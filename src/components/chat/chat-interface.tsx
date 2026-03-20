"use client";

import { useState } from "react";
import type { ChatTopic } from "@/lib/chat-topics";
import { ChatWindow } from "@/components/chat/chat-window";
import { ChatIcon } from "@/components/chat/chat-icon";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  user: {
    id: string;
    fullName: string;
    email?: string | null;
  };
  topics: ChatTopic[];
}

export function ChatInterface({ user, topics }: ChatInterfaceProps) {
  const [selectedTopic, setSelectedTopic] = useState<ChatTopic | null>(null);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Live chat támogatás</h1>
        <p className="text-sm text-muted-foreground">
          Válassz témát, és azonnal összekapcsolunk egy ügyintézővel.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {topics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => setSelectedTopic(topic)}
            className={cn(
              "rounded-2xl border p-4 text-left transition hover:border-primary hover:bg-primary/5",
              selectedTopic?.id === topic.id && "border-primary bg-primary/5"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <ChatIcon name={topic.iconName} className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">{topic.title}</p>
                <p className="text-xs text-muted-foreground">{topic.description}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {topic.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-muted px-3 py-1 text-[11px] font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        {selectedTopic ? (
          <ChatWindow user={user} topic={selectedTopic} />
        ) : (
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Válassz ki egy témát a fenti listából, hogy elindítsd a beszélgetést.</p>
            <p>
              Minden beszélgetés titkosított csatornán keresztül történik, és visszanézhető lesz a
              Beérkezett üzenetek menüpontban.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
