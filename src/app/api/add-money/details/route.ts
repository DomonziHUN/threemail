import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { BANK_ACCOUNT_NUMBER, BANK_BENEFICIARY_NAME } from "@/lib/constants";

export async function GET() {
  try {
    const user = await requireAuth();
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { paymentReference: true },
    });

    if (!dbUser) {
      return NextResponse.json({ message: "Felhasználó nem található" }, { status: 404 });
    }

    return NextResponse.json({
      accountNumber: BANK_ACCOUNT_NUMBER,
      beneficiaryName: BANK_BENEFICIARY_NAME,
      reference: dbUser.paymentReference,
    });
  } catch (error) {
    if ((error as Error).message === "NOT_AUTHENTICATED") {
      return NextResponse.json({ message: "Nem vagy bejelentkezve" }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ message: "Szerver hiba" }, { status: 500 });
  }
}
