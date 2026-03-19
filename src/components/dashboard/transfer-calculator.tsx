"use client";

import { useState, useEffect } from "react";
import { ArrowDownUp, Info, ChevronDown } from "lucide-react";
import { format, subDays } from "date-fns";
import {
  LineChart,
  Line,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type Currency = { code: string; name: string; flag: string };

const CURRENCIES: Currency[] = [
  { code: "HUF", name: "magyar forint", flag: "🇭🇺" },
  { code: "EUR", name: "euró", flag: "🇪🇺" },
  { code: "USD", name: "amerikai dollár", flag: "🇺🇸" },
  { code: "GBP", name: "brit font sterling", flag: "🇬🇧" },
  { code: "CHF", name: "svájci frank", flag: "🇨🇭" },
];

export function TransferCalculator() {
  const [sendCurrency, setSendCurrency] = useState<Currency>(CURRENCIES[1]); // EUR alapból
  const [receiveCurrency, setReceiveCurrency] = useState<Currency>(CURRENCIES[0]); // HUF alapból
  const [sendAmount, setSendAmount] = useState<string>("1000");
  const [receiveAmount, setReceiveAmount] = useState<string>("");
  
  const [chartData, setChartData] = useState<{ date: string; value: number }[]>([]);
  const [currentRate, setCurrentRate] = useState<number | null>(null);
  const [isCurrencySelectorOpen, setIsCurrencySelectorOpen] = useState<'send' | 'receive' | null>(null);

  // Árfolyam grafikon és lekérdezés effekt
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchRates = async () => {
      // Ha azonos a deviza, nincs mit chartolni
      if (sendCurrency.code === receiveCurrency.code) {
        setChartData([]);
        setCurrentRate(1);
        return;
      }

      try {
        // Történelmi adatok az elmúlt 30 napra
        const end = format(new Date(), "yyyy-MM-dd");
        const start = format(subDays(new Date(), 30), "yyyy-MM-dd");
        
        // Frankfurter történelmi adatok lekérdezése
        const historyRes = await fetch(`https://api.frankfurter.app/${start}..${end}?from=${sendCurrency.code}&to=${receiveCurrency.code}`);
        const historyData = await historyRes.json();
        
        const dataPoints: { date: string; value: number }[] = [];
        if (historyData.rates) {
          for (const [date, rates] of Object.entries(historyData.rates) as [string, any][]) {
            dataPoints.push({
              date,
              value: rates[receiveCurrency.code]
            });
          }
        }
        
        // Legfrissebb valós idejű rate lekérdezése az azonnali pontosságért
        const latestRes = await fetch(`https://api.frankfurter.app/latest?from=${sendCurrency.code}&to=${receiveCurrency.code}`);
        const latestData = await latestRes.json();
        const latestRate = latestData.rates[receiveCurrency.code];
        
        // Frissítjük a chart utolsó pontját is a jelenlegi állapotra
        if (dataPoints.length > 0) {
          // Csak akkor adjuk hozzá külön napként, ha még nem volt (bár a legújabb általában a mai nap, hacsak nem hétvége)
          // Egy egyszerűbb megoldás: hozzáadjuk a legfrissebbet utolsó pontként Date.now paraméterrel, vagy frissítjük az utolsót.
          dataPoints.push({ date: "Now", value: latestRate });
        }
        
        setChartData(dataPoints);
        setCurrentRate(latestRate);
      } catch (error) {
        console.error("Hiba az árfolyamok lekérésekor:", error);
      }
    };

    fetchRates();
    
    // Auto frissítés percenként (60000 ms)
    intervalId = setInterval(fetchRates, 60000);
    
    return () => clearInterval(intervalId);
  }, [sendCurrency, receiveCurrency]);

  // Érték számítás
  useEffect(() => {
    if (!currentRate) return;

    if (sendCurrency.code === receiveCurrency.code) {
      setReceiveAmount(sendAmount);
      return;
    }

    if (sendAmount && !isNaN(Number(sendAmount))) {
      const calculated = Number(sendAmount) * currentRate;
      // Két tizedesjegyre kerekítjük megjelenítésnél
      setReceiveAmount(calculated.toFixed(2));
    } else {
      setReceiveAmount("");
    }
  }, [sendAmount, currentRate, sendCurrency, receiveCurrency]);

  const handleSwapCurrencies = () => {
    setSendCurrency(receiveCurrency);
    setReceiveCurrency(sendCurrency);
    setSendAmount(receiveAmount);
  };

  // Min-max számítása a grafikon Y tengelyéhez, hogy szép legyen
  const minRate = chartData.length > 0 ? Math.min(...chartData.map(d => d.value)) : 0;
  const maxRate = chartData.length > 0 ? Math.max(...chartData.map(d => d.value)) : 0;
  const margin = (maxRate - minRate) * 0.1; // 10% padding
  const domain = [minRate - margin, maxRate + margin];

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold tracking-tight mb-4 px-2">Utalás kalkulátor</h2>
      
      <div className="bg-[#f0ede6] dark:bg-card border border-border/50 rounded-3xl p-5 shadow-sm">
        
        {/* Realtime Chart */}
        <div className="mb-4 h-32 relative">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <YAxis 
                  domain={domain} 
                  hide={true} // Elrejtjük az Y tengelyt a letisztult dizájn miatt, vagy tehetünk min/max feliratot manuálisan
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#1B4D2E" 
                  strokeWidth={2} 
                  dot={false}
                  activeDot={{ r: 4, fill: "#1B4D2E", stroke: "white" }}
                  isAnimationActive={true}
                  animationDuration={800}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
             <div className="h-full w-full flex items-center justify-center font-medium text-muted-foreground animate-pulse">
               Árfolyam betöltése...
             </div>
          )}
          
          {/* Chart feliratok (opcionális Y érték megjelenítés a széleken) */}
          {chartData.length > 0 && (
            <>
              <div className="absolute top-0 right-0 text-[10px] text-muted-foreground font-medium">
                {(maxRate).toFixed(1)}
              </div>
              <div className="absolute bottom-6 right-0 text-[10px] text-muted-foreground font-medium">
                {(minRate).toFixed(1)}
              </div>
            </>
          )}

          <div className="flex justify-between text-xs text-muted-foreground mt-2 px-1 absolute bottom-0 w-full">
            <span>30 napja</span>
            <span className="flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Ma
            </span>
          </div>
        </div>

        <div className="font-bold mb-6 text-sm flex items-center gap-2">
          {currentRate 
            ? `1 ${sendCurrency.code} = ${currentRate.toLocaleString('hu-HU', { maximumFractionDigits: 4 })} ${receiveCurrency.code}` 
            : "Árfolyam számítása..."}
        </div>

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
            <div className="font-semibold text-foreground">
              0 {sendCurrency.code}
              <span className="text-emerald-600 dark:text-emerald-400 line-through text-xs font-normal ml-1">
                {(400 / (sendCurrency.code === "HUF" ? 1 : 390)).toFixed(2)} {sendCurrency.code}
              </span>
            </div>
            <div className="h-[1px] w-full bg-border" />
            <div className="flex items-center justify-center gap-1">
              <span>Érkezés becsült ideje</span>
            </div>
            <div className="font-semibold text-foreground">Másodpercek alatt</div>
          </div>
        </div>

        <a
          href="/transfer"
          className="flex items-center justify-center w-full h-14 rounded-full mt-6 font-bold text-base transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: "#A1E678", color: "#1B4D2E" }}
        >
          Utalás indítása
        </a>
      </div>

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
