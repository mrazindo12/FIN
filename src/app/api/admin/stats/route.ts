import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const { errorResponse } = await requireStaff();
  if (errorResponse) return errorResponse;

  try {
    const [
      appStatusGroups,
      slaGroups,
      totalStudents,
      activePrograms,
      publishedAnnouncements,
      activeCompanies,
    ] = await Promise.all([
      prisma.application.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      prisma.application.groupBy({
        by: ["slaStatus"],
        where: { status: "APPLIED" },
        _count: { slaStatus: true },
      }),
      prisma.user.count({
        where: { role: "STUDENT" },
      }),
      prisma.program.count({
        where: { isActive: true },
      }),
      prisma.announcement.count({
        where: { isPublished: true },
      }),
      prisma.company.count({
        where: { isActive: true },
      }),
    ]);

    const applicationsByStatus = {
      PENDING_PAYMENT: 0,
      APPLIED: 0,
      REVIEW: 0,
      INTERVIEW: 0,
      OFFER: 0,
      REJECTED: 0,
    };

    appStatusGroups.forEach((g) => {
      if (g.status in applicationsByStatus) {
        applicationsByStatus[g.status as keyof typeof applicationsByStatus] = g._count.status;
      }
    });

    const slaCounts = {
      ON_TRACK: 0,
      WARNING: 0,
      BREACHED: 0,
    };

    slaGroups.forEach((g) => {
      if (g.slaStatus in slaCounts) {
        slaCounts[g.slaStatus as keyof typeof slaCounts] = g._count.slaStatus;
      }
    });

    return NextResponse.json({
      applicationsByStatus,
      slaCounts,
      totalStudents,
      activePrograms,
      publishedAnnouncements,
      activeCompanies,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
