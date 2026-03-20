"use client";

import { X, Camera, Zap, Bell, HelpCircle, FileText, ShieldCheck, CreditCard, Gauge, Moon, User, Users, Info, Star, XCircle, LogOut } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { avatarInitials } from "@/lib/utils";
import { toast } from "sonner";

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export function ProfileMenu({ isOpen, onClose, user }: ProfileMenuProps) {
  if (!isOpen) return null;

  const initials = avatarInitials(user?.fullName || "User");
  const membershipId = user?.id ? `P${user.id.substring(0, 8).toUpperCase()}` : "P41689672";
  const userTag = user?.fullName ? user.fullName.toLowerCase().replace(/\s/g, "") : "user";

  const handleCopyId = () => {
    navigator.clipboard.writeText(membershipId);
    toast.success("Tagsági szám kimásolva!");
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background max-w-md mx-auto xl:border-x border-border/40 flex flex-col pt-safe animate-in slide-in-from-bottom-5 fade-in duration-200">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary/70 transition-colors"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>
        <button className="bg-[#e4eedb] text-[#1B4D2E] rounded-full px-4 py-2 font-bold text-sm tracking-tight shadow-sm">
          Számla nyitása
        </button>
      </div>

      {/* Gördíthető tartalom */}
      <div className="flex-1 overflow-y-auto pb-24">
        
        {/* Profil Fejléc */}
        <div className="flex flex-col items-center mt-2 mb-8">
          <div className="relative mb-3">
            <div className="h-[4.5rem] w-[4.5rem] rounded-full bg-secondary flex items-center justify-center text-3xl font-bold text-foreground">
              {initials}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 bg-[#85E04D] border-2 border-background rounded-full p-[3px] shadow-sm">
              <Camera className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <h2 className="text-[28px] font-black uppercase tracking-tight text-foreground leading-none">
            {user?.fullName || "Felhasználó"}
          </h2>
          <p className="text-sm font-semibold text-foreground/80 mt-2 mb-2">Személyes fiók</p>
          <div className="bg-secondary/40 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 text-foreground/80 mt-1">
            <Zap className="w-3.5 h-3.5 fill-foreground/80" /> 
            @{userTag}
          </div>
        </div>

        {/* Listák */}
        <div className="px-5 space-y-8">
          
          <MenuSection title="A fiókod">
            <MenuItem
              icon={<Bell />}
              title="Beérkezett üzenetek"
              href="/inbox"
              onClick={onClose}
            />
            <MenuItem
              icon={<HelpCircle />}
              title="Segítség"
              href="/help"
              onClick={onClose}
            />
            <MenuItem
              icon={<FileText />}
              title="Kivonatok és kimutatások"
              href="/statements"
              onClick={onClose}
            />
          </MenuSection>

          <MenuSection title="Beállítások">
            <MenuItem 
              icon={<ShieldCheck />} 
              title="Biztonság és adatvédelem" 
              subtitle="Módosítsd a biztonsági és adatvédelmi beállításaidat" 
            />
            <MenuItem 
              icon={<Bell />} 
              title="Értesítések" 
              subtitle="Állítsd be, hogyan szeretnél értesítéseket kapni" 
            />
            <MenuItem 
              icon={<CreditCard />} 
              title="Fizetési módok" 
              subtitle="A fiókhoz kapcsolt mentett kártyák és bankszámlák kezelése" 
            />
            <MenuItem 
              icon={<Gauge />} 
              title="Limitek" 
              subtitle="Utalási és kártyás limitek kezelése" 
            />
            <MenuItem 
              icon={<Moon />} 
              title="Nyelv és megjelenés" 
              subtitle="Testreszabhatod a nyelvi beállításokat és a használt témát" 
            />
            <MenuItem 
              icon={<User />} 
              title="Személyes adatok" 
              subtitle="Személyes adataid frissítése" 
              href="/settings"
              onClick={onClose}
            />
          </MenuSection>

          <MenuSection title="Műveletek és megállapodások">
            <MenuItem 
              icon={<Users />} 
              title="Ajánlások" 
              subtitle="Ajánlások nyomon követése és kezelése" 
              href="/referrals"
              onClick={onClose}
            />
            <MenuItem icon={<Info />} title="Felhasználási feltételek" />
            <MenuItem 
              icon={<Star />} 
              title="Értékelj minket" 
              subtitle="Értékelj minket a Play Store-ban" 
            />
            <MenuItem icon={<XCircle />} title="Fiók bezárása" />
            <MenuItem 
              icon={<LogOut className="transform rotate-180" />} 
              title="Kijelentkezés" 
              onClick={handleLogout}
            />
          </MenuSection>

          {/* Footer infó */}
          <div className="pt-2 pb-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-[15px] mb-0.5">A tagsági számod</h4>
                <p className="text-sm text-muted-foreground">{membershipId}</p>
              </div>
              <button 
                onClick={handleCopyId}
                className="bg-secondary/40 text-foreground font-semibold px-4 py-2 rounded-full text-sm"
              >
                Másolás
              </button>
            </div>
            
            <div>
              <h4 className="font-bold text-[15px] mb-0.5">Az alkalmazásod verziója</h4>
              <p className="text-sm text-muted-foreground">v9.16.1 (1605)</p>
            </div>

            <div className="text-center pt-8 border-t border-border/40 text-sm">
              <p className="text-muted-foreground mb-3">Módosítottuk az alkalmazás ezen területét.</p>
              <button className="font-bold border-b-2 border-foreground uppercase tracking-wider text-xs">
                Oszd meg velünk a véleményed
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper összetevők
function MenuSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[19px] font-bold tracking-tight mb-4">{title}</h3>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}

function MenuItem({ 
  icon, 
  title, 
  subtitle, 
  href,
  onClick
}: { 
  icon: React.ReactNode; 
  title: string; 
  subtitle?: string; 
  href?: string;
  onClick?: () => void;
}) {
  const inner = (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-transparent rounded-full border border-border/50 flex items-center justify-center text-foreground shadow-sm">
        {icon && (
          <div className="[&>svg]:w-5 [&>svg]:h-5 [&>svg]:stroke-[1.5]">
            {icon}
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1 justify-center py-1">
        <h4 className="font-bold text-[15px] leading-tight text-foreground">{title}</h4>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5 leading-snug">{subtitle}</p>
        )}
      </div>
    </div>
  );

  return href ? (
    <Link href={href} onClick={onClick} className="block w-full text-left bg-transparent rounded-2xl p-1 mb-2 hover:bg-muted/40 transition-colors">
      <div className="flex items-center justify-between">
        {inner}
        <div className="pl-3 opacity-30">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>
    </Link>
  ) : (
    <button onClick={onClick} className="block w-full text-left bg-transparent rounded-2xl p-1 mb-2 hover:bg-muted/40 transition-colors">
      <div className="flex items-center justify-between">
        {inner}
        <div className="pl-3 opacity-30">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>
    </button>
  );
}
