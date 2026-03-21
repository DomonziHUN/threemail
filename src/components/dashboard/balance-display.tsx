"use client";

import { TrendingUp, HelpCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { BalanceDetailsModal } from "./balance-details-modal";

interface BalanceDisplayProps {
  balance: number;
}

export function BalanceDisplay({ balance }: BalanceDisplayProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          <span>Teljes egyenleg</span>
          <button
            onClick={() => setShowDetails(true)}
            className="ml-auto p-1 hover:bg-muted rounded-full transition-colors"
            title="Részletek"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={() => setShowDetails(true)}
          className="text-4xl font-bold tracking-tight hover:opacity-80 transition-opacity text-left"
        >
          {formatCurrency(balance)}
        </button>
      </div>
      <BalanceDetailsModal 
        open={showDetails} 
        onClose={() => setShowDetails(false)} 
      />
    </>
  );
}
