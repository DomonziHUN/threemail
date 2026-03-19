"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { VirtualCard } from "@/components/cards/virtual-card";
import { CardActions } from "@/components/cards/card-actions";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

const CARD_COLORS = [
  { id: "green", name: "ThreeMail Zöld", bg: "bg-gradient-to-br from-primary via-primary/90 to-accent" },
  { id: "blue", name: "Óceán Kék", bg: "bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500" },
  { id: "purple", name: "Éjfél Lila", bg: "bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500" },
  { id: "orange", name: "Naplemente", bg: "bg-gradient-to-br from-orange-500 via-orange-400 to-rose-400" },
  { id: "slate", name: "Prémium Sötét", bg: "bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600" },
];

export default function CardsPage() {
  const router = useRouter();
  const [cards, setCards] = useState<any[]>([]);
  const [hasAddress, setHasAddress] = useState(false);
  const [loading, setLoading] = useState(true);
  const [revealedCards, setRevealedCards] = useState<Record<string, any>>({});
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});
  const [showPin, setShowPin] = useState<Record<string, boolean>>({});
  const [isNewCardModalOpen, setIsNewCardModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState("green");
  const [selectedType, setSelectedType] = useState("VIRTUAL");
  
  // Manage state
  const [manageCardId, setManageCardId] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Activation state
  const [activateCardId, setActivateCardId] = useState<string | null>(null);
  const [activationPin, setActivationPin] = useState("");
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const res = await fetch("/api/cards");
      const data = await res.json();
      setCards(data.cards || []);
      setHasAddress(data.hasAddress || false);
    } catch (error) {
      toast.error("Hiba a kártyák betöltésekor");
    } finally {
      setLoading(false);
    }
  };

  const handleViewPin = async (cardId: string) => {
    if (showPin[cardId]) {
      setShowPin((prev) => ({ ...prev, [cardId]: false }));
      return;
    }
    if (!revealedCards[cardId]) {
      try {
        const res = await fetch(`/api/cards/${cardId}`);
        const data = await res.json();
        setRevealedCards((prev) => ({ ...prev, [cardId]: data }));
      } catch (error) {
        toast.error("Hiba a PIN lekérésekor");
        return;
      }
    }
    setShowPin((prev) => ({ ...prev, [cardId]: true }));
    setShowDetails((prev) => ({ ...prev, [cardId]: false }));
  };

  const handleViewDetails = async (cardId: string) => {
    if (showDetails[cardId]) {
      setShowDetails((prev) => ({ ...prev, [cardId]: false }));
      return;
    }
    if (!revealedCards[cardId]) {
      try {
        const res = await fetch(`/api/cards/${cardId}`);
        const data = await res.json();
        setRevealedCards((prev) => ({ ...prev, [cardId]: data }));
      } catch (error) {
        toast.error("Hiba a kártyaadatok lekérésekor");
        return;
      }
    }
    setShowDetails((prev) => ({ ...prev, [cardId]: true }));
    setShowPin((prev) => ({ ...prev, [cardId]: false }));
  };

  const handleToggleStatus = async (cardId: string) => {
    try {
      const res = await fetch(`/api/cards/${cardId}/status`, { method: "PATCH" });
      if (res.ok) {
        toast.success("Kártya státusz frissítve");
        fetchCards();
      }
    } catch (error) {
      toast.error("Hiba a státusz módosításakor");
    }
  };

  const submitRequestCard = async () => {
    if (selectedType === "PHYSICAL" && !hasAddress) {
      toast.error("Fizikai kártya igényléséhez kérjük add meg a szállítási címed!");
      setIsNewCardModalOpen(false);
      router.push("/settings");
      return;
    }

    try {
      const res = await fetch("/api/cards", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ color: selectedColor, cardType: selectedType })
      });
      if (res.ok) {
        toast.success("Új kártya igényelve!");
        setIsNewCardModalOpen(false);
        fetchCards();
      } else {
        const data = await res.json();
        toast.error(data.message || "Hiba a kártya igénylésekor");
      }
    } catch (error) {
      toast.error("Hiba a kártya igénylésekor");
    }
  };

  const handleDeleteCard = async () => {
    if (!deletePassword) return toast.error("Kérlek, add meg a jelszavad!");
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/cards/${manageCardId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword })
      });
      if (res.ok) {
        toast.success("Kártya sikeresen törölve");
        setManageCardId(null);
        setDeletePassword("");
        fetchCards();
      } else {
        const data = await res.json();
        toast.error(data.message || "Hiba a törlés során");
      }
    } catch (error) {
      toast.error("Hiba a törlés során");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleActivateCard = async () => {
    if (activationPin.length !== 4) return toast.error("Kérlek, add meg a 4 számjegyű PIN-kódot!");
    setIsActivating(true);
    try {
      const res = await fetch(`/api/cards/${activateCardId}/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: activationPin })
      });
      if (res.ok) {
        toast.success("Fizikai kártya sikeresen aktiválva!");
        setActivateCardId(null);
        setActivationPin("");
        fetchCards();
      } else {
        const data = await res.json();
        toast.error(data.message || "Hiba az aktiválás során");
      }
    } catch (error) {
      toast.error("Hiba az aktiválás során");
    } finally {
      setIsActivating(false);
    }
  };

  if (loading) {
    return <div className="py-6">Betöltés...</div>;
  }

  const activeCards = cards.filter((c) => c.status !== "TERMINATED");

  return (
    <div className="space-y-6 py-6 flex flex-col min-h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kártyák</h1>
        {activeCards.length < 3 && (
          <div className="flex gap-2">
            <Button 
              onClick={() => { setSelectedType("PHYSICAL"); setIsNewCardModalOpen(true); }} 
              size="sm" 
              variant="outline" 
              className="rounded-full shadow-sm bg-card hover:bg-muted"
            >
              Fizikai kártya
            </Button>
            <Button 
              onClick={() => { setSelectedType("VIRTUAL"); setIsNewCardModalOpen(true); }} 
              size="sm" 
              className="rounded-full shadow-md"
            >
              <Plus className="h-4 w-4 mr-1" />
              Új kártya
            </Button>
          </div>
        )}
      </div>

      {activeCards.length > 0 ? (
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 -mx-5 px-5 no-scrollbar scroll-smooth">
          {activeCards.map((card) => (
            <div key={card.id} className="min-w-[100%] snap-center shrink-0 flex flex-col gap-6 items-center">
              <VirtualCard
                last4={card.last4}
                status={card.status}
                color={card.color}
                cardType={card.cardType}
                expiryMonth={card.expiryMonth}
                expiryYear={card.expiryYear}
                cardNumber={revealedCards[card.id]?.cardNumber}
                cvv={revealedCards[card.id]?.cvv}
                pin={revealedCards[card.id]?.pin}
                showDetails={showDetails[card.id] || false}
                showPin={showPin[card.id] || false}
              />
              <div className="w-full">
                <CardActions
                  cardId={card.id}
                  status={card.status}
                  onViewPin={() => handleViewPin(card.id)}
                  onViewDetails={() => handleViewDetails(card.id)}
                  onToggleStatus={() => handleToggleStatus(card.id)}
                  onActivate={() => setActivateCardId(card.id)}
                  onManage={() => setManageCardId(card.id)}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-8 text-center flex flex-col items-center">
          <p className="text-sm text-muted-foreground mb-4">Nincs aktív kártyád</p>
          <div className="flex gap-3">
            <Button onClick={() => { setSelectedType("VIRTUAL"); setIsNewCardModalOpen(true); }}>
              Új virtuális
            </Button>
            <Button 
              onClick={() => { setSelectedType("PHYSICAL"); setIsNewCardModalOpen(true); }} 
              variant="outline"
            >
              Fizikai rendelése
            </Button>
          </div>
        </div>
      )}

      <Dialog open={isNewCardModalOpen} onOpenChange={setIsNewCardModalOpen}>
        <DialogContent onClose={() => setIsNewCardModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>Új kártya igénylése</DialogTitle>
            <DialogDescription>
              Állítsd be az új kártyád paramétereit.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 flex flex-col gap-4">
            <div className="flex gap-2 p-1 bg-muted rounded-xl">
              <Button 
                variant={selectedType === "VIRTUAL" ? "default" : "ghost"} 
                onClick={() => setSelectedType("VIRTUAL")} 
                className={`flex-1 rounded-lg ${selectedType === "VIRTUAL" ? "shadow-sm" : ""}`}
              >
                Virtuális
              </Button>
              <Button 
                variant={selectedType === "PHYSICAL" ? "default" : "ghost"} 
                onClick={() => setSelectedType("PHYSICAL")} 
                className={`flex-1 rounded-lg ${selectedType === "PHYSICAL" ? "shadow-sm" : ""}`}
              >
                Fizikai
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-2">
              {CARD_COLORS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedColor(c.id)}
                  className={`relative flex items-center justify-center p-4 h-24 rounded-xl transition-all border-2 ${
                    selectedColor === c.id ? "border-primary scale-[1.02] shadow-md ring-2 ring-primary/20" : "border-transparent opacity-90 hover:opacity-100"
                  } ${c.bg}`}
                >
                  <span className="text-white text-sm font-semibold drop-shadow-sm text-center">
                    {c.name}
                  </span>
                </button>
              ))}
            </div>
            <Button onClick={submitRequestCard} className="w-full mt-4">
              Kártya igénylése
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!manageCardId} onOpenChange={(open) => {
        if (!open) {
          setManageCardId(null);
          setDeletePassword("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kártya kezelése</DialogTitle>
            <DialogDescription>
              Tekintsd meg a kártya legutóbbi tranzakcióit, vagy töröld a kártyát.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 flex flex-col gap-6">
            <div>
              <h3 className="font-semibold text-sm mb-3 text-muted-foreground">Legutóbbi tranzakciók</h3>
              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2">
                {cards.find(c => c.id === manageCardId)?.transactions?.length > 0 ? (
                  cards.find((c: any) => c.id === manageCardId).transactions.map((tx: any) => (
                    <div key={tx.id} className="flex justify-between items-center p-3 rounded-lg bg-muted text-sm border">
                      <div className="flex flex-col">
                        <span className="font-medium">{tx.description}</span>
                        <span className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</span>
                      </div>
                      <span className={`font-medium ${tx.amount > 0 ? "text-primary" : ""}`}>
                        {tx.amount > 0 ? "+" : ""}{formatCurrency(tx.amount)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic text-center py-4">Nincsenek tranzakciók ehhez a kártyához.</p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-destructive/20">
              <h3 className="font-semibold text-sm mb-3 text-destructive">Kártya megszüntetése</h3>
              <div className="flex flex-col gap-3 bg-destructive/10 p-4 rounded-xl border border-destructive/20">
                <p className="text-xs text-destructive-foreground">
                  A kártya törlésével a kártya véglegesen zárolódik (megszűnik). Ennek jóváhagyásához add meg a fiókod jelszavát.
                </p>
                <Input 
                  type="password" 
                  placeholder="Fiók jelszava" 
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="bg-background"
                />
                <Button variant="destructive" onClick={handleDeleteCard} disabled={isDeleting || !deletePassword}>
                  {isDeleting ? "Törlés folyamatban..." : "Kártya végleges törlése"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Activation Modal */}
      <Dialog open={!!activateCardId} onOpenChange={(open) => {
        if (!open) {
          setActivateCardId(null);
          setActivationPin("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kártya aktiválása</DialogTitle>
            <DialogDescription>
              Kérlek add meg a kártyához tartozó 4 számjegyű PIN-kódot a kártya feloldásához. Ezt a "PIN-kód" gombra kattintva tekintheted meg.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 flex flex-col gap-4">
            <Input 
              type="password" 
              placeholder="1234" 
              maxLength={4} 
              value={activationPin}
              onChange={(e) => setActivationPin(e.target.value)}
              className="text-center text-4xl tracking-[1em] font-mono h-20"
            />
            <Button onClick={handleActivateCard} disabled={activationPin.length !== 4 || isActivating} className="w-full mt-2">
              {isActivating ? "Aktiválás folyamatban..." : "Kártya végleges aktiválása"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
