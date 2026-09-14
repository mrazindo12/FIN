import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  PENDING_PAYMENT: [], // Cannot be manually transitioned via staff before payment
  APPLIED: [ApplicationStatus.REVIEW],
  REVIEW: [ApplicationStatus.INTERVIEW, ApplicationStatus.REJECTED],
  INTERVIEW: [ApplicationStatus.OFFER, ApplicationStatus.REJECTED],
  OFFER: [],
  REJECTED: [],
};

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { errorResponse, session } = await requireStaff();
  if (errorResponse) return errorResponse;

  try {
    const applicationId = params.id;
    const body = await req.json();
    const { status: targetStatus } = body as { status?: ApplicationStatus };

    if (!targetStatus) {
      return NextResponse.json(
        { error: "Target status is required" },
        { status: 400 }
      );
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const allowedNextStates = VALID_TRANSITIONS[application.status] || [];

    if (!allowedNextStates.includes(targetStatus)) {
      const allowedMsg =
        allowedNextStates.length > 0
          ? allowedNextStates.join(", ")
          : "None (Terminal state reached)";

      return NextResponse.json(
        {
          error: `Invalid status transition from ${application.status} to ${targetStatus}. Valid next stage(s): [${allowedMsg}].`,
          allowedNextStates,
        },
        { status: 400 }
      );
    }

    // Perform forward transition and audit review action
    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: targetStatus,
        reviewedById: session!.user.id,
        reviewedAt: new Date(),
      },
      include: {
        reviewedBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    return NextResponse.json({ application: updated });
  } catch (error) {
    console.error("Error updating application status:", error);
    return NextResponse.json(
      { error: "Failed to update application status" },
      { status: 500 }
    );
  }
}
