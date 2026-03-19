"use client";

import { Eye, CreditCard, Lock, Unlock, Settings, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface CardActionsProps {
  cardId: string;
  status: string;
  onViewPin: () => void;
  onViewDetails: () => void;
  onToggleStatus: () => void;
  onActivate: () => void;
  onManage: () => void;
}

export function CardActions({
  cardId,
  status,
  onViewPin,
  onViewDetails,
  onToggleStatus,
  onActivate,
  onManage,
}: CardActionsProps) {
  const isFrozen = status === "FROZEN";

  return (
    <div className="flex items-center justify-center gap-4 py-6">
      <div className="flex flex-col items-center gap-2">
        <Button
          onClick={onViewPin}
          size="icon"
          className="h-14 w-14 rounded-full bg-primary shadow-lg"
        >
          <Eye className="h-5 w-5" />
        </Button>
        <span className="text-xs font-medium">PIN-kód</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Button
          onClick={onViewDetails}
          size="icon"
          className="h-14 w-14 rounded-full bg-primary shadow-lg"
        >
          <CreditCard className="h-5 w-5" />
        </Button>
        <span className="text-xs font-medium">Adatok</span>
      </div>

      {status === "INACTIVE" ? (
        <div className="flex flex-col items-center gap-2">
          <Button
            onClick={onActivate}
            size="icon"
            className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg animate-pulse"
          >
            <Check className="h-5 w-5" />
          </Button>
          <span className="text-xs font-medium text-primary">Aktiválás</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Button
            onClick={onToggleStatus}
            size="icon"
            className="h-14 w-14 rounded-full bg-primary shadow-lg"
          >
            {isFrozen ? <Unlock className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
          </Button>
          <span className="text-xs font-medium">
            {isFrozen ? "Feloldás" : "Zárolás"}
          </span>
        </div>
      )}

      <div className="flex flex-col items-center gap-2">
        <Button
          onClick={onManage}
          size="icon"
          className="h-14 w-14 rounded-full bg-primary shadow-lg"
        >
          <Settings className="h-5 w-5" />
        </Button>
        <span className="text-xs font-medium">Kezelés</span>
      </div>
    </div>
  );
}
