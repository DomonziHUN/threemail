"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ChatIcon } from "@/components/chat/chat-icon";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatTopic } from "@/lib/chat-topics";

interface ChatMessage {
  id: string;
  author: "user" | "support";
  operator?: string;
  text: string;
  timestamp: string;
}

interface ChatWindowProps {
  user: {
    id: string;
    fullName: string;
  };
  topic: ChatTopic;
}

export function ChatWindow({ user, topic }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = io({
      path: "/api/socket",
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("join_topic", {
        topic: topic.id,
        topicTitle: topic.title,
        user: { id: user.id, fullName: user.fullName },
      });
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("chat_history", (history: ChatMessage[]) => {
      setMessages(history);
    });

    socket.on("system_message", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("chat_message", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
      if (msg.author === "support") {
        setIsTyping(false);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [topic.id, topic.title, user.id, user.fullName]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = () => {
    if (!input.trim() || !socketRef.current) return;
    const text = input.trim();
    setInput("");
    setIsTyping(true);

    socketRef.current.emit("chat_message", {
      topic: topic.id,
      text,
      author: "user",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/30 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-primary/10 p-2 text-primary">
            <ChatIcon name={topic.iconName} className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">{topic.title}</p>
            <p className="text-xs text-muted-foreground">{topic.quickNote}</p>
          </div>
        </div>
        <Badge variant={isConnected ? "success" : "secondary"}>
          {isConnected ? "Kapcsolódva" : "Kapcsolódás..."}
        </Badge>
      </div>

      <div className="rounded-2xl border border-border bg-background">
        <ScrollArea ref={scrollRef} className="h-96 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-end gap-2",
                  message.author === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.author === "support" && (
                  <Avatar fallback={message.operator?.[0] || "S"} size="sm" />
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm",
                    message.author === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {message.operator && (
                    <p className="text-[11px] font-semibold opacity-70 mb-1">
                      {message.operator}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  <p className="text-[10px] opacity-70 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString("hu-HU", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {message.author === "user" && <Avatar fallback="Te" size="sm" />}
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Az ügyintéző válaszol...
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="rounded-2xl border border-border bg-background p-3">
        <div className="flex gap-2">
          <Textarea
            placeholder="Írd ide az üzeneted..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            rows={2}
            className="resize-none"
          />
          <Button
            type="button"
            onClick={sendMessage}
            disabled={!input.trim() || !isConnected}
            size="icon"
            className="h-auto"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Enter = küldés, Shift+Enter = új sor
        </p>
      </div>
    </div>
  );
}
