"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    startTransition(async () => {
      // First, validate password with credentials
      const passwordCheckResult = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (passwordCheckResult?.error) {
        setFormError("Hibás e-mail vagy jelszó");
        return;
      }

      // Password is correct, now check if user has biometric enabled
      const biometricCheckRes = await fetch("/api/user/biometric-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });

      const { hasBiometric } = await biometricCheckRes.json();

      if (hasBiometric) {
        // User has biometric enabled, require biometric authentication
        try {
          // Check browser support
          if (!window.PublicKeyCredential) {
            setFormError("A böngésző nem támogatja a biometrikus hitelesítést. Kérlek, használj másik böngészőt vagy eszközt.");
            return;
          }

          // Get authentication options
          const optionsRes = await fetch("/api/webauthn/authenticate/options", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: values.email }),
          });

          if (!optionsRes.ok) {
            setFormError("Hiba a biometrikus hitelesítés során");
            return;
          }

          const options = await optionsRes.json();

          // Start WebAuthn authentication
          const { startAuthentication } = await import("@simplewebauthn/browser");
          const asseResp = await startAuthentication(options);

          // Verify authentication
          const verifyRes = await fetch("/api/webauthn/authenticate/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: values.email, response: asseResp }),
          });

          const verification = await verifyRes.json();

          if (!verification.verified) {
            setFormError("Biometrikus hitelesítés sikertelen");
            return;
          }

          // Biometric verified, allow login
          router.push("/dashboard");
          router.refresh();
        } catch (error: any) {
          console.error("Biometric authentication error:", error);
          if (error.name === "NotAllowedError") {
            setFormError("Biometrikus hitelesítés megszakítva. A bejelentkezéshez szükséges az ujjlenyomat/Face ID.");
          } else {
            setFormError("Hiba a biometrikus hitelesítés során");
          }
        }
      } else {
        // No biometric, allow normal login (password already validated)
        router.push("/dashboard");
        router.refresh();
      }
    });
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail cím</Label>
        <Input id="email" type="email" placeholder="anna@pelda.hu" {...register("email")} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Jelszó</Label>
        <Input id="password" type="password" {...register("password")} />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>
      {formError && <p className="text-sm text-destructive">{formError}</p>}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Bejelentkezés..." : "Bejelentkezés"}
      </Button>
    </form>
  );
}
