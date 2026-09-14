import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code?.trim().toUpperCase();

    if (!code) {
      return NextResponse.json(
        { valid: false, message: "Certificate code is required" },
        { status: 400 }
      );
    }

    const certificate = await prisma.certificate.findUnique({
      where: { certificateCode: code },
      include: {
        course: {
          select: { title: true, description: true },
        },
        user: {
          select: { fullName: true }, // Strictly public fields only (no email, phone, or application data)
        },
      },
    });

    if (!certificate) {
      return NextResponse.json(
        { valid: false, message: "Certificate code not found or invalid." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      certificateCode: certificate.certificateCode,
      courseTitle: certificate.course.title,
      studentName: certificate.user.fullName,
      issuedAt: certificate.issuedAt,
      issuer: "Fortune Intern Network (FIN) Academy",
    });
  } catch (error) {
    console.error("Error verifying certificate:", error);
    return NextResponse.json(
      { valid: false, message: "Internal verification error" },
      { status: 500 }
    );
  }
}
