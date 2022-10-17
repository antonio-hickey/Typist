import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "../../../lib/prismadb";

export const authOptions = {
  // Authentication Providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    // @ts-expect-error
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.highScore = user.highScore;
      return session;
    },
  },
};

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  ...authOptions,
});
