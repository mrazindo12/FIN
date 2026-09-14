import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    const applicationId = params.id;

    // Strict ownership verification
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        userId: user.id,
      },
      select: {
        id: true,
        companyNameSnapshot: true,
        companyAddressSnapshot: true,
        firstName: true,
        lastName: true,
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

    if (!application) {
      return NextResponse.json(
        { error: "Application not found or unauthorized access" },
        { status: 404 }
      );
    }

    const latestPayment = application.payments[0] || null;

    return NextResponse.json({
      application: {
        ...application,
        latestPayment,
      },
    });
  } catch (error) {
    console.error("Error fetching single application:", error);
    return NextResponse.json(
      { error: "Failed to retrieve application details" },
      { status: 500 }
    );
  }
}
