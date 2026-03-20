import { requireAdmin } from "@/lib/auth-guard";
import { AdminNotificationSender } from "@/components/admin/admin-notification-sender";

export const metadata = {
  title: "Értesítések küldése | Admin",
};

export default async function AdminNotificationsPage() {
  await requireAdmin();

  return (
    <div className="py-6">
      <AdminNotificationSender />
    </div>
  );
}
