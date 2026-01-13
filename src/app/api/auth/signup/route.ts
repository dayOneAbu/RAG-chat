import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";

import { db } from "~/server/db";

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2).optional(),
});

type SignUpInput = z.infer<typeof signUpSchema>;

export async function POST(req: Request) {
  try {
    const json = (await req.json()) as SignUpInput;
    const body = signUpSchema.parse(json);

    const exists = await db.user.findFirst({
      where: { email: body.email },
    });

    if (exists) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(body.password, 12);

    const user = await db.user.create({
      data: {
        email: body.email,
        name: body.name,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 