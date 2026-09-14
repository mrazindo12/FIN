import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    newUser: "/overview",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role;

      const isAuthRoute =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/register");
      const isPublicApi =
        nextUrl.pathname.startsWith("/api/auth") ||
        nextUrl.pathname.startsWith("/api/webhooks") ||
        nextUrl.pathname.startsWith("/api/cron");

      if (isPublicApi) return true;

      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      if (isAdminRoute) {
        if (!isLoggedIn || userRole !== "STAFF") {
          return Response.redirect(new URL("/overview", nextUrl));
        }
        return true;
      }

      if (isAuthRoute) {
        if (isLoggedIn) {
          const defaultTarget = userRole === "STAFF" ? "/admin" : "/overview";
          return Response.redirect(new URL(defaultTarget, nextUrl));
        }
        return true;
      }

      // Any other route requires authentication
      return isLoggedIn;
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.role) token.role = session.role;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as "STUDENT" | "STAFF";
      }
      return session;
    },
  },
  providers: [], // Added in auth.ts with full node runtime
} satisfies NextAuthConfig;
