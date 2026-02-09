import { z } from "zod";
import { hash } from "bcryptjs";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { sendEmail } from "~/lib/email";
import { addMinutes } from "date-fns";

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2).optional(),
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string(),
});
const requestResetSchema = z.object({ email: z.string().email() });

export const authRouter = createTRPCRouter({
  signUp: publicProcedure
    .input(signUpSchema)
    .mutation(async ({ ctx, input }) => {
      const { email, password, name } = input;

      const exists = await ctx.db.user.findFirst({
        where: { email },
      });

      if (exists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists",
        });
      }

      const hashedPassword = await hash(password, 12);

      const user = await ctx.db.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      return user;
    }),

  signIn: publicProcedure
    .input(signInSchema)
    .mutation(async ({ ctx, input }) => {
      const { email } = input;

      const user = await ctx.db.user.findFirst({
        where: { email },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return { success: true };
    }),
  resetPassword: publicProcedure.input(resetPasswordSchema).mutation(async ({ ctx, input }) => {
    const { token, password } = input;
    const record = await ctx.db.passwordResetToken.findUnique({ where: { token } });
    if (!record || record.expiresAt < new Date()) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired token" });
    }
    const hashedPassword = await hash(password, 12);
    await ctx.db.user.update({
      where: { id: record.userId },
      data: { password: hashedPassword },
    });
    await ctx.db.passwordResetToken.delete({ where: { token } });
    return { success: true };
  }),
  requestPasswordReset: publicProcedure.input(requestResetSchema).mutation(async ({ ctx, input }) => {
    const { email } = input;
    // 1. Find user
    const user = await ctx.db.user.findFirst({ where: { email } });
    if (!user) return { success: true }; // Don't reveal if user exists
    // 2. Generate token (use crypto for now)
    const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
    // TODO: Save token to DB with expiry, associated with user
    await ctx.db.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: addMinutes(new Date(), 30),
      },
    });
    // 3. Send email (placeholder)
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${token}`;
    await sendEmail({
      to: email,
      subject: "Reset your password",
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 30 minutes.</p>`,
    });
    return { success: true };
  }),
}); 