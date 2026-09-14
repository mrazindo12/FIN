import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      fullName,
      phone,
      institution,
      programOfStudy,
      yearOfStudy,
      indexNumber,
    } = body;

    // Validate required fields
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Full Name, Email, and Password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Check for existing user with identical email
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered. Please sign in or use a different email." },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user and profile
    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        fullName: fullName.trim(),
        phone: phone ? phone.trim() : null,
        passwordHash,
        profile: {
          create: {
            institution: institution ? institution.trim() : null,
            programOfStudy: programOfStudy ? programOfStudy.trim() : null,
            yearOfStudy: yearOfStudy ? yearOfStudy.trim() : null,
            indexNumber: indexNumber ? indexNumber.trim() : null,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    return NextResponse.json(
      {
        message: "Account created successfully.",
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);

    // Prisma duplicate key error fallback
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "Email already registered." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred during registration. Please try again." },
      { status: 500 }
    );
  }
}
