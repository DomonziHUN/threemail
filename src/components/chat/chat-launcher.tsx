"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export function ChatLauncher() {
  return (
    <motion.div
      className="fixed bottom-28 right-6 z-40 xl:right-[calc(50%-220px)]"
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
    >
      <Link
        href="/chat"
        className="flex items-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-white shadow-2xl transition hover:scale-[1.03]"
      >
        <div className="rounded-full bg-white/20 p-2">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div className="text-sm font-semibold leading-tight">
          <p>Live chat</p>
          <span className="text-xs font-normal text-white/80">Valós idejű támogatás</span>
        </div>
      </Link>
    </motion.div>
  );
}
