"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { languages, type Locale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LanguageSwitcherProps {
  variant?: "default" | "ghost" | "outline";
  showLabel?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
}

export function LanguageSwitcher({ 
  variant = "ghost", 
  showLabel = false,
  size = "default" 
}: LanguageSwitcherProps) {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === locale);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <span className="text-lg">{currentLanguage?.flag}</span>
          {showLabel && (
            <span className="hidden sm:inline-block">{currentLanguage?.name}</span>
          )}
          {!showLabel && size !== "icon" && <Globe className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => {
              setLocale(lang.code as Locale);
              setOpen(false);
            }}
            className={`flex items-center gap-3 cursor-pointer ${
              locale === lang.code ? "bg-accent" : ""
            }`}
          >
            <span className="text-xl">{lang.flag}</span>
            <div className="flex flex-col">
              <span className="font-medium">{lang.name}</span>
              <span className="text-xs text-muted-foreground">{lang.nativeName}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
