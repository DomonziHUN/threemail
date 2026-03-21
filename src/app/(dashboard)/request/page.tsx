"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, User, Send, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type UserSuggestion = {
  id: string;
  fullName: string;
  email: string;
};

export default function RequestPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserSuggestion | null>(null);
  const [users, setUsers] = useState<UserSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchQuery.startsWith("@") && searchQuery.length > 1) {
      searchUsers(searchQuery.slice(1));
    } else {
      setUsers([]);
    }
  }, [searchQuery]);

  const searchUsers = async (query: string) => {
    if (query.length < 2) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("User search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (user: UserSuggestion) => {
    setSelectedUser(user);
    setSearchQuery(`@${user.fullName}`);
    setUsers([]);
    setStep(2);
  };

  const handleSendRequest = async () => {
    if (!selectedUser || !amount || Number(amount) <= 0) {
      toast.error("Add meg az összeget");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/request-money", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: selectedUser.id,
          amount: Number(amount),
          note: note.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Sikertelen kérés");
        return;
      }

      toast.success("Pénzkérés elküldve!");
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
          onClick={() => step === 2 ? setStep(1) : router.push("/dashboard")}
          className="w-10 h-10 rounded-full bg-secondary/30 flex items-center justify-center hover:bg-secondary/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {step === 1 && (
        <div className="px-5 mt-4">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Pénz kérése</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Kérj pénzt más ThreeMail felhasználóktól
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Kitől kérsz pénzt?</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="@név keresése..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 h-14 rounded-xl text-base"
                />
              </div>

              {loading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Keresés...
                </div>
              )}

              {users.length > 0 && (
                <div className="border border-border rounded-xl bg-card divide-y divide-border max-h-64 overflow-y-auto">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{user.fullName}</p>
                        <p className="text-sm text-muted-foreground">@{user.email.split("@")[0]}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searchQuery.startsWith("@") && searchQuery.length > 1 && !loading && users.length === 0 && (
                <p className="text-sm text-muted-foreground p-3">
                  Nincs találat
                </p>
              )}
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mt-6">
              <p className="text-sm text-muted-foreground">
                <strong>Tipp:</strong> Kezdd el gépelni a @ karaktert, majd a felhasználó nevét a kereséshez.
              </p>
            </div>
          </div>
        </div>
      )}

      {step === 2 && selectedUser && (
        <div className="px-5 mt-4 flex flex-col min-h-[calc(100vh-100px)]">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Mennyi pénzt kérsz?
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Kérés küldése: <strong>{selectedUser.fullName}</strong>
          </p>

          <div className="flex-1 space-y-6">
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
              disabled={sending || !amount || Number(amount) <= 0}
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
      )}
    </div>
  );
}
