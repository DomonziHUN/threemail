import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface VirtualCardProps {
  last4: string;
  status: string;
  expiryMonth: number;
  expiryYear: number;
  cardNumber?: string | null;
  cvv?: string | null;
  pin?: string | null;
  color?: string;
  cardType?: string;
  showDetails?: boolean;
  showPin?: boolean;
}

const COLOR_GRADIENTS: Record<string, string> = {
  green: "from-primary via-primary/90 to-accent",
  blue: "from-blue-600 via-blue-500 to-cyan-500",
  purple: "from-purple-600 via-purple-500 to-pink-500",
  orange: "from-orange-500 via-orange-400 to-rose-400",
  slate: "from-slate-800 via-slate-700 to-slate-600",
};

export function VirtualCard({
  last4,
  status,
  expiryMonth,
  expiryYear,
  cardNumber,
  cvv,
  pin,
  color = "green",
  cardType = "VIRTUAL",
  showDetails = false,
  showPin = false,
}: VirtualCardProps) {
  const isActive = status === "ACTIVE";
  const isFrozen = status === "FROZEN";

  const gradientClass = isActive
    ? COLOR_GRADIENTS[color] || COLOR_GRADIENTS.green
    : "from-muted-foreground/60 to-muted-foreground/40";

  return (
    <div className="relative w-full">
      <div
        className={cn(
          "relative aspect-[1.586/1] w-full max-w-sm mx-auto rounded-3xl p-6 shadow-2xl transition-all bg-gradient-to-br",
          gradientClass
        )}
      >
        {isFrozen && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-black/60">
            <div className="flex flex-col items-center gap-2 text-white/80">
              <Lock className="h-8 w-8" />
              <p className="text-sm font-semibold">Kártya zárolva</p>
            </div>
          </div>
        )}
        <div className="relative z-20 flex h-full flex-col justify-between text-white drop-shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium opacity-80">ThreeMail</p>
              <p className="text-sm font-semibold">Digitális kártya</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">VISA</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="font-mono text-xl font-semibold tracking-wider transition-all duration-300 min-h-[1.75rem]">
              {showPin && pin ? (
                <span>PIN: {pin}</span>
              ) : showDetails && cardNumber ? (
                <span>{cardNumber.match(/.{1,4}/g)?.join(" ")}</span>
              ) : (
                <span>•••• •••• •••• {last4}</span>
              )}
            </div>
            <div className="flex items-center justify-between text-xs">
              <div>
                <p className="opacity-70">Lejárat</p>
                <p className="font-semibold text-sm">
                  {String(expiryMonth).padStart(2, "0")}/{String(expiryYear).slice(-2)}
                </p>
              </div>
              <div className="text-right transition-all duration-300">
                <p className="opacity-70">{showDetails ? "CVV" : "Típus"}</p>
                <p className="font-semibold text-sm">
                  {showDetails && cvv ? cvv : "Virtuális"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {status === "INACTIVE" && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-3xl bg-black/60 backdrop-blur-md text-center p-4">
          <span className="text-white font-bold text-lg mb-1 tracking-wide">Fizikai kártya úton</span>
          <p className="text-sm text-white/80 max-w-[220px]">Kérlek aktiváld a kártyát a PIN kódod megadásával!</p>
        </div>
      )}
    </div>
  );
}
