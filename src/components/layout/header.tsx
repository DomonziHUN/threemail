import Link from "next/link";
import { Bell, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { avatarInitials } from "@/lib/utils";

interface HeaderProps {
  user: {
    fullName: string;
  };
  referralBonus?: number;
}

export function Header({ user, referralBonus = 0 }: HeaderProps) {
  const initials = avatarInitials(user.fullName);
  return (
    <header className="flex items-center justify-between gap-3 px-5 pt-8 pb-4">
      <Link
        href="/settings"
        className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-lg font-semibold text-primary"
        aria-label="Beállítások"
      >
        {initials}
      </Link>
      <Button
        asChild
        variant="outline"
        size="sm"
        className="rounded-full px-4 py-2 text-sm font-medium"
      >
        <Link href="/referrals" className="flex items-center gap-2">
          <Gift className="h-4 w-4" />
          <span>20.000 Ft bónusz</span>
        </Link>
      </Button>
      <Button variant="ghost" size="icon" className="rounded-2xl" aria-label="Értesítések">
        <Bell className="h-5 w-5" />
      </Button>
    </header>
  );
}
