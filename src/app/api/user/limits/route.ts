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
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return default limits (in a real app, these would be stored in database)
    const limits = {
      dailyTransferLimit: 10000,
      monthlyTransferLimit: 100000,
      dailyCardLimit: 5000,
      monthlyCardLimit: 50000,
      dailyAtmLimit: 2000,
      monthlyAtmLimit: 20000,
      dailyOnlineLimit: 3000,
      monthlyOnlineLimit: 30000,
    };

    return NextResponse.json(limits);
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

    // In a real app, save to database
    // For now, just return success

    return NextResponse.json({ success: true, limits });
  } catch (error) {
    console.error("Error updating limits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
