import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const signature = req.headers.get("x-paystack-signature");
    const secret = process.env.PAYSTACK_SECRET_KEY || "";

    if (!signature || !secret) {
      console.warn("Paystack Webhook: Missing signature or secret key.");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // CRITICAL: Read raw text first for precise HMAC verification
    const rawBody = await req.text();

    const expectedSignature = crypto
      .createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex");

    // Secure timing-safe signature comparison
    const signatureBuffer = Buffer.from(signature, "utf-8");
    const expectedBuffer = Buffer.from(expectedSignature, "utf-8");

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      console.warn("Paystack Webhook: Signature verification failed.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Parse JSON only after signature verification passes
    const event = JSON.parse(rawBody);
    const eventType = event.event;
    const data = event.data;
    const reference = data?.reference;

    if (!reference) {
      return NextResponse.json({ message: "No reference in payload" }, { status: 200 });
    }

    // Find the corresponding payment attempt
    const payment = await prisma.payment.findUnique({
      where: { paystackReference: reference },
      include: { application: true },
    });

    if (!payment) {
      console.warn(`Paystack Webhook: Payment reference ${reference} not found in DB.`);
      return NextResponse.json({ message: "Payment not found" }, { status: 200 });
    }

    if (eventType === "charge.success") {
      // Idempotency: If payment is already marked SUCCESS, do not duplicate actions
      if (payment.status === "SUCCESS") {
        return NextResponse.json({ message: "Payment already verified" }, { status: 200 });
      }

      const now = new Date();

      // Atomically update Payment, linked Application, and invalidate orphaned pending retries
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "SUCCESS",
            verifiedAt: now,
            rawWebhookPayload: event,
          },
        }),
        prisma.application.update({
          where: { id: payment.applicationId },
          data: {
            status: "APPLIED",
            submittedAt: now,
            slaDeadlineAt: new Date(now.getTime() + 72 * 60 * 60 * 1000), // 72-hour SLA deadline
            slaStatus: "ON_TRACK",
          },
        }),
        prisma.payment.updateMany({
          where: {
            applicationId: payment.applicationId,
            id: { not: payment.id },
            status: "PENDING",
          },
          data: {
            status: "FAILED",
          },
        }),
      ]);

      console.log(
        `✓ Paystack Webhook: Payment ${reference} verified. Application ${payment.applicationId} set to APPLIED.`
      );
    } else if (eventType === "charge.failed" || data?.status === "failed") {
      // Handle failed charge event so frontend poller resolves
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          rawWebhookPayload: event,
        },
      });

      console.log(`✕ Paystack Webhook: Payment ${reference} marked as FAILED.`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Paystack Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook internal processing error" },
      { status: 500 }
    );
  }
}
