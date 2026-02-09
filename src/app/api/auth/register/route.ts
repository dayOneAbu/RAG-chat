import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "~/server/db";
import { z } from "zod";
import { sendEmail } from "~/utils/sendEmail";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type RegisterRequest = z.infer<typeof registerSchema>;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RegisterRequest;
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    const { email, password } = result.data;

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: "ይህ ኢሜል ቀደም ሲል ተጠቅመዋል።" },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 12);
    const verificationToken = Math.random().toString(36).substring(2, 15);
    const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
      }/api/auth/verify?token=${verificationToken}&email=${email}`;

    await db.user.create({
      data: {
        email,
        password: hashedPassword,
        verificationToken,
        isVerified: false,
      },
    });

    await sendEmail({
      to: email,
      subject: "የመለያ ማረጋገጫ",
      html: `
        <p>ክቡር/ክብርት ደንበኛችን፣</p>
        <p>የመለያዎን ማረጋገጫ ለመጨረስ እባክዎ ከታች ያለውን አገናኝ ይጫኑ፡</p>
        <a href="${verificationLink}">ኢሜል ያረጋግጡ</a>
        <p>ይህን ጥያቄ እርስዎ ካልላኩት፣ እባክዎ ችላ ይበሉ።</p>
        <p>ከተሰጠ ድጋፍ ጋር፣<br>የአማርኛ AI የባንክ ደንበኛ ድጋፍ አገልግሎት</p>
      `,
      text: `Please verify your account by clicking the link: ${verificationLink}`,
    });

    return NextResponse.json(
      { message: "Registration successful. Please check your email to verify your account." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "አካውንት መፍጠር አልተሳካም" },
      { status: 500 }
    );
  }
}