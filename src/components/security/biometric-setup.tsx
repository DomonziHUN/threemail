"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { startRegistration } from "@simplewebauthn/browser";
import { toast } from "sonner";
import { Fingerprint, CheckCircle2 } from "lucide-react";

interface BiometricSetupProps {
  isEnabled: boolean;
  onSuccess: () => void;
}

export function BiometricSetup({ isEnabled, onSuccess }: BiometricSetupProps) {
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      // Check browser support
      if (!window.PublicKeyCredential) {
        toast.error("A böngésző nem támogatja a biometrikus hitelesítést");
        return;
      }

      // 1. Get registration options from server
      const optionsRes = await fetch("/api/webauthn/register/options", {
        method: "POST",
      });

      if (!optionsRes.ok) {
        throw new Error("Failed to get registration options");
      }

      const options = await optionsRes.json();

      // 2. Start WebAuthn registration
      const attResp = await startRegistration(options);

      // 3. Verify registration with server
      const verifyRes = await fetch("/api/webauthn/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attResp),
      });

      const verification = await verifyRes.json();

      if (verification.verified) {
        toast.success("Biometrikus hitelesítés sikeresen beállítva!");
        onSuccess();
      } else {
        toast.error("Hiba a beállítás során");
      }
    } catch (error: any) {
      console.error("Registration error:", error);

      if (error.name === "NotAllowedError") {
        toast.error("A hitelesítés megszakítva");
      } else if (error.name === "NotSupportedError") {
        toast.error("Ez a böngésző nem támogatja a biometrikus hitelesítést");
      } else if (error.name === "InvalidStateError") {
        toast.error("Ez az eszköz már regisztrálva van");
      } else {
        toast.error("Hiba történt a regisztráció során");
      }
    } finally {
      setLoading(false);
    }
  };

  if (isEnabled) {
    return (
      <div className="flex items-center gap-3 p-4 border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900 rounded-lg">
        <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
        <div className="flex-1">
          <h4 className="font-semibold text-green-900 dark:text-green-100">
            Biometrikus hitelesítés aktív
          </h4>
          <p className="text-sm text-green-700 dark:text-green-300">
            Az eszközöd ujjlenyomata vagy arcfelismerése regisztrálva van
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30">
        <Fingerprint className="w-8 h-8 text-primary" />
        <div className="flex-1">
          <h4 className="font-semibold">Biometrikus hitelesítés</h4>
          <p className="text-sm text-muted-foreground">
            Használd az ujjlenyomatodat vagy arcfelismerést a bejelentkezéshez
          </p>
        </div>
      </div>

      <Button onClick={handleRegister} disabled={loading} className="w-full">
        <Fingerprint className="w-4 h-4 mr-2" />
        {loading ? "Beállítás..." : "Biometrikus hitelesítés beállítása"}
      </Button>

      <div className="text-xs text-muted-foreground space-y-1 bg-muted/20 p-3 rounded-lg">
        <p className="font-semibold">✓ Támogatott eszközök:</p>
        <ul className="list-disc list-inside ml-2 space-y-0.5">
          <li>Touch ID (macOS, iOS)</li>
          <li>Face ID (iOS, iPadOS)</li>
          <li>Windows Hello (Windows 10+)</li>
          <li>Ujjlenyomat olvasók (Android)</li>
        </ul>
      </div>
    </div>
  );
}
