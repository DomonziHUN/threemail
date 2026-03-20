import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, symbol, name, amount, pricePerUnit } = await req.json();

    if (!type || !symbol || !name || !amount || !pricePerUnit) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (type !== "BUY" && type !== "SELL") {
      return NextResponse.json({ error: "Invalid transaction type" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { cryptoHoldings: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const totalHuf = amount * pricePerUnit;

    if (type === "BUY") {
      if (user.balanceHuf < totalHuf) {
        return NextResponse.json(
          { error: "Insufficient balance" },
          { status: 400 }
        );
      }

      const existingHolding = user.cryptoHoldings.find(
        (h) => h.symbol === symbol
      );

      if (existingHolding) {
        const newTotalAmount = existingHolding.amount + amount;
        const newAvgPrice =
          (existingHolding.avgBuyPrice * existingHolding.amount +
            pricePerUnit * amount) /
          newTotalAmount;

        await prisma.cryptoHolding.update({
          where: { id: existingHolding.id },
          data: {
            amount: newTotalAmount,
            avgBuyPrice: newAvgPrice,
          },
        });
      } else {
        await prisma.cryptoHolding.create({
          data: {
            userId: user.id,
            symbol,
            name,
            amount,
            avgBuyPrice: pricePerUnit,
          },
        });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { balanceHuf: user.balanceHuf - totalHuf },
      });
    } else {
      const holding = user.cryptoHoldings.find((h) => h.symbol === symbol);

      if (!holding || holding.amount < amount) {
        return NextResponse.json(
          { error: "Insufficient crypto balance" },
          { status: 400 }
        );
      }

      const newAmount = holding.amount - amount;

      if (newAmount === 0) {
        await prisma.cryptoHolding.delete({
          where: { id: holding.id },
        });
      } else {
        await prisma.cryptoHolding.update({
          where: { id: holding.id },
          data: { amount: newAmount },
        });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { balanceHuf: user.balanceHuf + totalHuf },
      });
    }

    await prisma.cryptoTransaction.create({
      data: {
        userId: user.id,
        type,
        symbol,
        name,
        amount,
        pricePerUnit,
        totalEur: totalHuf,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Crypto trade error:", error);
    return NextResponse.json(
      { error: "Failed to execute trade" },
      { status: 500 }
    );
  }
}
