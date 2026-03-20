import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as speakeasy from "speakeasy";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { securitySettings: true },
    });

    if (!user || !user.securitySettings?.twoFactorSecret) {
      return NextResponse.json({ error: "2FA not set up" }, { status: 400 });
    }

    const { code } = await req.json();

    const verified = speakeasy.totp.verify({
      secret: user.securitySettings.twoFactorSecret,
      encoding: "base32",
      token: code,
      window: 2,
    });

    if (!verified) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    await prisma.securitySettings.update({
      where: { userId: user.id },
      data: {
        twoFactorEnabled: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error verifying 2FA:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
