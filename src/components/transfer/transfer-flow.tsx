"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, ChevronRight, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// --- Pénznemek listája ---
type Currency = { code: string; name: string; flag: string };
const RECENT_CURRENCIES: Currency[] = [
  { code: "HUF", name: "magyar forint", flag: "🇭🇺" },
];
const ALL_CURRENCIES: Currency[] = [
  { code: "AED", name: "emirátusi dirham", flag: "🇦🇪" },
  { code: "ALL", name: "albán lek", flag: "🇦🇱" },
  { code: "ARS", name: "argentin peso", flag: "🇦🇷" },
  { code: "AUD", name: "ausztrál dollár", flag: "🇦🇺" },
  { code: "BAM", name: "bosnyák konvertibilis márka", flag: "🇧🇦" },
  { code: "EUR", name: "euró", flag: "🇪🇺" },
  { code: "USD", name: "amerikai dollár", flag: "🇺🇸" },
];

export function TransferFlow() {
  const router = useRouter();
  
  // Step 1: Pénznem választása, Step 2: Címzett adatok
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);

  // Keresőmező a 1. lépésnél
  const [searchQuery, setSearchQuery] = useState("");

  // Félkövér banki űrlap
  const [email, setEmail] = useState("");
  const [tab, setTab] = useState<"LOCAL" | "IBAN">("LOCAL");
  const [fullName, setFullName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [hasError, setHasError] = useState(false);

  // Keresés szűrés
  const filteredAll = ALL_CURRENCIES.filter(
    (c) => c.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
           c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCurrency = (currency: Currency) => {
    setSelectedCurrency(currency);
    setStep(2);
  };

  const handleGoBack = () => {
    if (step === 2) setStep(1);
    else router.push("/dashboard");
  };

  // Validátor
  const validateAndSubmit = () => {
    setHasError(false);
    
    // Alapvető kitöltésellenőrzés
    if (!fullName.trim() || !accountNumber.trim()) {
      setHasError(true);
      toast.error("Kérünk, adj meg egy érvényes bankszámlaszámot.");
      return;
    }

    // Magyar bankszámla validáció (LOCAL formátum 16 vagy 24 számjegy kis kötőjelekkel)
    if (tab === "LOCAL") {
      // Kiszedjük a szóközöket és kötőjeleket
      const cleanAcc = accountNumber.replace(/[\s-]/g, '');
      if (cleanAcc.length !== 16 && cleanAcc.length !== 24 || !/^\d+$/.test(cleanAcc)) {
        setHasError(true);
        toast.error("Kérünk, adj meg egy érvényes bankszámlaszámot.");
        return;
      }
    } 
    // IBAN validáció (2 betű, majd számok/betűk)
    else if (tab === "IBAN") {
      const cleanIban = accountNumber.replace(/[\s]/g, '').toUpperCase();
      if (!/^[A-Z]{2}\d{2}[A-Z\d]{10,30}$/.test(cleanIban)) {
        setHasError(true);
        toast.error("Kérünk, adj meg egy érvényes bankszámlaszámot.");
        return;
      }
    }

    toast.success("A kedvezményezett ellenőrzése sikeres. Hamarosan folytathatjuk az összeggel!");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground animate-in slide-in-from-right-8 duration-300">
      
      {/* Fejléc Back Gomb */}
      <div className="pt-6 px-4 pb-2">
        <button 
          onClick={handleGoBack}
          className="w-10 h-10 rounded-full bg-secondary/30 flex items-center justify-center hover:bg-secondary/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {step === 1 && (
        <div className="px-5 mt-4 flex-1">
          <h1 className="text-3xl font-bold tracking-tight mb-6">Pénznem kiválasztása</h1>
          
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input 
              type="text" 
              placeholder="Pénznem keresése" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-14 rounded-full border-muted-foreground/30 focus-visible:ring-primary/50 text-base"
            />
          </div>

          <div className="space-y-6">
            {/* Legutóbbi Pénznemek */}
            {searchQuery === "" && (
              <div>
                <h3 className="text-sm text-muted-foreground font-medium mb-2 pl-1">Legutóbbi pénznemek</h3>
                <div className="h-[1px] w-full bg-border mb-3" />
                <div className="space-y-1">
                  {RECENT_CURRENCIES.map((currency) => (
                    <button 
                      key={currency.code} 
                      onClick={() => handleSelectCurrency(currency)}
                      className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full overflow-hidden text-3xl leading-none flex items-center justify-center shadow-sm">
                          {currency.flag}
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-base">{currency.code}</p>
                          <p className="text-sm text-muted-foreground">{currency.name}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Összes Pénznem */}
            <div>
              <h3 className="text-sm text-muted-foreground font-medium mb-2 pl-1">
                {searchQuery !== "" ? "Keresési Eredmények" : "Összes pénznem"}
              </h3>
              <div className="h-[1px] w-full bg-border mb-3" />
              <div className="space-y-1 pb-10">
                {filteredAll.map((currency) => (
                  <button 
                    key={currency.code} 
                    onClick={() => handleSelectCurrency(currency)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden text-3xl leading-none flex items-center justify-center shadow-sm">
                        {currency.flag}
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-base">{currency.code}</p>
                        <p className="text-sm text-muted-foreground">{currency.name}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                ))}
                
                {filteredAll.length === 0 && (
                  <p className="text-center text-muted-foreground py-6">Nincs találat erre a keresésre</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="px-5 mt-4 flex-1 flex flex-col animate-in fade-in duration-300">
          <h1 className="text-[2rem] leading-tight font-bold tracking-tight mb-8">
            Add meg a <br/> kedvezményezett <br/> számlaadatait
          </h1>

          <div className="space-y-6 flex-1">
            
            {/* E-mail */}
            <div className="space-y-1">
              <label className="text-sm font-bold text-foreground pl-1">E-mail-címe (nem kötelező)</label>
              <Input 
                type="email" 
                placeholder="example@example.ex"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 rounded-xl border-muted-foreground/30 focus-visible:ring-primary/50 text-base"
              />
            </div>

            {/* Tab Selector */}
            <div className="space-y-2 pt-2">
              <label className="text-sm text-muted-foreground pl-1">Kedvezményezett banki adatai</label>
              <div className="h-[1px] w-full bg-border mb-2" />
              
              <div className="bg-[#f0ede6]/50 dark:bg-muted p-1 rounded-2xl flex relative">
                <button 
                  onClick={() => { setTab("LOCAL"); setHasError(false); }}
                  className={`flex-1 py-3 text-sm rounded-xl transition-all duration-300 z-10 ${
                    tab === "LOCAL" ? "bg-white dark:bg-card shadow-sm text-emerald-800 dark:text-emerald-400 font-bold" : "text-muted-foreground font-medium"
                  }`}
                >
                  Helyi bankszámla
                </button>
                <button 
                  onClick={() => { setTab("IBAN"); setHasError(false); }}
                  className={`flex-1 py-3 text-sm rounded-xl transition-all duration-300 z-10 ${
                    tab === "IBAN" ? "bg-white dark:bg-card shadow-sm text-emerald-800 dark:text-emerald-400 font-bold" : "text-muted-foreground font-medium"
                  }`}
                >
                  IBAN
                </button>
              </div>
            </div>

            {/* Számlatulajdonos Neve */}
            <div className="space-y-1 pt-2">
              <label className="text-sm font-bold text-foreground pl-1">Számlatulajdonos teljes neve</label>
              <Input 
                type="text" 
                placeholder="kis kari"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-14 rounded-xl border-muted-foreground/30 focus-visible:ring-primary/50 text-base"
              />
            </div>

            {/* Bankszámlaszám */}
            <div className="space-y-1">
              <label className="text-sm font-bold text-foreground pl-1">Bankszámlaszám</label>
              <Input 
                type="text" 
                placeholder={tab === "LOCAL" ? "12345678-12345678-12345678" : "HU... "}
                value={accountNumber}
                onChange={(e) => {
                  setAccountNumber(e.target.value);
                  setHasError(false);
                }}
                className={`h-14 rounded-xl text-base transition-colors ${
                  hasError 
                    ? "border-red-500 text-red-600 focus-visible:ring-red-500 bg-red-500/5" 
                    : "border-muted-foreground/30 focus-visible:ring-primary/50"
                }`}
              />
            </div>

            {/* Error Message */}
            {hasError && (
              <div className="flex gap-2 p-3 rounded-xl bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 animate-in slide-in-from-top-2">
                <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span className="text-sm font-medium">Kérünk, adj meg egy érvényes bankszámlaszámot.</span>
              </div>
            )}

          </div>

          {/* Folytatás Gomb */}
          <div className="pb-8 pt-4">
            <button 
              onClick={validateAndSubmit}
              className="w-full h-14 rounded-full bg-[#18181A] dark:bg-white text-white dark:text-black hover:opacity-90 active:scale-[0.98] transition-all font-bold text-base"
              style={!hasError ? { backgroundColor: '#A1E678', color: '#1B4D2E' } : {}}
            >
              Folytatás
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
