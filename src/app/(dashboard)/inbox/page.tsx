import { requireAuth } from "@/lib/auth-guard";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const demoMessages = [
  {
    id: "1",
    subject: "Tranzakció jóváhagyva",
    preview: "A 12 500 Ft összegű kártyás vásárlás sikeresen feldolgozva.",
    createdAt: new Date(),
    category: "Tranzakció",
    unread: true,
  },
  {
    id: "2",
    subject: "Pénz érkezett a számládra",
    preview: "25 000 Ft jóváírás érkezett a számládra. Köszönjük!",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    category: "Jóváírás",
    unread: false,
  },
  {
    id: "3",
    subject: "Kártya limitek frissítve",
    preview: "Az új napi limit: 300 000 Ft.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    category: "Beállítás",
    unread: false,
  },
];

export const metadata = {
  title: "Beérkezett üzenetek | ThreeMail Bank",
};

export default async function InboxPage() {
  await requireAuth();

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-bold">Beérkezett üzenetek</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Itt találod a fiókoddal kapcsolatos értesítéseket és üzeneteket.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Értesítések</CardTitle>
          <p className="text-sm text-muted-foreground">
            A legutóbbi események összefoglalója
          </p>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {demoMessages.map((message) => (
            <div key={message.id} className="flex gap-4 py-4">
              <div className="flex flex-col items-center gap-1">
                <Badge variant={message.unread ? "default" : "outline"}>
                  {message.category}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDate(message.createdAt)}
                </span>
              </div>
              <div className="flex-1">
                <p className={`font-semibold ${message.unread ? "text-primary" : ""}`}>
                  {message.subject}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {message.preview}
                </p>
              </div>
              {message.unread && (
                <span className="h-2 w-2 rounded-full bg-primary inline-block mt-2" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
