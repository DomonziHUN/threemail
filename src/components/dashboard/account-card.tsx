import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface AccountCardProps {
  balance: number;
}

export function AccountCard({ balance }: AccountCardProps) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-primary/90 to-accent p-6 text-white shadow-lg">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium opacity-90">Főszámla</p>
          <p className="text-2xl font-bold">{formatCurrency(balance)}</p>
        </div>
        <Link
          href="/add-money"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition hover:bg-white/30"
          aria-label="Számlaadatok"
        >
          <ChevronRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
