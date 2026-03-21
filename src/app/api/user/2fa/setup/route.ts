import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as speakeasy from "speakeasy";
import * as QRCode from "qrcode";

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

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const secret = speakeasy.generateSecret({
      name: `Threemail (${user.email})`,
      issuer: "Threemail",
    });

    let settings = user.securitySettings;

    if (!settings) {
      settings = await prisma.securitySettings.create({
        data: {
          userId: user.id,
          twoFactorSecret: secret.base32,
        },
      });
    } else {
      settings = await prisma.securitySettings.update({
        where: { userId: user.id },
        data: {
          twoFactorSecret: secret.base32,
        },
      });
    }

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || "");

    return NextResponse.json({
      qrCode: qrCodeUrl,
      secret: secret.base32,
    });
  } catch (error) {
    console.error("Error setting up 2FA:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
