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

const COLOR_GRADIENTS: Record<string, { bg: string; accent: string }> = {
  green: {
    bg: "from-emerald-800 via-emerald-700 to-teal-600",
    accent: "rgba(16,185,129,0.15)",
  },
  blue: {
    bg: "from-blue-900 via-blue-800 to-sky-700",
    accent: "rgba(56,189,248,0.12)",
  },
  purple: {
    bg: "from-violet-900 via-purple-800 to-fuchsia-700",
    accent: "rgba(192,132,252,0.12)",
  },
  orange: {
    bg: "from-orange-800 via-amber-700 to-yellow-600",
    accent: "rgba(251,191,36,0.12)",
  },
  slate: {
    bg: "from-slate-900 via-zinc-800 to-neutral-700",
    accent: "rgba(161,161,170,0.10)",
  },
};

function VisaLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 780 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M293.2 348.7l33.4-195.8h53.3l-33.4 195.8h-53.3zm246.8-191c-10.6-4-27.2-8.3-47.9-8.3-52.8 0-90 26.6-90.2 64.7-.3 28.2 26.5 43.9 46.8 53.3 20.8 9.6 27.8 15.8 27.7 24.4-.1 13.2-16.6 19.2-32 19.2-21.4 0-32.7-3-50.3-10.2l-6.9-3.1-7.5 44c12.5 5.5 35.6 10.2 59.6 10.5 56.1 0 92.5-26.3 92.9-67 .2-22.3-14-39.3-44.8-53.3-18.7-9.1-30.1-15.1-30-24.3 0-8.1 9.7-16.8 30.6-16.8 17.5-.3 30.1 3.5 40 7.5l4.8 2.3 7.2-42.8zm137.8-4.8h-41.3c-12.8 0-22.4 3.5-28 16.2l-79.4 179.9h56.1s9.2-24.1 11.2-29.4c6.1 0 60.7.1 68.5.1 1.6 6.9 6.5 29.3 6.5 29.3h49.6l-43.2-196.1zm-65.8 126.4c4.4-11.3 21.4-54.8 21.4-54.8-.3.5 4.4-11.4 7.1-18.8l3.6 17s10.3 47 12.4 56.6h-44.5zm-372.4-126.4l-52.4 133.5-5.6-27.2c-9.7-31.3-40-65.3-73.9-82.3l47.8 171.2 56.5-.1 84.1-195.1h-56.5z"
        fill="white"
      />
      <path
        d="M146.9 152.9h-86l-.7 4.1c67 16.2 111.4 55.4 129.8 102.4l-18.7-90.2c-3.2-12.3-12.8-15.9-24.4-16.3z"
        fill="rgba(255,255,255,0.8)"
      />
    </svg>
  );
}

function EmvChip({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 50 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0" y="0" width="50" height="40" rx="5" fill="url(#chipGrad)" />
      <line x1="0" y1="14" x2="50" y2="14" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
      <line x1="0" y1="26" x2="50" y2="26" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
      <line x1="18" y1="0" x2="18" y2="40" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
      <line x1="32" y1="0" x2="32" y2="40" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
      <line x1="18" y1="20" x2="0" y2="20" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
      <line x1="32" y1="20" x2="50" y2="20" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
      <defs>
        <linearGradient id="chipGrad" x1="0" y1="0" x2="50" y2="40">
          <stop offset="0%" stopColor="#e8d5a3" />
          <stop offset="30%" stopColor="#f0e6c8" />
          <stop offset="60%" stopColor="#d4b96a" />
          <stop offset="100%" stopColor="#c9a84c" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function ContactlessIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
      <path
        d="M12 18c3.314 0 6-2.686 6-6s-2.686-6-6-6"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M12 14c1.105 0 2-.895 2-2s-.895-2-2-2"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  );
}

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

  const palette = isActive
    ? COLOR_GRADIENTS[color] || COLOR_GRADIENTS.green
    : { bg: "from-neutral-600 via-neutral-500 to-neutral-400", accent: "rgba(120,120,120,0.1)" };

  return (
    <div className="relative w-full">
      <div
        className={cn(
          "relative aspect-[1.586/1] w-full max-w-sm mx-auto rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all duration-500 bg-gradient-to-br",
          palette.bg
        )}
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-30 blur-2xl"
            style={{ background: `radial-gradient(circle, ${palette.accent}, transparent 70%)` }}
          />
          <div
            className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-20 blur-2xl"
            style={{ background: `radial-gradient(circle, white, transparent 70%)` }}
          />
          {/* Subtle pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `repeating-linear-gradient(
                135deg,
                transparent,
                transparent 20px,
                rgba(255,255,255,1) 20px,
                rgba(255,255,255,1) 21px
              )`,
            }}
          />
          {/* Top shine effect */}
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/[0.08] to-transparent" />
        </div>

        {isFrozen && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2 text-white/90">
              <Lock className="h-8 w-8" />
              <p className="text-sm font-semibold tracking-wide">Kártya zárolva</p>
            </div>
          </div>
        )}

        <div className="relative z-20 flex h-full flex-col justify-between p-5 sm:p-6 text-white">
          {/* Top row: ThreeMail + Visa logo */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium tracking-widest uppercase opacity-70">ThreeMail</p>
              <p className="text-xs font-medium opacity-50 mt-0.5">
                {cardType === "VIRTUAL" ? "Digitális kártya" : "Bankkártya"}
              </p>
            </div>
            <VisaLogo className="w-16 sm:w-20 h-auto drop-shadow-md" />
          </div>

          {/* Middle: Chip + Contactless */}
          <div className="flex items-center gap-3 -mt-1">
            <EmvChip className="w-11 h-auto drop-shadow-sm" />
            <ContactlessIcon className="w-6 h-6 rotate-90 opacity-70" />
          </div>

          {/* Bottom section: Number, Expiry, CVV */}
          <div className="space-y-2.5">
            <div className="font-mono text-[17px] sm:text-lg font-medium tracking-[0.18em] transition-all duration-300 min-h-[1.5rem] drop-shadow-sm">
              {showPin && pin ? (
                <span className="tracking-[0.25em]">PIN: {pin}</span>
              ) : showDetails && cardNumber ? (
                <span>{cardNumber.match(/.{1,4}/g)?.join("  ")}</span>
              ) : (
                <span>••••  ••••  ••••  {last4}</span>
              )}
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[9px] uppercase tracking-widest opacity-50 mb-0.5">Lejárat</p>
                <p className="font-mono text-sm font-medium tracking-wider">
                  {String(expiryMonth).padStart(2, "0")}/{String(expiryYear).slice(-2)}
                </p>
              </div>
              <div className="text-right transition-all duration-300">
                <p className="text-[9px] uppercase tracking-widest opacity-50 mb-0.5">
                  {showDetails ? "CVV" : "Típus"}
                </p>
                <p className="font-mono text-sm font-medium tracking-wider">
                  {showDetails && cvv ? cvv : "Virtuális"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {status === "INACTIVE" && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-2xl bg-black/60 backdrop-blur-md text-center p-4">
          <span className="text-white font-bold text-lg mb-1 tracking-wide">Fizikai kártya úton</span>
          <p className="text-sm text-white/80 max-w-[220px]">Kérlek aktiváld a kártyát a PIN kódod megadásával!</p>
        </div>
      )}
    </div>
  );
}
