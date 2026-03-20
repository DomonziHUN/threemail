import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
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

    let settings = user.securitySettings;

    if (!settings) {
      settings = await prisma.securitySettings.create({
        data: {
          userId: user.id,
        },
      });
    }

    return NextResponse.json({
      settings: {
        twoFactorEnabled: settings.twoFactorEnabled,
        biometricEnabled: settings.biometricEnabled,
        emailNotifications: settings.emailNotifications,
        smsNotifications: settings.smsNotifications,
        loginAlerts: settings.loginAlerts,
        transactionAlerts: settings.transactionAlerts,
        marketingEmails: settings.marketingEmails,
        dataSharing: settings.dataSharing,
        activityTracking: settings.activityTracking,
      },
    });
  } catch (error) {
    console.error("Error fetching security settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
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

    const body = await req.json();

    let settings = user.securitySettings;

    if (!settings) {
      settings = await prisma.securitySettings.create({
        data: {
          userId: user.id,
          ...body,
        },
      });
    } else {
      settings = await prisma.securitySettings.update({
        where: { userId: user.id },
        data: body,
      });
    }

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Error updating security settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
