import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: session.user.id ? { id: session.user.id } : { email: session.user.email! },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { applicationId } = body;

    if (!applicationId) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 }
      );
    }

    // Strict ownership verification
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        userId: user.id,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found or unauthorized" },
        { status: 404 }
      );
    }

    if (application.status !== "PENDING_PAYMENT") {
      return NextResponse.json(
        { error: "This application has already been paid and submitted." },
        { status: 409 }
      );
    }

    // Read fee amount from env (e.g. 50.00 GHS -> 5000 pesewas/kobo)
    const feeGhs = process.env.APPLICATION_FEE_GHS || "50.00";
    const amountKobo = Math.round(parseFloat(feeGhs) * 100);

    const secretKey = process.env.PAYSTACK_SECRET_KEY || "";
    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";

    // Generate unique internal Paystack reference
    const paystackReference = `fin_${application.id.slice(-6)}_${Date.now()}`;

    // If Paystack Secret Key is available and not default placeholder, initialize via Paystack API
    if (secretKey && !secretKey.includes("placeholder")) {
      try {
        const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: application.email,
            amount: amountKobo,
            currency: "GHS",
            reference: paystackReference,
            metadata: {
              applicationId: application.id,
              userId: user.id,
              companyName: application.companyNameSnapshot,
              custom_fields: [
                {
                  display_name: "Applicant Name",
                  variable_name: "applicant_name",
                  value: `${application.firstName} ${application.lastName}`,
                },
                {
                  display_name: "Host Company",
                  variable_name: "host_company",
                  value: application.companyNameSnapshot,
                },
              ],
            },
          }),
        });

        const paystackData = await paystackRes.json();

        if (!paystackRes.ok || !paystackData.status) {
          console.error("Paystack Initialize error:", paystackData);
          return NextResponse.json(
            { error: paystackData.message || "Failed to initialize payment gateway." },
            { status: 502 }
          );
        }
      } catch (apiErr) {
        console.error("Network error contacting Paystack:", apiErr);
        return NextResponse.json(
          { error: "Unable to reach Paystack payment server. Please check your network connection." },
          { status: 503 }
        );
      }
    }

    // Log the payment attempt in database as PENDING (supports multiple attempts / retries)
    await prisma.payment.create({
      data: {
        applicationId: application.id,
        paystackReference,
        amountKobo,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      reference: paystackReference,
      publicKey,
      amount: amountKobo,
      email: application.email,
      currency: "GHS",
    });
  } catch (error) {
    console.error("Payment initialization error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while setting up checkout." },
      { status: 500 }
    );
  }
}
