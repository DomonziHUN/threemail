import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const user = await requireAuth();
    await prisma.user.update({
      where: { id: user.id },
      data: { kycStatus: "APPROVED" }
    });
    return NextResponse.json({ success: true, message: "KYC sikeresen elfogadva!" });
  } catch (error) {
    if ((error as Error).message === "NOT_AUTHENTICATED") {
      return NextResponse.json({ message: "Nem vagy bejelentkezve" }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ message: "Szerver hiba" }, { status: 500 });
  }
}
