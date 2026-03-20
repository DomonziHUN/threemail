"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Send, MessageSquare, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { chatTopics } from "@/lib/chat-topics";
import { ChatIcon } from "@/components/chat/chat-icon";

interface ChatMessage {
  id: string;
  author: "user" | "support";
  operator?: string;
  text: string;
  timestamp: string;
  topic?: string;
}

interface ActiveRoom {
  topic: string;
  topicTitle: string;
  messageCount: number;
  lastMessage?: ChatMessage;
}

interface AdminChatDashboardProps {
  adminId: string;
  adminName: string;
}

export function AdminChatDashboard({ adminId, adminName }: AdminChatDashboardProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeRooms, setActiveRooms] = useState<ActiveRoom[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io({
      path: "/api/socket",
      transports: ["polling", "websocket"],
      reconnection: true,
      upgrade: true,
    });

    newSocket.on("connect", () => {
      console.log("Admin connected to Socket.IO");
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket || !selectedTopic) return;

    socket.emit("admin_join_topic", { topic: selectedTopic, adminName });

    socket.on("chat_history", (history: ChatMessage[]) => {
      setMessages(history);
    });

    socket.on("chat_message", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("chat_history");
      socket.off("chat_message");
    };
  }, [socket, selectedTopic, adminName]);

  const sendMessage = () => {
    if (!input.trim() || !socket || !selectedTopic) return;
    const text = input.trim();
    setInput("");

    socket.emit("chat_message", {
      topic: selectedTopic,
      text,
      author: "support",
      operator: adminName,
    });
  };

  const currentTopic = chatTopics.find((t) => t.id === selectedTopic);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Chat Kezelés</h1>
          <p className="text-sm text-muted-foreground">
            Válaszolj a felhasználói üzenetekre valós időben
          </p>
        </div>
        <Badge variant={isConnected ? "success" : "secondary"}>
          {isConnected ? "Kapcsolódva" : "Kapcsolódás..."}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Témák
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {chatTopics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className={cn(
                  "w-full rounded-2xl border p-3 text-left transition hover:border-primary hover:bg-primary/5",
                  selectedTopic === topic.id && "border-primary bg-primary/5"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary/10 p-2 text-primary">
                    <ChatIcon name={topic.iconName} className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{topic.title}</p>
                    <p className="text-xs text-muted-foreground">{topic.quickNote}</p>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {currentTopic ? currentTopic.title : "Válassz témát"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedTopic ? (
              <div className="space-y-4">
                <ScrollArea className="h-96 rounded-2xl border border-border bg-muted/20 p-4">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        Még nincsenek üzenetek ebben a témában
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={cn(
                            "flex items-end gap-2",
                            message.author === "support" ? "justify-end" : "justify-start"
                          )}
                        >
                          {message.author === "user" && <Avatar fallback="U" size="sm" />}
                          <div
                            className={cn(
                              "max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm",
                              message.author === "support"
                                ? "bg-primary text-primary-foreground"
                                : "bg-background border"
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
                          {message.author === "support" && (
                            <Avatar fallback={message.operator?.[0] || "A"} size="sm" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                <div className="rounded-2xl border border-border bg-background p-3">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Írd ide a válaszod..."
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
            ) : (
              <div className="flex h-96 items-center justify-center text-sm text-muted-foreground">
                Válassz egy témát a bal oldalon a chat megkezdéséhez
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
