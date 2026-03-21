import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { message: "Hiányzó token" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Érvénytelen vagy lejárt token" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
      },
    });

    return NextResponse.json({ 
      success: true,
      message: "Email cím sikeresen megerősítve!" 
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Szerver hiba" },
      { status: 500 }
    );
  }
}
