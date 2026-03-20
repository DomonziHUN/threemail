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

    // If balanceHuf changed, create a corresponding transaction so bonus tracking works
    if (balanceHuf !== undefined) {
      const currentUser = await prisma.user.findUnique({ where: { id }, select: { balanceHuf: true } });
      if (currentUser) {
        const diff = Number(balanceHuf) - currentUser.balanceHuf;
        if (diff !== 0) {
          await prisma.$transaction([
            prisma.user.update({
              where: { id },
              data: { balanceHuf: Number(balanceHuf) },
            }),
            prisma.transaction.create({
              data: {
                userId: id,
                type: diff > 0 ? "DEPOSIT" : "WITHDRAWAL",
                amount: Math.abs(diff),
                description: diff > 0 ? "Admin egyenleg feltöltés" : "Admin egyenleg levonás",
                status: "COMPLETED",
              },
            }),
          ]);
        }
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(fullName !== undefined && { fullName }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(role !== undefined && { role }),
        ...(kycStatus !== undefined && { kycStatus }),
      },
    });

    if (kycStatus !== undefined) {
      await prisma.kycDocument.updateMany({
        where: { userId: id },
        data: { 
          status: kycStatus, 
          adminNote: body.adminNote || null,
          reviewedAt: new Date()
        }
      });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    if ((error as Error).message === "NOT_AUTHENTICATED" || (error as Error).message === "NOT_AUTHORIZED") {
      return NextResponse.json({ message: "Nem jogosult" }, { status: 403 });
    }
    console.error(error);
    return NextResponse.json({ message: "Szerver hiba az adatok mentésekor" }, { status: 500 });
  }
}
