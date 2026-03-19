import { requireAuth } from "@/lib/auth-guard";
import { TransferFlow } from "@/components/transfer/transfer-flow";

export const metadata = {
  title: "Utalás | ThreeMail Bank",
};

export default async function TransferPage() {
  await requireAuth();

  return (
    <div className="absolute inset-0 bg-background z-50 overflow-y-auto">
      <TransferFlow />
    </div>
  );
}
