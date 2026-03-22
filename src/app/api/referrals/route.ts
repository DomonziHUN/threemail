import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { INVITE_URL_BASE } from "@/lib/constants";

export async function GET() {
  try {
    const user = await requireAuth();
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ message: "Felhasználó nem található" }, { status: 404 });
    }

    const referrals = await prisma.referral.findMany({
      where: { referrerId: user.id },
      include: {
        referred: {
          select: {
            fullName: true,
            createdAt: true,
            balanceHuf: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalReferrals = referrals.length;
    const activeReferrals = referrals.filter((r: any) => r.status === "ACTIVATED").length;
    const totalBonus = referrals.reduce((sum: number, r: any) => sum + r.bonusAmount, 0);

    const referralMaxInvites = Number((dbUser as any).referralMaxInvites ?? 10);

    return NextResponse.json({
      referralCode: dbUser.referralCode,
      inviteUrl: `${INVITE_URL_BASE}?ref=${dbUser.referralCode}`,
      stats: {
        total: totalReferrals,
        max: referralMaxInvites,
        active: activeReferrals,
        bonus: totalBonus,
      },
      referrals: referrals.map((r: any) => ({
        id: r.id,
        name: maskName(r.fakeName || r.referred?.fullName || "Ismeretlen"),
        createdAt: r.completedAt || r.referred?.createdAt || r.createdAt,
        status: r.status,
        bonusAmount: r.bonusAmount,
      })),
    });
  } catch (error) {
    if ((error as Error).message === "NOT_AUTHENTICATED") {
      return NextResponse.json({ message: "Nem vagy bejelentkezve" }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ message: "Szerver hiba" }, { status: 500 });
  }
}

function maskName(name: string) {
  const parts = name.split(" ");
  return parts
    .map((part) => {
      if (part.length <= 2) return part;
      return part[0] + "***";
    })
    .join(" ");
}
