import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { generateCardNumber, generateCVV, generatePIN, generateExpiryDate } from "@/lib/generate";
import { encryptCardData } from "@/lib/crypto";

export async function GET() {
  try {
    const user = await requireAuth();
    
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { country: true, city: true, street: true, zipCode: true, balanceHuf: true }
    });
    const hasAddress = !!(dbUser?.country && dbUser?.city && dbUser?.street && dbUser?.zipCode);
    const balance = dbUser?.balanceHuf || 0;

    const cards = await prisma.card.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        transactions: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json({ cards, hasAddress, balance });
  } catch (error) {
    if ((error as Error).message === "NOT_AUTHENTICATED") {
      return NextResponse.json({ message: "Nem vagy bejelentkezve" }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ message: "Szerver hiba" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    
    let color = "green";
    let cardType = "VIRTUAL";
    try {
      const body = await request.json();
      if (body.color) color = body.color;
      if (body.cardType) cardType = body.cardType;
    } catch (e) {
      // Ignore JSON parse errors if body is empty
    }
    
    const { month, year } = generateExpiryDate();
    const cardNumber = generateCardNumber();
    const last4 = cardNumber.slice(-4);
    const cvv = generateCVV();
    const pin = generatePIN();

    const activeCardsCount = await prisma.card.count({
      where: {
        userId: user.id,
        status: { not: "TERMINATED" },
      }
    });

    if (cardType === "PHYSICAL") {
      const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { balanceHuf: true } });
      if (!dbUser || dbUser.balanceHuf < 10000) {
        return NextResponse.json({ message: "Nincs elegendő fedezet fizikai kártya igényléséhez. Minimum 10 000 Ft szükséges." }, { status: 400 });
      }
    }

    if (activeCardsCount >= 3) {
      return NextResponse.json({ message: "Maximum 3 aktív kártyád lehet!" }, { status: 400 });
    }

    const card = await prisma.card.create({
      data: {
        userId: user.id,
        cardNumber: encryptCardData(cardNumber),
        last4,
        expiryMonth: month,
        expiryYear: year,
        cvv: encryptCardData(cvv),
        pin: encryptCardData(pin),
        color,
        cardType,
        status: (cardType === "PHYSICAL" ? "INACTIVE" : "ACTIVE") as any,
      },
    });

    return NextResponse.json({ card }, { status: 201 });
  } catch (error) {
    if ((error as Error).message === "NOT_AUTHENTICATED") {
      return NextResponse.json({ message: "Nem vagy bejelentkezve" }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ message: "Szerver hiba" }, { status: 500 });
  }
}
