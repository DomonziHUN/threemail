"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CloseAccountPage() {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmText !== "TÖRLÉS") {
      toast.error("Kérlek, írd be pontosan: TÖRLÉS");
      return;
    }

    if (!agreedToTerms) {
      toast.error("El kell fogadnod a feltételeket");
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch("/api/user/delete-account", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Hiba történt a fiók törlése során");
      }

      toast.success("Fiókod sikeresen törölve lett");
      
      // Sign out and redirect to home
      await signOut({ redirect: false });
      router.push("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Hiba történt a fiók törlése során");
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
          <XCircle className="w-6 h-6 text-destructive" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-destructive">Fiók Bezárása</h1>
          <p className="text-muted-foreground">Ez a művelet visszafordíthatatlan</p>
        </div>
      </div>

      {/* Warning Card */}
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Figyelmeztetés
          </CardTitle>
          <CardDescription>
            Kérjük, olvasd el figyelmesen mielőtt folytatod
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <p className="font-semibold">A fiók törlésével az alábbiak történnek:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>Minden személyes adatod véglegesen törlődik</li>
              <li>Tranzakciós előzményeid elérhetetlenné válnak</li>
              <li>Bankszámlád és kártyáid deaktiválódnak</li>
              <li>Befektetéseid és megtakarításaid megszűnnek</li>
              <li>Ajánlási programban szerzett jutalmaid elvesznek</li>
              <li>Nem lesz lehetőséged visszaállítani a fiókot</li>
            </ul>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-900 mt-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Fontos:</strong> Mielőtt törölnéd a fiókod, győződj meg róla, hogy:
            </p>
            <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300 ml-2 mt-2 space-y-1">
              <li>Kiegyenlítettél minden tartozást</li>
              <li>Átutaltad a fennmaradó egyenlegedet</li>
              <li>Lemondtál minden aktív előfizetést</li>
              <li>Lementettél minden szükséges dokumentumot</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Deletion Form */}
      <Card>
        <CardHeader>
          <CardTitle>Fiók Törlésének Megerősítése</CardTitle>
          <CardDescription>
            A folytatáshoz erősítsd meg szándékodat
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="confirm">
              Írd be a következőt a megerősítéshez: <strong className="text-destructive">TÖRLÉS</strong>
            </Label>
            <Input
              id="confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="TÖRLÉS"
              className="font-mono"
            />
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Elfogadom a következményeket
              </label>
              <p className="text-sm text-muted-foreground">
                Megértettem, hogy ez a művelet visszafordíthatatlan, és minden adatom véglegesen törlődik.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={isDeleting}
              className="flex-1"
            >
              Mégse
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting || confirmText !== "TÖRLÉS" || !agreedToTerms}
              className="flex-1"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Törlés folyamatban...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Fiók Végleges Törlése
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alternative Options */}
      <Card>
        <CardHeader>
          <CardTitle>Alternatív Lehetőségek</CardTitle>
          <CardDescription>
            Fontold meg ezeket a lehetőségeket a fiók törlése helyett
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start" asChild>
            <a href="/settings">
              Fiók beállítások módosítása
            </a>
          </Button>
          <Button variant="outline" className="w-full justify-start" asChild>
            <a href="/security">
              Biztonsági beállítások frissítése
            </a>
          </Button>
          <Button variant="outline" className="w-full justify-start" asChild>
            <a href="/help">
              Kapcsolatfelvétel az ügyfélszolgálattal
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
