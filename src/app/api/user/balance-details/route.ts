import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireAuth();

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { balanceHuf: true },
    });

    if (!dbUser) {
      return NextResponse.json({ message: "Felhasználó nem található" }, { status: 404 });
    }

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const thisMonthTransactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: thisMonthStart },
        status: "COMPLETED",
      },
      select: {
        type: true,
        amount: true,
      },
    });

    const lastMonthTransactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: lastMonthStart,
          lte: lastMonthEnd,
        },
        status: "COMPLETED",
      },
      select: {
        type: true,
        amount: true,
      },
    });

    const calculateTotals = (transactions: { type: string; amount: number }[]) => {
      let income = 0;
      let expense = 0;

      transactions.forEach((t) => {
        if (t.type === "DEPOSIT" || t.type === "TRANSFER_IN") {
          income += t.amount;
        } else if (t.type === "WITHDRAWAL" || t.type === "CARD_PAYMENT" || t.type === "TRANSFER_OUT") {
          expense += t.amount;
        }
      });

      return { income, expense };
    };

    const thisMonth = calculateTotals(thisMonthTransactions);
    const lastMonth = calculateTotals(lastMonthTransactions);

    const pendingTransactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        status: "PENDING",
      },
      select: {
        type: true,
        amount: true,
      },
    });

    let pendingIncoming = 0;
    let pendingOutgoing = 0;

    pendingTransactions.forEach((t) => {
      if (t.type === "DEPOSIT" || t.type === "TRANSFER_IN") {
        pendingIncoming += t.amount;
      } else {
        pendingOutgoing += t.amount;
      }
    });

    return NextResponse.json({
      totalBalance: dbUser.balanceHuf,
      availableBalance: dbUser.balanceHuf,
      pendingIncoming,
      pendingOutgoing,
      thisMonthIncome: thisMonth.income,
      thisMonthExpense: thisMonth.expense,
      lastMonthIncome: lastMonth.income,
      lastMonthExpense: lastMonth.expense,
    });
  } catch (error) {
    if ((error as Error).message === "NOT_AUTHENTICATED") {
      return NextResponse.json({ message: "Nem vagy bejelentkezve" }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ message: "Szerver hiba" }, { status: 500 });
  }
}
