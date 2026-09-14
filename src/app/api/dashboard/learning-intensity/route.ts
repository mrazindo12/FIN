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

    const completions = await prisma.moduleCompletion.findMany({
      where: { userId: user.id },
      orderBy: { completedAt: "asc" },
      select: { completedAt: true },
    });

    // Group completions by day for the last 14 days (or past completions)
    const daysMap = new Map<string, number>();

    // Seed past 7 days with 0
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      daysMap.set(dateStr, 0);
    }

    completions.forEach((c) => {
      const dateStr = c.completedAt.toISOString().slice(0, 10);
      if (daysMap.has(dateStr)) {
        daysMap.set(dateStr, (daysMap.get(dateStr) || 0) + 1);
      } else {
        daysMap.set(dateStr, 1);
      }
    });

    const labels = Array.from(daysMap.keys()).map((d) => {
      const parts = d.split("-");
      return `${parts[1]}/${parts[2]}`;
    });

    const values = Array.from(daysMap.values());

    return NextResponse.json({
      labels,
      values,
      totalCompletions: completions.length,
    });
  } catch (error) {
    console.error("Error fetching learning intensity data:", error);
    return NextResponse.json(
      { error: "Failed to load learning intensity data" },
      { status: 500 }
    );
  }
}
