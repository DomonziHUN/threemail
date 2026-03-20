# WebAuthn - Biometrikus Hitelesítés Weben

## Mi az a WebAuthn?

A **Web Authentication API (WebAuthn)** egy W3C szabvány, amely lehetővé teszi:
- **Ujjlenyomat** olvasók használatát
- **Arcfelismerés** (Face ID, Windows Hello)
- **Biztonsági kulcsok** (YubiKey, stb.)
- **PIN kód** alapú hitelesítés

## Hogyan Működik?

### 1. Regisztráció (Registration)
```
Felhasználó → Böngésző → Hitelesítő eszköz (ujjlenyomat olvasó)
                ↓
         Publikus kulcs pár generálása
                ↓
         Publikus kulcs → Szerver
         Privát kulcs → Eszközön marad (biztonságosan)
```

### 2. Hitelesítés (Authentication)
```
Felhasználó → Böngésző → Challenge kérés szervertől
                ↓
         Biometrikus ellenőrzés
                ↓
         Aláírás privát kulccsal
                ↓
         Aláírt válasz → Szerver ellenőrzi publikus kulccsal
```

## Implementáció a ThreeMail Projektben

### Szükséges Csomagok

```bash
npm install @simplewebauthn/server @simplewebauthn/browser
```

### 1. Adatbázis Séma Frissítése

```prisma
// prisma/schema.prisma

model WebAuthnCredential {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  credentialId    String   @unique
  publicKey       String
  counter         Int      @default(0)
  deviceType      String   // "platform" (beépített) vagy "cross-platform" (külső kulcs)
  transports      String?  // JSON array: ["usb", "nfc", "ble", "internal"]
  createdAt       DateTime @default(now())
}

// User modellhez hozzáadni:
model User {
  // ... meglévő mezők
  webAuthnCredentials WebAuthnCredential[]
}
```

### 2. Backend API - Regisztráció Indítása

```typescript
// src/app/api/webauthn/register/options/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateRegistrationOptions } from "@simplewebauthn/server";

const rpName = "ThreeMail Bank";
const rpID = process.env.NEXT_PUBLIC_RP_ID || "localhost";
const origin = process.env.NEXT_PUBLIC_ORIGIN || "http://localhost:3000";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { webAuthnCredentials: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: user.id,
      userName: user.email,
      userDisplayName: user.fullName,
      attestationType: "none",
      excludeCredentials: user.webAuthnCredentials.map((cred) => ({
        id: Buffer.from(cred.credentialId, "base64"),
        type: "public-key",
        transports: cred.transports ? JSON.parse(cred.transports) : undefined,
      })),
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
        authenticatorAttachment: "platform", // "platform" = beépített (ujjlenyomat, Face ID)
      },
    });

    // Challenge mentése session-be vagy Redis-be
    // Egyszerűség kedvéért itt most az adatbázisba mentjük
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // Ideiglenesen tároljuk a challenge-t egy külön mezőben
        // Éles környezetben használj Redis-t vagy session storage-t
      },
    });

    return NextResponse.json(options);
  } catch (error) {
    console.error("Error generating registration options:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### 3. Backend API - Regisztráció Ellenőrzése

```typescript
// src/app/api/webauthn/register/verify/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyRegistrationResponse } from "@simplewebauthn/server";

