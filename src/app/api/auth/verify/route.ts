import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    return NextResponse.json({ message: "Invalid verification link" }, { status: 400 });
  }

  try {
    const user = await db.user.findUnique({
      where: { email },
    });
    if (!user || user.verificationToken !== token) {
      return NextResponse.json(
        { message: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    await db.user.update({
      where: { email },
      data: {
        isVerified: true,
        verificationToken: null,
        emailVerified: new Date(),
      },
    });

    return NextResponse.redirect(
      new URL("/auth/signin?verified=true", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000")
    );
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ message: "Verification failed" }, { status: 500 });
  }
}