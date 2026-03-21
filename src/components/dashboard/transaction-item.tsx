"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { hu } from "date-fns/locale";
import { ArrowUpRight, ArrowDownLeft, CreditCard, Plus, X, ChevronRight, CheckCircle2, Clock, XCircle } from "lucide-react";

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: Date | string;
  currency?: string;
  status?: string;
  senderName?: string | null;
  senderAccountNumber?: string | null;
  reference?: string | null;
}

interface TransactionItemProps {
  transaction: Transaction;
}

const TYPE_LABELS: Record<string, string> = {
  DEPOSIT: "Befizetés",
  WITHDRAWAL: "Kivét",
  CARD_PAYMENT: "Kártyás fizetés",
  TRANSFER_IN: "Beérkező utalás",
  TRANSFER_OUT: "Kimenő utalás",
};

const STATUS_LABELS: Record<string, string> = {
  COMPLETED: "Teljesítve",
  PENDING: "Függőben",
  FAILED: "Sikertelen",
};

function getIcon(type: string) {
  if (type === "CARD_PAYMENT") return CreditCard;
  if (type === "DEPOSIT") return Plus;
  if (["TRANSFER_IN"].includes(type)) return ArrowDownLeft;
  return ArrowUpRight;
}

function StatusIcon({ status }: { status?: string }) {
  if (status === "COMPLETED") return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  if (status === "PENDING") return <Clock className="h-4 w-4 text-yellow-500" />;
  if (status === "FAILED") return <XCircle className="h-4 w-4 text-red-500" />;
  return <CheckCircle2 className="h-4 w-4 text-green-500" />;
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const [open, setOpen] = useState(false);
  const isIncoming = ["DEPOSIT", "TRANSFER_IN"].includes(transaction.type);
  const Icon = getIcon(transaction.type);
  const date = new Date(transaction.createdAt);
  const shortDate = format(date, "yyyy. MMM d.", { locale: hu });

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 py-3 w-full text-left hover:bg-muted/30 transition-colors -mx-1 px-1 rounded-xl"
      >
        <div className={`flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0 ${
          isIncoming ? "bg-primary/10 text-primary" : "bg-muted"
        }`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{transaction.description}</p>
          <p className="text-xs text-muted-foreground">{shortDate}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className={`font-semibold text-sm ${isIncoming ? "text-primary" : ""}`}>
              {isIncoming ? "+" : "-"}{formatCurrency(Math.abs(transaction.amount))}
            </p>
            {transaction.currency && transaction.currency !== "HUF" && (
              <p className="text-xs text-muted-foreground">{transaction.currency}</p>
            )}
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
        </div>
      </button>

      {open && (
        <TransactionDetail transaction={transaction} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

// ─── Full-screen transaction detail overlay ───
function TransactionDetail({ transaction, onClose }: { transaction: Transaction; onClose: () => void }) {
  const isIncoming = ["DEPOSIT", "TRANSFER_IN"].includes(transaction.type);
  const Icon = getIcon(transaction.type);
  const date = new Date(transaction.createdAt);

  return (
    <div className="fixed inset-0 z-[100] bg-background max-w-md mx-auto xl:border-x border-border/40 flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary/70 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-base">Tranzakció részletei</h2>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-10">
        {/* Amount hero */}
        <div className="flex flex-col items-center py-8">
          <div className={`flex h-16 w-16 items-center justify-center rounded-full mb-4 ${
            isIncoming ? "bg-primary/10 text-primary" : "bg-muted"
          }`}>
            <Icon className="h-7 w-7" />
          </div>
          <p className={`text-3xl font-black ${isIncoming ? "text-primary" : ""}`}>
            {isIncoming ? "+" : "-"}{formatCurrency(Math.abs(transaction.amount))}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {TYPE_LABELS[transaction.type] || transaction.type}
          </p>
        </div>

        {/* Details */}
        <div className="rounded-2xl border border-border bg-card divide-y divide-border">
          <DetailRow label="Leírás" value={transaction.description} />
          <DetailRow label="Típus" value={TYPE_LABELS[transaction.type] || transaction.type} />
          <DetailRow
            label="Státusz"
            value={
              <span className="flex items-center gap-1.5">
                <StatusIcon status={transaction.status} />
                {STATUS_LABELS[transaction.status || "COMPLETED"] || transaction.status}
              </span>
            }
          />
          <DetailRow
            label="Dátum"
            value={format(date, "yyyy. MMMM d., HH:mm:ss", { locale: hu })}
          />

          {transaction.senderName && (
            <DetailRow label="Küldő neve" value={transaction.senderName} />
          )}
          {transaction.senderAccountNumber && (
            <DetailRow label="Küldő számlaszáma" value={transaction.senderAccountNumber} mono />
          )}
          {transaction.reference && (
            <DetailRow label="Referencia" value={transaction.reference} mono />
          )}
          <DetailRow label="Pénznem" value={transaction.currency || "HUF"} />
          <DetailRow label="Tranzakció ID" value={transaction.id} mono small />
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
  small = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  small?: boolean;
}) {
  return (
    <div className="flex items-start justify-between px-4 py-3.5 gap-4">
      <span className="text-sm text-muted-foreground flex-shrink-0">{label}</span>
      <span
        className={`text-sm font-medium text-right break-all ${mono ? "font-mono" : ""} ${small ? "text-xs text-muted-foreground" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
