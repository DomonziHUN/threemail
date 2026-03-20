"use client";

import Link from "next/link";
import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { useLanguage } from "@/contexts/LanguageContext";

export function RegisterPageContent() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <LanguageSwitcher variant="outline" size="sm" />
      </div>
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">{t.auth.joinThreeMail}</h1>
        <p className="text-sm text-muted-foreground">
          {t.auth.createAccount}
        </p>
      </div>
      <Suspense fallback={<div className="flex justify-center py-4 text-sm text-muted-foreground">{t.common.loading}</div>}>
        <RegisterForm />
      </Suspense>
      <p className="text-center text-sm text-muted-foreground">
        {t.auth.alreadyHaveAccount}{" "}
        <Link href="/login" className="font-medium text-primary">
          {t.auth.loginHere}
        </Link>
      </p>
    </div>
  );
}
