import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import {
  generateReferralCode,
  generatePaymentReference,
  generateCardNumber,
  generateCVV,
  generatePIN,
  generateExpiryDate,
} from "@/lib/generate";
import { registerSchema } from "@/lib/validations";
import { encryptCardData } from "@/lib/crypto";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
    }

    const data = {
      ...parsed.data,
      phone: parsed.data.phone?.trim() || undefined,
      referralCode: parsed.data.referralCode?.trim().toUpperCase() || undefined,
    };
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Ezzel az e-mail címmel már regisztráltak" },
        { status: 409 }
      );
    }

    let referredBy = null;
    if (data.referralCode) {
      referredBy = await prisma.user.findUnique({
        where: { referralCode: data.referralCode },
      });

      if (!referredBy) {
        return NextResponse.json(
          { message: "Érvénytelen meghívókód" },
          { status: 400 }
        );
      }
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const verificationToken = randomBytes(32).toString("hex");

    const [referralCode, paymentReference] = await Promise.all([
      generateReferralCode(),
      generatePaymentReference(),
    ]);

    const { month, year } = generateExpiryDate();
    const cardNumber = generateCardNumber();
    const last4 = cardNumber.slice(-4);
    const cvv = generateCVV();
    const pin = generatePIN();

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        fullName: data.fullName,
        phone: data.phone,
        referralCode,
        paymentReference,
        referredById: referredBy?.id,
        emailVerificationToken: verificationToken,
      },
    });

    await prisma.card.create({
      data: {
        userId: user.id,
        cardNumber: encryptCardData(cardNumber),
        last4,
        expiryMonth: month,
        expiryYear: year,
        cvv: encryptCardData(cvv),
        pin: encryptCardData(pin),
        status: "FROZEN",
      },
    });

    if (referredBy) {
      await prisma.referral.create({
        data: {
          referrerId: referredBy.id,
          referredId: user.id,
        },
      });
    }

    try {
      await sendVerificationEmail(user.email, verificationToken);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    return NextResponse.json({ 
      success: true,
      user: {
        email: user.email,
        id: user.id,
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Ismeretlen hiba" }, { status: 500 });
  }
}
