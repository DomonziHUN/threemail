import Link from "next/link";
import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Regisztráció | ThreeMail",
};

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Csatlakozz a ThreeMail Bankhoz</h1>
        <p className="text-sm text-muted-foreground">
          Hozz létre digitális banki fiókot percek alatt.
        </p>
      </div>
      <Suspense fallback={<div className="flex justify-center py-4 text-sm text-muted-foreground">Űrlap betöltése...</div>}>
        <RegisterForm />
      </Suspense>
      <p className="text-center text-sm text-muted-foreground">
        Már van fiókod? {" "}
        <Link href="/login" className="font-medium text-primary">
          Jelentkezz be
        </Link>
      </p>
    </div>
  );
}
