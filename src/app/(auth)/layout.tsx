import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import "../globals.css";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center justify-center gap-2">
            <Image src="/logo.svg" alt={`${APP_NAME} logo`} width={48} height={48} />
            <span className="text-2xl font-semibold text-foreground">{APP_NAME}</span>
          </Link>
          <p className="text-muted-foreground mt-2">
            Kapcsolatban mindenkor, mindenkivel.
          </p>
        </div>
        <div className="rounded-3xl bg-background p-6 shadow-xl border border-border">
          {children}
        </div>
      </div>
    </div>
  );
}
