import { requireAuth } from "@/lib/auth-guard";
import { notFound } from "next/navigation";
import { chatTopics } from "@/lib/chat-topics";
import { ChatWindow } from "@/components/chat/chat-window";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Chat | Threemail",
};

interface ChatTopicPageProps {
  params: Promise<{
    topicId: string;
  }>;
}

export default async function ChatTopicPage({ params }: ChatTopicPageProps) {
  const user = await requireAuth();
  const { topicId } = await params;
  const topic = chatTopics.find((t) => t.id === topicId);

  if (!topic) {
    notFound();
  }

  return (
    <div className="py-6 space-y-4">
      <Link
        href="/chat"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Vissza a témákhoz
      </Link>

      <ChatWindow
        user={{
          id: user.id,
          fullName: user.fullName || user.name || "Felhasználó",
        }}
        topic={topic}
      />
    </div>
  );
}
