import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

// A funkció ami fogadja a feltöltött dokumentumokat
export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const { frontId, backId, selfie } = await request.json();

    if (!frontId || !backId || !selfie) {
      return NextResponse.json({ message: "Minden fényképre szükség van" }, { status: 400 });
    }

    // A célmappa, ahová elmentjük a fotókat a VPS-en (public/uploads/kyc)
    const uploadDir = path.join(process.cwd(), "public", "uploads", "kyc");
    
    // Biztosítjuk, hogy a mappa létezik
    await fs.mkdir(uploadDir, { recursive: true }).catch(() => {});

    // Segédfüggvény a Base64 konvertáláshoz és lementéshez
    const saveImage = async (base64String: string, suffix: string) => {
      // Leszedjük a "data:image/jpeg;base64," előtagot
      const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error("Érvénytelen képformátum");
      }
      
      const buffer = Buffer.from(matches[2], "base64");
      // A fájlnév mindig tartalmazza az user ID-t, hogy tiszta legyen
      const fileName = `${user.id}-${suffix}-${Date.now()}.jpg`;
      const filePath = path.join(uploadDir, fileName);
      
      await fs.writeFile(filePath, buffer);
      
      // A publikusan (vagyis az API-n keresztül biztonságosan) elérhető URL
      return `/api/uploads/kyc/${fileName}`;
    };

    // Párhuzamosan elmentjük a 3 képet a lemezre
    const [frontUrl, backUrl, selfieUrl] = await Promise.all([
      saveImage(frontId, "front"),
      saveImage(backId, "back"),
      saveImage(selfie, "selfie"),
    ]);

    // Rögzítjük az adatbázisban a KYC anyagokat
    await prisma.kycDocument.upsert({
      where: { userId: user.id },
      update: {
        frontIdUrl: frontUrl,
        backIdUrl: backUrl,
        selfieUrl: selfieUrl,
        status: "PENDING",
        submittedAt: new Date(),
        reviewedAt: null,
      },
      create: {
        userId: user.id,
        frontIdUrl: frontUrl,
        backIdUrl: backUrl,
        selfieUrl: selfieUrl,
        status: "PENDING",
      },
    });

    // Frissítjük a felhasználó állapotát
    await prisma.user.update({
      where: { id: user.id },
      data: { kycStatus: "PENDING" },
    });

    return NextResponse.json({ message: "Sikeres hitelesítés beküldés!" });
  } catch (error) {
    if ((error as Error).message === "NOT_AUTHENTICATED") {
      return NextResponse.json({ message: "Nem vagy bejelentkezve" }, { status: 401 });
    }
    console.error("KYC Feltöltési Hiba:", error);
    return NextResponse.json({ message: "Hiba történt a képek mentésekor" }, { status: 500 });
  }
}
