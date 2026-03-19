import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const { recipientName, recipientAccount, accountType, currency, amount, description } =
      await req.json();

    // --- Bemenet validáció ---
    if (!recipientName || !recipientAccount || !accountType || !currency || !amount) {
      return NextResponse.json({ message: "Hiányos adatok" }, { status: 400 });
    }

    const amountInt = Math.round(Number(amount));
    if (isNaN(amountInt) || amountInt <= 0) {
      return NextResponse.json({ message: "Érvénytelen összeg" }, { status: 400 });
    }

    // --- Egyenleg ellenőrzés ---
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { balanceHuf: true },
    });

    if (!dbUser) {
      return NextResponse.json({ message: "Felhasználó nem található" }, { status: 404 });
    }

    if (dbUser.balanceHuf < amountInt) {
      return NextResponse.json({ message: "Nincs elegendő fedezet" }, { status: 400 });
    }

    // --- Tranzakció + egyenleg atomi frissítése ---
    const [transaction] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          userId: user.id,
          type: "TRANSFER_OUT",
          amount: amountInt,
          currency,
          description:
            description?.trim() ||
            `Utalás: ${recipientName} (${recipientAccount})`,
          status: "COMPLETED",
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { balanceHuf: { decrement: amountInt } },
      }),
    ]);

    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { balanceHuf: true },
    });

    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
      newBalance: updatedUser?.balanceHuf,
    });
  } catch (error) {
    if ((error as Error).message === "NOT_AUTHENTICATED") {
      return NextResponse.json({ message: "Nem vagy bejelentkezve" }, { status: 401 });
    }
    console.error("[transfer]", error);
    return NextResponse.json({ message: "Szerver hiba" }, { status: 500 });
  }
}
