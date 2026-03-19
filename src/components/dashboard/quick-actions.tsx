import Link from "next/link";
import { ArrowUpRight, Plus, ArrowDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QuickActions() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      <Button
        asChild
        variant="outline"
        className="flex-shrink-0 rounded-full px-5 py-2.5 h-auto text-primary border-primary hover:bg-primary/10"
      >
        <Link href="/transfer" className="flex items-center gap-2">
          <ArrowUpRight className="h-4 w-4" />
          <span>Utalás</span>
        </Link>
      </Button>
      <Button
        asChild
        className="flex-shrink-0 rounded-full px-5 py-2.5 h-auto"
      >
        <Link href="/add-money" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Pénz hozzáadása</span>
        </Link>
      </Button>
      <Button
        asChild
        variant="outline"
        className="flex-shrink-0 rounded-full px-5 py-2.5 h-auto"
        disabled
      >
        <div className="flex items-center gap-2">
          <ArrowDownLeft className="h-4 w-4" />
          <span>Kérés</span>
        </div>
      </Button>
    </div>
  );
}
