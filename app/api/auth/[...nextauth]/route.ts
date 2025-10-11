import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth";

export const { handlers, auth } = NextAuth(authConfig);
export const { GET, POST } = handlers;
