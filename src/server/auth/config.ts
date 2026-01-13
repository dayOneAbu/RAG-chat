import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { db } from "~/server/db";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "hello@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const { email, password } = loginSchema.parse(credentials);
          const user = await db.user.findUnique({
            where: { email },
          });
          if (!user?.password || !user.isVerified) {
            return null;
          }
          const isValid = await compare(password, user.password);
          if (!isValid) {
            return null;
          }
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  adapter: PrismaAdapter(db),
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.id as string,
      },
    }),
    async signIn({ user }) {
      const dbUser = await db.user.findUnique({
        where: { email: user.email ?? undefined },
      });
      if (!dbUser?.isVerified) {
        return false;
      }
      return true;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
} satisfies NextAuthConfig;