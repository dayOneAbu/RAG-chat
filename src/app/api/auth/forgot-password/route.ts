import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { sendEmail } from "~/utils/sendEmail";
import { randomBytes } from "crypto";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const { email } = forgotPasswordSchema.parse(await req.json());
    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { message: "ይህ ኢሜል ካለ መልሶ ማግኛ አገናኝ ተልኳል።" },
        { status: 200 }
      );
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour

    await db.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${token}&email=${email}`;
    await sendEmail({
      to: email,
      subject: "የይለፍ ቃል መልሶ ማግኛ ጥያቄ",
      html: `
        <p>ክቡር/ክብርት ደንበኛችን፣</p>
        <p>በመለያዎ ላይ የይለፍ ቃል እንደገና ለመቀየር ጥያቄ እንደላኩ ተረድተናል። እባክዎ ከታች ያለውን አድራሻ በመንካት የይለፍ ቃልዎን እንደገና ያቀይሩ።</p>
        <p><a href="${resetUrl}">የይለፍ ቃል እንደገና ለመቀየር እዚህ ጠቅ ያድርጉ</a></p>
        <p>ይህ ጥያቄ እርስዎ ካልላኩት እባክዎን እቶት አድርጉ፣ እና እባክዎን ያንን ድጋፍ ያስተዋውቁ።</p>
        <p>ከተስፋፋ ድጋፍ ጋር፣<br>የአማርኛ የባንክ ደንበኛ ድጋፍ አገልግሎት</p>
      `,
      text: `የይለፍ ቃል እንደገና ለመቀየር እዚህ ጠቅ ያድርጉ: ${resetUrl}`,
    });

    return NextResponse.json(
      { message: "ይህ ኢሜል ካለ መልሶ ማግኛ አገናኝ ተልኳል።" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { message: "የይለፍ ቃል መልሶ ማግኛ ኢሜል መላክ አልተሳካም" },
      { status: 500 }
    );
  }
}