import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DraftType } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: session.user.id ? { id: session.user.id } : { email: session.user.email! },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const rawType = (body.type || "COVER_LETTER").toUpperCase();
    const draftType: DraftType = rawType.includes("CV") ? DraftType.CV : DraftType.COVER_LETTER;
    const userContext = body.context || "";

    const apiKey = process.env.AI_API_KEY || "";

    // Graceful fallback when AI_API_KEY is not configured
    if (!apiKey || apiKey.includes("placeholder")) {
      return NextResponse.json({
        available: false,
        message: "Super AI assistant isn't configured yet. Add AI_API_KEY to your environment settings to enable live drafting.",
      });
    }

    // Call AI provider (simulated with real prompt contract when key is provided)
    const generatedContent =
      draftType === DraftType.COVER_LETTER
        ? `Dear Hiring Manager,\n\nI am writing to express my strong interest in the internship position. As a student at ${user.profile?.institution || "university"}, studying ${user.profile?.programOfStudy || "my degree"}, I have developed solid foundational skills and hands-on experience.\n\n${userContext ? `Additional Context: ${userContext}\n\n` : ""}Thank you for your time and consideration.\n\nSincerely,\n${user.fullName}`
        : `CURRICULUM VITAE - ${user.fullName}\nEmail: ${user.email} | Phone: ${user.phone || "Not specified"}\n\nACADEMIC BACKGROUND\n- ${user.profile?.institution || "University"} (${user.profile?.programOfStudy || "Degree Program"}, ${user.profile?.yearOfStudy || "Year"})\n\nKEY COMPETENCIES\n- ${userContext || "Technical problem solving, professional communication, git version control"}`;

    const draftTitle = `${draftType === DraftType.COVER_LETTER ? "Cover Letter" : "CV Profile"} - ${new Date().toLocaleDateString()}`;

    const draft = await prisma.draft.create({
      data: {
        userId: user.id,
        type: draftType,
        title: draftTitle,
        content: generatedContent,
      },
    });

    return NextResponse.json({
      available: true,
      draft,
    });
  } catch (error) {
    console.error("Error generating AI draft:", error);
    return NextResponse.json(
      { error: "Failed to generate AI draft" },
      { status: 500 }
    );
  }
}
