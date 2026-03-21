"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function RequestPage() {
  const router = useRouter();
  const [recipientHandle, setRecipientHandle] = useState("@");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendRequest = async () => {
    const normalizedHandle = recipientHandle.trim().replace(/^@/, "");

    if (!normalizedHandle) {
      toast.error("Add meg, kitől kérsz pénzt (pl. @valaki)");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("Adj meg egy érvényes összeget");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/request-money", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientHandle: normalizedHandle,
          amount: Number(amount),
          note: note.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Sikertelen kérés");
        return;
      }

      toast.success(data.message || "Pénzkérés elküldve!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Hiba történt");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-6 px-4 pb-2">
        <button
          onClick={() => router.push("/dashboard")}
          className="w-10 h-10 rounded-full bg-secondary/30 flex items-center justify-center hover:bg-secondary/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="px-5 mt-4 flex flex-col min-h-[calc(100vh-100px)]">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Pénz kérése</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Add meg, kitől kérsz pénzt (pl. <strong>@valaki</strong>)
        </p>

        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Felhasználó (@név)</label>
            <Input
              type="text"
              placeholder="@valaki"
              value={recipientHandle}
              onChange={(e) => setRecipientHandle(e.target.value)}
              className="h-14 rounded-xl text-base"
            />
            <p className="text-xs text-muted-foreground">
              A kérés akkor is elküldésre kerül. Ha a felhasználó létezik, értesítést kap róla.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Összeg (HUF)</label>
            <div className="relative">
              <Input
                type="number"
                min={1}
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-20 rounded-2xl text-4xl font-bold text-center pr-16"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">
                HUF
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Megjegyzés (opcionális)</label>
            <Input
              type="text"
              placeholder="pl. Közös vacsora"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="h-14 rounded-xl text-base"
            />
          </div>
        </div>

        <div className="pb-8 pt-4">
          <Button
            onClick={handleSendRequest}
            disabled={sending || !amount || Number(amount) <= 0 || !recipientHandle.trim()}
            className="w-full h-14 rounded-full text-base font-bold"
            size="lg"
          >
            {sending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Küldés...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Kérés küldése
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
