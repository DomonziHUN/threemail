"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CreditCard, Users2, Bitcoin } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Főoldal", icon: Home },
  { href: "/cards", label: "Kártyák", icon: CreditCard },
  { href: "/referrals", label: "Partnerek", icon: Users2 },
  { href: "/crypto", label: "Crypto", icon: Bitcoin },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 inset-x-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-md items-center justify-around px-6 py-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname?.startsWith(item.href) ?? false;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center text-xs font-medium gap-1",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full transition",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
