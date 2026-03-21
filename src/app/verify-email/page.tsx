"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Hiányzó megerősítő token");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message || "Email cím sikeresen megerősítve!");
        } else {
          setStatus("error");
          setMessage(data.message || "Hiba történt a megerősítés során");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Hiba történt a megerősítés során");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Email megerősítés</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === "loading" && (
            <div className="text-center py-8">
              <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary mb-4" />
              <p className="text-muted-foreground">Email cím megerősítése...</p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center py-8">
              <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Sikeres megerősítés!</h3>
              <p className="text-muted-foreground mb-6">{message}</p>
              <Button onClick={() => router.push("/dashboard")} className="w-full">
                Tovább a dashboardra
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="text-center py-8">
              <XCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
              <h3 className="text-xl font-semibold mb-2">Hiba történt</h3>
              <p className="text-muted-foreground mb-6">{message}</p>
              <Button onClick={() => router.push("/login")} variant="outline" className="w-full">
                Vissza a bejelentkezéshez
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Email megerősítés</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Betöltés...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
