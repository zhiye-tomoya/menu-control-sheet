import { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db/connection";
import { users, userShops } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import "@/lib/types/auth";

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !db) {
          return null;
        }

        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .limit(1)
          .then((rows) => rows[0] || null);

        if (!user) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(credentials.password as string, user.hashedPassword);

        if (!isValidPassword) {
          return null;
        }

        // Get user's shops
        const userShopsData = await db.select({ shopId: userShops.shopId }).from(userShops).where(eq(userShops.userId, user.id));

        const shopIds = userShopsData.map((us) => us.shopId);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          organizationId: user.organizationId,
          isAdmin: user.isAdmin,
          shopIds,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.organizationId = user.organizationId;
        token.isAdmin = user.isAdmin;
        token.shopIds = user.shopIds;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.organizationId = token.organizationId as string;
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.shopIds = token.shopIds as string[];
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
};
