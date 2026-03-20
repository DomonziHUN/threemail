"use client";

import { useEffect, useState } from "react";
import { CopyField } from "@/components/add-money/copy-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users2, UserCheck, Gift } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function ReferralsPage() {
  const [data, setData] = useState<any>(null);
  const [welcomeData, setWelcomeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchReferrals(), fetchWelcomeStatus()]).finally(() => setLoading(false));
  }, []);

  const fetchReferrals = async () => {
    try {
      const res = await fetch("/api/referrals");
      const result = await res.json();
      setData(result);
    } catch (error) {
      toast.error("Hiba a meghívók betöltésekor");
    }
  };

  const fetchWelcomeStatus = async () => {
    try {
      const res = await fetch("/api/referrals/welcome-status");
      if (res.ok) {
        setWelcomeData(await res.json());
      }
    } catch (error) {}
  };

  if (loading) {
    return <div className="py-6">Betöltés...</div>;
  }

  if (!data) {
    return <div className="py-6">Hiba történt</div>;
  }

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-bold">Meghívók & Bónusz</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Hívd meg ismerőseidet és szerezz bónuszt
        </p>
      </div>

      {welcomeData?.isInvited && (
        <Card className="border-primary/50 shadow-md bg-primary/5 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <CardHeader className="pb-3 relative z-10">
            <CardTitle className="text-xl text-primary flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Üdvözlő Bónusz Kihívás
            </CardTitle>
            <p className="text-sm text-muted-foreground leading-snug">
              Teljesítsd az alábbi 4 lépést a 20.000 Ft-os meghívási bónuszodért!
            </p>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`h-6 w-6 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${welcomeData.tasks.topup.completed ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                  {welcomeData.tasks.topup.completed ? "✓" : "1"}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${welcomeData.tasks.topup.completed ? "" : "opacity-80"}`}>Töltsd fel az egyenleged</p>
                  {!welcomeData.tasks.topup.completed && (
                    <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
                      <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${Math.min(100, (welcomeData.tasks.topup.current / welcomeData.tasks.topup.required) * 100)}%` }}></div>
                    </div>
                  )}
                  {!welcomeData.tasks.topup.completed && <p className="text-xs text-muted-foreground mt-1">{formatCurrency(welcomeData.tasks.topup.current)} / {formatCurrency(welcomeData.tasks.topup.required)}</p>}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`h-6 w-6 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${welcomeData.tasks.physicalCard.completed ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                  {welcomeData.tasks.physicalCard.completed ? "✓" : "2"}
                </div>
                <p className={`text-sm font-medium ${welcomeData.tasks.physicalCard.completed ? "" : "opacity-80"}`}>Rendelj egy Fizikai kártyát</p>
              </div>

              <div className="flex items-center gap-3">
                <div className={`h-6 w-6 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${welcomeData.tasks.kyc.completed ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                  {welcomeData.tasks.kyc.completed ? "✓" : "3"}
                </div>
                <p className={`text-sm font-medium ${welcomeData.tasks.kyc.completed ? "" : "opacity-80"}`}>Végezd el a KYC azonosítást</p>
              </div>

              <div className="flex items-center gap-3">
                <div className={`h-6 w-6 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${welcomeData.tasks.purchase.completed ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                  {welcomeData.tasks.purchase.completed ? "✓" : "4"}
                </div>
                <p className={`text-sm font-medium ${welcomeData.tasks.purchase.completed ? "" : "opacity-80"}`}>Vásárolj bármelyik kártyáddal 1x</p>
              </div>
            </div>
            
            {welcomeData.status === "COMPLETED" && (
              <div className="mt-5 p-3 bg-primary text-primary-foreground rounded-xl text-center text-sm font-bold shadow-lg animate-in fade-in zoom-in duration-500">
                Gratulálunk! A 20.000 Ft bónusz jóváírásra került! 🎉
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Hogyan működik a meghívási bónusz?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">1</span>
              Küldd el a meghívó linket
            </h3>
            <p className="text-sm text-muted-foreground ml-8">
              Oszd meg a meghívó linkedet vagy kódodat ismerőseiddel
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">2</span>
              A meghívottnak teljesítenie kell 4 lépést
            </h3>
            <div className="ml-8 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong>Feltölti az egyenlegét 20.000 Ft-tal (50 EUR)</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong>Rendel egy ingyenes Fizikai kártyát</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong>Elvégzi a KYC azonosítást</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong>Vásárol 1 alkalommal</strong> a virtuális vagy fizikai kártyájával</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">3</span>
              Mindketten megkapjátok a bónuszt!
            </h3>
            <p className="text-sm text-muted-foreground ml-8">
              Ha a meghívott teljesítette mind a 4 lépést, <strong>mindketten kaptok 20.000 Ft (50 EUR) bónuszt</strong> az egyenlegetekre!
            </p>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mt-4">
            <p className="text-xs text-muted-foreground">
              <strong>Fontos:</strong> Maximum 10 ismerőst hívhatsz meg. A bónusz automatikusan jóváírásra kerül, amikor a meghívott teljesítette az összes feltételt.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <CopyField label="Meghívókód" value={data.referralCode} />
        <CopyField label="Meghívó link" value={data.inviteUrl} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardHeader className="pb-3">
            <Users2 className="h-5 w-5 text-muted-foreground mb-2" />
            <CardTitle className="text-2xl font-bold">{data.stats.total}/10</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-xs text-muted-foreground">Összes meghívott</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <UserCheck className="h-5 w-5 text-primary mb-2" />
            <CardTitle className="text-2xl font-bold">{data.stats.active}</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-xs text-muted-foreground">Aktív</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <Gift className="h-5 w-5 text-primary mb-2" />
            <CardTitle className="text-2xl font-bold">
              {formatCurrency(data.stats.bonus)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-xs text-muted-foreground">Bónusz</p>
          </CardContent>
        </Card>
      </div>

      {data.referrals.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Meghívottak</h2>
          <div className="divide-y divide-border rounded-2xl border border-border bg-card">
            {data.referrals.map((ref: any) => (
              <div key={ref.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-sm">{ref.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(new Date(ref.createdAt))}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      ref.status === "ACTIVATED"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {ref.status === "ACTIVATED" ? "Aktív" : "Regisztrált"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
