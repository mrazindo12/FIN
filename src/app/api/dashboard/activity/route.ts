import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
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

    const groups = await prisma.application.groupBy({
      by: ["status"],
      where: { userId: user.id },
      _count: { status: true },
    });

    const statusCounts = {
      PENDING_PAYMENT: 0,
      APPLIED: 0,
      REVIEW: 0,
      INTERVIEW: 0,
      OFFER: 0,
      REJECTED: 0,
    };

    let totalApplications = 0;
    groups.forEach((g) => {
      if (g.status in statusCounts) {
        statusCounts[g.status as keyof typeof statusCounts] = g._count.status;
        totalApplications += g._count.status;
      }
    });

    return NextResponse.json({
      statusCounts,
      totalApplications,
    });
  } catch (error) {
    console.error("Error fetching student dashboard activity:", error);
    return NextResponse.json(
      { error: "Failed to load activity statistics" },
      { status: 500 }
    );
  }
}
