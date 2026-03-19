import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { CopyField } from "@/components/add-money/copy-field";
import { BANK_ACCOUNT_NUMBER, BANK_BENEFICIARY_NAME } from "@/lib/constants";
import { AlertCircle } from "lucide-react";

export const metadata = {
  title: "Pénz hozzáadása | ThreeMail Bank",
};

export default async function AddMoneyPage() {
  const user = await requireAuth();
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { paymentReference: true },
  });

  if (!dbUser) {
    return <div>Felhasználó nem található</div>;
  }

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-bold">Pénz hozzáadása</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Utalj pénzt az alábbi számlaszámra az egyedi közleménnyel
        </p>
      </div>

      <div className="space-y-3">
        <CopyField label="Számlaszám" value={BANK_ACCOUNT_NUMBER} />
        <CopyField label="Kedvezményezett neve" value={BANK_BENEFICIARY_NAME} />
        <CopyField label="Közlemény" value={dbUser.paymentReference} />
      </div>

      <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold mb-1">Fontos!</p>
          <p>
            Kérjük pontosan add meg a közleményt, különben nem tudjuk jóváírni az összeget!
          </p>
        </div>
      </div>
    </div>
  );
}
