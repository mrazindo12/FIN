import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const { errorResponse } = await requireStaff();
  if (errorResponse) return errorResponse;

  try {
    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: { applications: true, programs: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ companies });
  } catch (error) {
    console.error("Error fetching admin companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { errorResponse } = await requireStaff();
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { name, address, isCustom, isActive } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      );
    }

    const company = await prisma.company.create({
      data: {
        name,
        address: address || null,
        isCustom: Boolean(isCustom),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ company }, { status: 201 });
  } catch (error) {
    console.error("Error creating company:", error);
    return NextResponse.json(
      { error: "Failed to create company" },
      { status: 500 }
    );
  }
}
