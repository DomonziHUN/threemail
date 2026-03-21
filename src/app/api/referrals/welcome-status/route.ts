import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireAuth();
    
    // Check if user was invited
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!dbUser?.referredById) {
      return NextResponse.json({ isInvited: false });
    }

    const referral = await prisma.referral.findFirst({
      where: { referredId: user.id },
    });

    if (!referral) {
      return NextResponse.json({ isInvited: false });
    }

    // 1. Top-up 20,000 HUF
    const deposits = await prisma.transaction.aggregate({
      where: { userId: user.id, type: "DEPOSIT", status: "COMPLETED" },
      _sum: { amount: true },
    });
    const totalDeposited = deposits._sum.amount || 0;
    const hasTopup = totalDeposited >= 20000;

    // 2. Physical Card
    const physicalCard = await prisma.card.findFirst({
      where: { userId: user.id, cardType: "PHYSICAL", status: { not: "TERMINATED" } },
    });
    const hasPhysicalCard = !!physicalCard;

    // 3. KYC
    const hasKyc = dbUser.kycStatus === "APPROVED";

    // 4. Purchase 1x
    const purchase = await prisma.transaction.findFirst({
      where: { userId: user.id, type: "CARD_PAYMENT", status: "COMPLETED" },
    });
    const hasPurchase = !!purchase;

    // 5. Invite at least 1 user
    const invitedCount = await prisma.referral.count({
      where: { referrerId: user.id },
    });
    const hasInvitedUser = invitedCount >= 1;

    const allCompleted = hasTopup && hasPhysicalCard && hasKyc && hasPurchase && hasInvitedUser;

    // Payout logic
    if (allCompleted && referral.status !== "ACTIVATED" && referral.referredId) {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: referral.referrerId },
          data: { balanceHuf: { increment: 20000 } }
        }),
        prisma.user.update({
          where: { id: referral.referredId },
          data: { balanceHuf: { increment: 20000 } }
        }),
        prisma.referral.update({
          where: { id: referral.id },
          data: { status: "ACTIVATED", bonusAmount: 20000 }
        })
      ]);
    }

    return NextResponse.json({
      isInvited: true,
      status: allCompleted ? "ACTIVATED" : "PENDING",
      tasks: {
        topup: { completed: hasTopup, current: totalDeposited, required: 20000 },
        physicalCard: { completed: hasPhysicalCard },
        kyc: { completed: hasKyc },
        purchase: { completed: hasPurchase },
        inviteUser: { completed: hasInvitedUser, current: invitedCount, required: 1 }
      }
    });

  } catch (error) {
    if ((error as Error).message === "NOT_AUTHENTICATED") {
      return NextResponse.json({ message: "Nem vagy bejelentkezve" }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ message: "Szerver hiba" }, { status: 500 });
  }
}
