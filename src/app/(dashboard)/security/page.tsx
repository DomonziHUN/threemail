"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  ShieldCheck, 
  Smartphone, 
  Eye, 
  EyeOff, 
  Lock, 
  Monitor, 
  Trash2,
  Globe,
  Bell,
  UserCheck,
  Key,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { BiometricSetup } from "@/components/security/biometric-setup";

interface SecuritySettings {
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  loginAlerts: boolean;
  transactionAlerts: boolean;
  marketingEmails: boolean;
  dataSharing: boolean;
  activityTracking: boolean;
}

interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export default function SecurityPage() {
  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    biometricEnabled: false,
    emailNotifications: true,
    smsNotifications: true,
    loginAlerts: true,
    transactionAlerts: true,
    marketingEmails: false,
    dataSharing: false,
    activityTracking: true,
  });

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [qrCode, setQrCode] = useState("");

  useEffect(() => {
    fetchSecuritySettings();
    fetchActiveSessions();
  }, []);

  const fetchSecuritySettings = async () => {
    try {
      const res = await fetch("/api/user/security");
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      toast.error("Hiba a beállítások betöltésekor");
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveSessions = async () => {
    try {
      const res = await fetch("/api/user/sessions");
      const data = await res.json();
      if (data.sessions) {
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error("Hiba a munkamenetek betöltésekor");
    }
  };

  const updateSetting = async (key: keyof SecuritySettings, value: boolean) => {
    const oldValue = settings[key];
    setSettings({ ...settings, [key]: value });

    try {
      const res = await fetch("/api/user/security", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });

      if (!res.ok) {
        throw new Error();
      }

      toast.success("Beállítás frissítve");
    } catch (error) {
      setSettings({ ...settings, [key]: oldValue });
      toast.error("Hiba a beállítás frissítésekor");
    }
  };

  const handleTwoFactorToggle = async () => {
    if (!settings.twoFactorEnabled) {
      try {
        const res = await fetch("/api/user/2fa/setup", {
          method: "POST",
        });
        const data = await res.json();
        
        if (data.qrCode) {
          setQrCode(data.qrCode);
          setShowTwoFactorSetup(true);
        }
      } catch (error) {
        toast.error("Hiba a kétfaktoros hitelesítés beállításakor");
      }
    } else {
      await updateSetting("twoFactorEnabled", false);
      toast.success("Kétfaktoros hitelesítés kikapcsolva");
    }
  };

  const verifyTwoFactor = async () => {
    try {
      const res = await fetch("/api/user/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verificationCode }),
      });

      if (res.ok) {
        setSettings({ ...settings, twoFactorEnabled: true });
        setShowTwoFactorSetup(false);
        setVerificationCode("");
        toast.success("Kétfaktoros hitelesítés aktiválva!");
      } else {
        toast.error("Hibás ellenőrző kód");
      }
    } catch (error) {
      toast.error("Hiba történt");
    }
  };

  const terminateSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/user/sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSessions(sessions.filter(s => s.id !== sessionId));
        toast.success("Munkamenet megszakítva");
      } else {
        toast.error("Hiba a munkamenet megszakításakor");
      }
    } catch (error) {
      toast.error("Hiba történt");
    }
  };

  const terminateAllSessions = async () => {
    try {
      const res = await fetch("/api/user/sessions/all", {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Minden munkamenet megszakítva");
        fetchActiveSessions();
      } else {
        toast.error("Hiba történt");
      }
    } catch (error) {
      toast.error("Hiba történt");
    }
  };

  if (loading) {
    return <div className="py-6">Betöltés...</div>;
  }

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold">Biztonság és adatvédelem</h1>
      </div>

      {/* Kétfaktoros hitelesítés */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Kétfaktoros hitelesítés (2FA)</CardTitle>
              <CardDescription>Extra biztonsági réteg a fiókodhoz</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="2fa" className="font-semibold">Kétfaktoros hitelesítés</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Bejelentkezéskor egy egyszer használatos kódot kell megadnod
              </p>
            </div>
            <Switch
              checked={settings.twoFactorEnabled}
              onCheckedChange={handleTwoFactorToggle}
            />
          </div>

          {showTwoFactorSetup && (
            <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <h4 className="font-semibold">Kétfaktoros hitelesítés beállítása</h4>
              <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
                <li>Telepíts egy hitelesítő alkalmazást (Google Authenticator, Authy)</li>
                <li>Szkenneld be a QR kódot az alkalmazással</li>
                <li>Add meg az alkalmazásban megjelenő 6 számjegyű kódot</li>
              </ol>
              
              {qrCode && (
                <div className="flex justify-center py-4">
                  <div className="bg-white p-4 rounded-lg">
                    <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="code">Ellenőrző kód</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={verifyTwoFactor} disabled={verificationCode.length !== 6}>
                  Ellenőrzés és aktiválás
                </Button>
                <Button variant="outline" onClick={() => setShowTwoFactorSetup(false)}>
                  Mégse
                </Button>
              </div>
            </div>
          )}

          <div className="pt-4">
            <BiometricSetup
              isEnabled={settings.biometricEnabled}
              onSuccess={fetchSecuritySettings}
            />
          </div>
        </CardContent>
      </Card>

      {/* Aktív munkamenetek */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
              <Monitor className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <CardTitle>Aktív munkamenetek</CardTitle>
              <CardDescription>Eszközök, ahol be vagy jelentkezve</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Csak ez az eszköz van bejelentkezve</p>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-semibold text-sm">
                      {session.device}
                      {session.current && <span className="ml-2 text-xs text-green-600">(Jelenlegi)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.location} • {session.lastActive}
                    </p>
                  </div>
                </div>
                {!session.current && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => terminateSession(session.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))
          )}

          {sessions.length > 1 && (
            <Button variant="destructive" className="w-full mt-4" onClick={terminateAllSessions}>
              <Trash2 className="w-4 h-4 mr-2" />
              Minden más munkamenet megszakítása
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Értesítési beállítások */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <CardTitle>Értesítési beállítások</CardTitle>
              <CardDescription>Értesítések kezelése</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="email-notif" className="font-semibold">E-mail értesítések</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Fontos értesítések e-mailben
              </p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => updateSetting("emailNotifications", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="sms-notif" className="font-semibold">SMS értesítések</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Tranzakciós értesítések SMS-ben
              </p>
            </div>
            <Switch
              checked={settings.smsNotifications}
              onCheckedChange={(checked) => updateSetting("smsNotifications", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="login-alerts" className="font-semibold">Bejelentkezési riasztások</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Értesítés új eszközről történő bejelentkezéskor
              </p>
            </div>
            <Switch
              checked={settings.loginAlerts}
              onCheckedChange={(checked) => updateSetting("loginAlerts", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="transaction-alerts" className="font-semibold">Tranzakciós riasztások</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Azonnali értesítés minden tranzakcióról
              </p>
            </div>
            <Switch
              checked={settings.transactionAlerts}
              onCheckedChange={(checked) => updateSetting("transactionAlerts", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="marketing" className="font-semibold">Marketing e-mailek</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Hírlevelek és ajánlatok
              </p>
            </div>
            <Switch
              checked={settings.marketingEmails}
              onCheckedChange={(checked) => updateSetting("marketingEmails", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Adatvédelmi beállítások */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
              <Lock className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <CardTitle>Adatvédelmi beállítások</CardTitle>
              <CardDescription>Adataid kezelése és védelme</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="data-sharing" className="font-semibold">Adatmegosztás partnerekkel</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Adatok megosztása megbízható partnerekkel
              </p>
            </div>
            <Switch
              checked={settings.dataSharing}
              onCheckedChange={(checked) => updateSetting("dataSharing", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="activity-tracking" className="font-semibold">Aktivitás követése</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Használati adatok gyűjtése a szolgáltatás javítása érdekében
              </p>
            </div>
            <Switch
              checked={settings.activityTracking}
              onCheckedChange={(checked) => updateSetting("activityTracking", checked)}
            />
          </div>

          <div className="pt-4 space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/privacy-policy">
                <FileText className="w-4 h-4 mr-2" />
                Adatvédelmi szabályzat
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/data-export">
                <Globe className="w-4 h-4 mr-2" />
                Adataim letöltése
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Veszélyzóna */}
      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-destructive">Veszélyzóna</CardTitle>
              <CardDescription>Visszafordíthatatlan műveletek</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive" asChild>
            <Link href="/settings">
              <Key className="w-4 h-4 mr-2" />
              Jelszó megváltoztatása
            </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Fiók törlése
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function FileText({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
