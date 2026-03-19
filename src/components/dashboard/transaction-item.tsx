import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowUpRight, ArrowDownLeft, CreditCard, Plus } from "lucide-react";

interface TransactionItemProps {
  transaction: {
    id: string;
    type: string;
    amount: number;
    description: string;
    createdAt: Date;
    currency?: string;
  };
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const isIncoming = ["DEPOSIT", "TRANSFER_IN"].includes(transaction.type);
  const Icon = transaction.type === "CARD_PAYMENT" 
    ? CreditCard 
    : transaction.type === "DEPOSIT"
    ? Plus
    : isIncoming 
    ? ArrowDownLeft 
    : ArrowUpRight;

  return (
    <div className="flex items-center gap-3 py-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
        isIncoming ? "bg-primary/10 text-primary" : "bg-muted"
      }`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{transaction.description}</p>
        <p className="text-xs text-muted-foreground">
          {formatDate(transaction.createdAt)}
        </p>
      </div>
      <div className="text-right">
        <p className={`font-semibold text-sm ${isIncoming ? "text-primary" : ""}`}>
          {isIncoming ? "+" : "-"}{formatCurrency(Math.abs(transaction.amount))}
        </p>
        {transaction.currency && transaction.currency !== "HUF" && (
          <p className="text-xs text-muted-foreground">{transaction.currency}</p>
        )}
      </div>
    </div>
  );
}
