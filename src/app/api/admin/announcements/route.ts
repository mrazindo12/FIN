import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const { errorResponse } = await requireStaff();
  if (errorResponse) return errorResponse;

  try {
    const announcements = await prisma.announcement.findMany({
      include: {
        author: {
          select: { id: true, fullName: true, email: true },
        },
      },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error("Error fetching admin announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { errorResponse, session } = await requireStaff();
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { title, body: contentBody, pinned, isPublished } = body;

    if (!title || !contentBody) {
      return NextResponse.json(
        { error: "Title and body are required" },
        { status: 400 }
      );
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        body: contentBody,
        pinned: Boolean(pinned),
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
        authorId: session!.user.id,
      },
    });

    return NextResponse.json({ announcement }, { status: 201 });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: 500 }
    );
  }
}
