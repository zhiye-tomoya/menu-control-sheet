import { DefaultSession } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      organizationId: string;
      isAdmin: boolean;
      shopIds: string[];
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    name: string;
    organizationId: string;
    isAdmin: boolean;
    shopIds: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    organizationId: string;
    isAdmin: boolean;
    shopIds: string[];
  }
}
