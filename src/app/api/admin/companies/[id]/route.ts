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
    const companyId = params.id;
    const body = await req.json();

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.isCustom !== undefined) updateData.isCustom = Boolean(body.isCustom);
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);

    const company = await prisma.company.update({
      where: { id: companyId },
      data: updateData,
    });

    return NextResponse.json({ company });
  } catch (error) {
    console.error("Error updating company:", error);
    return NextResponse.json(
      { error: "Failed to update company" },
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
    const companyId = params.id;

    // Non-destructive soft delete: deactivate company so it disappears from applicant dropdown
    const company = await prisma.company.update({
      where: { id: companyId },
      data: { isActive: false },
    });

    return NextResponse.json({
      message: "Company deactivated successfully (soft-deleted)",
      company,
    });
  } catch (error) {
    console.error("Error deactivating company:", error);
    return NextResponse.json(
      { error: "Failed to deactivate company" },
      { status: 500 }
    );
  }
}
