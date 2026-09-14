import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const { errorResponse } = await requireStaff();
  if (errorResponse) return errorResponse;

  try {
    const programs = await prisma.program.findMany({
      include: {
        company: {
          select: { id: true, name: true, isActive: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ programs });
  } catch (error) {
    console.error("Error fetching admin programs:", error);
    return NextResponse.json(
      { error: "Failed to fetch programs" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { errorResponse } = await requireStaff();
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const {
      title,
      description,
      location,
      category,
      companyId,
      companyNameSnapshot,
      applicationDeadline,
      isActive,
    } = body;

    if (!title || !description || !location || !category || !companyNameSnapshot) {
      return NextResponse.json(
        { error: "Missing required program fields" },
        { status: 400 }
      );
    }

    const program = await prisma.program.create({
      data: {
        title,
        description,
        location,
        category,
        companyId: companyId || null,
        companyNameSnapshot,
        applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ program }, { status: 201 });
  } catch (error) {
    console.error("Error creating program:", error);
    return NextResponse.json(
      { error: "Failed to create program" },
      { status: 500 }
    );
  }
}
