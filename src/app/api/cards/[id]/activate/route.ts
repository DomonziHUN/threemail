import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { decryptCardData } from "@/lib/crypto";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireAuth();
    
    let pin = "";
    try {
      const body = await request.json();
      pin = body.pin;
    } catch (e) {
      return NextResponse.json({ message: "Érvénytelen kérés" }, { status: 400 });
    }

    if (!pin || pin.length !== 4) {
      return NextResponse.json({ message: "Adj meg egy 4 számjegyű PIN-kódot!" }, { status: 400 });
    }

    const card = await prisma.card.findFirst({
      where: { id, userId: user.id },
    });

    if (!card) {
      return NextResponse.json({ message: "Kártya nem található" }, { status: 404 });
    }
    
    if (card.status !== "INACTIVE") {
      return NextResponse.json({ message: "A kártya státusza nem inaktív" }, { status: 400 });
    }

    const realPin = decryptCardData(card.pin);
    if (pin !== realPin) {
      return NextResponse.json({ message: "Helytelen PIN-kód!" }, { status: 403 });
    }

    await prisma.card.update({
      where: { id },
      data: { status: "ACTIVE" }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as Error).message === "NOT_AUTHENTICATED") {
      return NextResponse.json({ message: "Nem vagy bejelentkezve" }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ message: "Szerver hiba" }, { status: 500 });
  }
}
