"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Bell, Send, Users, User } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "INFO", label: "Információ", color: "bg-blue-500" },
  { value: "WARNING", label: "Figyelmeztetés", color: "bg-yellow-500" },
  { value: "SUCCESS", label: "Siker", color: "bg-green-500" },
  { value: "ERROR", label: "Hiba", color: "bg-red-500" },
  { value: "TRANSACTION", label: "Tranzakció", color: "bg-purple-500" },
  { value: "SECURITY", label: "Biztonság", color: "bg-orange-500" },
];

export function AdminNotificationSender() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("INFO");
  const [targetType, setTargetType] = useState<"all" | "single">("all");
  const [userId, setUserId] = useState("");
  const [sending, setSending] = useState(false);

  const sendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("A cím és az üzenet kötelező!");
      return;
    }

    if (targetType === "single" && !userId.trim()) {
      toast.error("Add meg a felhasználó ID-t!");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          message,
          category,
          ...(targetType === "single" ? { userId } : {}),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`Értesítés elküldve ${data.count} felhasználónak!`);
        setTitle("");
        setMessage("");
        setUserId("");
      } else {
        toast.error("Hiba történt az értesítés küldése közben");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Hiba történt az értesítés küldése közben");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Értesítések küldése</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Küldj értesítéseket a felhasználóknak
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Új értesítés
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Címzettek</Label>
              <div className="flex gap-2">
                <Button
                  variant={targetType === "all" ? "default" : "outline"}
                  onClick={() => setTargetType("all")}
                  className="flex-1"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Minden felhasználó
                </Button>
                <Button
                  variant={targetType === "single" ? "default" : "outline"}
                  onClick={() => setTargetType("single")}
                  className="flex-1"
                >
                  <User className="h-4 w-4 mr-2" />
                  Egy felhasználó
                </Button>
              </div>
            </div>

            {targetType === "single" && (
              <div className="space-y-2">
                <Label htmlFor="userId">Felhasználó ID</Label>
                <Input
                  id="userId"
                  placeholder="clxxx..."
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Cím</Label>
              <Input
                id="title"
                placeholder="Értesítés címe"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Üzenet</Label>
              <Textarea
                id="message"
                placeholder="Értesítés szövege..."
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Kategória</Label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`rounded-lg border-2 p-3 text-left transition ${
                      category === cat.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${cat.color}`} />
                      <span className="text-sm font-medium">{cat.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={sendNotification}
              disabled={sending}
              className="w-full"
              size="lg"
            >
              <Send className="h-4 w-4 mr-2" />
              {sending ? "Küldés..." : "Értesítés küldése"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Előnézet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border border-border bg-muted/20 p-4">
              <div className="flex items-start gap-3">
                <Badge variant="default">
                  {CATEGORIES.find((c) => c.value === category)?.label || "INFO"}
                </Badge>
                <div className="flex-1">
                  <p className="font-semibold text-primary">
                    {title || "Értesítés címe"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {message || "Az értesítés szövege itt fog megjelenni..."}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">Most</p>
                </div>
                <span className="h-2 w-2 rounded-full bg-primary inline-block mt-1" />
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>Címzettek:</strong>{" "}
                {targetType === "all" ? "Minden felhasználó" : "1 felhasználó"}
              </p>
              <p>
                <strong>Kategória:</strong>{" "}
                {CATEGORIES.find((c) => c.value === category)?.label}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
