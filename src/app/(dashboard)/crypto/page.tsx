"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

interface CryptoPrice {
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

export default function CryptoPage() {
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [holdings, setHoldings] = useState<CryptoHolding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pricesRes, holdingsRes] = await Promise.all([
        fetch("/api/crypto/prices"),
        fetch("/api/crypto/holdings"),
      ]);

      if (pricesRes.ok) {
        setPrices(await pricesRes.json());
      }

      if (holdingsRes.ok) {
        setHoldings(await holdingsRes.json());
      }
    } catch (error) {
      toast.error("Hiba az adatok betöltésekor");
    } finally {
      setLoading(false);
    }
  };

  const totalPortfolioValue = holdings.reduce((sum, holding) => {
    const currentPrice = prices.find((p) => p.symbol === holding.symbol)?.price || 0;
    return sum + holding.amount * currentPrice;
  }, 0);

  const totalInvested = holdings.reduce((sum, holding) => {
    return sum + holding.amount * holding.avgBuyPrice;
  }, 0);

  const totalProfit = totalPortfolioValue - totalInvested;
  const profitPercent = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  if (loading) {
    return (
      <div className="py-6 flex items-center justify-center">
        <p className="text-muted-foreground">Betöltés...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-bold">Crypto Trading</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Vásárolj és adj el kriptovalutákat valós árfolyamon
        </p>
      </div>

      {holdings.length > 0 && (
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wallet className="h-5 w-5" />
              Portfolio Összértéke
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-3xl font-bold">{formatCurrency(totalPortfolioValue)}</p>
              <div className="flex items-center gap-2 mt-2">
                {totalProfit >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                )}
                <span
                  className={`text-sm font-semibold ${
                    totalProfit >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {totalProfit >= 0 ? "+" : ""}
                  {formatCurrency(totalProfit)} ({profitPercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">Top Kriptovaluták</h2>
        <div className="space-y-2">
          {prices.map((crypto) => {
            const holding = holdings.find((h) => h.symbol === crypto.symbol);
            const isPositive = crypto.change24h >= 0;

            return (
              <Link key={crypto.id} href={`/crypto/${crypto.id}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {crypto.symbol.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold">{crypto.symbol}</p>
                          <p className="text-xs text-muted-foreground">{crypto.name}</p>
                          {holding && (
                            <p className="text-xs text-primary font-medium mt-0.5">
                              {holding.amount.toFixed(6)} {crypto.symbol}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(crypto.price)}</p>
                        <div className="flex items-center gap-1 justify-end">
                          {isPositive ? (
                            <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                          )}
                          <span
                            className={`text-xs font-semibold ${
                              isPositive
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {isPositive ? "+" : ""}
                            {crypto.change24h.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {holdings.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Saját Holdings</h2>
          <div className="space-y-2">
            {holdings.map((holding) => {
              const currentPrice = prices.find((p) => p.symbol === holding.symbol)?.price || 0;
              const currentValue = holding.amount * currentPrice;
              const invested = holding.amount * holding.avgBuyPrice;
              const profit = currentValue - invested;
              const profitPercent = invested > 0 ? (profit / invested) * 100 : 0;

              return (
                <Link key={holding.id} href={`/crypto/${holding.symbol.toLowerCase()}`}>
                  <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold">{holding.symbol}</p>
                          <p className="text-sm text-muted-foreground">
                            {holding.amount.toFixed(6)} {holding.symbol}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(currentValue)}</p>
                          <p
                            className={`text-xs font-semibold ${
                              profit >= 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {profit >= 0 ? "+" : ""}
                            {formatCurrency(profit)} ({profitPercent.toFixed(2)}%)
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
