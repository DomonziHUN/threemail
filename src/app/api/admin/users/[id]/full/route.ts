import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

function parseReferralMaxInvites(value: unknown) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 1000) {
    return null;
  }

  return parsed;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        cards: {
          orderBy: { createdAt: "desc" },
          include: {
            transactions: {
              take: 10,
              orderBy: { createdAt: "desc" },
            },
          },
        },
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        kycDocument: true,
        referralEntries: {
          orderBy: { createdAt: "desc" },
          include: {
            referred: {
              select: { id: true, fullName: true, email: true, createdAt: true },
            },
          },
        },
        referredEntries: {
          orderBy: { createdAt: "desc" },
          include: {
            referrer: {
              select: { id: true, fullName: true, email: true },
            },
          },
        },
        notifications: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        securitySettings: true,
        sessions: {
          orderBy: { lastActive: "desc" },
        },
        limits: true,
        cryptoHoldings: {
          orderBy: { updatedAt: "desc" },
        },
        cryptoTransactions: {
          orderBy: { createdAt: "desc" },
          take: 30,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Felhasználó nem található" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    if ((error as Error).message === "NOT_AUTHENTICATED" || (error as Error).message === "NOT_AUTHORIZED") {
      return NextResponse.json({ message: "Nem jogosult" }, { status: 403 });
    }
    console.error(error);
    return NextResponse.json({ message: "Szerver hiba" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    switch (action) {
      // ─── Profile Update ───
      case "updateProfile": {
        const { fullName, email, phone, role, kycStatus, country, city, street, zipCode, adminNote, referralMaxInvites } = body;

        let parsedReferralMaxInvites: number | undefined;
        if (referralMaxInvites !== undefined) {
          parsedReferralMaxInvites = parseReferralMaxInvites(referralMaxInvites) ?? undefined;
          if (parsedReferralMaxInvites === undefined) {
            return NextResponse.json(
              { message: "A meghívási maximum 0 és 1000 közötti egész szám lehet" },
              { status: 400 }
            );
          }
        }

        // Handle balance separately to create transaction
        if (body.balanceHuf !== undefined) {
          const currentUser = await prisma.user.findUnique({ where: { id }, select: { balanceHuf: true } });
          if (currentUser) {
            const diff = Number(body.balanceHuf) - currentUser.balanceHuf;
            if (diff !== 0) {
              await prisma.$transaction([
                prisma.user.update({ where: { id }, data: { balanceHuf: Number(body.balanceHuf) } }),
                prisma.transaction.create({
                  data: {
                    userId: id,
                    type: diff > 0 ? "DEPOSIT" : "WITHDRAWAL",
                    amount: Math.abs(diff),
                    description: diff > 0 ? "Admin egyenleg feltöltés" : "Admin egyenleg levonás",
                    status: "COMPLETED",
                  },
                }),
              ]);
            }
          }
        }

        const updateData: any = {
          ...(fullName !== undefined && { fullName }),
          ...(email !== undefined && { email: email.toLowerCase() }),
          ...(phone !== undefined && { phone }),
          ...(role !== undefined && { role }),
          ...(kycStatus !== undefined && { kycStatus }),
          ...(country !== undefined && { country }),
          ...(city !== undefined && { city }),
          ...(street !== undefined && { street }),
          ...(zipCode !== undefined && { zipCode }),
        };

        if (parsedReferralMaxInvites !== undefined) {
          updateData.referralMaxInvites = parsedReferralMaxInvites;
        }

        const updatedUser = await prisma.user.update({
          where: { id },
          data: updateData,
        });

        if (kycStatus !== undefined) {
          await prisma.kycDocument.updateMany({
            where: { userId: id },
            data: { status: kycStatus, adminNote: adminNote || null, reviewedAt: new Date() },
          });
        }

        return NextResponse.json({ success: true, user: updatedUser });
      }

      // ─── Card Operations ───
      case "updateCard": {
        const { cardId, status, color, onlinePurchase, contactless, atmWithdrawal, dailyLimit, monthlyLimit } = body;
        const card = await prisma.card.update({
          where: { id: cardId },
          data: {
            ...(status !== undefined && { status }),
            ...(color !== undefined && { color }),
            ...(onlinePurchase !== undefined && { onlinePurchase }),
            ...(contactless !== undefined && { contactless }),
            ...(atmWithdrawal !== undefined && { atmWithdrawal }),
            ...(dailyLimit !== undefined && { dailyLimit: Number(dailyLimit) }),
            ...(monthlyLimit !== undefined && { monthlyLimit: Number(monthlyLimit) }),
          },
        });
        return NextResponse.json({ success: true, card });
      }

      case "deleteCard": {
        const { cardId: delCardId } = body;
        await prisma.card.update({
          where: { id: delCardId },
          data: { status: "TERMINATED" },
        });
        return NextResponse.json({ success: true });
      }

      // ─── Transaction Operations ───
      case "createTransaction": {
        const { type, amount, description, status: txStatus, cardId: txCardId, senderName, senderAccountNumber } = body;
        const amountInt = Math.abs(Math.round(Number(amount)));

        const tx = await prisma.transaction.create({
          data: {
            userId: id,
            type,
            amount: amountInt,
            description: description || `Admin: ${type}`,
            status: txStatus || "COMPLETED",
            ...(txCardId && { cardId: txCardId }),
            ...(senderName && { senderName }),
            ...(senderAccountNumber && { senderAccountNumber }),
          },
        });

        // If DEPOSIT, TRANSFER_IN adjust balance up; WITHDRAWAL, CARD_PAYMENT, TRANSFER_OUT adjust down
        if ((type === "DEPOSIT" || type === "TRANSFER_IN") && (txStatus || "COMPLETED") === "COMPLETED") {
          await prisma.user.update({ where: { id }, data: { balanceHuf: { increment: amountInt } } });
        } else if ((type === "WITHDRAWAL" || type === "CARD_PAYMENT" || type === "TRANSFER_OUT") && (txStatus || "COMPLETED") === "COMPLETED") {
          await prisma.user.update({ where: { id }, data: { balanceHuf: { decrement: amountInt } } });
        }

        return NextResponse.json({ success: true, transaction: tx });
      }

      case "deleteTransaction": {
        const { transactionId } = body;
        await prisma.transaction.delete({ where: { id: transactionId } });
        return NextResponse.json({ success: true });
      }

      // ─── Crypto Operations ───
      case "updateCryptoHolding": {
        const { holdingId, amount: cryptoAmount, avgBuyPrice } = body;
        const holding = await prisma.cryptoHolding.update({
          where: { id: holdingId },
          data: {
            ...(cryptoAmount !== undefined && { amount: Number(cryptoAmount) }),
            ...(avgBuyPrice !== undefined && { avgBuyPrice: Number(avgBuyPrice) }),
          },
        });
        return NextResponse.json({ success: true, holding });
      }

      case "deleteCryptoHolding": {
        const { holdingId: delHoldingId } = body;
        await prisma.cryptoHolding.delete({ where: { id: delHoldingId } });
        return NextResponse.json({ success: true });
      }

      case "createCryptoHolding": {
        const { symbol, name: cryptoName, amount: newAmount, avgBuyPrice: newPrice } = body;
        const holding = await prisma.cryptoHolding.create({
          data: {
            userId: id,
            symbol,
            name: cryptoName,
            amount: Number(newAmount),
            avgBuyPrice: Number(newPrice),
          },
        });
        return NextResponse.json({ success: true, holding });
      }

      // ─── Referral Operations ───
      case "createReferral": {
        const { referredEmail, fakeName, bonusAmount: newBonusAmount, status: newRefStatus, completedAt } = body;
        console.log("createReferral - completedAt received:", completedAt);

        const referrer = await prisma.user.findUnique({ where: { id } });
        if (!referrer) {
          return NextResponse.json({ message: "Felhasználó nem található" }, { status: 404 });
        }

        const referrerMaxInvites = Number((referrer as any).referralMaxInvites ?? 10);

        const currentReferralsCount = await prisma.referral.count({
          where: { referrerId: id },
        });
        if (currentReferralsCount >= referrerMaxInvites) {
          return NextResponse.json(
            {
              message: `A felhasználó elérte a maximum meghívási limitet (${referrerMaxInvites})`,
            },
            { status: 400 }
          );
        }

        // If fakeName is provided, create a fake referral entry (no real user needed)
        if (fakeName) {
          const parsedDate = completedAt ? new Date(completedAt) : null;
          console.log("createReferral - parsed date:", parsedDate);
          const referral = await prisma.referral.create({
            data: {
              referrerId: id,
              fakeName,
              fakeEmail: referredEmail || null,
              bonusAmount: Number(newBonusAmount) || 0,
              status: newRefStatus || "REGISTERED",
              completedAt: parsedDate,
            },
          });
          return NextResponse.json({ success: true, referral });
        }

        // Otherwise, look up the real user
        const referredUser = await prisma.user.findUnique({ where: { email: referredEmail } });
        if (!referredUser) {
          return NextResponse.json({ message: "A megadott e-mail címmel nem található felhasználó" }, { status: 404 });
        }
        if (referredUser.id === id) {
          return NextResponse.json({ message: "Egy felhasználó nem hívhatja meg önmagát" }, { status: 400 });
        }

        const existing = await prisma.referral.findFirst({
          where: { referrerId: id, referredId: referredUser.id },
        });
        if (existing) {
          return NextResponse.json({ message: "Ez a meghívás már létezik" }, { status: 400 });
        }

        const referral = await prisma.referral.create({
          data: {
            referrerId: id,
            referredId: referredUser.id,
            bonusAmount: Number(newBonusAmount) || 0,
            status: newRefStatus || "REGISTERED",
            completedAt: completedAt ? new Date(completedAt) : null,
          },
        });
        return NextResponse.json({ success: true, referral });
      }

      case "updateReferral": {
        const { referralId, status: refStatus, bonusAmount, completedAt } = body;
        const referral = await prisma.referral.update({
          where: { id: referralId },
          data: {
            ...(refStatus !== undefined && { status: refStatus }),
            ...(bonusAmount !== undefined && { bonusAmount: Number(bonusAmount) }),
            ...(completedAt !== undefined && { completedAt: completedAt ? new Date(completedAt) : null }),
          },
        });
        return NextResponse.json({ success: true, referral });
      }

      case "deleteReferral": {
        const { referralId: delRefId } = body;
        await prisma.referral.delete({ where: { id: delRefId } });
        return NextResponse.json({ success: true });
      }

      // ─── Notification Operations ───
      case "deleteNotification": {
        const { notificationId } = body;
        await prisma.notification.delete({ where: { id: notificationId } });
        return NextResponse.json({ success: true });
      }

      // ─── Session Operations ───
      case "deleteSession": {
        const { sessionId } = body;
        await prisma.userSession.delete({ where: { id: sessionId } });
        return NextResponse.json({ success: true });
      }

      case "deleteAllSessions": {
        await prisma.userSession.deleteMany({ where: { userId: id } });
        return NextResponse.json({ success: true });
      }

      // ─── Limits Operations ───
      case "updateLimits": {
        const { dailyTransferLimit, monthlyTransferLimit, dailyCardLimit, monthlyCardLimit, dailyAtmLimit, monthlyAtmLimit, dailyOnlineLimit, monthlyOnlineLimit } = body;
        const limits = await prisma.userLimits.upsert({
          where: { userId: id },
          create: {
            userId: id,
            ...(dailyTransferLimit !== undefined && { dailyTransferLimit: Number(dailyTransferLimit) }),
            ...(monthlyTransferLimit !== undefined && { monthlyTransferLimit: Number(monthlyTransferLimit) }),
            ...(dailyCardLimit !== undefined && { dailyCardLimit: Number(dailyCardLimit) }),
            ...(monthlyCardLimit !== undefined && { monthlyCardLimit: Number(monthlyCardLimit) }),
            ...(dailyAtmLimit !== undefined && { dailyAtmLimit: Number(dailyAtmLimit) }),
            ...(monthlyAtmLimit !== undefined && { monthlyAtmLimit: Number(monthlyAtmLimit) }),
            ...(dailyOnlineLimit !== undefined && { dailyOnlineLimit: Number(dailyOnlineLimit) }),
            ...(monthlyOnlineLimit !== undefined && { monthlyOnlineLimit: Number(monthlyOnlineLimit) }),
          },
          update: {
            ...(dailyTransferLimit !== undefined && { dailyTransferLimit: Number(dailyTransferLimit) }),
            ...(monthlyTransferLimit !== undefined && { monthlyTransferLimit: Number(monthlyTransferLimit) }),
            ...(dailyCardLimit !== undefined && { dailyCardLimit: Number(dailyCardLimit) }),
            ...(monthlyCardLimit !== undefined && { monthlyCardLimit: Number(monthlyCardLimit) }),
            ...(dailyAtmLimit !== undefined && { dailyAtmLimit: Number(dailyAtmLimit) }),
            ...(monthlyAtmLimit !== undefined && { monthlyAtmLimit: Number(monthlyAtmLimit) }),
            ...(dailyOnlineLimit !== undefined && { dailyOnlineLimit: Number(dailyOnlineLimit) }),
            ...(monthlyOnlineLimit !== undefined && { monthlyOnlineLimit: Number(monthlyOnlineLimit) }),
          },
        });
        return NextResponse.json({ success: true, limits });
      }

      // ─── Security Settings ───
      case "updateSecurity": {
        const { twoFactorEnabled, biometricEnabled, emailNotifications, smsNotifications, loginAlerts, transactionAlerts } = body;
        const security = await prisma.securitySettings.upsert({
          where: { userId: id },
          create: {
            userId: id,
            ...(twoFactorEnabled !== undefined && { twoFactorEnabled }),
            ...(biometricEnabled !== undefined && { biometricEnabled }),
            ...(emailNotifications !== undefined && { emailNotifications }),
            ...(smsNotifications !== undefined && { smsNotifications }),
            ...(loginAlerts !== undefined && { loginAlerts }),
            ...(transactionAlerts !== undefined && { transactionAlerts }),
          },
          update: {
            ...(twoFactorEnabled !== undefined && { twoFactorEnabled }),
            ...(biometricEnabled !== undefined && { biometricEnabled }),
            ...(emailNotifications !== undefined && { emailNotifications }),
            ...(smsNotifications !== undefined && { smsNotifications }),
            ...(loginAlerts !== undefined && { loginAlerts }),
            ...(transactionAlerts !== undefined && { transactionAlerts }),
          },
        });
        return NextResponse.json({ success: true, security });
      }

      // ─── Delete User ───
      case "deleteUser": {
        await prisma.$transaction([
          prisma.notification.deleteMany({ where: { userId: id } }),
          prisma.userSession.deleteMany({ where: { userId: id } }),
          prisma.webAuthnChallenge.deleteMany({ where: { userId: id } }),
          prisma.webAuthnCredential.deleteMany({ where: { userId: id } }),
          prisma.cryptoTransaction.deleteMany({ where: { userId: id } }),
          prisma.cryptoHolding.deleteMany({ where: { userId: id } }),
          prisma.transaction.deleteMany({ where: { userId: id } }),
          prisma.card.deleteMany({ where: { userId: id } }),
          prisma.referral.deleteMany({ where: { OR: [{ referrerId: id }, { referredId: id }] } }),
          prisma.kycDocument.deleteMany({ where: { userId: id } }),
          prisma.securitySettings.deleteMany({ where: { userId: id } }),
          prisma.userLimits.deleteMany({ where: { userId: id } }),
          prisma.user.delete({ where: { id } }),
        ]);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ message: "Ismeretlen művelet" }, { status: 400 });
    }
  } catch (error) {
    if ((error as Error).message === "NOT_AUTHENTICATED" || (error as Error).message === "NOT_AUTHORIZED") {
      return NextResponse.json({ message: "Nem jogosult" }, { status: 403 });
    }
    console.error("[admin/users/full]", error);
    return NextResponse.json({ message: "Szerver hiba" }, { status: 500 });
  }
}
