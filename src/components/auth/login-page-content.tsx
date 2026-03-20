"use client";

import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { useLanguage } from "@/contexts/LanguageContext";

export function LoginPageContent() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <LanguageSwitcher variant="outline" size="sm" />
      </div>
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">{t.auth.welcomeBack}</h1>
        <p className="text-muted-foreground text-sm">
          {t.auth.readyToBanking}
        </p>
      </div>
      <LoginForm />
      <p className="text-center text-sm text-muted-foreground">
        {t.auth.dontHaveAccount}{" "}
        <Link href="/register" className="font-medium text-primary">
          {t.auth.registerNow}
        </Link>
      </p>
    </div>
  );
}
