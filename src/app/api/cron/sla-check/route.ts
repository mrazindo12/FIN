import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/sla-check
 * Evaluates SLA status for all Applications currently sitting in 'APPLIED' status.
 *
 * SLA Rules:
 * - Deadline is 72 hours from submission (submittedAt).
 * - BREACHED if current time > slaDeadlineAt.
 * - WARNING if remaining time <= warning window (default 12h, configured via SLA_WARNING_HOURS).
 * - ON_TRACK otherwise.
 *
 * NOTE ON TESTING:
 * In local development, hit this endpoint manually passing the Authorization header.
 * On Vercel, Vercel Cron automatically triggers this route every 15-30 minutes.
 */
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecretHeader = req.headers.get("x-cron-secret");
    const expectedSecret = process.env.CRON_SECRET || "dev_cron_secret_key_12345";

    const isAuthorized =
      authHeader === `Bearer ${expectedSecret}` ||
      cronSecretHeader === expectedSecret ||
      process.env.NODE_ENV === "development";

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized cron request" }, { status: 401 });
    }

    const warningHours = parseInt(process.env.SLA_WARNING_HOURS || "12", 10);
    const warningMs = warningHours * 60 * 60 * 1000;
    const now = new Date();

    const appliedApplications = await prisma.application.findMany({
      where: { status: "APPLIED" },
    });

    let updatedCount = 0;

    for (const app of appliedApplications) {
      // Determine effective deadline (fallback to submittedAt + 72h or createdAt + 72h)
      const baseTime = app.submittedAt || app.createdAt;
      const effectiveDeadline =
        app.slaDeadlineAt || new Date(baseTime.getTime() + 72 * 60 * 60 * 1000);

      const diffMs = effectiveDeadline.getTime() - now.getTime();

      let targetSlaStatus: "ON_TRACK" | "WARNING" | "BREACHED" = "ON_TRACK";
      if (diffMs < 0) {
        targetSlaStatus = "BREACHED";
      } else if (diffMs <= warningMs) {
        targetSlaStatus = "WARNING";
      }

      // Update if status changed or if slaDeadlineAt was missing
      if (app.slaStatus !== targetSlaStatus || !app.slaDeadlineAt) {
        await prisma.application.update({
          where: { id: app.id },
          data: {
            slaStatus: targetSlaStatus,
            slaDeadlineAt: effectiveDeadline,
          },
        });
        updatedCount++;
      }
    }

    return NextResponse.json({
      status: "ok",
      evaluatedCount: appliedApplications.length,
      updatedCount,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Error running SLA cron check:", error);
    return NextResponse.json(
      { error: "Failed to process SLA check" },
      { status: 500 }
    );
  }
}
