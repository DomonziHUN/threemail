import { requireAdmin } from "@/lib/auth-guard";
import { AdminChatDashboard } from "@/components/admin/admin-chat-dashboard";

export const metadata = {
  title: "Chat Kezelés | Admin",
};

export default async function AdminChatPage() {
  const admin = await requireAdmin();

  return (
    <div className="py-6">
      <AdminChatDashboard adminId={admin.id} adminName={admin.fullName || admin.email || "Admin"} />
    </div>
  );
}
