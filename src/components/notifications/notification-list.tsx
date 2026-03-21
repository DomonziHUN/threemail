"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  category: string;
  read: boolean;
  createdAt: string;
}

interface PaymentRequestItem {
  id: string;
  amount: number;
  note?: string | null;
  createdAt: string;
  requester?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequestItem[]>([]);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    fetchPaymentRequests();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentRequests = async () => {
    try {
      const res = await fetch("/api/request-money");
      if (res.ok) {
        const data = await res.json();
        setPaymentRequests(data.requests || []);
      }
    } catch (error) {
      console.error("Error fetching payment requests:", error);
    }
  };

  const handlePaymentRequestAction = async (
    requestId: string,
    action: "ACCEPT" | "REJECT"
  ) => {
    setProcessingRequestId(requestId);
    try {
      const res = await fetch("/api/request-money", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "A művelet sikertelen");
        return;
      }

      toast.success(data.message || "Sikeres művelet");
      setPaymentRequests((prev) => prev.filter((req) => req.id !== requestId));
      fetchNotifications();
    } catch (error) {
      toast.error("Hiba történt");
    } finally {
      setProcessingRequestId(null);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Betöltés...
        </CardContent>
      </Card>
    );
  }

  if (notifications.length === 0 && paymentRequests.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BellOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Még nincsenek értesítéseid</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {paymentRequests.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Beérkező pénzkérések</CardTitle>
            <p className="text-sm text-muted-foreground">
              Elfogadhatod vagy elutasíthatod a neked küldött kéréseket.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {paymentRequests.map((request) => (
              <div key={request.id} className="rounded-xl border border-border p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{request.requester?.fullName || "Ismeretlen"}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(new Date(request.createdAt))}
                    </p>
                  </div>
                  <p className="text-lg font-bold">{request.amount.toLocaleString("hu-HU")} HUF</p>
                </div>
                {request.note && (
                  <p className="text-sm text-muted-foreground">Megjegyzés: {request.note}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={processingRequestId === request.id}
                    onClick={() => handlePaymentRequestAction(request.id, "REJECT")}
                  >
                    Elutasítás
                  </Button>
                  <Button
                    disabled={processingRequestId === request.id}
                    onClick={() => handlePaymentRequestAction(request.id, "ACCEPT")}
                  >
                    Elfogadás
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Értesítések
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {notifications.filter((n) => !n.read).length} olvasatlan értesítés
          </p>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex gap-4 py-4 cursor-pointer hover:bg-muted/50 transition rounded-lg px-2"
              onClick={() => !notification.read && markAsRead(notification.id)}
            >
              <div className="flex flex-col items-center gap-1">
                <Badge variant={notification.read ? "outline" : "default"}>
                  {notification.category}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDate(new Date(notification.createdAt))}
                </span>
              </div>
              <div className="flex-1">
                <p className={`font-semibold ${!notification.read ? "text-primary" : ""}`}>
                  {notification.title}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.message}
                </p>
              </div>
              {!notification.read && (
                <span className="h-2 w-2 rounded-full bg-primary inline-block mt-2" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
