"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  author: "user" | "support";
  text: string;
  timestamp: Date;
}

const cannedReplies = [
  "Köszönjük a megkeresést! Pár percen belül válaszolunk.",
  "Egy pillanat, ellenőrizzük az adatokat...",
  "Ha szeretnéd, azonnal zárolhatjuk a kártyád a kérést követően.",
];

let replyIndex = 0;

export function LiveChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      author: "support",
      text: "Szia! Miben segíthetünk ma?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      author: "user",
      text: input.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);

    setTimeout(() => {
      const reply: ChatMessage = {
        id: crypto.randomUUID(),
        author: "support",
        text: cannedReplies[replyIndex % cannedReplies.length],
        timestamp: new Date(),
      };
      replyIndex += 1;
      setMessages((prev) => [...prev, reply]);
      setIsSending(false);
    }, 1200);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-background">
        <ScrollArea className="h-64 p-4">
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.author === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm",
                    message.author === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p>{message.text}</p>
                  <p className="text-[10px] opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString("hu-HU", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-muted px-4 py-2 text-xs text-muted-foreground">
                  Ügyintéző ír...
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="flex gap-2"
      >
        <Input
          placeholder="Írd ide az üzeneted..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button type="submit" disabled={isSending || !input.trim()}>
          Küldés
        </Button>
      </form>
    </div>
  );
}
