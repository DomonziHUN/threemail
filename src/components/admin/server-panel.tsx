"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function ServerPanel() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleDeploy = async () => {
    if (!confirm("Biztosan elindítod a szerver frissítését? A weboldal kb. 5 másodperc múlva újraindul.")) return;
    
    setIsDeploying(true);
    try {
      const res = await fetch("/api/admin/deploy", { method: "POST" });
      if (!res.ok) {
        throw new Error("Szerver hiba");
      }
      toast.success("Frissítés elindítva! Kérlek, várj...");
      
      // Start a 5 second fake countdown for UI feedback
      let count = 5;
      setCountdown(count);
      const target = setInterval(() => {
        count--;
        setCountdown(count);
        if (count <= 0) {
          clearInterval(target);
          window.location.reload();
        }
      }, 1000);

    } catch (error) {
      toast.error("Nem sikerült elindítani a frissítést.");
      setIsDeploying(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5 text-primary" />
          Szerver & Frissítések
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          A gombra kattintva a szerver automatikusan letölti a legújabb GitHub kódot, feltelepíti és újraindítja a bankot.
        </p>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleDeploy} 
          disabled={isDeploying}
          className="w-full sm:w-auto"
        >
          {isDeploying ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Újraindulás {countdown}mp...
            </>
          ) : (
            <>
              Változások letöltése és Újraindítás (Deploy)
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
