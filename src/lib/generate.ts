import { format } from "date-fns";
import crypto from "node:crypto";
import { REFERRAL_CODE_PREFIX, PAYMENT_REF_PREFIX } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { randomAlphaNumeric } from "@/lib/utils";

export async function generateReferralCode() {
  while (true) {
    const code = `${REFERRAL_CODE_PREFIX}${randomAlphaNumeric(6)}`;
    const existing = await prisma.user.findFirst({ where: { referralCode: code } });
    if (!existing) return code;
  }
}

export async function generatePaymentReference() {
  while (true) {
    const numeric = crypto.randomInt(0, 10_000_000);
    const padded = numeric.toString().padStart(8, "0");
    const reference = `${PAYMENT_REF_PREFIX}${padded}`;
    const existing = await prisma.user.findFirst({ where: { paymentReference: reference } });
    if (!existing) return reference;
  }
}

export function generateCardNumber() {
  const randomDigits = Array.from({ length: 14 }, () =>
    crypto.randomInt(0, 10).toString()
  ).join("");
  const base = `4${randomDigits}`;
  const digits = base.split("").map(Number);
  const luhnDigit = (() => {
    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
      let digit = digits[digits.length - 1 - i];
      if (i % 2 === 0) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }
    return (10 - (sum % 10)) % 10;
  })();
  return `${base}${luhnDigit}`;
}

export function generateCVV() {
  return crypto.randomInt(100, 999).toString();
}

export function generatePIN() {
  return crypto.randomInt(1000, 9999).toString();
}

export function generateExpiryDate() {
  const now = new Date();
  now.setFullYear(now.getFullYear() + 5);
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    label: format(now, "MM/yy"),
  };
}
