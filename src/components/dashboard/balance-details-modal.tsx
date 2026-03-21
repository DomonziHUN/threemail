"use client";

import { useEffect, useState } from "react";
import { X, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface BalanceDetailsModalProps {
  open: boolean;
  onClose: () => void;
}

type BalanceBreakdown = {
  totalBalance: number;
  availableBalance: number;
  pendingIncoming: number;
  pendingOutgoing: number;
  thisMonthIncome: number;
  thisMonthExpense: number;
  lastMonthIncome: number;
  lastMonthExpense: number;
};

export function BalanceDetailsModal({ open, onClose }: BalanceDetailsModalProps) {
  const [data, setData] = useState<BalanceBreakdown | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchBalanceDetails();
    }
  }, [open]);

  const fetchBalanceDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/balance-details");
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (error) {
      console.error("Balance details fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-background w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-8 duration-300">
        <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Teljes egyenleg</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Betöltés...</div>
        ) : data ? (
          <div className="p-6 space-y-6">
            <div className="text-center py-6">
              <div className="text-sm text-muted-foreground mb-2">Teljes egyenleg</div>
              <div className="text-5xl font-bold">{formatCurrency(data.totalBalance)}</div>
            </div>

            <div className="space-y-3">
              <div className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium">Készpénz</span>
                  </div>
                  <span className="font-bold">{formatCurrency(data.availableBalance)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="font-semibold mb-3">Teljes hozam</h3>
              
              <div className="bg-muted/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Kamatok</span>
                  <span className="font-medium">0,00 HUF</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Részvények</span>
                  <span className="font-medium">0,00 HUF</span>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="font-semibold mb-3">Kiadásaid</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <div className="font-medium">Kiadásaid ebben a hónapban</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date().toLocaleDateString("hu-HU", { year: "numeric", month: "long" })}
                      </div>
                    </div>
                  </div>
                  <span className="font-bold text-red-500">{formatCurrency(data.thisMonthExpense)}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                  <div>
                    <div className="font-medium text-sm">Kiadásaid a múlt hónapban</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleDateString("hu-HU", { year: "numeric", month: "long" })}
                    </div>
                  </div>
                  <span className="font-semibold">{formatCurrency(data.lastMonthExpense)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="font-semibold mb-3">Bevételeid</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <div className="font-medium">Bevételeid ebben a hónapban</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date().toLocaleDateString("hu-HU", { year: "numeric", month: "long" })}
                      </div>
                    </div>
                  </div>
                  <span className="font-bold text-green-500">{formatCurrency(data.thisMonthIncome)}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                  <div>
                    <div className="font-medium text-sm">Bevételeid a múlt hónapban</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleDateString("hu-HU", { year: "numeric", month: "long" })}
                    </div>
                  </div>
                  <span className="font-semibold">{formatCurrency(data.lastMonthIncome)}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">Hiba történt</div>
        )}
      </div>
    </div>
  );
}
