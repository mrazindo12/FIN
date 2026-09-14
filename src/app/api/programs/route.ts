import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const programs = await prisma.program.findMany({
      where: { isActive: true },
      include: {
        company: {
          select: { id: true, name: true, address: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ programs });
  } catch (error) {
    console.error("Error fetching active programs:", error);
    return NextResponse.json(
      { error: "Failed to load programs list" },
      { status: 500 }
    );
  }
}
