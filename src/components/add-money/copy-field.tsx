"use client";

import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { toast } from "sonner";

interface CopyFieldProps {
  label: string;
  value: string;
}

export function CopyField({ label, value }: CopyFieldProps) {
  const { copy, isCopied } = useCopyToClipboard();

  const handleCopy = async () => {
    const success = await copy(value);
    if (success) {
      toast.success(`${label} másolva!`);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/50 p-4">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
        <p className="font-mono text-sm font-semibold truncate">{value}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className="flex-shrink-0"
        aria-label={`${label} másolása`}
      >
        {isCopied ? (
          <Check className="h-4 w-4 text-primary" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
