"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateProfileSchema, changePasswordSchema } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const profileForm = useForm<z.infer<typeof updateProfileSchema>>({
    resolver: zodResolver(updateProfileSchema),
  });

  const passwordForm = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      const data = await res.json();
      setProfile(data.user);
      profileForm.reset({
        fullName: data.user.fullName,
        phone: data.user.phone || "",
        country: data.user.country || "",
        city: data.user.city || "",
        street: data.user.street || "",
        zipCode: data.user.zipCode || "",
      });
    } catch (error) {
      toast.error("Hiba a profil betöltésekor");
    } finally {
      setLoading(false);
    }
  };

  const onProfileSubmit = profileForm.handleSubmit(async (values) => {
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        toast.success("Profil frissítve!");
        fetchProfile();
      } else {
        toast.error("Hiba a profil frissítésekor");
      }
    } catch (error) {
      toast.error("Hiba történt");
    }
  });

  const onPasswordSubmit = passwordForm.handleSubmit(async (values) => {
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        toast.success("Jelszó megváltoztatva!");
        passwordForm.reset();
      } else {
        const data = await res.json();
        toast.error(data.message || "Hiba a jelszó módosításakor");
      }
    } catch (error) {
      toast.error("Hiba történt");
    }
  });

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  if (loading) {
    return <div className="py-6">Betöltés...</div>;
  }

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-bold">Beállítások</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kezeld a fiókod és a személyes adataidat
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Személyes adatok</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onProfileSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Teljes név</Label>
              <Input id="fullName" {...profileForm.register("fullName")} />
              {profileForm.formState.errors.fullName && (
                <p className="text-sm text-destructive">
                  {profileForm.formState.errors.fullName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail cím</Label>
              <Input id="email" value={profile?.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefonszám</Label>
              <Input id="phone" {...profileForm.register("phone")} />
            </div>

            <div className="pt-4 mt-2 border-t">
              <h3 className="font-semibold text-sm mb-3">Szállítási cím (Fizikai kártyához)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Ország</Label>
                  <Input id="country" {...profileForm.register("country")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Irányítószám</Label>
                  <Input id="zipCode" {...profileForm.register("zipCode")} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="city">Város</Label>
                  <Input id="city" {...profileForm.register("city")} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="street">Utca és házszám</Label>
                  <Input id="street" {...profileForm.register("street")} />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={profileForm.formState.isSubmitting} className="w-full">
              Mentés
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Jelszó módosítása</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onPasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Jelenlegi jelszó</Label>
              <Input
                id="currentPassword"
                type="password"
                {...passwordForm.register("currentPassword")}
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Új jelszó</Label>
              <Input
                id="newPassword"
                type="password"
                {...passwordForm.register("newPassword")}
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Jelszó megerősítése</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...passwordForm.register("confirmPassword")}
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
              Jelszó módosítása
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fiók</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleLogout} variant="destructive" className="w-full">
            <LogOut className="h-4 w-4 mr-2" />
            Kijelentkezés
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
