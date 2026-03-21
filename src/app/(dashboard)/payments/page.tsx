import { Clock } from "lucide-react";

export const metadata = {
  title: "Fizetések | Threemail",
};

export default function PaymentsPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center py-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="rounded-full bg-muted p-6">
            <Clock className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Hamarosan</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            A fizetési funkciók jelenleg fejlesztés alatt állnak. Hamarosan elérhető lesz!
          </p>
        </div>
      </div>
    </div>
  );
}
