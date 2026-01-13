import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { z } from "zod";

import { db } from "~/server/db";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type SignInInput = z.infer<typeof signInSchema>;

export async function POST(req: Request) {
  try {
    const json = (await req.json()) as SignInInput;
    const body = signInSchema.parse(json);

    const user = await db.user.findUnique({
      where: { email: body.email },
    });

    if (!user?.password) {
      return NextResponse.json(
        { error: "የትክክል አይደለም። ኢሜል ወይም የይለፍ ቃል ያስተካክሉ" },
        { status: 401 }
      );
    }

    const isValid = await compare(body.password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: "የትክክል አይደለም። ኢሜል ወይም የይለፍ ቃል ያስተካክሉ" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 422 });
    }

    if (err instanceof Error) {
      return NextResponse.json(
        { error: err.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 