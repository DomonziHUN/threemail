"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function UsersTable() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Nyers kereseshez
  const [search, setSearch] = useState("");

  // Szerkesztéshez
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  // KYC Bírálathoz
  const [kycUser, setKycUser] = useState<any>(null);
  const [kycRejectReason, setKycRejectReason] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch {
      toast.error("Hiba a felhasználók betöltésekor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditClick = (user: any) => {
    setEditingUser(user);
    setEditForm({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || "",
      balanceHuf: user.balanceHuf,
      role: user.role,
      kycStatus: user.kycStatus,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        toast.success("Felhasználó sikeresen módosítva!");
        setEditingUser(null);
        fetchUsers();
      } else {
        toast.error("Mentés sikertelen.");
      }
    } catch {
      toast.error("Kommunikációs hiba.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleKycStatus = async (status: "APPROVED" | "REJECTED") => {
    if (status === "REJECTED" && !kycRejectReason) {
      toast.error("Elutasítás esetén kérlek adj meg indoklást!");
      return;
    }
    
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${kycUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          kycStatus: status,
          adminNote: status === "REJECTED" ? kycRejectReason : null 
        }),
      });
      if (res.ok) {
        toast.success(`KYC sikeresen ${status === "APPROVED" ? "jóváhagyva" : "elutasítva"}!`);
        setKycUser(null);
        setKycRejectReason("");
        fetchUsers();
      } else {
        toast.error("Hiba a KYC mentésekor.");
      }
    } catch {
      toast.error("Kommunikációs hiba.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredUsers = users.filter((u) => 
    u.fullName.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-sm">Felhasználók betöltése...</div>;

  return (
    <div className="space-y-4">
      <Input
        placeholder="Keresés név vagy e-mail alapján..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md bg-card"
      />

      <div className="rounded-xl border border-border bg-card overflow-hidden overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground bg-muted/50 border-b">
            <tr>
              <th className="px-4 py-3">Név</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Egyenleg</th>
              <th className="px-4 py-3">KYC</th>
              <th className="px-4 py-3">Regisztráció</th>
              <th className="px-4 py-3 text-right">Művelet</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3 font-medium">{user.fullName}</td>
                <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                <td className="px-4 py-3">{formatCurrency(user.balanceHuf)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.kycStatus === 'APPROVED' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                    {user.kycStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(new Date(user.createdAt))}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {user.kycDocument && user.kycStatus === "PENDING" && (
                      <Button variant="default" className="bg-blue-600 hover:bg-blue-700 text-white" size="sm" onClick={() => setKycUser(user)}>
                        KYC Bírálat
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(user)}>
                      Szerkesztés
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                  Nincs találat.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Egyszerű Modal a Szerkesztéshez */}
      {editingUser && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-2xl shadow-xl border overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b">
              <h3 className="font-bold text-lg">Szerkesztés: {editingUser.fullName}</h3>
            </div>
            
            <form onSubmit={handleSave} className="p-6 flex-1 overflow-y-auto space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Teljes Név</label>
                <Input value={editForm.fullName} onChange={e => setEditForm({...editForm, fullName: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">E-mail (Belépéshez)</label>
                <Input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Egyenleg (HUF)</label>
                <Input type="number" value={editForm.balanceHuf} onChange={e => setEditForm({...editForm, balanceHuf: Number(e.target.value)})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Szerepkör</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={editForm.role} 
                    onChange={e => setEditForm({...editForm, role: e.target.value})}
                  >
                    <option value="USER">Felhasználó (USER)</option>
                    <option value="ADMIN">Adminisztrátor (ADMIN)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">KYC Állapot</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={editForm.kycStatus} 
                    onChange={e => setEditForm({...editForm, kycStatus: e.target.value})}
                  >
                    <option value="PENDING">Függőben (PENDING)</option>
                    <option value="APPROVED">Jóváhagyva (APPROVED)</option>
                    <option value="REJECTED">Elutasítva (REJECTED)</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-6 flex items-center justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setEditingUser(null)}>Mégsem</Button>
                <Button type="submit" disabled={isSaving}>{isSaving ? "Mentés..." : "Mentés és Frissítés"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KYC Döntnök Modal Óriási Képekkel */}
      {kycUser && kycUser.kycDocument && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-6xl rounded-3xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-muted/30">
              <div>
                <h3 className="font-bold text-xl">KYC Bírálat: {kycUser.fullName}</h3>
                <p className="text-sm text-muted-foreground">{kycUser.email}</p>
              </div>
              <Button variant="ghost" onClick={() => setKycUser(null)}>Bezárás</Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Előlap */}
                <div className="space-y-2">
                  <h4 className="font-bold text-primary">Személyi Előlap</h4>
                  <div className="rounded-xl overflow-hidden border-2 border-primary/20 aspect-[4/3] bg-black">
                    <img src={kycUser.kycDocument.frontIdUrl.replace("/api", "")} alt="Előlap" className="w-full h-full object-contain" />
                  </div>
                </div>

                {/* 2. Hátlap */}
                <div className="space-y-2">
                  <h4 className="font-bold text-primary">Személyi Hátlap</h4>
                  <div className="rounded-xl overflow-hidden border-2 border-primary/20 aspect-[4/3] bg-black">
                    <img src={kycUser.kycDocument.backIdUrl.replace("/api", "")} alt="Hátlap" className="w-full h-full object-contain" />
                  </div>
                </div>

                {/* 3. Szelfi */}
                <div className="space-y-2">
                  <h4 className="font-bold text-accent">Szelfi Kamera</h4>
                  <div className="rounded-xl overflow-hidden border-2 border-accent/50 aspect-[4/3] bg-black relative">
                    <img src={kycUser.kycDocument.selfieUrl.replace("/api", "")} alt="Szelfi" className="w-full h-full object-contain" />
                  </div>
                </div>

              </div>
            </div>

            <div className="p-6 border-t bg-muted/10 grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div className="space-y-2">
                <label className="text-sm font-bold text-red-500">Újra bekérés indoklása (Csak elutasításnál)</label>
                <Input 
                  placeholder="Pl. Túl homályos a szelfi, vagy a fénykép nem egyezik..." 
                  value={kycRejectReason}
                  onChange={(e) => setKycRejectReason(e.target.value)}
                  className="border-red-500/30 focus-visible:ring-red-500"
                />
              </div>
              <div className="flex gap-4">
                <Button 
                  onClick={() => handleKycStatus("REJECTED")} 
                  disabled={isSaving} 
                  variant="destructive" 
                  className="w-1/2 h-12 font-bold text-lg"
                >
                  {isSaving ? "Kérem várjon..." : "Elutasítás ❌"}
                </Button>
                <Button 
                  onClick={() => handleKycStatus("APPROVED")} 
                  disabled={isSaving} 
                  className="w-1/2 h-12 font-bold text-lg bg-green-500 hover:bg-green-600 text-white"
                >
                  {isSaving ? "Kérem várjon..." : "Jóváhagyás ✅"}
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
