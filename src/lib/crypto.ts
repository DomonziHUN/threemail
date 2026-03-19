import crypto from "node:crypto";

const SECRET = process.env.CARD_ENCRYPTION_KEY;

if (!SECRET) {
  throw new Error("CARD_ENCRYPTION_KEY környezeti változó nincs beállítva");
}

const KEY = crypto.createHash("sha256").update(SECRET).digest();

export function encryptCardData(value: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", KEY, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${encrypted.toString("hex")}:${tag.toString("hex")}`;
}

export function decryptCardData(payload: string) {
  const [ivHex, dataHex, tagHex] = payload.split(":");
  if (!ivHex || !dataHex || !tagHex) {
    throw new Error("Érvénytelen titkosított formátum");
  }
  const iv = Buffer.from(ivHex, "hex");
  const data = Buffer.from(dataHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", KEY, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString("utf8");
}
