import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { errorResponse, session } = await requireStaff();
  if (errorResponse) return errorResponse;

  try {
    const applicationId = params.id;
    const body = await req.json();
    const { letterContent } = body;

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (application.status !== "OFFER") {
      return NextResponse.json(
        { error: "Offer letters can only be sent for applications in the OFFER stage." },
        { status: 400 }
      );
    }

    if (application.letterSentAt) {
      return NextResponse.json(
        { error: `Offer letter was already sent on ${new Date(application.letterSentAt).toLocaleString()}. Duplicate sending is blocked.` },
        { status: 400 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY || "";
    let isSimulated = false;

    if (resendApiKey && !resendApiKey.includes("placeholder")) {
      try {
        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Fortune Intern Network <admissions@fortuneintern.com>",
            to: [application.email],
            subject: `Official Internship Offer - ${application.companyNameSnapshot}`,
            text: letterContent || `Congratulations ${application.firstName}! You have been offered an internship placement at ${application.companyNameSnapshot}.`,
          }),
        });

        if (!resendRes.ok) {
          const resendErr = await resendRes.json();
          console.error("Resend API error:", resendErr);
          // Fallback to simulated log
          isSimulated = true;
        }
      } catch (e) {
        console.error("Error connecting to Resend service:", e);
        isSimulated = true;
      }
    } else {
      isSimulated = true;
    }

    const now = new Date();
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        letterSentAt: now,
        reviewedById: session!.user.id,
        reviewedAt: now,
      },
    });

    return NextResponse.json({
      sent: true,
      simulated: isSimulated,
      letterSentAt: now.toISOString(),
      message: isSimulated
        ? "Offer letter action recorded in database (Resend API key missing or unverified domain; simulated mode active)."
        : `Offer letter successfully sent to ${application.email}.`,
    });
  } catch (error) {
    console.error("Error sending offer letter:", error);
    return NextResponse.json(
      { error: "Failed to send offer letter" },
      { status: 500 }
    );
  }
}
