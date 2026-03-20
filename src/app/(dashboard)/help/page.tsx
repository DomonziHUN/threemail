import Link from "next/link";
import { requireAuth } from "@/lib/auth-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, Shield, Info, BookOpen } from "lucide-react";
import { LiveChat } from "@/components/help/live-chat";

const faqItems = [
  {
    question: "Hogyan tudok pénzt hozzáadni a számlámhoz?",
    answer:
      "A Pénz hozzáadása oldalon megtalálod a banki adatainkat. Utald át az összeget az egyedi közlemény megadásával.",
  },
  {
    question: "Hol találom a virtuális kártyám adatait?",
    answer:
      "A Kártyák menüben megtekintheted a kártyaszámot, a PIN kódot és a CVV-t, illetve kezelheted a limiteket.",
  },
  {
    question: "Mit tegyek, ha gyanús tranzakciót látok?",
    answer:
      "Azonnal zárold a kártyád a Kártyák oldalon, majd vedd fel velünk a kapcsolatot a support@threemail.hu címen.",
  },
];

export const metadata = {
  title: "Segítség | ThreeMail Bank",
};

export default async function HelpPage() {
  await requireAuth();

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-bold">Segítség és támogatás</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Vedd fel velünk a kapcsolatot, vagy keresd meg a választ a gyakori kérdések között.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kapcsolatfelvétel</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">E-mail támogatás</p>
              <p className="text-sm text-muted-foreground">support@threemail.hu</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="mailto:support@threemail.hu">Írok</Link>
            </Button>
          </div>
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-full bg-primary/20 p-2 text-primary">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Live chat támogatás</p>
                <p className="text-sm text-muted-foreground">Azonnali segítség 8:00 - 22:00 között</p>
              </div>
            </div>
            <LiveChat />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <Shield className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Biztonság</CardTitle>
          </CardHeader>
          <CardContent>
            Kétlépcsős védelem, valós idejű értesítések és azonnali kártyazárolás segít megvédeni a fiókodat.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Info className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Útmutató</CardTitle>
          </CardHeader>
          <CardContent>
            Az első lépésekhez részletes súgó áll rendelkezésre, hogy könnyedén kihasználhasd a platformunk funkcióit.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <BookOpen className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Dokumentáció</CardTitle>
          </CardHeader>
          <CardContent>
            Lekérheted számlakivonataidat, visszaolvashatod értesítéseidet, és megnézheted a korábbi kommunikációt.
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gyakori kérdések</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqItems.map((faq) => (
            <div key={faq.question} className="rounded-2xl border border-border/80 p-4">
              <p className="font-semibold">{faq.question}</p>
              <p className="text-sm text-muted-foreground mt-2">{faq.answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
