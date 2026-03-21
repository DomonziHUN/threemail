"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { avatarInitials } from "@/lib/utils";
import { ProfileMenu } from "@/components/layout/profile-menu";

interface HeaderProps {
  user: any;
  referralBonus?: number;
}

export function Header({ user, referralBonus = 0 }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsProfileOpen(false);
  }, [pathname]);
  const initials = avatarInitials(user?.fullName || "User");

  return (
    <header className="flex items-center justify-between gap-3 px-5 pt-8 pb-4 relative z-50">
      <button
        onClick={() => setIsProfileOpen(true)}
        className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-lg font-semibold text-primary shadow-sm hover:scale-[1.02] active:scale-95 transition-transform"
        aria-label="Fiók"
      >
        {initials}
      </button>
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
      <div className="relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full hover:bg-muted" 
          aria-label="Értesítések"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <Bell className="h-5 w-5" />
        </Button>
        {showNotifications && (
          <div className="absolute right-0 mt-2 w-64 bg-card border border-primary/20 shadow-2xl rounded-2xl p-5 text-center z-50 animate-in zoom-in-95 fade-in duration-200">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-bold">Nincsenek értesítések</p>
            <p className="text-xs text-muted-foreground mt-1">Itt fognak megjelenni a fiókoddal kapcsolatos legfontosabb események.</p>
          </div>
        )}
      </div>

      <ProfileMenu 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        user={user} 
      />
    </header>
  );
}
