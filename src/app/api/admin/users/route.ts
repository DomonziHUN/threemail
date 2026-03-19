import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        cards: true,
        kycDocument: true,
        _count: {
          select: { transactions: true, referrals: true },
        },
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    if ((error as Error).message === "NOT_AUTHENTICATED" || (error as Error).message === "NOT_AUTHORIZED") {
      return NextResponse.json({ message: "Nem jogosult" }, { status: 403 });
    }
    return NextResponse.json({ message: "Szerver hiba" }, { status: 500 });
  }
}
