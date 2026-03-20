"use client";

import { useState, useEffect } from "react";
import { ArrowDownUp, Info, ChevronDown } from "lucide-react";
import { format, subDays } from "date-fns";
import { hu } from 'date-fns/locale';
import {
  LineChart,
  Line,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type Currency = { code: string; name: string; flag: string; priority: number };

const CURRENCIES: Currency[] = [
  { code: "HUF", name: "magyar forint", flag: "🇭🇺", priority: 5 },
  { code: "USD", name: "amerikai dollár", flag: "🇺🇸", priority: 4 },
  { code: "EUR", name: "euró", flag: "🇪🇺", priority: 3 },
  { code: "CHF", name: "svájci frank", flag: "🇨🇭", priority: 2 },
  { code: "GBP", name: "brit font sterling", flag: "🇬🇧", priority: 1 },
];

export function TransferCalculator() {
  const [sendCurrency, setSendCurrency] = useState<Currency>(CURRENCIES.find(c => c.code === "HUF")!);
  const [receiveCurrency, setReceiveCurrency] = useState<Currency>(CURRENCIES.find(c => c.code === "EUR")!);
  
  const [sendAmount, setSendAmount] = useState<string>("3039");
  const [receiveAmount, setReceiveAmount] = useState<string>("");
  
  const [chartData, setChartData] = useState<{ date: string; value: number }[]>([]);
  const [baseToQuoteRate, setBaseToQuoteRate] = useState<number | null>(null);
  const [sendToReceiveRate, setSendToReceiveRate] = useState<number | null>(null);
  const [isCurrencySelectorOpen, setIsCurrencySelectorOpen] = useState<'send' | 'receive' | null>(null);

  // Melyik a bázis deviza (az erősebb, amihez viszonyítunk a grafikonon)
  const baseCurrency = (sendCurrency as any).priority < (receiveCurrency as any).priority ? sendCurrency : receiveCurrency;
  const quoteCurrency = baseCurrency.code === sendCurrency.code ? receiveCurrency : sendCurrency;

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchRates = async () => {
      // Ha ugyanaz, nincs grafikon
      if (sendCurrency.code === receiveCurrency.code) {
        setChartData([]);
        setBaseToQuoteRate(1);
        setSendToReceiveRate(1);
        return;
      }

      try {
        const end = format(new Date(), "yyyy-MM-dd");
        const start = format(subDays(new Date(), 30), "yyyy-MM-dd");
        
        // Grafikon adatainak lekérése (Base -> Quote)
        const historyRes = await fetch(`https://api.frankfurter.app/${start}..${end}?from=${baseCurrency.code}&to=${quoteCurrency.code}`);
        const historyData = await historyRes.json();
        
        const dataPoints: { date: string; value: number }[] = [];
        if (historyData.rates) {
          for (const [date, rates] of Object.entries(historyData.rates) as [string, any][]) {
            dataPoints.push({
              date,
              value: rates[quoteCurrency.code]
            });
          }
        }
        
        // Élő rate-ek (Base -> Quote is kell a kiíráshoz, és Send -> Receive a váltáshoz)
        const latestRes = await fetch(`https://api.frankfurter.app/latest?from=${baseCurrency.code}&to=${quoteCurrency.code}`);
        const latestData = await latestRes.json();
        const baseToQuoteLatest = latestData.rates[quoteCurrency.code];
        
        if (dataPoints.length > 0) {
          // Ha az utolsó nap nem a mai, frissítsük a maival
          dataPoints.push({ date: "Ma", value: baseToQuoteLatest });
        }
        
        setChartData(dataPoints);
        setBaseToQuoteRate(baseToQuoteLatest);

        // Kiszámoljuk a Send -> Receive konverziós értéket
        if (sendCurrency.code === baseCurrency.code) {
          setSendToReceiveRate(baseToQuoteLatest);
        } else {
          setSendToReceiveRate(1 / baseToQuoteLatest);
        }

      } catch (error) {
        console.error("Hiba az árfolyamok lekérésekor:", error);
      }
    };

    fetchRates();
    intervalId = setInterval(fetchRates, 60000);
    return () => clearInterval(intervalId);
  }, [sendCurrency, receiveCurrency, baseCurrency, quoteCurrency]);

  // Érték számítás
  useEffect(() => {
    if (sendCurrency.code === receiveCurrency.code) {
      setReceiveAmount(sendAmount);
      return;
    }

    if (sendToReceiveRate && sendAmount && !isNaN(Number(sendAmount))) {
      const calculated = Number(sendAmount) * sendToReceiveRate;
      
      // Huf-nál nincs tizedesjegy, egyébként 2
      if (receiveCurrency.code === "HUF") {
        setReceiveAmount(calculated.toFixed(0));
      } else {
        setReceiveAmount(calculated.toFixed(2));
      }
    } else {
      setReceiveAmount("");
    }
  }, [sendAmount, sendToReceiveRate, sendCurrency, receiveCurrency]);

  const handleSwapCurrencies = () => {
    setSendCurrency(receiveCurrency);
    setReceiveCurrency(sendCurrency);
    setSendAmount(receiveAmount || "");
  };

  // Min-max számítása a grafikon Y tengelyéhez, paddinggel
  const values = chartData.map(d => d.value);
  const minRate = values.length > 0 ? Math.min(...values) : 0;
  const maxRate = values.length > 0 ? Math.max(...values) : 0;
  const margin = (maxRate - minRate) * 0.1;
  const domain = [minRate - margin, maxRate + margin];

  const startDateText = format(subDays(new Date(), 30), "MMM d.", { locale: hu });

  // Custom Dot az utolsó elemhez (zöld pötty a Recharts-ban)
  const renderCustomizedDot = (props: any) => {
    const { cx, cy, index } = props;
    if (index === chartData.length - 1) {
      return (
        <circle cx={cx} cy={cy} r={5} fill="#1B4D2E" stroke="none" />
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <h2 className="text-[1.35rem] font-bold tracking-tight mb-4 px-2 text-foreground">Utalás kalkulátor</h2>
      
      <div className="bg-card border border-border/50 rounded-[2rem] p-5 shadow-sm">
        
        {/* Realtime Chart Container */}
        <div className="mb-2 relative">
          <div className="h-[120px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 15, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d1d5db" />
                  <YAxis 
                    domain={domain} 
                    axisLine={false}
                    tickLine={false}
                    orientation="right"
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    tickFormatter={(val) => val.toLocaleString('hu-HU', { maximumFractionDigits: 1 })}
                    dx={20}
                  />
                  <Line 
                    type="linear" // Nem kerekített, hanem éles
                    dataKey="value" 
                    stroke="#1B4D2E" 
                    strokeWidth={2.5} 
                    dot={renderCustomizedDot}
                    activeDot={{ r: 6, fill: "#1B4D2E", stroke: "white", strokeWidth: 2 }}
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
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground mt-1 px-1">
            <span>{startDateText}</span>
            <span className="mr-8">Ma</span>
          </div>
        </div>

        <div className="font-bold mb-6 text-sm flex items-center text-foreground px-1 pl-1">
          {baseToQuoteRate 
            ? `1 ${baseCurrency.code} = ${baseToQuoteRate.toLocaleString('hu-HU', { maximumFractionDigits: 4 })} ${quoteCurrency.code}` 
            : "Árfolyam számítása..."}
        </div>

        {/* CSERE INPUTOK */}
        <div className="relative">
          {/* FELSZŐ (Küldött) DOBOZ */}
          <div className="relative bg-background rounded-[1.25rem] p-3 flex items-center justify-between shadow-sm focus-within:ring-2 focus-within:ring-[#A1E678] transition-all border border-border/50">
            <input
              type="number"
              value={sendAmount}
              onChange={(e) => setSendAmount(e.target.value)}
              className="bg-transparent text-[1.35rem] font-bold outline-none w-1/2 pl-2"
              placeholder="0"
            />
            <button 
              onClick={() => setIsCurrencySelectorOpen('send')}
              className="flex items-center gap-2 hover:bg-muted p-2 px-3 rounded-lg transition-colors border border-border/40 shrink-0"
            >
              <span className="text-xl leading-none shadow-sm rounded-full overflow-hidden flex">{sendCurrency.flag}</span>
              <span className="font-bold">{sendCurrency.code}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* SWAP GOMB (Pozícionálva a két doboz közé) */}
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10">
            <button 
              onClick={handleSwapCurrencies}
              className="w-10 h-10 bg-card border-4 border-background rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
            >
              <ArrowDownUp className="w-[18px] h-[18px] text-muted-foreground" />
            </button>
          </div>

          {/* ALSÓ (Érkező) DOBOZ */}
          <div className="relative bg-background rounded-[1.25rem] p-3 flex items-center justify-between shadow-sm mt-3 focus-within:ring-2 focus-within:ring-[#A1E678] transition-all border border-border/50">
            <input
              type="text"
              readOnly
              value={receiveAmount}
              className="bg-transparent text-[1.35rem] font-bold outline-none w-1/2 pl-2 text-muted-foreground"
              placeholder="0"
            />
            <button 
              onClick={() => setIsCurrencySelectorOpen('receive')}
              className="flex items-center gap-2 hover:bg-muted p-2 px-3 rounded-lg transition-colors border border-border/40 shrink-0"
            >
              <span className="text-xl leading-none shadow-sm rounded-full overflow-hidden flex">{receiveCurrency.flag}</span>
              <span className="font-bold">{receiveCurrency.code}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <button
          onClick={() => window.location.href = '/transfer'}
          className="w-full h-[52px] rounded-full mt-5 font-bold text-base transition-all hover:opacity-90 active:scale-[0.98] shadow-sm"
          style={{ backgroundColor: "#85E04D", color: "#1B4D2E" }}
        >
          Utalás
        </button>
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
                style={c.code === (isCurrencySelectorOpen === 'send' ? sendCurrency.code : receiveCurrency.code) ? { backgroundColor: 'hsl(var(--muted))' } : {}}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl leading-none">{c.flag}</span>
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