const rpID = process.env.NEXT_PUBLIC_RP_ID || "localhost";
const origin = process.env.NEXT_PUBLIC_ORIGIN || "http://localhost:3000";

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    
    // Challenge visszakeresése (éles környezetben Redis-ből)
    const expectedChallenge = "..."; // Korábban mentett challenge

    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (verification.verified && verification.registrationInfo) {
      const { credentialPublicKey, credentialID, counter } = verification.registrationInfo;

      await prisma.webAuthnCredential.create({
        data: {
          userId: user.id,
          credentialId: Buffer.from(credentialID).toString("base64"),
          publicKey: Buffer.from(credentialPublicKey).toString("base64"),
          counter,
          deviceType: body.response.authenticatorAttachment || "platform",
          transports: body.response.transports ? JSON.stringify(body.response.transports) : null,
        },
      });

      // Biometrikus hitelesítés engedélyezése
      await prisma.securitySettings.update({
        where: { userId: user.id },
        data: { biometricEnabled: true },
      });

      return NextResponse.json({ verified: true });
    }

    return NextResponse.json({ verified: false }, { status: 400 });
  } catch (error) {
    console.error("Error verifying registration:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### 4. Frontend - Regisztráció

```typescript
// src/components/security/biometric-setup.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { startRegistration } from "@simplewebauthn/browser";
import { toast } from "sonner";
import { Fingerprint } from "lucide-react";

export function BiometricSetup() {
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      // 1. Regisztrációs opciók lekérése
      const optionsRes = await fetch("/api/webauthn/register/options", {
        method: "POST",
      });
      const options = await optionsRes.json();

      // 2. Böngésző WebAuthn API hívása
      const attResp = await startRegistration(options);

      // 3. Válasz elküldése a szervernek
      const verifyRes = await fetch("/api/webauthn/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attResp),
      });

      const verification = await verifyRes.json();

      if (verification.verified) {
        toast.success("Biometrikus hitelesítés sikeresen beállítva!");
      } else {
        toast.error("Hiba a beállítás során");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      
      if (error.name === "NotAllowedError") {
        toast.error("A hitelesítés megszakítva");
      } else if (error.name === "NotSupportedError") {
        toast.error("Ez a böngésző nem támogatja a biometrikus hitelesítést");
      } else {
        toast.error("Hiba történt a regisztráció során");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 border rounded-lg">
        <Fingerprint className="w-8 h-8 text-primary" />
        <div className="flex-1">
          <h4 className="font-semibold">Biometrikus hitelesítés</h4>
          <p className="text-sm text-muted-foreground">
            Használd az ujjlenyomatodat vagy arcfelismerést a bejelentkezéshez
          </p>
        </div>
      </div>

      <Button onClick={handleRegister} disabled={loading} className="w-full">
        {loading ? "Beállítás..." : "Biometrikus hitelesítés beállítása"}
      </Button>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>✓ Támogatott eszközök:</p>
        <ul className="list-disc list-inside ml-2">
          <li>Touch ID (macOS, iOS)</li>
          <li>Face ID (iOS, iPadOS)</li>
          <li>Windows Hello (Windows 10+)</li>
          <li>Ujjlenyomat olvasók (Android, Chromebook)</li>
        </ul>
      </div>
    </div>
  );
}
```

### 5. Frontend - Bejelentkezés Biometriával

```typescript
// src/components/auth/biometric-login.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { startAuthentication } from "@simplewebauthn/browser";
import { toast } from "sonner";
import { Fingerprint } from "lucide-react";
import { signIn } from "next-auth/react";

export function BiometricLogin({ email }: { email: string }) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      // 1. Authentication opciók lekérése
      const optionsRes = await fetch("/api/webauthn/authenticate/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const options = await optionsRes.json();

      // 2. Böngésző WebAuthn API hívása
      const asseResp = await startAuthentication(options);

      // 3. Válasz elküldése és bejelentkezés
      const result = await signIn("webauthn", {
        email,
        response: JSON.stringify(asseResp),
        redirect: false,
      });

      if (result?.ok) {
        toast.success("Sikeres bejelentkezés!");
        window.location.href = "/dashboard";
      } else {
        toast.error("Hitelesítés sikertelen");
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast.error("Hiba a bejelentkezés során");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogin}
      disabled={loading}
      variant="outline"
      className="w-full"
    >
      <Fingerprint className="w-4 h-4 mr-2" />
      {loading ? "Hitelesítés..." : "Bejelentkezés biometriával"}
    </Button>
  );
}
```

## Böngésző Támogatás

### Támogatott Böngészők (2024+)
- ✅ Chrome 67+
- ✅ Firefox 60+
- ✅ Safari 13+ (macOS, iOS)
- ✅ Edge 18+
- ✅ Opera 54+

### Támogatott Platformok
- ✅ **Windows 10+**: Windows Hello (ujjlenyomat, arc, PIN)
- ✅ **macOS**: Touch ID
- ✅ **iOS/iPadOS**: Touch ID, Face ID
- ✅ **Android 7+**: Ujjlenyomat olvasók
- ✅ **Linux**: FIDO2 kulcsok

## Biztonság

### Előnyök
1. **Privát kulcs soha nem hagyja el az eszközt**
2. **Phishing elleni védelem** - domain-hez kötött
3. **Nincs jelszó tárolás** a szerveren
4. **Replay attack védelem** - minden hitelesítés egyedi

### Fontos Tudnivalók
- A biometrikus adat (ujjlenyomat, arc) **soha nem kerül átvitelre**
- Csak egy kriptográfiai aláírás készül
- Az eszköz maga végzi a biometrikus ellenőrzést

## Környezeti Változók

```env
# .env
NEXT_PUBLIC_RP_ID=yourdomain.com
NEXT_PUBLIC_ORIGIN=https://yourdomain.com

# Localhost fejlesztéshez:
NEXT_PUBLIC_RP_ID=localhost
NEXT_PUBLIC_ORIGIN=http://localhost:3000
```

## Tesztelés

### Lokális Fejlesztés
WebAuthn **csak HTTPS-en vagy localhost-on** működik!

```bash
# Localhost OK
http://localhost:3000

# HTTPS szükséges production-ben
https://yourdomain.com
```

### Böngésző DevTools
Chrome DevTools → Application → WebAuthn
- Virtual authenticator létrehozása teszteléshez
- Különböző eszköztípusok szimulálása

## Fallback Stratégia

Ha a böngésző nem támogatja:

```typescript
// Ellenőrzés
if (window.PublicKeyCredential) {
  // WebAuthn támogatott
  showBiometricOption();
} else {
  // Fallback hagyományos jelszóra
  showPasswordLogin();
}
```

## Teljes Munkafolyamat

### 1. Felhasználó Regisztrál
```
Regisztráció → Jelszó beállítása → Biometrikus opció felajánlása
```

### 2. Biometrikus Beállítás
```
Beállítások → Biztonság → "Biometrikus hitelesítés beállítása"
→ Ujjlenyomat/Arc szkennelés → Mentés
```

### 3. Bejelentkezés
```
Login oldal → E-mail megadása → "Bejelentkezés biometriával" gomb
→ Ujjlenyomat/Arc ellenőrzés → Bejelentkezve
```

## Következő Lépések

1. ✅ Csomagok telepítése
2. ✅ Adatbázis séma frissítése
3. ✅ API végpontok létrehozása
4. ✅ Frontend komponensek
5. ✅ NextAuth integráció
6. ✅ Tesztelés különböző eszközökön
7. ✅ Production deployment HTTPS-el

## Hasznos Linkek

- [WebAuthn Guide](https://webauthn.guide/)
- [SimpleWebAuthn Docs](https://simplewebauthn.dev/)
- [MDN WebAuthn API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API)
- [Can I Use WebAuthn](https://caniuse.com/webauthn)
