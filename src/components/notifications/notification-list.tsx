"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Bell, BellOff } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  category: string;
  read: boolean;
  createdAt: string;
}

interface NotificationListProps {
  userId: string;
}

export function NotificationList({ userId }: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
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

  if (notifications.length === 0) {
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
  );
}
