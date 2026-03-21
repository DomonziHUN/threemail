"use client";

import { useEffect, useState, useCallback } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Search, User, CreditCard, ArrowLeftRight, Bitcoin,
  Users2, Shield, Gauge, Bell, Trash2, RefreshCw, Plus, X,
  ChevronRight, CheckCircle2, AlertTriangle
} from "lucide-react";

const SELECT_CLASS =
  "flex h-11 w-full rounded-xl border border-border bg-background px-4 text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const TABS = [
  { id: "profile", label: "Profil", icon: User },
  { id: "cards", label: "Kártyák", icon: CreditCard },
  { id: "transactions", label: "Tranzakciók", icon: ArrowLeftRight },
  { id: "crypto", label: "Crypto", icon: Bitcoin },
  { id: "referrals", label: "Meghívók", icon: Users2 },
  { id: "security", label: "Biztonság", icon: Shield },
  { id: "limits", label: "Limitek", icon: Gauge },
  { id: "notifications", label: "Értesítések", icon: Bell },
  { id: "danger", label: "Veszélyzóna", icon: AlertTriangle },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ─────────────────────── Main Component ───────────────────────
export function UsersTable() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [saving, setSaving] = useState(false);

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

  const fetchUserDetail = useCallback(async (userId: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/full`);
      if (res.ok) {
        setUserData(await res.json());
      } else {
        toast.error("Nem sikerült betölteni a felhasználó adatait");
      }
    } catch {
      toast.error("Kommunikációs hiba");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  const openUser = (userId: string) => {
    setSelectedUserId(userId);
    setActiveTab("profile");
    fetchUserDetail(userId);
  };

  const closeUser = () => {
    setSelectedUserId(null);
    setUserData(null);
    fetchUsers();
  };

  const apiAction = async (body: any) => {
    if (!selectedUserId) return false;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUserId}/full`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success("Sikeres mentés!");
        await fetchUserDetail(selectedUserId);
        return true;
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Hiba történt");
        return false;
      }
    } catch {
      toast.error("Kommunikációs hiba");
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ─── Filtered user list ───
  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-sm py-4">Felhasználók betöltése...</div>;

  // ═════════════════════ User Detail Panel ═════════════════════
  if (selectedUserId) {
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
        <button
          onClick={closeUser}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Vissza a listához
        </button>

        {detailLoading || !userData ? (
          <div className="flex items-center gap-2 py-10 text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Adatok betöltése...
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-4 pb-2">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                {userData.fullName?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold truncate">{userData.fullName}</h2>
                <p className="text-sm text-muted-foreground truncate">{userData.email}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{formatCurrency(userData.balanceHuf)}</p>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${userData.role === "ADMIN" ? "bg-purple-500/10 text-purple-500" : "bg-muted text-muted-foreground"}`}>
                  {userData.role}
                </span>
              </div>
            </div>

            {/* Tab navigation */}
            <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <div className="rounded-2xl border border-border bg-card p-5 min-h-[300px]">
              {activeTab === "profile" && (
                <ProfileTab user={userData} onSave={apiAction} saving={saving} />
              )}
              {activeTab === "cards" && (
                <CardsTab cards={userData.cards || []} onAction={apiAction} saving={saving} />
              )}
              {activeTab === "transactions" && (
                <TransactionsTab
                  transactions={userData.transactions || []}
                  cards={userData.cards || []}
                  onAction={apiAction}
                  saving={saving}
                />
              )}
              {activeTab === "crypto" && (
                <CryptoTab
                  holdings={userData.cryptoHoldings || []}
                  transactions={userData.cryptoTransactions || []}
                  onAction={apiAction}
                  saving={saving}
                />
              )}
              {activeTab === "referrals" && (
                <ReferralsTab
                  entries={userData.referralEntries || []}
                  invited={userData.referredEntries || []}
                  onAction={apiAction}
                  saving={saving}
                />
              )}
              {activeTab === "security" && (
                <SecurityTab
                  settings={userData.securitySettings}
                  sessions={userData.sessions || []}
                  onAction={apiAction}
                  saving={saving}
                />
              )}
              {activeTab === "limits" && (
                <LimitsTab limits={userData.limits} onAction={apiAction} saving={saving} />
              )}
              {activeTab === "notifications" && (
                <NotificationsTab
                  notifications={userData.notifications || []}
                  onAction={apiAction}
                  saving={saving}
                />
              )}
              {activeTab === "danger" && (
                <DangerTab userName={userData.fullName} onAction={apiAction} onClose={closeUser} saving={saving} />
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  // ═════════════════════ Users List ═════════════════════
  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Keresés név vagy e-mail alapján..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-card"
        />
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground bg-muted/50 border-b">
            <tr>
              <th className="px-4 py-3">Név</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Egyenleg</th>
              <th className="px-4 py-3">Kártyák</th>
              <th className="px-4 py-3">KYC</th>
              <th className="px-4 py-3">Szerep</th>
              <th className="px-4 py-3">Regisztráció</th>
              <th className="px-4 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => openUser(user.id)}
              >
                <td className="px-4 py-3 font-medium">{user.fullName}</td>
                <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                <td className="px-4 py-3 font-medium">{formatCurrency(user.balanceHuf)}</td>
                <td className="px-4 py-3 text-muted-foreground">{user.cards?.length ?? 0} db</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      user.kycStatus === "APPROVED"
                        ? "bg-green-500/10 text-green-500"
                        : user.kycStatus === "REJECTED"
                        ? "bg-red-500/10 text-red-500"
                        : "bg-yellow-500/10 text-yellow-500"
                    }`}
                  >
                    {user.kycStatus}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      user.role === "ADMIN" ? "bg-purple-500/10 text-purple-500" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(new Date(user.createdAt))}</td>
                <td className="px-4 py-3 text-right">
                  <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-muted-foreground">
                  Nincs találat.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── Section Label ───
// ═══════════════════════════════════════════════════════════════
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-muted-foreground mb-3">{children}</h3>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── Profile Tab ───
// ═══════════════════════════════════════════════════════════════
function ProfileTab({ user, onSave, saving }: { user: any; onSave: (b: any) => Promise<boolean>; saving: boolean }) {
  const [form, setForm] = useState({
    fullName: user.fullName || "",
    email: user.email || "",
    phone: user.phone || "",
    role: user.role || "USER",
    kycStatus: user.kycStatus || "PENDING",
    balanceHuf: user.balanceHuf ?? 0,
    country: user.country || "",
    city: user.city || "",
    street: user.street || "",
    zipCode: user.zipCode || "",
  });

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6">
      <SectionLabel>Személyes adatok</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Teljes név">
          <Input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
        </Field>
        <Field label="E-mail">
          <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </Field>
        <Field label="Telefonszám">
          <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </Field>
        <Field label="Egyenleg (HUF)">
          <Input type="number" value={form.balanceHuf} onChange={(e) => set("balanceHuf", Number(e.target.value))} />
        </Field>
        <Field label="Szerepkör">
          <select className={SELECT_CLASS} value={form.role} onChange={(e) => set("role", e.target.value)}>
            <option value="USER">Felhasználó</option>
            <option value="ADMIN">Admin</option>
          </select>
        </Field>
        <Field label="KYC állapot">
          <select className={SELECT_CLASS} value={form.kycStatus} onChange={(e) => set("kycStatus", e.target.value)}>
            <option value="PENDING">Függőben</option>
            <option value="APPROVED">Jóváhagyva</option>
            <option value="REJECTED">Elutasítva</option>
          </select>
        </Field>
      </div>

      <SectionLabel>Cím</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Ország">
          <Input value={form.country} onChange={(e) => set("country", e.target.value)} />
        </Field>
        <Field label="Város">
          <Input value={form.city} onChange={(e) => set("city", e.target.value)} />
        </Field>
        <Field label="Utca, házszám">
          <Input value={form.street} onChange={(e) => set("street", e.target.value)} />
        </Field>
        <Field label="Irányítószám">
          <Input value={form.zipCode} onChange={(e) => set("zipCode", e.target.value)} />
        </Field>
      </div>

      {user.kycDocument && (
        <>
          <SectionLabel>KYC dokumentumok</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Előlap", url: user.kycDocument.frontIdUrl },
              { label: "Hátlap", url: user.kycDocument.backIdUrl },
              { label: "Szelfi", url: user.kycDocument.selfieUrl },
            ].map((doc) => (
              <div key={doc.label} className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">{doc.label}</p>
                <div className="rounded-lg overflow-hidden border aspect-[4/3] bg-black">
                  <img src={doc.url?.replace("/api", "")} alt={doc.label} className="w-full h-full object-contain" />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="flex justify-end pt-2">
        <Button disabled={saving} onClick={() => onSave({ action: "updateProfile", ...form })}>
          {saving ? "Mentés..." : "Profil mentése"}
        </Button>
      </div>

      <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
        <p><strong>ID:</strong> {user.id}</p>
        <p><strong>Meghívókód:</strong> {user.referralCode}</p>
        <p><strong>Fizetési ref.:</strong> {user.paymentReference}</p>
        <p><strong>Regisztráció:</strong> {formatDate(new Date(user.createdAt))}</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── Cards Tab ───
// ═══════════════════════════════════════════════════════════════
function CardsTab({ cards, onAction, saving }: { cards: any[]; onAction: (b: any) => Promise<boolean>; saving: boolean }) {
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});

  const startEdit = (card: any) => {
    setEditId(card.id);
    setForm({
      status: card.status,
      color: card.color,
      onlinePurchase: card.onlinePurchase,
      contactless: card.contactless,
      atmWithdrawal: card.atmWithdrawal,
      dailyLimit: card.dailyLimit,
      monthlyLimit: card.monthlyLimit,
    });
  };

  const saveCard = async () => {
    const ok = await onAction({ action: "updateCard", cardId: editId, ...form });
    if (ok) setEditId(null);
  };

  if (cards.length === 0) return <p className="text-sm text-muted-foreground">Nincs kártya.</p>;

  return (
    <div className="space-y-4">
      {cards.map((card) => (
        <div key={card.id} className="border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono font-medium">•••• {card.last4}</span>
              <span className="ml-2 text-xs text-muted-foreground">({card.cardType})</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  card.status === "ACTIVE"
                    ? "bg-green-500/10 text-green-500"
                    : card.status === "FROZEN"
                    ? "bg-blue-500/10 text-blue-500"
                    : card.status === "INACTIVE"
                    ? "bg-yellow-500/10 text-yellow-500"
                    : "bg-red-500/10 text-red-500"
                }`}
              >
                {card.status}
              </span>
              <Button size="sm" variant="outline" onClick={() => (editId === card.id ? setEditId(null) : startEdit(card))}>
                {editId === card.id ? "Mégse" : "Szerkesztés"}
              </Button>
            </div>
          </div>

          {editId === card.id && (
            <div className="space-y-3 pt-2 border-t">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Field label="Státusz">
                  <select className={SELECT_CLASS} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="ACTIVE">Aktív</option>
                    <option value="FROZEN">Zárolva</option>
                    <option value="INACTIVE">Inaktív</option>
                    <option value="TERMINATED">Megszüntetve</option>
                  </select>
                </Field>
                <Field label="Szín">
                  <select className={SELECT_CLASS} value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}>
                    {["green", "blue", "purple", "orange", "slate"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Napi limit">
                  <Input type="number" value={form.dailyLimit} onChange={(e) => setForm({ ...form, dailyLimit: Number(e.target.value) })} />
                </Field>
                <Field label="Havi limit">
                  <Input type="number" value={form.monthlyLimit} onChange={(e) => setForm({ ...form, monthlyLimit: Number(e.target.value) })} />
                </Field>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                {(["onlinePurchase", "contactless", "atmWithdrawal"] as const).map((key) => (
                  <label key={key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                      className="rounded border-border"
                    />
                    {key === "onlinePurchase" ? "Online vásárlás" : key === "contactless" ? "Érintéses" : "ATM"}
                  </label>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" disabled={saving} onClick={saveCard}>Mentés</Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={saving}
                  onClick={() => onAction({ action: "deleteCard", cardId: card.id })}
                >
                  Megszüntetés
                </Button>
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Lejárat: {String(card.expiryMonth).padStart(2, "0")}/{String(card.expiryYear).slice(-2)} · Szín: {card.color} · Létrehozva: {formatDate(new Date(card.createdAt))}
          </p>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── Transactions Tab ───
// ═══════════════════════════════════════════════════════════════
function TransactionsTab({
  transactions,
  cards,
  onAction,
  saving,
}: {
  transactions: any[];
  cards: any[];
  onAction: (b: any) => Promise<boolean>;
  saving: boolean;
}) {
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ type: "DEPOSIT", amount: 0, description: "", status: "COMPLETED", cardId: "", senderName: "", senderAccountNumber: "" });

  const handleCreate = async () => {
    const ok = await onAction({ action: "createTransaction", ...form });
    if (ok) {
      setShowNew(false);
      setForm({ type: "DEPOSIT", amount: 0, description: "", status: "COMPLETED", cardId: "", senderName: "", senderAccountNumber: "" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionLabel>Tranzakciók ({transactions.length})</SectionLabel>
        <Button size="sm" variant="outline" onClick={() => setShowNew((v) => !v)}>
          {showNew ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          <span className="ml-1">{showNew ? "Mégse" : "Új tranzakció"}</span>
        </Button>
      </div>

      {showNew && (
        <div className="border rounded-xl p-4 space-y-3 bg-muted/30">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Field label="Típus">
              <select className={SELECT_CLASS} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="DEPOSIT">Befizetés</option>
                <option value="WITHDRAWAL">Kivét</option>
                <option value="CARD_PAYMENT">Kártyás fizetés</option>
                <option value="TRANSFER_IN">Bejövő utalás</option>
                <option value="TRANSFER_OUT">Kimenő utalás</option>
              </select>
            </Field>
            <Field label="Összeg (HUF)">
              <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
            </Field>
            <Field label="Státusz">
              <select className={SELECT_CLASS} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="COMPLETED">Teljesítve</option>
                <option value="PENDING">Függőben</option>
                <option value="FAILED">Sikertelen</option>
              </select>
            </Field>
            <Field label="Leírás">
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Admin tranzakció" />
            </Field>
            {cards.length > 0 && (
              <Field label="Kártya (opcionális)">
                <select className={SELECT_CLASS} value={form.cardId} onChange={(e) => setForm({ ...form, cardId: e.target.value })}>
                  <option value="">Nincs</option>
                  {cards.map((c: any) => (
                    <option key={c.id} value={c.id}>•••• {c.last4}</option>
                  ))}
                </select>
              </Field>
            )}
            {form.type === "TRANSFER_IN" && (
              <>
                <Field label="Küldő neve">
                  <Input value={form.senderName} onChange={(e) => setForm({ ...form, senderName: e.target.value })} placeholder="pl. Kiss János" />
                </Field>
                <Field label="Küldő számlaszáma">
                  <Input value={form.senderAccountNumber} onChange={(e) => setForm({ ...form, senderAccountNumber: e.target.value })} placeholder="pl. 11773016-01234567-00000000" />
                </Field>
              </>
            )}
          </div>
          <Button size="sm" disabled={saving} onClick={handleCreate}>Létrehozás</Button>
        </div>
      )}

      <div className="divide-y rounded-xl border overflow-hidden">
        {transactions.length === 0 && <p className="text-sm text-muted-foreground p-4">Nincs tranzakció.</p>}
        {transactions.map((tx: any) => (
          <div key={tx.id} className="flex items-center justify-between px-4 py-3 text-sm hover:bg-muted/30">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{tx.description}</p>
              <p className="text-xs text-muted-foreground">
                {tx.type} · {tx.status} · {formatDate(new Date(tx.createdAt))}
              </p>
              {(tx.senderName || tx.senderAccountNumber) && (
                <p className="text-xs text-muted-foreground">
                  Küldő: {tx.senderName}{tx.senderName && tx.senderAccountNumber ? " · " : ""}{tx.senderAccountNumber}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className={`font-medium whitespace-nowrap ${tx.type === "DEPOSIT" || tx.type === "TRANSFER_IN" ? "text-green-500" : ""}`}>
                {tx.type === "DEPOSIT" || tx.type === "TRANSFER_IN" ? "+" : "-"}{formatCurrency(tx.amount)}
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Biztosan törlöd?")) onAction({ action: "deleteTransaction", transactionId: tx.id });
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── Crypto Tab ───
// ═══════════════════════════════════════════════════════════════
function CryptoTab({
  holdings,
  transactions,
  onAction,
  saving,
}: {
  holdings: any[];
  transactions: any[];
  onAction: (b: any) => Promise<boolean>;
  saving: boolean;
}) {
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ amount: 0, avgBuyPrice: 0 });
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ symbol: "BTC", name: "Bitcoin", amount: 0, avgBuyPrice: 0 });

  const COINS = [
    { symbol: "BTC", name: "Bitcoin" },
    { symbol: "ETH", name: "Ethereum" },
    { symbol: "SOL", name: "Solana" },
    { symbol: "BNB", name: "BNB" },
    { symbol: "XRP", name: "XRP" },
    { symbol: "ADA", name: "Cardano" },
    { symbol: "DOGE", name: "Dogecoin" },
    { symbol: "DOT", name: "Polkadot" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionLabel>Crypto portfolió ({holdings.length})</SectionLabel>
        <Button size="sm" variant="outline" onClick={() => setShowNew((v) => !v)}>
          {showNew ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          <span className="ml-1">{showNew ? "Mégse" : "Új holding"}</span>
        </Button>
      </div>

      {showNew && (
        <div className="border rounded-xl p-4 space-y-3 bg-muted/30">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Coin">
              <select
                className={SELECT_CLASS}
                value={newForm.symbol}
                onChange={(e) => {
                  const c = COINS.find((cc) => cc.symbol === e.target.value);
                  setNewForm({ ...newForm, symbol: e.target.value, name: c?.name || e.target.value });
                }}
              >
                {COINS.map((c) => (
                  <option key={c.symbol} value={c.symbol}>{c.name} ({c.symbol})</option>
                ))}
              </select>
            </Field>
            <Field label="Mennyiség">
              <Input type="number" step="any" value={newForm.amount} onChange={(e) => setNewForm({ ...newForm, amount: Number(e.target.value) })} />
            </Field>
            <Field label="Átlag vételi ár (EUR)">
              <Input type="number" step="any" value={newForm.avgBuyPrice} onChange={(e) => setNewForm({ ...newForm, avgBuyPrice: Number(e.target.value) })} />
            </Field>
          </div>
          <Button
            size="sm"
            disabled={saving}
            onClick={async () => {
              const ok = await onAction({ action: "createCryptoHolding", ...newForm });
              if (ok) setShowNew(false);
            }}
          >
            Hozzáadás
          </Button>
        </div>
      )}

      {holdings.length === 0 && !showNew && <p className="text-sm text-muted-foreground">Nincs crypto holding.</p>}

      {holdings.map((h: any) => (
        <div key={h.id} className="border rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold">{h.symbol}</span>
              <span className="text-muted-foreground text-sm ml-2">{h.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">{h.amount}</span>
              <Button size="sm" variant="outline" onClick={() => {
                if (editId === h.id) { setEditId(null); } else {
                  setEditId(h.id);
                  setEditForm({ amount: h.amount, avgBuyPrice: h.avgBuyPrice });
                }
              }}>
                {editId === h.id ? "Mégse" : "Szerkesztés"}
              </Button>
            </div>
          </div>
          {editId === h.id && (
            <div className="pt-2 border-t space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Mennyiség">
                  <Input type="number" step="any" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: Number(e.target.value) })} />
                </Field>
                <Field label="Átlag ár (EUR)">
                  <Input type="number" step="any" value={editForm.avgBuyPrice} onChange={(e) => setEditForm({ ...editForm, avgBuyPrice: Number(e.target.value) })} />
                </Field>
              </div>
              <div className="flex gap-2">
                <Button size="sm" disabled={saving} onClick={() => onAction({ action: "updateCryptoHolding", holdingId: h.id, ...editForm })}>Mentés</Button>
                <Button size="sm" variant="destructive" disabled={saving} onClick={() => { if (confirm("Biztosan törlöd?")) onAction({ action: "deleteCryptoHolding", holdingId: h.id }); }}>Törlés</Button>
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground">Átlag ár: €{h.avgBuyPrice?.toFixed(2)}</p>
        </div>
      ))}

      {transactions.length > 0 && (
        <>
          <SectionLabel>Crypto tranzakciók</SectionLabel>
          <div className="divide-y rounded-xl border overflow-hidden">
            {transactions.map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <span className={`font-medium ${tx.type === "BUY" ? "text-green-500" : "text-red-500"}`}>{tx.type}</span>
                  <span className="ml-2">{tx.amount} {tx.symbol}</span>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>€{tx.totalEur?.toFixed(2)}</p>
                  <p>{formatDate(new Date(tx.createdAt))}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── Referrals Tab ───
// ═══════════════════════════════════════════════════════════════
function ReferralsTab({
  entries,
  invited,
  onAction,
  saving,
}: {
  entries: any[];
  invited: any[];
  onAction: (b: any) => Promise<boolean>;
  saving: boolean;
}) {
  const [showNew, setShowNew] = useState(false);
  const [isFake, setIsFake] = useState(true);
  const [newForm, setNewForm] = useState({ referredEmail: "", fakeName: "", bonusAmount: 20000, status: "REGISTERED", completedAt: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [editBonus, setEditBonus] = useState(0);
  const [editDate, setEditDate] = useState("");

  const handleCreate = async () => {
    const payload: any = { action: "createReferral", referredEmail: newForm.referredEmail, bonusAmount: newForm.bonusAmount, status: newForm.status };
    if (isFake) payload.fakeName = newForm.fakeName;
    if (newForm.completedAt) payload.completedAt = newForm.completedAt;
    const ok = await onAction(payload);
    if (ok) {
      setShowNew(false);
      setNewForm({ referredEmail: "", fakeName: "", bonusAmount: 20000, status: "REGISTERED", completedAt: "" });
    }
  };

  const handleUpdateBonus = async (referralId: string) => {
    const payload: any = { action: "updateReferral", referralId, bonusAmount: editBonus };
    if (editDate) payload.completedAt = editDate;
    const ok = await onAction(payload);
    if (ok) setEditId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionLabel>Meghívottak (akiket ő hívott meg): {entries.length}</SectionLabel>
        <Button size="sm" variant="outline" onClick={() => setShowNew((v) => !v)}>
          {showNew ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          <span className="ml-1">{showNew ? "Mégse" : "Új meghívott"}</span>
        </Button>
      </div>

      {showNew && (
        <div className="border rounded-xl p-4 space-y-3 bg-muted/30">
          <div className="flex items-center gap-3 mb-1">
            <button
              type="button"
              onClick={() => setIsFake(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${isFake ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              Fake (kitalált)
            </button>
            <button
              type="button"
              onClick={() => setIsFake(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${!isFake ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              Valós felhasználó
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {isFake && (
              <Field label="Fake név">
                <Input
                  value={newForm.fakeName}
                  onChange={(e) => setNewForm({ ...newForm, fakeName: e.target.value })}
                  placeholder="Kovács Péter"
                />
              </Field>
            )}
            <Field label={isFake ? "Fake e-mail (opcionális)" : "Felhasználó e-mail címe"}>
              <Input
                value={newForm.referredEmail}
                onChange={(e) => setNewForm({ ...newForm, referredEmail: e.target.value })}
                placeholder="pelda@email.hu"
              />
            </Field>
            <Field label="Bónusz összeg (HUF)">
              <Input
                type="number"
                value={newForm.bonusAmount}
                onChange={(e) => setNewForm({ ...newForm, bonusAmount: Number(e.target.value) })}
              />
            </Field>
            <Field label="Státusz">
              <select
                className={SELECT_CLASS}
                value={newForm.status}
                onChange={(e) => setNewForm({ ...newForm, status: e.target.value })}
              >
                <option value="REGISTERED">Regisztrált</option>
                <option value="ACTIVATED">Teljesített</option>
              </select>
            </Field>
            <Field label="Teljesítés dátuma (opcionális)">
              <Input
                type="datetime-local"
                value={newForm.completedAt}
                onChange={(e) => setNewForm({ ...newForm, completedAt: e.target.value })}
              />
            </Field>
          </div>
          <Button size="sm" disabled={saving || (isFake ? !newForm.fakeName : !newForm.referredEmail)} onClick={handleCreate}>
            Hozzáadás
          </Button>
        </div>
      )}

      {entries.length === 0 && !showNew && <p className="text-sm text-muted-foreground">Nincs meghívott.</p>}
      {entries.map((r: any) => (
        <div key={r.id} className="border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">
                {r.fakeName || r.referred?.fullName || "?"}
              </p>
              <p className="text-xs text-muted-foreground">{r.fakeEmail || r.referred?.email || "—"} · {formatDate(new Date(r.createdAt))}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${r.status === "ACTIVATED" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}`}>
                {r.status === "ACTIVATED" ? "Teljesített" : "Regisztrált"}
              </span>
              <span className="text-sm font-medium">{formatCurrency(r.bonusAmount)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t">
            {editId === r.id ? (
              <>
                <Input
                  type="number"
                  className="w-32 h-8 text-sm"
                  value={editBonus}
                  onChange={(e) => setEditBonus(Number(e.target.value))}
                  placeholder="Bónusz"
                />
                <Input
                  type="datetime-local"
                  className="w-48 h-8 text-sm"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  placeholder="Teljesítés dátuma"
                />
                <Button size="sm" variant="outline" disabled={saving} onClick={() => handleUpdateBonus(r.id)}>
                  Mentés
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditId(null)}>
                  Mégse
                </Button>
              </>
            ) : (
              <Button size="sm" variant="outline" onClick={() => { 
                setEditId(r.id); 
                setEditBonus(r.bonusAmount); 
                setEditDate(r.completedAt ? new Date(r.completedAt).toISOString().slice(0, 16) : "");
              }}>
                Bónusz/Dátum módosítás
              </Button>
            )}

            {r.status !== "ACTIVATED" ? (
              <Button
                size="sm"
                variant="outline"
                disabled={saving}
                onClick={() => onAction({ action: "updateReferral", referralId: r.id, status: "ACTIVATED" })}
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                Teljesítés
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                disabled={saving}
                onClick={() => onAction({ action: "updateReferral", referralId: r.id, status: "REGISTERED" })}
              >
                Visszavonás
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              disabled={saving}
              onClick={() => { if (confirm("Biztosan törlöd ezt a meghívást?")) onAction({ action: "deleteReferral", referralId: r.id }); }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ))}

      <SectionLabel>Meghívó (aki őt hívta meg)</SectionLabel>
      {invited.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nem hívta meg senki.</p>
      ) : (
        invited.map((r: any) => (
          <div key={r.id} className="border rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{r.referrer?.fullName || "?"}</p>
              <p className="text-xs text-muted-foreground">{r.referrer?.email}</p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${r.status === "ACTIVATED" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}`}>
              {r.status === "ACTIVATED" ? "Teljesített" : "Regisztrált"}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── Security Tab ───
// ═══════════════════════════════════════════════════════════════
function SecurityTab({
  settings,
  sessions,
  onAction,
  saving,
}: {
  settings: any;
  sessions: any[];
  onAction: (b: any) => Promise<boolean>;
  saving: boolean;
}) {
  const [form, setForm] = useState({
    twoFactorEnabled: settings?.twoFactorEnabled ?? false,
    biometricEnabled: settings?.biometricEnabled ?? false,
    emailNotifications: settings?.emailNotifications ?? true,
    smsNotifications: settings?.smsNotifications ?? true,
    loginAlerts: settings?.loginAlerts ?? true,
    transactionAlerts: settings?.transactionAlerts ?? true,
  });

  const toggle = (k: string) => setForm((p: any) => ({ ...p, [k]: !p[k] }));

  return (
    <div className="space-y-6">
      <SectionLabel>Biztonsági beállítások</SectionLabel>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Object.entries({
          twoFactorEnabled: "2FA",
          biometricEnabled: "Biometrikus",
          emailNotifications: "Email ért.",
          smsNotifications: "SMS ért.",
          loginAlerts: "Belépési ért.",
          transactionAlerts: "Tranz. ért.",
        }).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm border rounded-lg p-3 cursor-pointer hover:bg-muted/30">
            <input type="checkbox" checked={(form as any)[key]} onChange={() => toggle(key)} className="rounded border-border" />
            {label}
          </label>
        ))}
      </div>
      <Button size="sm" disabled={saving} onClick={() => onAction({ action: "updateSecurity", ...form })}>
        Mentés
      </Button>

      <SectionLabel>Aktív munkamenetek ({sessions.length})</SectionLabel>
      {sessions.length === 0 && <p className="text-sm text-muted-foreground">Nincs aktív munkamenet.</p>}
      <div className="space-y-2">
        {sessions.map((s: any) => (
          <div key={s.id} className="border rounded-xl p-3 flex items-center justify-between text-sm">
            <div>
              <p className="font-medium">{s.device}</p>
              <p className="text-xs text-muted-foreground">{s.ipAddress} · {s.location} · {formatDate(new Date(s.lastActive))}</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive"
              disabled={saving}
              onClick={() => onAction({ action: "deleteSession", sessionId: s.id })}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
      {sessions.length > 0 && (
        <Button size="sm" variant="destructive" disabled={saving} onClick={() => onAction({ action: "deleteAllSessions" })}>
          Összes munkamenet törlése
        </Button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── Limits Tab ───
// ═══════════════════════════════════════════════════════════════
function LimitsTab({ limits, onAction, saving }: { limits: any; onAction: (b: any) => Promise<boolean>; saving: boolean }) {
  const [form, setForm] = useState({
    dailyTransferLimit: limits?.dailyTransferLimit ?? 10000,
    monthlyTransferLimit: limits?.monthlyTransferLimit ?? 100000,
    dailyCardLimit: limits?.dailyCardLimit ?? 5000,
    monthlyCardLimit: limits?.monthlyCardLimit ?? 50000,
    dailyAtmLimit: limits?.dailyAtmLimit ?? 2000,
    monthlyAtmLimit: limits?.monthlyAtmLimit ?? 20000,
    dailyOnlineLimit: limits?.dailyOnlineLimit ?? 3000,
    monthlyOnlineLimit: limits?.monthlyOnlineLimit ?? 30000,
  });

  const set = (k: string, v: number) => setForm((p) => ({ ...p, [k]: v }));

  const fields = [
    { key: "dailyTransferLimit", label: "Napi utalás" },
    { key: "monthlyTransferLimit", label: "Havi utalás" },
    { key: "dailyCardLimit", label: "Napi kártya" },
    { key: "monthlyCardLimit", label: "Havi kártya" },
    { key: "dailyAtmLimit", label: "Napi ATM" },
    { key: "monthlyAtmLimit", label: "Havi ATM" },
    { key: "dailyOnlineLimit", label: "Napi online" },
    { key: "monthlyOnlineLimit", label: "Havi online" },
  ];

  return (
    <div className="space-y-4">
      <SectionLabel>Felhasználói limitek</SectionLabel>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {fields.map((f) => (
          <Field key={f.key} label={f.label}>
            <Input
              type="number"
              value={(form as any)[f.key]}
              onChange={(e) => set(f.key, Number(e.target.value))}
            />
          </Field>
        ))}
      </div>
      <Button size="sm" disabled={saving} onClick={() => onAction({ action: "updateLimits", ...form })}>
        Limitek mentése
      </Button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── Notifications Tab ───
// ═══════════════════════════════════════════════════════════════
function NotificationsTab({
  notifications,
  onAction,
  saving,
}: {
  notifications: any[];
  onAction: (b: any) => Promise<boolean>;
  saving: boolean;
}) {
  return (
    <div className="space-y-4">
      <SectionLabel>Értesítések ({notifications.length})</SectionLabel>
      {notifications.length === 0 && <p className="text-sm text-muted-foreground">Nincs értesítés.</p>}
      <div className="divide-y rounded-xl border overflow-hidden">
        {notifications.map((n: any) => (
          <div key={n.id} className="flex items-center justify-between px-4 py-3 text-sm hover:bg-muted/30">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{n.title}</p>
              <p className="text-xs text-muted-foreground truncate">{n.message}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {n.category} · {n.read ? "Olvasott" : "Olvasatlan"} · {formatDate(new Date(n.createdAt))}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive"
              disabled={saving}
              onClick={() => onAction({ action: "deleteNotification", notificationId: n.id })}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── Danger Zone Tab ───
// ═══════════════════════════════════════════════════════════════
function DangerTab({
  userName,
  onAction,
  onClose,
  saving,
}: {
  userName: string;
  onAction: (b: any) => Promise<boolean>;
  onClose: () => void;
  saving: boolean;
}) {
  const [confirmText, setConfirmText] = useState("");

  return (
    <div className="space-y-6">
      <div className="border-2 border-destructive/30 rounded-xl p-6 bg-destructive/5 space-y-4">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="font-bold text-lg">Felhasználó végleges törlése</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Ez a művelet <strong>véglegesen törli</strong> a felhasználót és minden hozzá tartozó adatot
          (kártyák, tranzakciók, crypto, meghívók, értesítések, munkamenetek, stb.).
          Ez a művelet <strong>nem vonható vissza</strong>.
        </p>
        <Field label={`Írd be a nevet a megerősítéshez: "${userName}"`}>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={userName}
            className="border-destructive/30"
          />
        </Field>
        <Button
          variant="destructive"
          disabled={saving || confirmText !== userName}
          onClick={async () => {
            const ok = await onAction({ action: "deleteUser" });
            if (ok) {
              toast.success("Felhasználó törölve");
              onClose();
            }
          }}
          className="w-full"
        >
          {saving ? "Törlés folyamatban..." : "Felhasználó végleges törlése"}
        </Button>
      </div>
    </div>
  );
}
