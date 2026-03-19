import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { adminBalanceUpdateSchema } from "@/lib/validations";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireAdmin();
    const body = await request.json();
    const parsed = adminBalanceUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ message: "Felhasználó nem található" }, { status: 404 });
    }

    const newBalance = user.balanceHuf + parsed.data.amount;

    const [updatedUser, transaction] = await prisma.$transaction([
      prisma.user.update({
        where: { id },
        data: { balanceHuf: newBalance },
      }),
      prisma.transaction.create({
        data: {
          userId: id,
          type: parsed.data.amount > 0 ? "DEPOSIT" : "WITHDRAWAL",
          amount: Math.abs(parsed.data.amount),
          description: parsed.data.description,
          status: "COMPLETED",
        },
      }),
    ]);

    return NextResponse.json({ user: updatedUser, transaction });
  } catch (error) {
    if ((error as Error).message === "NOT_AUTHENTICATED") {
      return NextResponse.json({ message: "Nem vagy bejelentkezve" }, { status: 401 });
    }
    if ((error as Error).message === "NOT_AUTHORIZED") {
      return NextResponse.json({ message: "Nincs jogosultságod" }, { status: 403 });
    }
    console.error(error);
    return NextResponse.json({ message: "Szerver hiba" }, { status: 500 });
  }
}
