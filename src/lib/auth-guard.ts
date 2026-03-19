import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentSession() {
  return auth();
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("NOT_AUTHENTICATED");
  }
  return session.user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (dbUser?.role !== "ADMIN" && dbUser?.email?.toLowerCase().trim() !== "erikapukaja@gmail.com") {
    throw new Error("NOT_AUTHORIZED");
  }
  return dbUser;
}
