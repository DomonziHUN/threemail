import NextAuth, { type NextAuthOptions, type User, getServerSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import type { JWT } from "next-auth/jwt";

type CredentialsUser = User & {
  role: string;
  fullName: string;
};

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          throw new Error("Hibás bejelentkezési adatok");
        }

        const email = parsed.data.email.toLowerCase();

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          throw new Error("Hibás e-mail vagy jelszó");
        }

        const isValid = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash
        );

        if (!isValid) {
          throw new Error("Hibás e-mail vagy jelszó");
        }

        const credentialsUser: CredentialsUser = {
          id: user.id,
          email: user.email,
          name: user.fullName,
          fullName: user.fullName,
          role: user.role,
        };
        return credentialsUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const authUser = user as CredentialsUser;
        (token as JWT & CredentialsUser).id = authUser.id;
        (token as JWT & CredentialsUser).role = authUser.role;
        (token as JWT & CredentialsUser).fullName = authUser.fullName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        const typedToken = token as JWT & CredentialsUser;
        session.user.id = typedToken.id;
        session.user.role = typedToken.role;
        session.user.fullName = typedToken.fullName;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

// next-auth v4 handler — used by the API route
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// Convenience helper — use this instead of next-auth v5's auth()
export async function auth() {
  return getServerSession(authOptions);
}
