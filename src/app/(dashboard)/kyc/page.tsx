import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { KycStepper } from "@/components/kyc/kyc-stepper";
import { ShieldCheck, Clock, XCircle } from "lucide-react";

export const metadata = {
  title: "Hitelesítés (KYC) | ThreeMail Bank",
};

export default async function KycPage() {
  const user = await requireAuth();

  // Lekérjük a KYC dokumentumot (ha már feltöltötte egyszer)
  const kycDoc = await prisma.kycDocument.findUnique({
    where: { userId: user.id }
  });

  return (
    <div className="space-y-6 py-6 pb-24">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ügyfél-azonosítás</h1>
        <p className="text-sm text-muted-foreground mt-1">
          A banki előírások miatt végre kell hajtanunk ezt a kötelező hitelesítést.
        </p>
      </div>

      {/* 1. ESET: Már Elfogadták a dokumentumokat */}
      {kycDoc?.status === "APPROVED" && (
        <div className="bg-green-500/10 border-2 border-green-500/50 rounded-2xl p-8 flex flex-col items-center text-center space-y-4 animate-in fade-in duration-500">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-green-500">Hitelesített Fiók</h2>
          <p className="text-muted-foreground max-w-sm">
            Az okmányaidat átnéztük és sikeresen ellenőriztük! Minden banki funkció korlátozások nélkül elérhető számodra.
          </p>
        </div>
      )}

      {/* 2. ESET: Függőben lévő (Épp elbírálás alatt) */}
      {kycDoc?.status === "PENDING" && (
        <div className="bg-blue-500/10 border-2 border-blue-500/50 rounded-2xl p-8 flex flex-col items-center text-center space-y-4 animate-in fade-in duration-500">
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Clock className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-blue-500">Elbírálás Folyamatban</h2>
          <p className="text-muted-foreground max-w-sm">
            A beküldött igazolványokat jelenleg ellenőrzik a kollégáink. Kérjük, légy türelemmel, hamarosan értesítünk!
          </p>
        </div>
      )}

      {/* 3. ESET: Hiba / Elutasítva (Pl. Homályos kép miatt) VAGY még el sem kezdte a kitöltést */}
      {(!kycDoc || kycDoc.status === "REJECTED") && (
        <div className="space-y-6">
          {kycDoc?.status === "REJECTED" && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
              <XCircle className="w-6 h-6 text-red-500 shrink-0" />
              <div>
                <h3 className="font-bold text-red-500">Hitelesítés elutasítva</h3>
                <p className="text-sm text-muted-foreground mt-1">Az okmányaid vizsgálata során hibát találtunk (pl. elmosódott). Kérlek ismételd meg a folyamatot!</p>
                {kycDoc.adminNote && (
                  <p className="text-xs font-semibold mt-2 text-foreground bg-background/50 p-2 rounded">Indoklás: {kycDoc.adminNote}</p>
                )}
              </div>
            </div>
          )}
          
          <KycStepper />
        </div>
      )}
    </div>
  );
}
