import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      where: { isPublished: true },
      include: {
        author: {
          select: { fullName: true },
        },
      },
      orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }],
    });

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { error: "Failed to load announcements feed" },
      { status: 500 }
    );
  }
}
