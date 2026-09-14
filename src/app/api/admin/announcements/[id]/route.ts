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
    const announcementId = params.id;
    const body = await req.json();

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.body !== undefined) updateData.body = body.body;
    if (body.pinned !== undefined) updateData.pinned = Boolean(body.pinned);
    if (body.isPublished !== undefined) updateData.isPublished = Boolean(body.isPublished);

    const announcement = await prisma.announcement.update({
      where: { id: announcementId },
      data: updateData,
    });

    return NextResponse.json({ announcement });
  } catch (error) {
    console.error("Error updating announcement:", error);
    return NextResponse.json(
      { error: "Failed to update announcement" },
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
    const announcementId = params.id;

    // Non-destructive soft delete: unpublish the record without deleting row
    const announcement = await prisma.announcement.update({
      where: { id: announcementId },
      data: { isPublished: false },
    });

    return NextResponse.json({
      message: "Announcement unpublished successfully (soft-deleted)",
      announcement,
    });
  } catch (error) {
    console.error("Error unpublishing announcement:", error);
    return NextResponse.json(
      { error: "Failed to unpublish announcement" },
      { status: 500 }
    );
  }
}
