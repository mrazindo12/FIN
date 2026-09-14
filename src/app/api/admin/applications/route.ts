import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { errorResponse } = await requireStaff();
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const slaStatus = searchParams.get("slaStatus");

    const whereClause: any = {};
    if (status && status !== "ALL") {
      whereClause.status = status;
    }
    if (slaStatus && slaStatus !== "ALL") {
      whereClause.slaStatus = slaStatus;
    }

    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            paystackReference: true,
            status: true,
            verifiedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Custom sorting: BREACHED -> WARNING -> others (ON_TRACK / non-APPLIED)
    const priorityMap: Record<string, number> = {
      BREACHED: 1,
      WARNING: 2,
      ON_TRACK: 3,
    };

    const sortedApplications = applications.sort((a, b) => {
      // Only APPLIED status gets priority sort
      const pA = a.status === "APPLIED" ? priorityMap[a.slaStatus] || 4 : 5;
      const pB = b.status === "APPLIED" ? priorityMap[b.slaStatus] || 4 : 5;

      if (pA !== pB) {
        return pA - pB;
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return NextResponse.json({ applications: sortedApplications });
  } catch (error) {
    console.error("Error fetching admin applications queue:", error);
    return NextResponse.json(
      { error: "Failed to fetch application queue" },
      { status: 500 }
    );
  }
}
