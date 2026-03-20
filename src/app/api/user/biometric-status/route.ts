import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        securitySettings: true,
        webAuthnCredentials: true,
      },
    });

    if (!user) {
      return NextResponse.json({ hasBiometric: false });
    }

    const hasBiometric =
      user.securitySettings?.biometricEnabled &&
      user.webAuthnCredentials.length > 0;

    return NextResponse.json({ hasBiometric });
  } catch (error) {
    console.error("Error checking biometric status:", error);
    return NextResponse.json({ hasBiometric: false });
  }
}
