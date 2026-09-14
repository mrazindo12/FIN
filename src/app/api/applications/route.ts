import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Resolve user ID
    const user = await prisma.user.findUnique({
      where: session.user.id ? { id: session.user.id } : { email: session.user.email! },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const applications = await prisma.application.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        companyId: true,
        companyNameSnapshot: true,
        companyAddressSnapshot: true,
        firstName: true,
        lastName: true,
        gender: true,
        phone: true,
        email: true,
        institution: true,
        programOfStudy: true,
        yearOfStudy: true,
        indexNumber: true,
        status: true,
        createdAt: true,
        submittedAt: true,
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            paystackReference: true,
            amountKobo: true,
            status: true,
            verifiedAt: true,
          },
        },
      },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: session.user.id ? { id: session.user.id } : { email: session.user.email! },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      firstName,
      lastName,
      gender,
      phone,
      email,
      institution,
      programOfStudy,
      yearOfStudy,
      indexNumber,
      companyId,
      companyName,
      companyAddress,
      isCustom,
      coverLetter,
    } = body;

    // Validate Required Fields
    if (
      !firstName?.trim() ||
      !lastName?.trim() ||
      !phone?.trim() ||
      !email?.trim() ||
      !institution?.trim() ||
      !programOfStudy?.trim() ||
      !yearOfStudy?.trim() ||
      !indexNumber?.trim() ||
      !companyName?.trim()
    ) {
      return NextResponse.json(
        { error: "Please fill out all required fields across all sections." },
        { status: 400 }
      );
    }

    const cleanCompanyName = companyName.trim();
    const cleanCompanyAddress = companyAddress ? companyAddress.trim() : null;

    // Check for exact duplicate pending payment application for this company
    const existingPending = await prisma.application.findFirst({
      where: {
        userId: user.id,
        status: "PENDING_PAYMENT",
        companyNameSnapshot: cleanCompanyName,
      },
    });

    if (existingPending) {
      // Return existing pending application ID so the user can continue/resume payment
      return NextResponse.json({
        applicationId: existingPending.id,
        message: "Continuing existing pending application for this host company.",
      });
    }

    let linkedCompanyId: string | null = null;

    if (companyId) {
      const company = await prisma.company.findUnique({ where: { id: companyId } });
      if (company) {
        linkedCompanyId = company.id;
      }
    } else if (isCustom) {
      // Create custom company record
      const customCompany = await prisma.company.create({
        data: {
          name: cleanCompanyName,
          address: cleanCompanyAddress,
          isCustom: true,
        },
      });
      linkedCompanyId = customCompany.id;
    }

    // Create Application row with immutable snapshot fields in PENDING_PAYMENT
    const application = await prisma.application.create({
      data: {
        userId: user.id,
        companyId: linkedCompanyId,
        companyNameSnapshot: cleanCompanyName,
        companyAddressSnapshot: cleanCompanyAddress,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender: gender ? gender.trim() : null,
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        institution: institution.trim(),
        programOfStudy: programOfStudy.trim(),
        yearOfStudy: yearOfStudy.trim(),
        indexNumber: indexNumber.trim(),
        coverLetter: coverLetter ? coverLetter.trim() : null,
        status: "PENDING_PAYMENT",
      },
    });

    return NextResponse.json(
      {
        applicationId: application.id,
        message: "Application drafted successfully. Proceeding to checkout.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Failed to submit application. Please try again." },
      { status: 500 }
    );
  }
}
