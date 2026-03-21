import { requireAdmin } from "@/lib/auth-guard";
import { ServerPanel } from "@/components/admin/server-panel";
import { UsersTable } from "@/components/admin/users-table";

export const metadata = {
  title: "Admin Vezérlőpult | Threemail",
};

export default async function AdminPage() {
  // Ezzel ellenőrizzük, hogy az erikapukaja@gmail.com vagy ADMIN rang lépett-e be
  await requireAdmin();

  return (
    <div className="space-y-6 py-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          Admin Vezérlőpult
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Központi rendszerkezelő – Csak neked!
        </p>
      </div>

      <ServerPanel />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Felhasználók Kezelése</h2>
        <UsersTable />
      </div>
    </div>
  );
}
