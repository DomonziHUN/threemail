import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ChatLauncher } from "@/components/chat/chat-launcher";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto w-full flex min-h-screen max-w-md flex-col bg-background shadow-2xl xl:border-x border-border/40">
      <Header user={session.user as any} />
      <main className="flex-1 px-5 pb-24 overflow-x-hidden">{children}</main>
      <BottomNav />
      <ChatLauncher />
    </div>
  );
}
