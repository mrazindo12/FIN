import { Role } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: Role | "STUDENT" | "STAFF";
  }

  interface Session {
    user: {
      id: string;
      role?: Role | "STUDENT" | "STAFF";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role | "STUDENT" | "STAFF";
  }
}
