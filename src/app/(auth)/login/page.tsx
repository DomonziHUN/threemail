import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Bejelentkezés | ThreeMail Bank",
};

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Üdv újra!</h1>
        <p className="text-muted-foreground text-sm">
          Lépj be, hogy kezeld az egyenleged és a kártyáidat.
        </p>
      </div>
      <LoginForm />
      <p className="text-center text-sm text-muted-foreground">
        Nincs még fiókod? {" "}
        <Link href="/register" className="font-medium text-primary">
          Regisztrálj most
        </Link>
      </p>
    </div>
  );
}
