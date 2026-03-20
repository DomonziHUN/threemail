import {
  UserCog,
  Wallet,
  Gift,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";

const iconMap = {
  UserCog,
  Wallet,
  Gift,
  RefreshCcw,
  ShieldCheck,
};

interface ChatIconProps {
  name: string;
  className?: string;
}

export function ChatIcon({ name, className }: ChatIconProps) {
  const Icon = iconMap[name as keyof typeof iconMap];
  if (!Icon) return null;
  return <Icon className={className} />;
}
