import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import fs from "fs/promises";
import path from "path";

// Ez az endpoint megkerüli a Next.js statikus fájl cache-lését, ami
// futásidőben nem engedi a friss képek kiszolgálását a public mappából.
// Továbbá GDPR szempontból is kritikus, mert így védi a dokumentumokat!
export async function GET(request: Request, context: { params: Promise<{ filename: string }> }) {
  try {
    // 1. Biztonsági ellenőrzés: Csak az Admin láthatja a kényes személyi igazolványokat!
    await requireAdmin();
    
    // 2. Fájlnév kinyerése
    const { filename } = await context.params;
    
    // 3. Biztonságos pútvonal a szerveren
    const filePath = path.join(process.cwd(), "public", "uploads", "kyc", path.basename(filename));
    
    // 4. Kép beolvasása bináris adatként
    const fileBuffer = await fs.readFile(filePath);
    
    // 5. Streamelés a böngészőnek képi formátumban
    return new NextResponse(fileBuffer, {
      headers: { 
        "Content-Type": "image/jpeg",
        "Cache-Control": "private, max-age=86400"
      },
    });
  } catch (error) {
    if ((error as Error).message === "NOT_AUTHORIZED") {
      return NextResponse.json({ message: "Nincs jogosultságod a kép megtekintéséhez!" }, { status: 403 });
    }
    return NextResponse.json({ message: "Fájl nem található a szerveren" }, { status: 404 });
  }
}
