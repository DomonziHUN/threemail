"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { registerSchema } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTransition, useState } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlRefCode = searchParams?.get("ref") || "";
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: undefined,
      referralCode: urlRefCode || undefined,
    },
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message ?? "Sikertelen regisztráció");
        }

        toast.success("Sikeres regisztráció, bejelentkezhetsz!");
        router.push("/login");
      } catch (error) {
        setFormError((error as Error).message);
      }
    });
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="fullName">Teljes név</Label>
        <Input id="fullName" placeholder="Kiss Anna" {...register("fullName")} />
        {errors.fullName && (
          <p className="text-sm text-destructive">{errors.fullName.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail cím</Label>
        <Input id="email" type="email" placeholder="anna@pelda.hu" {...register("email")} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Telefonszám</Label>
        <Input id="phone" placeholder="+36 30 123 4567" {...register("phone")} />
        {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="password">Jelszó</Label>
          <Input id="password" type="password" {...register("password")} />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Jelszó megerősítése</Label>
          <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="referralCode">Meghívókód {urlRefCode ? "(Automatikusan kitöltve)" : "(opcionális)"}</Label>
        <Input 
          id="referralCode" 
          placeholder="TM-XXXXXX" 
          {...register("referralCode")} 
          readOnly={!!urlRefCode}
          className={urlRefCode ? "bg-muted font-medium text-muted-foreground cursor-not-allowed" : ""}
        />
        {errors.referralCode && (
          <p className="text-sm text-destructive">{errors.referralCode.message}</p>
        )}
      </div>
      {formError && <p className="text-sm text-destructive">{formError}</p>}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Regisztráció..." : "Regisztráció"}
      </Button>
    </form>
  );
}
