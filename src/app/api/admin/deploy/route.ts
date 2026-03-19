import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { exec } from "child_process";

export async function POST() {
  try {
    // Only allow admins to trigger deploy
    await requireAdmin();

    // Trigger the deploy script in the background
    // We don't await the promise completely because the server will restart and drop the connection.
    // So we just launch it, and return a success message instantly to the client.
    exec("chmod +x /var/www/threemail/deploy.sh && cd /var/www/threemail && ./deploy.sh", (error, stdout, stderr) => {
      // The process will be killed halfway by PM2 restart, so this callback might not even finish.
      if (error) {
        console.error("Deploy script error:", error);
      }
    });

    return NextResponse.json({ message: "Frissítés megkezdve! A szerver másodperceken belül újraindul." });
  } catch (error) {
    if ((error as Error).message === "NOT_AUTHENTICATED" || (error as Error).message === "NOT_AUTHORIZED") {
      return NextResponse.json({ message: "Nincs jogosultságod!" }, { status: 403 });
    }
    return NextResponse.json({ message: "Szerver hiba" }, { status: 500 });
  }
}
