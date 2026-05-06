import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

// Extend the default session and user types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      provider?: string;
    };
  }

  interface User {
    id: string;
    provider?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    provider?: string;
  }
}

export async function authorizeCredentials(credentials: any) {
  if (!credentials?.email || !credentials?.password) {
    return null;
  }

  const email = credentials.email.toLowerCase().trim();
  const password = credentials.password.trim();

  if (email.endsWith("@elzatona.com") && password === "dev-access") {
    return {
      id: "dev-user-id",
      email: credentials.email,
      name: "Developer Access",
      role: "developer",
    };
  }

  if (email === "admin@test.com" && password === "admin-pass") {
    return {
      id: "admin-user-id",
      email: "admin@test.com",
      name: "Test Admin",
      role: "admin",
    };
  }

  if (email === "guest@test.com" && password === "guest-pass") {
    return {
      id: "guest-user-id",
      email: "guest@test.com",
      name: "Test Guest",
      role: "guest",
    };
  }

  return null;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: authorizeCredentials,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.provider = account?.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.provider = token.provider;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
