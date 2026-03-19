"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  XCircle,
  CheckCircle2,
  Send,
  Loader2,
  ArrowDownUp,
  Info,
  ChevronDown
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// --- Pénznemek listája ---
type Currency = { code: string; name: string; flag: string };

const CURRENCIES: Currency[] = [
  { code: "HUF", name: "magyar forint", flag: "🇭🇺" },
  { code: "EUR", name: "euró", flag: "🇪🇺" },
  { code: "USD", name: "amerikai dollár", flag: "🇺🇸" },
  { code: "GBP", name: "brit font sterling", flag: "🇬🇧" },
  { code: "CHF", name: "svájci frank", flag: "🇨🇭" },
];

const CURRENCY_IBAN_PLACEHOLDER: Record<string, string> = {
  HUF: "HU42 1177 3016 1111 1018 0000 0000",
  EUR: "DE89 3704 0044 0532 0130 00",
  USD: "IBAN szám...",
  GBP: "GB29 NWBK 6016 1331 9268 19",
  CHF: "CH56 0483 5012 3456 7800 9",
};

function formatCurrency(n: number, currency: string) {
  return new Intl.NumberFormat("hu-HU", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 2,
  }).format(n);
}

// Egyszerű kamu sparkline SVG
const Sparkline = () => (
  <div className="relative h-24 w-full flex items-end">
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full stroke-[#1B4D2E] fill-none" strokeWidth="1.5">
      <path d="M0,20 C5,18 10,22 15,20 C20,18 25,25 30,22 C35,19 40,24 45,15 C50,6 55,10 60,6 C65,2 70,12 75,10 C80,8 85,15 90,12 C95,9 100,5 100,5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="100" cy="5" r="3" className="fill-[#1B4D2E]" stroke="none" />
    </svg>
    {/* Grid lines */}
    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-2">
      <div className="border-t border-dashed border-border w-full opacity-50" />
      <div className="border-t border-dashed border-border w-full opacity-50" />
      <div className="border-t border-dashed border-border w-full opacity-50" />
    </div>
  </div>
);

export function TransferFlow() {
  const router = useRouter();

  // Steps: 1 = Calculator, 2 = Recipient, 3 = Confirm
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Calculator State
  const [sendCurrency, setSendCurrency] = useState<Currency>(CURRENCIES[0]); // HUF
  const [receiveCurrency, setReceiveCurrency] = useState<Currency>(CURRENCIES[1]); // EUR
  const [sendAmount, setSendAmount] = useState<string>("10000");
  const [receiveAmount, setReceiveAmount] = useState<string>("");
  const [rates, setRates] = useState<Record<string, number>>({ EUR: 0.0025, USD: 0.0027, GBP: 0.0021, CHF: 0.0024, HUF: 1 });
  const [liveRateText, setLiveRateText] = useState("Betöltés...");
  const [isCurrencySelectorOpen, setIsCurrencySelectorOpen] = useState<'send' | 'receive' | null>(null);

  // User Balance
  const [balance, setBalance] = useState<number | null>(null);

  // Step 2: Recipient
  const [email, setEmail] = useState("");
  const [tab, setTab] = useState<"LOCAL" | "IBAN">("LOCAL");
  const [fullName, setFullName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [hasError, setHasError] = useState(false);

  // Step 3: Confirm
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);

  // Fetch live rates (Frankfurter) and user balance
  useEffect(() => {
    fetch("/api/user/balance")
      .then((r) => r.json())
      .then((d) => setBalance(d.balance ?? 0))
      .catch(() => setBalance(0));

    // Élő árfolyamok lekérése EUR bázissal
    fetch("https://api.frankfurter.app/latest?from=EUR")
      .then((res) => res.json())
      .then((data) => {
        const rates = data.rates;
        // Konvertáljunk egy közös bázisra, pl USD, vagy csak mentsük el a HUF/EUR/USD stb hálót
        const newRates: Record<string, number> = {
          EUR: 1,
          HUF: rates.HUF,
          USD: rates.USD,
          GBP: rates.GBP,
          CHF: rates.CHF
        };
        setRates(newRates);
      })
      .catch((e) => console.log("Árfolyam hiba:", e));
  }, []);

  // Számítás effect
  useEffect(() => {
    if (!rates.HUF) return;

    // Kalkuláljuk a váltási rátát
    const rateSendToEuro = 1 / rates[sendCurrency.code];
    const rateEuroToReceive = rates[receiveCurrency.code];
    const finalRate = rateSendToEuro * rateEuroToReceive;

    // Ha ugyanaz a deviza
    if (sendCurrency.code === receiveCurrency.code) {
      setReceiveAmount(sendAmount);
      setLiveRateText(`1 ${sendCurrency.code} = 1 ${receiveCurrency.code}`);
      return;
    }

    if (sendAmount && !isNaN(Number(sendAmount))) {
      const calculated = Number(sendAmount) * finalRate;
      setReceiveAmount(calculated.toFixed(2));
    } else {
      setReceiveAmount("");
    }

    // Élő rate szöveg frissítése
    // Pl. 1 EUR = 392,870 HUF (Mindig a "nagyobb" értékűt mutatjuk előre az élethűség kedvéért, vagy fixen Send -> Receive)
    let displayRate = finalRate;
    if (finalRate < 0.01) {
      displayRate = 1 / finalRate;
      setLiveRateText(`1 ${receiveCurrency.code} = ${displayRate.toLocaleString('hu-HU', { maximumFractionDigits: 4 })} ${sendCurrency.code}`);
    } else {
      setLiveRateText(`1 ${sendCurrency.code} = ${displayRate.toLocaleString('hu-HU', { maximumFractionDigits: 4 })} ${receiveCurrency.code}`);
    }

  }, [sendAmount, sendCurrency, receiveCurrency, rates]);

  const handleSwapCurrencies = () => {
    setSendCurrency(receiveCurrency);
    setReceiveCurrency(sendCurrency);
    setSendAmount(receiveAmount);
  };

  const handleGoBack = () => {
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
    else router.push("/dashboard");
  };

  // Kalkulátorból Tovább
  const handleCalculatorContinue = () => {
    const num = Number(sendAmount);
    if (!sendAmount || isNaN(num) || num <= 0) {
      toast.error("Adj meg egy érvényes összeget.");
      return;
    }
    // Csak a HUF egyenleget ellenőrizzük, mert a felhasználónak csak HUF egyenlege van a rendszerben
    // Viszont ha nem HUF-t küld, akkor át kell számolni HUF-ra a fedezet-ellenőrzéshez
    const sendInHuf = sendCurrency.code === "HUF" ? num : (num * (rates.HUF / rates[sendCurrency.code]));
    
    if (balance !== null && sendInHuf > balance) {
      toast.error(`Nincs elegendő fedezet. Elérhető: ${formatCurrency(balance, "HUF")}`);
      return;
    }
    setStep(2);
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

  // Step 3 – Küldés
  const handleSend = async () => {
    setSending(true);
    try {
      // Mindig a küldött (saját levont) összeget küldjük az API-nak a devizájával, vagy átváltjuk HUF-ra a levonáshoz
      // A mi API-nk JELENLEG HUF egyenleget von, de `amount`-ot kér be.
      // Emiatt kiszámoljuk, mennyit vonjon le fixen HUF-ban, és azt küldjük be.
      const sendInHuf = sendCurrency.code === "HUF" ? Number(sendAmount) : (Number(sendAmount) * (rates.HUF / rates[sendCurrency.code]));
      
      const res = await fetch("/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: fullName,
          recipientAccount: accountNumber,
          accountType: tab,
          currency: receiveCurrency.code, // Milyen devizában érkezik
          amount: sendInHuf,              // Mennyit vonunk le
          description: note.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message ?? "Az utalás sikertelen.");
        return;
      }

      toast.success("Az utalás elindítva!");
      router.push("/dashboard");
    } catch {
      toast.error("Szerver hiba. Kérünk, próbáld újra.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9f9] dark:bg-[#09090b] text-foreground animate-in slide-in-from-right-8 duration-300">
      
      <div className="pt-6 px-4 pb-2 flex items-center justify-between">
        <button
          onClick={handleGoBack}
          className="w-10 h-10 rounded-full bg-secondary/30 flex items-center justify-center hover:bg-secondary/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        {step === 1 && (
          <div className="px-3 py-1.5 bg-[#A1E678] text-[#1B4D2E] text-xs font-bold rounded-full">
            Nincs utalási díj
          </div>
        )}
      </div>

      {/* ===================== STEP 1 – Kalkulátor ===================== */}
      {step === 1 && (
        <div className="px-5 mt-2 flex-1 flex flex-col max-w-md mx-auto w-full">
          <h1 className="text-2xl font-bold tracking-tight mb-4">Utalás kalkulátor</h1>

          <div className="bg-[#f0ede6] dark:bg-card border border-border/50 rounded-3xl p-5 shadow-sm">
            {/* Chart Area */}
            <div className="mb-4">
              <Sparkline />
              <div className="flex justify-between text-xs text-muted-foreground mt-2 px-1">
                <span>Ma</span>
                <span>Idén</span>
              </div>
            </div>

            <div className="font-bold mb-6 text-sm">{liveRateText}</div>

            {/* Küldött összeg */}
            <div className="relative bg-white dark:bg-background rounded-2xl p-4 flex items-center justify-between shadow-sm z-10 transition-shadow focus-within:ring-2 focus-within:ring-primary/20">
              <input
                type="number"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                className="bg-transparent text-2xl font-bold outline-none w-1/2"
                placeholder="0"
              />
              <button 
                onClick={() => setIsCurrencySelectorOpen('send')}
                className="flex items-center gap-2 bg-muted/50 hover:bg-muted px-3 py-2 rounded-xl transition-colors"
              >
                <span className="text-xl">{sendCurrency.flag}</span>
                <span className="font-bold">{sendCurrency.code}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Swap Button */}
            <div className="relative h-6 flex justify-center items-center z-20">
              <button 
                onClick={handleSwapCurrencies}
                className="w-10 h-10 bg-[#f0ede6] dark:bg-card border-4 border-white dark:border-background rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
              >
                <ArrowDownUp className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Érkező összeg */}
            <div className="relative bg-white dark:bg-background rounded-2xl p-4 flex items-center justify-between shadow-sm z-10">
              <input
                type="text"
                readOnly
                value={receiveAmount}
                className="bg-transparent text-2xl font-bold outline-none w-1/2 text-muted-foreground"
                placeholder="0"
              />
              <button 
                onClick={() => setIsCurrencySelectorOpen('receive')}
                className="flex items-center gap-2 bg-muted/50 hover:bg-muted px-3 py-2 rounded-xl transition-colors"
              >
                <span className="text-xl">{receiveCurrency.flag}</span>
                <span className="font-bold">{receiveCurrency.code}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Info Box */}
            <div className="mt-6 border border-border/50 rounded-2xl p-4 bg-white/50 dark:bg-background/50">
              <div className="flex flex-col gap-3 text-sm text-center text-muted-foreground">
                <div className="flex items-center justify-center gap-1">
                  <span>Tartalmazza a díjakat</span>
                  <Info className="w-3.5 h-3.5" />
                </div>
                <div className="font-semibold text-foreground">0 HUF <span className="text-emerald-600 dark:text-emerald-400 line-through text-xs font-normal ml-1">404 HUF</span></div>
                <div className="h-[1px] w-full bg-border" />
                <div className="flex items-center justify-center gap-1">
                  <span>Érkezés becsült ideje</span>
                </div>
                <div className="font-semibold text-foreground">Másodpercek alatt</div>
              </div>
            </div>

            <button
              onClick={handleCalculatorContinue}
              className="w-full h-14 rounded-full mt-6 font-bold text-base transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: "#A1E678", color: "#1B4D2E" }}
            >
              Utalás
            </button>
          </div>

          <div className="py-6 text-center text-sm text-muted-foreground">
            Elérhető egyenleg: <span className="font-semibold text-foreground">{balance !== null ? formatCurrency(balance, "HUF") : "..."}</span>
          </div>
        </div>
      )}

      {/* ===================== STEP 2 – Kedvezményezett ===================== */}
      {step === 2 && (
        <div className="px-5 mt-4 flex-1 flex flex-col animate-in fade-in duration-300 max-w-md mx-auto w-full">
          <h1 className="text-[2rem] leading-tight font-bold tracking-tight mb-8">
            Add meg a <br /> kedvezményezett <br /> számlaadatait
          </h1>

          <div className="space-y-6 flex-1">
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

            <div className="space-y-2 pt-2">
              <label className="text-sm text-muted-foreground pl-1">
                Kedvezményezett banki adatai ({receiveCurrency.code})
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
                    {t === "LOCAL" ? "Helyi belföldi" : "IBAN"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <label className="text-sm font-bold text-foreground pl-1">
                Számlatulajdonos teljes neve
              </label>
              <Input
                type="text"
                placeholder="Minta Felhasználó"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-14 rounded-xl border-muted-foreground/30 focus-visible:ring-primary/50 text-base"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-foreground pl-1">Bankszámlaszám</label>
              <Input
                type="text"
                placeholder={
                  tab === "LOCAL"
                    ? "12345678-12345678-12345678"
                    : (CURRENCY_IBAN_PLACEHOLDER[receiveCurrency.code] ?? "IBAN szám...")
                }
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

      {/* ===================== STEP 3 – Megerősítés ===================== */}
      {step === 3 && (
        <div className="px-5 mt-4 flex-1 flex flex-col animate-in fade-in duration-300 max-w-md mx-auto w-full">
          <h1 className="text-[2rem] leading-tight font-bold tracking-tight mb-8">
            Ellenőrizd az <br /> utalási adatokat
          </h1>

          <div className="rounded-3xl border border-border bg-card p-5 space-y-4 mb-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Küldött összeg</span>
              <span className="font-bold text-xl">{Number(sendAmount).toLocaleString("hu-HU")} {sendCurrency.code}</span>
            </div>
            {sendCurrency.code !== receiveCurrency.code && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">Érkező összeg</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{Number(receiveAmount).toLocaleString("hu-HU")} {receiveCurrency.code}</span>
              </div>
            )}
            <div className="h-[1px] w-full bg-border" />
            <SummaryRow label="Kedvezményezett" value={fullName} />
            <SummaryRow label="Számlaszám" value={accountNumber} />
            <SummaryRow label="Típus" value={tab === "LOCAL" ? "Helyi bankszámla" : "IBAN"} />
          </div>

          <div className="space-y-1 mb-6">
            <label className="text-sm font-bold text-foreground pl-1">
              Közlemény (opcionális)
            </label>
            <Input
              type="text"
              placeholder="pl. Közös nyaralás"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="h-14 rounded-xl border-muted-foreground/30 focus-visible:ring-primary/50 text-base"
            />
          </div>

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
                  Folyamatban…
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Pénz elküldése
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

      {/* Currency Selector Modal */}
      <Dialog open={!!isCurrencySelectorOpen} onOpenChange={(open) => !open && setIsCurrencySelectorOpen(null)}>
        <DialogContent className="max-w-sm rounded-[2rem]">
          <h3 className="font-bold text-xl mb-4 text-center">Pénznem választás</h3>
          <div className="space-y-2">
            {CURRENCIES.map((c) => (
              <button
                key={c.code}
                onClick={() => {
                  if (isCurrencySelectorOpen === 'send') setSendCurrency(c);
                  else setReceiveCurrency(c);
                  setIsCurrencySelectorOpen(null);
                }}
                className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{c.flag}</span>
                  <div className="text-left">
                    <div className="font-bold">{c.code}</div>
                    <div className="text-sm text-muted-foreground">{c.name}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string; }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-semibold text-right break-all text-sm">{value}</span>
    </div>
  );
}
