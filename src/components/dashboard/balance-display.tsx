import { TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface BalanceDisplayProps {
  balance: number;
}

export function BalanceDisplay({ balance }: BalanceDisplayProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <TrendingUp className="h-4 w-4" />
        <span>Teljes egyenleg</span>
      </div>
      <div className="text-4xl font-bold tracking-tight">
        {formatCurrency(balance)}
      </div>
    </div>
  );
}
