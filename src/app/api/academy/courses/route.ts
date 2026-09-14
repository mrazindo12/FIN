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

    const [courses, userCompletions, userCertificates] = await Promise.all([
      prisma.course.findMany({
        include: {
          modules: {
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      }),
      prisma.moduleCompletion.findMany({
        where: { userId: user.id },
        select: { moduleId: true },
      }),
      prisma.certificate.findMany({
        where: { userId: user.id },
        select: { courseId: true, certificateCode: true, issuedAt: true },
      }),
    ]);

    const completedModuleIds = userCompletions.map((c) => c.moduleId);

    const certificateMap = new Map<string, { code: string; issuedAt: Date }>();
    userCertificates.forEach((cert) => {
      certificateMap.set(cert.courseId, {
        code: cert.certificateCode,
        issuedAt: cert.issuedAt,
      });
    });

    const enrichedCourses = courses.map((course) => {
      const totalModules = course.modules.length;
      const completedCount = course.modules.filter((m) =>
        completedModuleIds.includes(m.id)
      ).length;
      const progressPercent =
        totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;

      const certInfo = certificateMap.get(course.id) || null;

      return {
        ...course,
        totalModules,
        completedCount,
        progressPercent,
        certificate: certInfo,
      };
    });

    return NextResponse.json({
      courses: enrichedCourses,
      completedModuleIds,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to load Academy courses" },
      { status: 500 }
    );
  }
}
