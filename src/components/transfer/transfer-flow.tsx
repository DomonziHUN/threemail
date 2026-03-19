"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  ChevronRight,
  XCircle,
  CheckCircle2,
  Send,
  Loader2,
} from "lucide-react";
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

function formatHuf(n: number) {
  return new Intl.NumberFormat("hu-HU", {
    style: "currency",
    currency: "HUF",
    maximumFractionDigits: 0,
  }).format(n);
}

export function TransferFlow() {
  const router = useRouter();

  // Steps: 1 = currency, 2 = recipient, 3 = amount, 4 = confirm
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);

  // Step 1 – keresés
  const [searchQuery, setSearchQuery] = useState("");

  // Step 2 – kedvezményezett
  const [email, setEmail] = useState("");
  const [tab, setTab] = useState<"LOCAL" | "IBAN">("LOCAL");
  const [fullName, setFullName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [hasError, setHasError] = useState(false);

  // Step 3 – összeg
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [amountError, setAmountError] = useState("");

  // Step 4 – küldés
  const [sending, setSending] = useState(false);

  // Szűrt pénznemek
  const filteredAll = ALL_CURRENCIES.filter(
    (c) =>
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Egyenleg lekérése a 3. lépéshez
  useEffect(() => {
    if (step === 3) {
      fetch("/api/user/balance")
        .then((r) => r.json())
        .then((d) => setBalance(d.balance ?? null))
        .catch(() => setBalance(null));
    }
  }, [step]);

  const handleSelectCurrency = (currency: Currency) => {
    setSelectedCurrency(currency);
    setStep(2);
  };

  const handleGoBack = () => {
    if (step === 4) setStep(3);
    else if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
    else router.push("/dashboard");
  };

  // Step 2 → 3 validáció
  const handleRecipientContinue = () => {
    setHasError(false);
    if (!fullName.trim() || !accountNumber.trim()) {
      setHasError(true);
      toast.error("Kérünk, adj meg egy érvényes bankszámlaszámot.");
      return;
    }
    if (tab === "LOCAL") {
      const clean = accountNumber.replace(/[\s-]/g, "");
      if ((clean.length !== 16 && clean.length !== 24) || !/^\d+$/.test(clean)) {
        setHasError(true);
        toast.error("Kérünk, adj meg egy érvényes bankszámlaszámot.");
        return;
      }
    } else {
      const clean = accountNumber.replace(/[\s]/g, "").toUpperCase();
      if (!/^[A-Z]{2}\d{2}[A-Z\d]{10,30}$/.test(clean)) {
        setHasError(true);
        toast.error("Kérünk, adj meg egy érvényes bankszámlaszámot.");
        return;
      }
    }
    setStep(3);
  };

  // Step 3 → 4 validáció
  const handleAmountContinue = () => {
    setAmountError("");
    const num = Number(amount);
    if (!amount || isNaN(num) || num <= 0) {
      setAmountError("Adj meg egy érvényes összeget.");
      return;
    }
    if (balance !== null && num > balance) {
      setAmountError("Nincs elegendő fedezet az egyenlegeden.");
      return;
    }
    setStep(4);
  };

  // Step 4 – Küldés
  const handleSend = async () => {
    setSending(true);
    try {
      const res = await fetch("/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: fullName,
          recipientAccount: accountNumber,
          accountType: tab,
          currency: selectedCurrency?.code ?? "HUF",
          amount: Number(amount),
          description: note.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message ?? "Az utalás sikertelen.");
        return;
      }

      toast.success("Az utalás sikeres!");
      router.push("/dashboard");
    } catch {
      toast.error("Szerver hiba. Kérünk, próbáld újra.");
    } finally {
      setSending(false);
    }
  };

  // --- Fejléc ---
  const Header = () => (
    <div className="pt-6 px-4 pb-2">
      <button
        onClick={handleGoBack}
        className="w-10 h-10 rounded-full bg-secondary/30 flex items-center justify-center hover:bg-secondary/50 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 text-foreground" />
      </button>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground animate-in slide-in-from-right-8 duration-300">
      <Header />

      {/* ===================== STEP 1 – Pénznem ===================== */}
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
            {searchQuery === "" && (
              <div>
                <h3 className="text-sm text-muted-foreground font-medium mb-2 pl-1">
                  Legutóbbi pénznemek
                </h3>
                <div className="h-[1px] w-full bg-border mb-3" />
                <div className="space-y-1">
                  {RECENT_CURRENCIES.map((c) => (
                    <CurrencyRow key={c.code} currency={c} onSelect={handleSelectCurrency} />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm text-muted-foreground font-medium mb-2 pl-1">
                {searchQuery !== "" ? "Keresési Eredmények" : "Összes pénznem"}
              </h3>
              <div className="h-[1px] w-full bg-border mb-3" />
              <div className="space-y-1 pb-10">
                {filteredAll.map((c) => (
                  <CurrencyRow key={c.code} currency={c} onSelect={handleSelectCurrency} />
                ))}
                {filteredAll.length === 0 && (
                  <p className="text-center text-muted-foreground py-6">
                    Nincs találat erre a keresésre
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== STEP 2 – Kedvezményezett ===================== */}
      {step === 2 && (
        <div className="px-5 mt-4 flex-1 flex flex-col animate-in fade-in duration-300">
          <h1 className="text-[2rem] leading-tight font-bold tracking-tight mb-8">
            Add meg a <br /> kedvezményezett <br /> számlaadatait
          </h1>

          <div className="space-y-6 flex-1">
            {/* E-mail (opcionális) */}
            <div className="space-y-1">
              <label className="text-sm font-bold text-foreground pl-1">
                E-mail-címe (nem kötelező)
              </label>
              <Input
                type="email"
                placeholder="example@example.ex"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 rounded-xl border-muted-foreground/30 focus-visible:ring-primary/50 text-base"
              />
            </div>

            {/* Tab: Helyi / IBAN */}
            <div className="space-y-2 pt-2">
              <label className="text-sm text-muted-foreground pl-1">
                Kedvezményezett banki adatai
              </label>
              <div className="h-[1px] w-full bg-border mb-2" />
              <div className="bg-[#f0ede6]/50 dark:bg-muted p-1 rounded-2xl flex">
                {(["LOCAL", "IBAN"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); setHasError(false); }}
                    className={`flex-1 py-3 text-sm rounded-xl transition-all duration-300 ${
                      tab === t
                        ? "bg-white dark:bg-card shadow-sm text-emerald-800 dark:text-emerald-400 font-bold"
                        : "text-muted-foreground font-medium"
                    }`}
                  >
                    {t === "LOCAL" ? "Helyi bankszámla" : "IBAN"}
                  </button>
                ))}
              </div>
            </div>

            {/* Számlatulajdonos neve */}
            <div className="space-y-1 pt-2">
              <label className="text-sm font-bold text-foreground pl-1">
                Számlatulajdonos teljes neve
              </label>
              <Input
                type="text"
                placeholder="Kis Kari"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-14 rounded-xl border-muted-foreground/30 focus-visible:ring-primary/50 text-base"
              />
            </div>

            {/* Számlaszám */}
            <div className="space-y-1">
              <label className="text-sm font-bold text-foreground pl-1">Bankszámlaszám</label>
              <Input
                type="text"
                placeholder={tab === "LOCAL" ? "12345678-12345678-12345678" : "HU..."}
                value={accountNumber}
                onChange={(e) => { setAccountNumber(e.target.value); setHasError(false); }}
                className={`h-14 rounded-xl text-base transition-colors ${
                  hasError
                    ? "border-red-500 text-red-600 focus-visible:ring-red-500 bg-red-500/5"
                    : "border-muted-foreground/30 focus-visible:ring-primary/50"
                }`}
              />
            </div>

            {hasError && (
              <div className="flex gap-2 p-3 rounded-xl bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 animate-in slide-in-from-top-2">
                <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span className="text-sm font-medium">
                  Kérünk, adj meg egy érvényes bankszámlaszámot.
                </span>
              </div>
            )}
          </div>

          <div className="pb-8 pt-4">
            <button
              onClick={handleRecipientContinue}
              className="w-full h-14 rounded-full font-bold text-base transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: "#A1E678", color: "#1B4D2E" }}
            >
              Folytatás
            </button>
          </div>
        </div>
      )}

      {/* ===================== STEP 3 – Összeg ===================== */}
      {step === 3 && (
        <div className="px-5 mt-4 flex-1 flex flex-col animate-in fade-in duration-300">
          <h1 className="text-[2rem] leading-tight font-bold tracking-tight mb-2">
            Mennyi {selectedCurrency?.code ?? "HUF"}-t <br /> szeretnél küldeni?
          </h1>

          {/* Egyenleg badge */}
          <p className="text-sm text-muted-foreground mb-8 pl-1">
            Elérhető egyenleg:{" "}
            <span className="font-semibold text-foreground">
              {balance !== null ? formatHuf(balance) : "…"}
            </span>
          </p>

          <div className="flex-1 flex flex-col gap-6">
            {/* Nagy összeg input */}
            <div className="relative">
              <Input
                type="number"
                min={1}
                placeholder="0"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setAmountError(""); }}
                className={`h-20 rounded-2xl text-4xl font-bold pr-20 text-center tracking-tight transition-colors ${
                  amountError
                    ? "border-red-500 text-red-600 focus-visible:ring-red-500 bg-red-500/5"
                    : "border-muted-foreground/30 focus-visible:ring-primary/50"
                }`}
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">
                {selectedCurrency?.flag ?? "🇭🇺"}
              </span>
            </div>

            {amountError && (
              <div className="flex gap-2 p-3 rounded-xl bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 animate-in slide-in-from-top-2">
                <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span className="text-sm font-medium">{amountError}</span>
              </div>
            )}

            {/* Megjegyzés */}
            <div className="space-y-1">
              <label className="text-sm font-bold text-foreground pl-1">
                Megjegyzés (nem kötelező)
              </label>
              <Input
                type="text"
                placeholder="pl. Közös nyaralás"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="h-14 rounded-xl border-muted-foreground/30 focus-visible:ring-primary/50 text-base"
              />
            </div>
          </div>

          <div className="pb-8 pt-4">
            <button
              onClick={handleAmountContinue}
              className="w-full h-14 rounded-full font-bold text-base transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: "#A1E678", color: "#1B4D2E" }}
            >
              Folytatás
            </button>
          </div>
        </div>
      )}

      {/* ===================== STEP 4 – Megerősítés ===================== */}
      {step === 4 && (
        <div className="px-5 mt-4 flex-1 flex flex-col animate-in fade-in duration-300">
          <h1 className="text-[2rem] leading-tight font-bold tracking-tight mb-8">
            Ellenőrizd az <br /> utalási adatokat
          </h1>

          {/* Összefoglaló kártya */}
          <div className="rounded-3xl border border-border bg-card p-5 space-y-4 mb-6">
            <SummaryRow label="Összeg" value={`${Number(amount).toLocaleString("hu-HU")} ${selectedCurrency?.code}`} large />
            <div className="h-[1px] w-full bg-border" />
            <SummaryRow label="Kedvezményezett" value={fullName} />
            <SummaryRow label="Számlaszám" value={accountNumber} />
            <SummaryRow label="Típus" value={tab === "LOCAL" ? "Helyi bankszámla" : "IBAN"} />
            {note && <SummaryRow label="Megjegyzés" value={note} />}
          </div>

          {/* Figyelmeztetés */}
          <div className="flex gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300 mb-6">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">
              Győződj meg róla, hogy a számlaszám helyes – az utalást nem lehet visszavonni.
            </p>
          </div>

          <div className="flex-1" />

          <div className="pb-8 pt-4 space-y-3">
            <button
              onClick={handleSend}
              disabled={sending}
              className="w-full h-14 rounded-full font-bold text-base transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ backgroundColor: "#A1E678", color: "#1B4D2E" }}
            >
              {sending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Küldés folyamatban…
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Küldés
                </>
              )}
            </button>
            <button
              onClick={handleGoBack}
              className="w-full h-12 rounded-full text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              Vissza
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Segéd komponensek ---

function CurrencyRow({
  currency,
  onSelect,
}: {
  currency: Currency;
  onSelect: (c: Currency) => void;
}) {
  return (
    <button
      onClick={() => onSelect(currency)}
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
  );
}

function SummaryRow({
  label,
  value,
  large,
}: {
  label: string;
  value: string;
  large?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={`font-semibold text-right break-all ${
          large ? "text-2xl text-emerald-600 dark:text-emerald-400" : "text-base"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
