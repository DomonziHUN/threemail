import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userId, userIds, title, message, category } = await req.json();

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
    }

    // Send to specific user
    if (userId) {
      await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          category: category || "INFO",
        },
      });
      return NextResponse.json({ success: true, count: 1 });
    }

    // Send to multiple users
    if (userIds && Array.isArray(userIds)) {
      await prisma.notification.createMany({
        data: userIds.map((uid: string) => ({
          userId: uid,
          title,
          message,
          category: category || "INFO",
        })),
      });
      return NextResponse.json({ success: true, count: userIds.length });
    }

    // Send to all users
    const allUsers = await prisma.user.findMany({
      where: { role: "USER" },
      select: { id: true },
    });

    await prisma.notification.createMany({
      data: allUsers.map((user) => ({
        userId: user.id,
        title,
        message,
        category: category || "INFO",
      })),
    });

    return NextResponse.json({ success: true, count: allUsers.length });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}
