import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import crypto from "node:crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amountHuf: number) {
  return new Intl.NumberFormat("hu-HU", {
    style: "currency",
    currency: "HUF",
    minimumFractionDigits: 0,
  }).format(amountHuf);
}

export function formatEuro(amountEur: number) {
  return new Intl.NumberFormat("hu-HU", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountEur);
}

export function formatDate(date: Date | string | number) {
  return format(date, "yyyy. MMM d.");
}

export function randomAlphaNumeric(length: number) {
  if (length <= 0) throw new Error("length must be positive");
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = crypto.randomBytes(length);
  return Array.from(bytes, (byte) => chars[byte % chars.length]).join("");
}

export function avatarInitials(name: string) {
  const [first = "", second = ""] = name.trim().split(" ");
  const initials = `${first[0] ?? ""}${second[0] ?? ""}`.toUpperCase();
  return initials || "TM";
}
