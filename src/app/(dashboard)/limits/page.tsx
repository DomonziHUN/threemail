"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Gauge, CreditCard, ArrowUpRight, Banknote, ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Limits {
  dailyTransferLimit: number;
  monthlyTransferLimit: number;
  dailyCardLimit: number;
  monthlyCardLimit: number;
  dailyAtmLimit: number;
  monthlyAtmLimit: number;
  dailyOnlineLimit: number;
  monthlyOnlineLimit: number;
}

export default function LimitsPage() {
  const [limits, setLimits] = useState<Limits>({
    dailyTransferLimit: 10000,
    monthlyTransferLimit: 100000,
    dailyCardLimit: 5000,
    monthlyCardLimit: 50000,
    dailyAtmLimit: 2000,
    monthlyAtmLimit: 20000,
    dailyOnlineLimit: 3000,
    monthlyOnlineLimit: 30000,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLimits();
  }, []);

  const fetchLimits = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/user/limits");
      if (response.ok) {
        const data = await response.json();
        setLimits(data);
      }
    } catch (error) {
      console.error("Error fetching limits:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/user/limits", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(limits),
      });

      if (response.ok) {
        toast.success("Limitek sikeresen frissítve!");
      } else {
        toast.error("Hiba történt a limitek mentése során");
      }
    } catch (error) {
      console.error("Error saving limits:", error);
      toast.error("Hiba történt a limitek mentése során");
    } finally {
      setSaving(false);
    }
  };

  const updateLimit = (key: keyof Limits, value: string) => {
    const numValue = parseInt(value) || 0;
    setLimits((prev) => ({ ...prev, [key]: numValue }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Gauge className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Tranzakciós Limitek</h1>
          <p className="text-muted-foreground">Állítsd be a napi és havi tranzakciós limiteket</p>
        </div>
      </div>

      {/* Átutalási Limitek */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <CardTitle>Átutalási Limitek</CardTitle>
              <CardDescription>Belföldi és nemzetközi átutalások limitjei</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dailyTransfer">Napi limit (EUR)</Label>
              <Input
                id="dailyTransfer"
                type="number"
                value={limits.dailyTransferLimit}
                onChange={(e) => updateLimit("dailyTransferLimit", e.target.value)}
                min="0"
                max="100000"
              />
              <p className="text-xs text-muted-foreground">Maximum: €100,000</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyTransfer">Havi limit (EUR)</Label>
              <Input
                id="monthlyTransfer"
                type="number"
                value={limits.monthlyTransferLimit}
                onChange={(e) => updateLimit("monthlyTransferLimit", e.target.value)}
                min="0"
                max="1000000"
              />
              <p className="text-xs text-muted-foreground">Maximum: €1,000,000</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bankkártyás Vásárlások */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <CardTitle>Bankkártyás Vásárlások</CardTitle>
              <CardDescription>POS terminálnál és érintésmentes fizetések</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dailyCard">Napi limit (EUR)</Label>
              <Input
                id="dailyCard"
                type="number"
                value={limits.dailyCardLimit}
                onChange={(e) => updateLimit("dailyCardLimit", e.target.value)}
                min="0"
                max="50000"
              />
              <p className="text-xs text-muted-foreground">Maximum: €50,000</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyCard">Havi limit (EUR)</Label>
              <Input
                id="monthlyCard"
                type="number"
                value={limits.monthlyCardLimit}
                onChange={(e) => updateLimit("monthlyCardLimit", e.target.value)}
                min="0"
                max="500000"
              />
              <p className="text-xs text-muted-foreground">Maximum: €500,000</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ATM Készpénzfelvétel */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
              <Banknote className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <CardTitle>ATM Készpénzfelvétel</CardTitle>
              <CardDescription>Készpénzfelvételi limitek bankautomatákból</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dailyAtm">Napi limit (EUR)</Label>
              <Input
                id="dailyAtm"
                type="number"
                value={limits.dailyAtmLimit}
                onChange={(e) => updateLimit("dailyAtmLimit", e.target.value)}
                min="0"
                max="10000"
              />
              <p className="text-xs text-muted-foreground">Maximum: €10,000</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyAtm">Havi limit (EUR)</Label>
              <Input
                id="monthlyAtm"
                type="number"
                value={limits.monthlyAtmLimit}
                onChange={(e) => updateLimit("monthlyAtmLimit", e.target.value)}
                min="0"
                max="100000"
              />
              <p className="text-xs text-muted-foreground">Maximum: €100,000</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Online Vásárlások */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <CardTitle>Online Vásárlások</CardTitle>
              <CardDescription>Internetes és mobilos fizetések limitjei</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dailyOnline">Napi limit (EUR)</Label>
              <Input
                id="dailyOnline"
                type="number"
                value={limits.dailyOnlineLimit}
                onChange={(e) => updateLimit("dailyOnlineLimit", e.target.value)}
                min="0"
                max="25000"
              />
              <p className="text-xs text-muted-foreground">Maximum: €25,000</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyOnline">Havi limit (EUR)</Label>
              <Input
                id="monthlyOnline"
                type="number"
                value={limits.monthlyOnlineLimit}
                onChange={(e) => updateLimit("monthlyOnlineLimit", e.target.value)}
                min="0"
                max="250000"
              />
              <p className="text-xs text-muted-foreground">Maximum: €250,000</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mentés gomb */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={fetchLimits} disabled={saving}>
          Visszaállítás
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Mentés...
            </>
          ) : (
            "Limitek Mentése"
          )}
        </Button>
      </div>

      {/* Információs panel */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Fontos információk:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>A limitek azonnal érvénybe lépnek a mentés után</li>
              <li>A napi limitek minden nap éjfélkor nullázódnak (UTC)</li>
              <li>A havi limitek minden hónap első napján nullázódnak</li>
              <li>A limitek csökkentése azonnal, növelése 24 órás késleltetéssel lép életbe biztonsági okokból</li>
              <li>Nagyobb limitek igényléséhez vedd fel a kapcsolatot az ügyfélszolgálattal</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
