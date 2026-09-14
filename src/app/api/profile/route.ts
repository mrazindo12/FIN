import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        createdAt: true,
        profile: {
          select: {
            id: true,
            institution: true,
            programOfStudy: true,
            yearOfStudy: true,
            indexNumber: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      fullName,
      phone,
      institution,
      programOfStudy,
      yearOfStudy,
      indexNumber,
    } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update User and upsert StudentProfile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        fullName: fullName !== undefined ? fullName.trim() : undefined,
        phone: phone !== undefined ? (phone ? phone.trim() : null) : undefined,
        profile: {
          upsert: {
            create: {
              institution: institution ? institution.trim() : null,
              programOfStudy: programOfStudy ? programOfStudy.trim() : null,
              yearOfStudy: yearOfStudy ? yearOfStudy.trim() : null,
              indexNumber: indexNumber ? indexNumber.trim() : null,
            },
            update: {
              institution: institution !== undefined ? (institution ? institution.trim() : null) : undefined,
              programOfStudy: programOfStudy !== undefined ? (programOfStudy ? programOfStudy.trim() : null) : undefined,
              yearOfStudy: yearOfStudy !== undefined ? (yearOfStudy ? yearOfStudy.trim() : null) : undefined,
              indexNumber: indexNumber !== undefined ? (indexNumber ? indexNumber.trim() : null) : undefined,
            },
          },
        },
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        profile: true,
      },
    });

    return NextResponse.json({
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profile PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update profile. Please try again." },
      { status: 500 }
    );
  }
}
