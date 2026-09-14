import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: session.user.id ? { id: session.user.id } : { email: session.user.email! },
      select: { id: true, fullName: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const moduleId = params.id;

    // Fetch target module and its parent course
    const moduleItem = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        course: {
          include: {
            modules: {
              select: { id: true },
            },
          },
        },
      },
    });

    if (!moduleItem) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    const courseId = moduleItem.courseId;
    const allCourseModuleIds = moduleItem.course.modules.map((m) => m.id);

    let certificateIssued = false;
    let certificateCode: string | null = null;

    // Execute atomic completion & race-safe certificate check inside a single transaction
    await prisma.$transaction(async (tx) => {
      // 1. Idempotent module completion record (safe against double-click races)
      await tx.moduleCompletion.upsert({
        where: {
          userId_moduleId: {
            userId: user.id,
            moduleId,
          },
        },
        create: {
          userId: user.id,
          moduleId,
        },
        update: {}, // No-op if already completed
      });

      // 2. Count completed modules for this course
      const completedCount = await tx.moduleCompletion.count({
        where: {
          userId: user.id,
          moduleId: { in: allCourseModuleIds },
        },
      });

      // 3. If all modules in course are completed, issue certificate safely
      if (completedCount >= allCourseModuleIds.length) {
        const existingCert = await tx.certificate.findUnique({
          where: {
            userId_courseId: {
              userId: user.id,
              courseId,
            },
          },
        });

        if (existingCert) {
          certificateIssued = true;
          certificateCode = existingCert.certificateCode;
        } else {
          // Generate human-readable code: FIN-XXXX-XXXX
          const randHex = crypto.randomBytes(4).toString("hex").toUpperCase();
          const generatedCode = `FIN-${randHex.slice(0, 4)}-${randHex.slice(4, 8)}`;

          try {
            const newCert = await tx.certificate.create({
              data: {
                userId: user.id,
                courseId,
                certificateCode: generatedCode,
              },
            });
            certificateIssued = true;
            certificateCode = newCert.certificateCode;
          } catch (certError: any) {
            // Catch unique constraint race condition gracefully (P2002)
            if (certError?.code === "P2002") {
              const racedCert = await tx.certificate.findUnique({
                where: {
                  userId_courseId: {
                    userId: user.id,
                    courseId,
                  },
                },
              });
              certificateIssued = true;
              certificateCode = racedCert?.certificateCode || generatedCode;
            } else {
              throw certError;
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      completed: true,
      moduleId,
      courseId,
      certificateIssued,
      certificateCode,
    });
  } catch (error) {
    console.error("Error completing module:", error);
    return NextResponse.json(
      { error: "Failed to mark module complete" },
      { status: 500 }
    );
  }
}
