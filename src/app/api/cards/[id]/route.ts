import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { decryptCardData } from "@/lib/crypto";
import bcrypt from "bcryptjs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireAuth();
    const card = await prisma.card.findFirst({
      where: { id, userId: user.id },
    });

    if (!card) {
      return NextResponse.json({ message: "Kártya nem található" }, { status: 404 });
    }

    return NextResponse.json({
      ...card,
      cardNumber: decryptCardData(card.cardNumber),
      cvv: decryptCardData(card.cvv),
      pin: decryptCardData(card.pin),
    });
  } catch (error) {
    if ((error as Error).message === "NOT_AUTHENTICATED") {
      return NextResponse.json({ message: "Nem vagy bejelentkezve" }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ message: "Szerver hiba" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireAuth();

    let password = "";
    try {
      const body = await request.json();
      password = body.password;
    } catch (e) {
      return NextResponse.json({ message: "Érvénytelen kérés" }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ message: "A jelszó megadása kötelező!" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
      return NextResponse.json({ message: "Érvénytelen felhasználó" }, { status: 400 });
    }

    const isValid = await bcrypt.compare(password, dbUser.passwordHash);
    if (!isValid) {
      return NextResponse.json({ message: "Helytelen jelszó!" }, { status: 403 });
    }

    const card = await prisma.card.findFirst({
      where: { id, userId: user.id },
    });

    if (!card) {
      return NextResponse.json({ message: "Kártya nem található" }, { status: 404 });
    }

    await prisma.card.update({
      where: { id },
      data: { status: "TERMINATED" },
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
