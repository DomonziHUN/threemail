import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { BalanceDisplay } from "@/components/dashboard/balance-display";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { AccountCard } from "@/components/dashboard/account-card";
import { TransactionList } from "@/components/dashboard/transaction-list";

export const metadata = {
  title: "Dashboard | ThreeMail Bank",
};

export default async function DashboardPage() {
  const user = await requireAuth();
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { balanceHuf: true },
  });

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const balance = dbUser?.balanceHuf || 0;

  return (
    <div className="space-y-6 py-6">
      <BalanceDisplay balance={balance} />
      <QuickActions />
      <AccountCard balance={balance} />
      <TransactionList transactions={transactions} />
    </div>
  );
}
