import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SkillAxis } from "@prisma/client";

export const dynamic = "force-dynamic";

const AXIS_LABELS: Record<SkillAxis, string> = {
  TECHNICAL_SKILLS: "Technical Skills",
  COMMUNICATION: "Communication",
  PROBLEM_SOLVING: "Problem Solving",
  TEAMWORK: "Teamwork",
  LEADERSHIP: "Leadership",
  ADAPTABILITY: "Adaptability",
};

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

    // 1. Fetch total available modules per skill axis
    const totalModulesByAxis = await prisma.module.groupBy({
      by: ["skillAxis"],
      _count: { skillAxis: true },
    });

    const totalMap: Record<SkillAxis, number> = {
      TECHNICAL_SKILLS: 0,
      COMMUNICATION: 0,
      PROBLEM_SOLVING: 0,
      TEAMWORK: 0,
      LEADERSHIP: 0,
      ADAPTABILITY: 0,
    };

    totalModulesByAxis.forEach((g) => {
      totalMap[g.skillAxis] = g._count.skillAxis;
    });

    // 2. Fetch user's completed modules with skillAxis
    const userCompletions = await prisma.moduleCompletion.findMany({
      where: { userId: user.id },
      include: {
        module: {
          select: { skillAxis: true },
        },
      },
    });

    const completedMap: Record<SkillAxis, number> = {
      TECHNICAL_SKILLS: 0,
      COMMUNICATION: 0,
      PROBLEM_SOLVING: 0,
      TEAMWORK: 0,
      LEADERSHIP: 0,
      ADAPTABILITY: 0,
    };

    userCompletions.forEach((c) => {
      if (c.module.skillAxis) {
        completedMap[c.module.skillAxis] = (completedMap[c.module.skillAxis] || 0) + 1;
      }
    });

    // 3. Format Radar Data
    const axesOrder: SkillAxis[] = [
      SkillAxis.TECHNICAL_SKILLS,
      SkillAxis.COMMUNICATION,
      SkillAxis.PROBLEM_SOLVING,
      SkillAxis.TEAMWORK,
      SkillAxis.LEADERSHIP,
      SkillAxis.ADAPTABILITY,
    ];

    const labels = axesOrder.map((axis) => AXIS_LABELS[axis]);
    const completedValues = axesOrder.map((axis) => completedMap[axis]);
    const totalValues = axesOrder.map((axis) => totalMap[axis]);
    const percentages = axesOrder.map((axis) => {
      const total = totalMap[axis];
      const done = completedMap[axis];
      return total > 0 ? Math.round((done / total) * 100) : 0;
    });

    const totalCompleted = userCompletions.length;

    return NextResponse.json({
      labels,
      completedValues,
      totalValues,
      percentages,
      totalCompleted,
    });
  } catch (error) {
    console.error("Error fetching competency radar data:", error);
    return NextResponse.json(
      { error: "Failed to load competency radar data" },
      { status: 500 }
    );
  }
}
