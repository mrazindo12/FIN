import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function requireStaff() {
  const session = await auth();
  if (!session?.user || session.user.role !== "STAFF") {
    return {
      errorResponse: NextResponse.json(
        { error: "Forbidden: Staff access required" },
        { status: 403 }
      ),
      session: null,
    };
  }
  return { errorResponse: null, session };
}
