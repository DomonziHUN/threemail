import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { cardControlsSchema } from "@/lib/validations";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireAuth();
    const body = await request.json();
    const parsed = cardControlsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
    }

    const card = await prisma.card.findFirst({
      where: { id, userId: user.id },
    });

    if (!card) {
      return NextResponse.json({ message: "Kártya nem található" }, { status: 404 });
    }

    const updatedCard = await prisma.card.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ card: updatedCard });
  } catch (error) {
    if ((error as Error).message === "NOT_AUTHENTICATED") {
      return NextResponse.json({ message: "Nem vagy bejelentkezve" }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ message: "Szerver hiba" }, { status: 500 });
  }
}
