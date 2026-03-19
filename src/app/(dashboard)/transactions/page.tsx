import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { TransactionItem } from "@/components/dashboard/transaction-item";

export const metadata = {
  title: "Tranzakciók | ThreeMail Bank",
};

export default async function TransactionsPage() {
  const user = await requireAuth();
  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-bold">Tranzakciók</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Az összes tranzakciód egy helyen
        </p>
      </div>

      {transactions.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">Még nincs tranzakciód</p>
        </div>
      ) : (
        <div className="divide-y divide-border rounded-2xl border border-border bg-card px-4">
          {transactions.map((transaction: any) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </div>
      )}
    </div>
  );
}
