import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();
    
    // We extract the allowed fields to update.
    const { fullName, email, phone, balanceHuf, role, kycStatus } = body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(fullName !== undefined && { fullName }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(balanceHuf !== undefined && { balanceHuf: Number(balanceHuf) }),
        ...(role !== undefined && { role }),
        ...(kycStatus !== undefined && { kycStatus }),
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    if ((error as Error).message === "NOT_AUTHENTICATED" || (error as Error).message === "NOT_AUTHORIZED") {
      return NextResponse.json({ message: "Nem jogosult" }, { status: 403 });
    }
    console.error(error);
    return NextResponse.json({ message: "Szerver hiba az adatok mentésekor" }, { status: 500 });
  }
}
