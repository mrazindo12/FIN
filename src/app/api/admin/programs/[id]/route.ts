import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { errorResponse } = await requireStaff();
  if (errorResponse) return errorResponse;

  try {
    const programId = params.id;
    const body = await req.json();

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.companyId !== undefined) updateData.companyId = body.companyId;
    if (body.companyNameSnapshot !== undefined) updateData.companyNameSnapshot = body.companyNameSnapshot;
    if (body.applicationDeadline !== undefined) {
      updateData.applicationDeadline = body.applicationDeadline ? new Date(body.applicationDeadline) : null;
    }
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);

    const program = await prisma.program.update({
      where: { id: programId },
      data: updateData,
    });

    return NextResponse.json({ program });
  } catch (error) {
    console.error("Error updating program:", error);
    return NextResponse.json(
      { error: "Failed to update program" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { errorResponse } = await requireStaff();
  if (errorResponse) return errorResponse;

  try {
    const programId = params.id;

    // Non-destructive soft-delete: flip isActive to false to preserve historical data
    const program = await prisma.program.update({
      where: { id: programId },
      data: { isActive: false },
    });

    return NextResponse.json({
      message: "Program deactivated successfully (soft-deleted)",
      program,
    });
  } catch (error) {
    console.error("Error deactivating program:", error);
    return NextResponse.json(
      { error: "Failed to deactivate program" },
      { status: 500 }
    );
  }
}
