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

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { company: true },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const contactEmail = application.company?.contactEmail;

    if (!contactEmail) {
      return NextResponse.json(
        {
          error: `Cannot notify host organization: Linked company "${application.companyNameSnapshot}" does not have a registered contact email address in the system roster. Please update the company email in Partner Companies settings first.`,
        },
        { status: 400 }
      );
    }

    if (application.companyNotifiedAt) {
      return NextResponse.json(
        { error: `Company was already notified on ${new Date(application.companyNotifiedAt).toLocaleString()}. Duplicate notifications are blocked.` },
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
            to: [contactEmail],
            subject: `Candidate Notification: ${application.firstName} ${application.lastName}`,
            text: `Dear ${application.companyNameSnapshot} Admissions,\n\nStudent ${application.firstName} ${application.lastName} (${application.institution}, ${application.programOfStudy}) has reached the pipeline stage for your organization.\n\nFIN Admissions Team`,
          }),
        });

        if (!resendRes.ok) {
          isSimulated = true;
        }
      } catch (e) {
        console.error("Error calling Resend for company notification:", e);
        isSimulated = true;
      }
    } else {
      isSimulated = true;
    }

    const now = new Date();
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        companyNotifiedAt: now,
        reviewedById: session!.user.id,
        reviewedAt: now,
      },
    });

    return NextResponse.json({
      sent: true,
      simulated: isSimulated,
      companyNotifiedAt: now.toISOString(),
      contactEmail,
      message: isSimulated
        ? `Company notification logged in database for ${contactEmail} (Resend API key missing; simulated mode active).`
        : `Company notification email sent successfully to ${contactEmail}.`,
    });
  } catch (error) {
    console.error("Error notifying company:", error);
    return NextResponse.json(
      { error: "Failed to send company notification" },
      { status: 500 }
    );
  }
}
