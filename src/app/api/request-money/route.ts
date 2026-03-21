import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

const paymentRequestClient = (prisma as any).paymentRequest;

function isPaymentRequestUnavailable(error: unknown) {
  const msg = String((error as any)?.message || error || "").toLowerCase();
  return msg.includes("paymentrequest") || msg.includes("no such table") || msg.includes("p2021");
}

export async function GET() {
  try {
    const user = await requireAuth();

    if (!paymentRequestClient) {
      return NextResponse.json({ requests: [] });
    }

    const requests = await paymentRequestClient.findMany({
      where: {
        recipientId: user.id,
        status: "PENDING",
      },
      include: {
        requester: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      requests: requests.map((request: any) => ({
        id: request.id,
        amount: request.amount,
        note: request.note,
        createdAt: request.createdAt,
        recipientHandle: request.recipientHandle,
        requester: request.requester,
      })),
    });
  } catch (error) {
    if ((error as Error).message === "NOT_AUTHENTICATED") {
      return NextResponse.json({ message: "Nem vagy bejelentkezve" }, { status: 401 });
    }
    if (isPaymentRequestUnavailable(error)) {
      return NextResponse.json({ requests: [] });
    }
    console.error(error);
    return NextResponse.json({ message: "Szerver hiba" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { recipientHandle, amount, note } = body;
    const normalizedHandle = String(recipientHandle || "").trim().replace(/^@/, "").toLowerCase();
    const amountInt = Math.round(Number(amount));

    if (!normalizedHandle || isNaN(amountInt) || amountInt <= 0) {
      return NextResponse.json(
        { message: "Hiányzó vagy érvénytelen adatok" },
        { status: 400 }
      );
    }

    const recipient = await prisma.user.findFirst({
      where: {
        id: { not: user.id },
        email: { startsWith: `${normalizedHandle}@` },
      },
      select: { id: true, fullName: true, email: true },
    });

    let paymentRequestId: string | null = null;

    if (paymentRequestClient) {
      try {
        const paymentRequest = await paymentRequestClient.create({
          data: {
            requesterId: user.id,
            recipientId: recipient?.id,
            recipientHandle: normalizedHandle,
            amount: amountInt,
            note: note?.trim() || null,
          },
        });

        paymentRequestId = paymentRequest.id;
      } catch (error) {
        if (!isPaymentRequestUnavailable(error)) {
          throw error;
        }
      }
    }

    if (paymentRequestId) {
      await prisma.transaction.create({
        data: {
          userId: user.id,
          type: "TRANSFER_IN",
          amount: amountInt,
          currency: "HUF",
          description: `Kiküldött pénzkérés: @${normalizedHandle}`,
          reference: `PAYREQ:${paymentRequestId}`,
          status: "PENDING",
        },
      });
    }

    if (recipient?.id) {
      await prisma.notification.create({
        data: {
          userId: recipient.id,
          title: "Új pénzkérés",
          message: `${user.fullName} ${amountInt.toLocaleString("hu-HU")} HUF-ot kér tőled${note ? `: ${note}` : ""}`,
          category: "PAYMENT_REQUEST",
        },
      });
    }

    return NextResponse.json({
      success: true,
      requestId: paymentRequestId,
      message: recipient
        ? "Pénzkérés elküldve"
        : "Pénzkérés rögzítve. Ha a felhasználó létezik, értesítést fog kapni.",
    });
  } catch (error) {
    if ((error as Error).message === "NOT_AUTHENTICATED") {
      return NextResponse.json({ message: "Nem vagy bejelentkezve" }, { status: 401 });
    }
    if (isPaymentRequestUnavailable(error)) {
      return NextResponse.json({
        success: true,
        requestId: null,
        message: "Pénzkérés elküldve",
      });
    }
    console.error(error);
    return NextResponse.json({ message: "Szerver hiba" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAuth();

    if (!paymentRequestClient) {
      return NextResponse.json(
        { message: "A kéréskezelés átmenetileg nem elérhető" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const requestId = String(body.requestId || "");
    const action = String(body.action || "").toUpperCase();

    if (!requestId || !["ACCEPT", "REJECT"].includes(action)) {
      return NextResponse.json({ message: "Érvénytelen kérés" }, { status: 400 });
    }

    const paymentRequest = await paymentRequestClient.findUnique({
      where: { id: requestId },
      include: {
        requester: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    if (!paymentRequest || paymentRequest.recipientId !== user.id) {
      return NextResponse.json({ message: "A kérés nem található" }, { status: 404 });
    }

    if (paymentRequest.status !== "PENDING") {
      return NextResponse.json({ message: "A kérés már feldolgozva" }, { status: 400 });
    }

    if (action === "REJECT") {
      await prisma.$transaction([
        paymentRequestClient.update({
          where: { id: paymentRequest.id },
          data: {
            status: "REJECTED",
            respondedAt: new Date(),
          },
        }),
        prisma.transaction.updateMany({
          where: {
            userId: paymentRequest.requesterId,
            reference: `PAYREQ:${paymentRequest.id}`,
            status: "PENDING",
          },
          data: { status: "FAILED" },
        }),
        prisma.notification.create({
          data: {
            userId: paymentRequest.requesterId,
            title: "Pénzkérés elutasítva",
            message: `${user.fullName} elutasította a pénzkérésedet (${paymentRequest.amount.toLocaleString("hu-HU")} HUF).`,
            category: "PAYMENT_REQUEST",
          },
        }),
      ]);

      return NextResponse.json({ success: true, message: "Pénzkérés elutasítva" });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { balanceHuf: true },
    });

    if (!dbUser || dbUser.balanceHuf < paymentRequest.amount) {
      return NextResponse.json({ message: "Nincs elegendő fedezet" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      const trx = tx as any;

      await tx.user.update({
        where: { id: user.id },
        data: { balanceHuf: { decrement: paymentRequest.amount } },
      });

      await tx.user.update({
        where: { id: paymentRequest.requesterId },
        data: { balanceHuf: { increment: paymentRequest.amount } },
      });

      await tx.transaction.create({
        data: {
          userId: user.id,
          type: "TRANSFER_OUT",
          amount: paymentRequest.amount,
          currency: "HUF",
          description: `Pénzkérés teljesítése: ${paymentRequest.requester.fullName}`,
          status: "COMPLETED",
        },
      });

      const requesterPending = await tx.transaction.updateMany({
        where: {
          userId: paymentRequest.requesterId,
          reference: `PAYREQ:${paymentRequest.id}`,
          status: "PENDING",
        },
        data: {
          status: "COMPLETED",
          description: `Beérkezett pénzkérés: ${user.fullName}`,
        },
      });

      if (requesterPending.count === 0) {
        await tx.transaction.create({
          data: {
            userId: paymentRequest.requesterId,
            type: "TRANSFER_IN",
            amount: paymentRequest.amount,
            currency: "HUF",
            description: `Beérkezett pénzkérés: ${user.fullName}`,
            reference: `PAYREQ:${paymentRequest.id}`,
            status: "COMPLETED",
          },
        });
      }

      await trx.paymentRequest.update({
        where: { id: paymentRequest.id },
        data: {
          status: "ACCEPTED",
          respondedAt: new Date(),
        },
      });

      await tx.notification.create({
        data: {
          userId: paymentRequest.requesterId,
          title: "Pénzkérés teljesítve",
          message: `${user.fullName} jóváhagyta a pénzkérésedet (${paymentRequest.amount.toLocaleString("hu-HU")} HUF).`,
          category: "PAYMENT_REQUEST",
        },
      });
    });

    return NextResponse.json({ success: true, message: "Pénzkérés elfogadva" });
  } catch (error) {
    if ((error as Error).message === "NOT_AUTHENTICATED") {
      return NextResponse.json({ message: "Nem vagy bejelentkezve" }, { status: 401 });
    }
    if (isPaymentRequestUnavailable(error)) {
      return NextResponse.json(
        { message: "A kéréskezelés átmenetileg nem elérhető" },
        { status: 503 }
      );
    }
    console.error(error);
    return NextResponse.json({ message: "Szerver hiba" }, { status: 500 });
  }
}
