import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { hu } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { TransactionItem } from "@/components/dashboard/transaction-item";

export const metadata = {
  title: "Kivonatok és kimutatások | Threemail",
};

export default async function StatementsPage() {
  const user = await requireAuth();
  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const grouped = transactions.reduce<Record<string, typeof transactions>>((acc, tx) => {
    const key = format(tx.createdAt, "yyyy MMMM", { locale: hu });
    acc[key] = acc[key] ? [...acc[key], tx] : [tx];
    return acc;
  }, {});

  return (
    <div className="space-y-6 py-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Kivonatok és kimutatások</h1>
        <p className="text-sm text-muted-foreground">
          Töltsd le a havi kivonatokat vagy tekintsd meg a részletes tranzakciós kimutatásokat.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Havi kivonat</CardTitle>
            <p className="text-sm text-muted-foreground">
              PDF és CSV formátumban tölthető le
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              <Download className="h-4 w-4 mr-1" /> PDF
            </Button>
            <Button size="sm" disabled>
              <Download className="h-4 w-4 mr-1" /> CSV
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {Object.entries(grouped).map(([month, list]) => (
          <Card key={month}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{month}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {list.length} tranzakció összesen
                </p>
              </div>
              <Button variant="ghost" size="sm" disabled>
                <Download className="h-4 w-4 mr-2" /> Kivonat
              </Button>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {list.map((tx) => (
                <TransactionItem key={tx.id} transaction={tx} />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
