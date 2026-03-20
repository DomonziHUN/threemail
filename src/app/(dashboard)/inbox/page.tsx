import { requireAuth } from "@/lib/auth-guard";
import { NotificationList } from "@/components/notifications/notification-list";

export const metadata = {
  title: "Beérkezett üzenetek | ThreeMail Bank",
};

export default async function InboxPage() {
  const user = await requireAuth();

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-bold">Beérkezett üzenetek</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Itt találod a fiókoddal kapcsolatos értesítéseket és üzeneteket.
        </p>
      </div>

      <NotificationList userId={user.id} />
    </div>
  );
}
