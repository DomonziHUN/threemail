"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/contexts/LanguageContext";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <Toaster position="top-center" richColors closeButton />
        </ThemeProvider>
      </LanguageProvider>
    </SessionProvider>
  );
}
