"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { startAuthentication } from "@simplewebauthn/browser";
import { toast } from "sonner";
import { Fingerprint } from "lucide-react";

interface BiometricLoginProps {
  email: string;
}

export function BiometricLogin({ email }: BiometricLoginProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleBiometricLogin = async () => {
    if (!email) {
      toast.error("Add meg az e-mail címedet először");
      return;
    }

    setLoading(true);
    try {
      // Check browser support
      if (!window.PublicKeyCredential) {
        toast.error("A böngésző nem támogatja a biometrikus hitelesítést");
        return;
      }

      // 1. Get authentication options from server
      const optionsRes = await fetch("/api/webauthn/authenticate/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!optionsRes.ok) {
        const error = await optionsRes.json();
        if (error.error === "No credentials registered") {
          toast.error("Nincs regisztrált biometrikus hitelesítés ehhez a fiókhoz");
        } else {
          toast.error("Hiba történt");
        }
        return;
      }

      const options = await optionsRes.json();

      // 2. Start WebAuthn authentication
      const asseResp = await startAuthentication(options);

      // 3. Verify authentication with server
      const verifyRes = await fetch("/api/webauthn/authenticate/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, response: asseResp }),
      });

      const verification = await verifyRes.json();

      if (verification.verified) {
        toast.success("Sikeres bejelentkezés!");
        
        // Sign in with NextAuth using the verified email
        const { signIn } = await import("next-auth/react");
        const result = await signIn("credentials", {
          redirect: false,
          email: verification.email,
          webauthn: "true",
        });

        if (result?.ok) {
          router.push("/dashboard");
          router.refresh();
        }
      } else {
        toast.error("Hitelesítés sikertelen");
      }
    } catch (error: any) {
      console.error("Authentication error:", error);

      if (error.name === "NotAllowedError") {
        toast.error("A hitelesítés megszakítva");
      } else if (error.name === "NotSupportedError") {
        toast.error("Ez a böngésző nem támogatja a biometrikus hitelesítést");
      } else {
        toast.error("Hiba a bejelentkezés során");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleBiometricLogin}
      disabled={loading || !email}
      variant="outline"
      className="w-full"
    >
      <Fingerprint className="w-4 h-4 mr-2" />
      {loading ? "Hitelesítés..." : "Bejelentkezés biometriával"}
    </Button>
  );
}
