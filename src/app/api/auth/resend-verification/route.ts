import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { randomBytes } from "crypto";

export async function POST() {
  try {
    const user = await requireAuth();
    
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json(
        { message: "Felhasználó nem található" },
        { status: 404 }
      );
    }

    if (dbUser.emailVerified) {
      return NextResponse.json(
        { message: "Az email cím már megerősítve" },
        { status: 400 }
      );
    }

    const verificationToken = randomBytes(32).toString("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerificationToken: verificationToken },
    });

    await sendVerificationEmail(dbUser.email, verificationToken);

    return NextResponse.json({ 
      success: true,
      message: "Megerősítő email újraküldve!" 
    });
  } catch (error) {
    if ((error as Error).message === "NOT_AUTHENTICATED") {
      return NextResponse.json(
        { message: "Nem vagy bejelentkezve" },
        { status: 401 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { message: "Szerver hiba" },
      { status: 500 }
    );
  }
}
