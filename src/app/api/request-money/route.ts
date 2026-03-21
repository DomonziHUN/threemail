import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { recipientId, amount, note } = body;

    if (!recipientId || !amount || amount <= 0) {
      return NextResponse.json(
        { message: "Hiányzó vagy érvénytelen adatok" },
        { status: 400 }
      );
    }

    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { id: true, fullName: true },
    });

    if (!recipient) {
      return NextResponse.json(
        { message: "A felhasználó nem található" },
        { status: 404 }
      );
    }

    await prisma.notification.create({
      data: {
        userId: recipientId,
        title: "Új pénzkérés",
        message: `${user.fullName} ${amount.toLocaleString("hu-HU")} HUF-ot kér tőled${note ? `: ${note}` : ""}`,
        category: "PAYMENT_REQUEST",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pénzkérés elküldve",
    });
  } catch (error) {
    if ((error as Error).message === "NOT_AUTHENTICATED") {
      return NextResponse.json({ message: "Nem vagy bejelentkezve" }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ message: "Szerver hiba" }, { status: 500 });
  }
}
