"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, TrendingDown, ShoppingCart, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface CryptoDetail {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
}

interface CryptoHolding {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  avgBuyPrice: number;
}

export default function CryptoDetailPage() {
  const router = useRouter();
  const params = useParams();
  const cryptoId = params?.id as string;

  const [crypto, setCrypto] = useState<CryptoDetail | null>(null);
  const [holding, setHolding] = useState<CryptoHolding | null>(null);
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [trading, setTrading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [cryptoId]);

  const fetchData = async () => {
    try {
      const [pricesRes, holdingsRes, balanceRes] = await Promise.all([
        fetch("/api/crypto/prices"),
        fetch("/api/crypto/holdings"),
        fetch("/api/balance"),
      ]);

      if (pricesRes.ok) {
        const prices = await pricesRes.json();
        const foundCrypto = prices.find(
          (p: CryptoDetail) => p.id === cryptoId || p.symbol.toLowerCase() === cryptoId.toLowerCase()
        );
        setCrypto(foundCrypto || null);
      }

      if (holdingsRes.ok) {
        const holdings = await holdingsRes.json();
        const foundHolding = holdings.find(
          (h: CryptoHolding) => h.symbol.toLowerCase() === cryptoId.toLowerCase()
        );
        setHolding(foundHolding || null);
      }

      if (balanceRes.ok) {
        const data = await balanceRes.json();
        setBalance(data.balance);
      }
    } catch (error) {
      toast.error("Hiba az adatok betöltésekor");
    } finally {
      setLoading(false);
    }
  };

  const handleTrade = async (type: "BUY" | "SELL") => {
    if (!crypto || !amount || Number(amount) <= 0) {
      toast.error("Adj meg egy érvényes összeget");
      return;
    }

    const tradeAmount = Number(amount);
    const totalCost = tradeAmount * crypto.price;

    if (type === "BUY" && totalCost > balance) {
      toast.error("Nincs elegendő egyenleg");
      return;
    }

    if (type === "SELL" && (!holding || tradeAmount > holding.amount)) {
      toast.error("Nincs elegendő crypto egyenleg");
      return;
    }

    setTrading(true);

    try {
      const res = await fetch("/api/crypto/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          symbol: crypto.symbol,
          name: crypto.name,
          amount: tradeAmount,
          pricePerUnit: crypto.price,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Hiba történt");
        return;
      }

      toast.success(
        type === "BUY"
          ? `Sikeresen vásároltál ${tradeAmount} ${crypto.symbol}-t!`
          : `Sikeresen eladtál ${tradeAmount} ${crypto.symbol}-t!`
      );

      setAmount("");
      await fetchData();
    } catch (error) {
      toast.error("Hiba történt a tranzakció során");
    } finally {
      setTrading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-6 flex items-center justify-center">
        <p className="text-muted-foreground">Betöltés...</p>
      </div>
    );
  }

  if (!crypto) {
    return (
      <div className="py-6">
        <p className="text-muted-foreground">Crypto nem található</p>
      </div>
    );
  }

  const isPositive = crypto.change24h >= 0;
  const currentValue = holding ? holding.amount * crypto.price : 0;
  const invested = holding ? holding.amount * holding.avgBuyPrice : 0;
  const profit = currentValue - invested;
  const profitPercent = invested > 0 ? (profit / invested) * 100 : 0;

  return (
    <div className="space-y-6 py-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Vissza
      </button>

      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xl">
            {crypto.symbol.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{crypto.name}</h1>
            <p className="text-sm text-muted-foreground">{crypto.symbol}</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-4xl font-bold">{formatCurrency(crypto.price)}</p>
          <div className="flex items-center gap-2 mt-2">
            {isPositive ? (
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
            )}
            <span
              className={`text-lg font-semibold ${
                isPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {isPositive ? "+" : ""}
              {crypto.change24h.toFixed(2)}% (24h)
            </span>
          </div>
        </div>
      </div>

      {holding && (
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Saját Holding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Mennyiség</span>
              <span className="font-bold">
                {holding.amount.toFixed(6)} {crypto.symbol}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Jelenlegi érték</span>
              <span className="font-bold">{formatCurrency(currentValue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Profit/Loss</span>
              <span
                className={`font-bold ${
                  profit >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {profit >= 0 ? "+" : ""}
                {formatCurrency(profit)} ({profitPercent.toFixed(2)}%)
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Kereskedés</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Mennyiség ({crypto.symbol})
            </label>
            <Input
              type="number"
              step="0.000001"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg"
            />
            {amount && Number(amount) > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Összesen: {formatCurrency(Number(amount) * crypto.price)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => handleTrade("BUY")}
              disabled={trading || !amount || Number(amount) <= 0}
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Vásárlás
            </Button>

            {holding && holding.amount > 0 && (
              <Button
                onClick={() => handleTrade("SELL")}
                disabled={trading || !amount || Number(amount) <= 0}
                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Eladás
              </Button>
            )}
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Elérhető egyenleg</span>
              <span className="font-semibold">{formatCurrency(balance)}</span>
            </div>
            {holding && (
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-muted-foreground">Elérhető {crypto.symbol}</span>
                <span className="font-semibold">
                  {holding.amount.toFixed(6)} {crypto.symbol}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
