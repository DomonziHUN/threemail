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
      include: { limits: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If user doesn't have limits yet, create default ones
    if (!user.limits) {
      const newLimits = await prisma.userLimits.create({
        data: {
          userId: user.id,
          dailyTransferLimit: 10000,
          monthlyTransferLimit: 100000,
          dailyCardLimit: 5000,
          monthlyCardLimit: 50000,
          dailyAtmLimit: 2000,
          monthlyAtmLimit: 20000,
          dailyOnlineLimit: 3000,
          monthlyOnlineLimit: 30000,
        },
      });
      return NextResponse.json(newLimits);
    }

    return NextResponse.json(user.limits);
  } catch (error) {
    console.error("Error fetching limits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { limits: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const limits = await req.json();

    // Validate limits
    const maxLimits = {
      dailyTransferLimit: 100000,
      monthlyTransferLimit: 1000000,
      dailyCardLimit: 50000,
      monthlyCardLimit: 500000,
      dailyAtmLimit: 10000,
      monthlyAtmLimit: 100000,
      dailyOnlineLimit: 25000,
      monthlyOnlineLimit: 250000,
    };

    for (const [key, value] of Object.entries(limits)) {
      if (typeof value !== "number" || value < 0) {
        return NextResponse.json(
          { error: `Invalid value for ${key}` },
          { status: 400 }
        );
      }

      const maxValue = maxLimits[key as keyof typeof maxLimits];
      if (value > maxValue) {
        return NextResponse.json(
          { error: `${key} exceeds maximum allowed value of ${maxValue}` },
          { status: 400 }
        );
      }
    }

    // Update or create limits in database
    const updatedLimits = await prisma.userLimits.upsert({
      where: { userId: user.id },
      update: {
        dailyTransferLimit: limits.dailyTransferLimit,
        monthlyTransferLimit: limits.monthlyTransferLimit,
        dailyCardLimit: limits.dailyCardLimit,
        monthlyCardLimit: limits.monthlyCardLimit,
        dailyAtmLimit: limits.dailyAtmLimit,
        monthlyAtmLimit: limits.monthlyAtmLimit,
        dailyOnlineLimit: limits.dailyOnlineLimit,
        monthlyOnlineLimit: limits.monthlyOnlineLimit,
      },
      create: {
        userId: user.id,
        dailyTransferLimit: limits.dailyTransferLimit,
        monthlyTransferLimit: limits.monthlyTransferLimit,
        dailyCardLimit: limits.dailyCardLimit,
        monthlyCardLimit: limits.monthlyCardLimit,
        dailyAtmLimit: limits.dailyAtmLimit,
        monthlyAtmLimit: limits.monthlyAtmLimit,
        dailyOnlineLimit: limits.dailyOnlineLimit,
        monthlyOnlineLimit: limits.monthlyOnlineLimit,
      },
    });

    return NextResponse.json({ success: true, limits: updatedLimits });
  } catch (error) {
    console.error("Error updating limits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
