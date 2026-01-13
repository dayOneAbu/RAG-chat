import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { hash } from "bcryptjs";

const resetPasswordSchema = z.object({
  email: z.string().email(),
  token: z.string(),
  password: z.string().min(6, "የይለፍ ቃል ቢያንስ 6 ፊደላት መሆን አለበት"),
});

export async function POST(req: Request) {
  try {
    const { email, token, password } = resetPasswordSchema.parse(await req.json());

    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.user.email !== email || resetToken.expiresAt < new Date()) {
      console.log("Invalid reset attempt:", { email, token, resetToken });
      return NextResponse.json(
        { message: "የተሳሳተ ወይም ጊዜው ያለፈበት የይለፍ ቃል መልሶ ማግኛ ማስረጃ" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 12);

    await db.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    await db.passwordResetToken.delete({ where: { token } });

    return NextResponse.json(
      { message: "የይለፍ ቃል በተሳካ ሁኔታ ተቀይሯል" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { message: "የይለፍ ቃል መልሶ ማግኛ አልተሳካም" },
      { status: 500 }
    );
  }
}