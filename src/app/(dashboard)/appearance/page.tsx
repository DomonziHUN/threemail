"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Moon, Sun, Monitor, Globe, Palette, Type } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";

export default function AppearancePage() {
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState("hu");
  const [fontSize, setFontSize] = useState("medium");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load saved preferences
    const savedLanguage = localStorage.getItem("language") || "hu";
    const savedFontSize = localStorage.getItem("fontSize") || "medium";
    setLanguage(savedLanguage);
    setFontSize(savedFontSize);
  }, []);

  const handleSave = () => {
    localStorage.setItem("language", language);
    localStorage.setItem("fontSize", fontSize);
    toast.success("Beállítások sikeresen mentve!");
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Palette className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Nyelv és Megjelenés</h1>
          <p className="text-muted-foreground">Személyre szabhatod az alkalmazás megjelenését</p>
        </div>
      </div>

      {/* Téma */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
              <Moon className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <CardTitle>Téma</CardTitle>
              <CardDescription>Válaszd ki a számodra legmegfelelőbb témát</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RadioGroup value={theme} onValueChange={setTheme}>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light" className="flex items-center gap-3 cursor-pointer flex-1">
                  <Sun className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="font-medium">Világos</p>
                    <p className="text-sm text-muted-foreground">Klasszikus világos téma</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark" className="flex items-center gap-3 cursor-pointer flex-1">
                  <Moon className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Sötét</p>
                    <p className="text-sm text-muted-foreground">Kímélő sötét téma</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="system" id="system" />
                <Label htmlFor="system" className="flex items-center gap-3 cursor-pointer flex-1">
                  <Monitor className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Rendszer</p>
                    <p className="text-sm text-muted-foreground">Automatikus váltás a rendszer beállításai szerint</p>
                  </div>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Nyelv */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
              <Globe className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <CardTitle>Nyelv</CardTitle>
              <CardDescription>Válaszd ki az alkalmazás nyelvét</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RadioGroup value={language} onValueChange={setLanguage}>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="hu" id="hu" />
                <Label htmlFor="hu" className="flex items-center gap-3 cursor-pointer flex-1">
                  <span className="text-2xl">🇭🇺</span>
                  <div>
                    <p className="font-medium">Magyar</p>
                    <p className="text-sm text-muted-foreground">Hungarian</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="en" id="en" />
                <Label htmlFor="en" className="flex items-center gap-3 cursor-pointer flex-1">
                  <span className="text-2xl">🇬🇧</span>
                  <div>
                    <p className="font-medium">English</p>
                    <p className="text-sm text-muted-foreground">Angol</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="de" id="de" />
                <Label htmlFor="de" className="flex items-center gap-3 cursor-pointer flex-1">
                  <span className="text-2xl">🇩🇪</span>
                  <div>
                    <p className="font-medium">Deutsch</p>
                    <p className="text-sm text-muted-foreground">Német</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="fr" id="fr" />
                <Label htmlFor="fr" className="flex items-center gap-3 cursor-pointer flex-1">
                  <span className="text-2xl">🇫🇷</span>
                  <div>
                    <p className="font-medium">Français</p>
                    <p className="text-sm text-muted-foreground">Francia</p>
                  </div>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Betűméret */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
              <Type className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <CardTitle>Betűméret</CardTitle>
              <CardDescription>Állítsd be a számodra legolvashatóbb betűméretet</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RadioGroup value={fontSize} onValueChange={setFontSize}>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="small" id="small" />
                <Label htmlFor="small" className="cursor-pointer flex-1">
                  <p className="font-medium text-sm">Kicsi</p>
                  <p className="text-xs text-muted-foreground">Kompakt megjelenés, több információ</p>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium" className="cursor-pointer flex-1">
                  <p className="font-medium">Közepes</p>
                  <p className="text-sm text-muted-foreground">Alapértelmezett, kiegyensúlyozott</p>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="large" id="large" />
                <Label htmlFor="large" className="cursor-pointer flex-1">
                  <p className="font-medium text-lg">Nagy</p>
                  <p className="text-base text-muted-foreground">Könnyebb olvashatóság</p>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Mentés gomb */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          Beállítások Mentése
        </Button>
      </div>

      {/* Információs panel */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Megjegyzés:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>A téma azonnal alkalmazásra kerül</li>
              <li>A nyelvi beállítások az oldal újratöltése után lépnek életbe</li>
              <li>A betűméret beállítás az egész alkalmazásra vonatkozik</li>
              <li>A beállításaid az eszközödön kerülnek tárolásra</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
