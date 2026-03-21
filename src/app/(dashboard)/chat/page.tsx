import { requireAuth } from "@/lib/auth-guard";
import { ChatInterface } from "@/components/chat/chat-interface";
import { chatTopics } from "@/lib/chat-topics";

export const metadata = {
  title: "Live Chat | Threemail",
};

export default async function ChatPage() {
  await requireAuth();

  return (
    <div className="py-6">
      <ChatInterface topics={chatTopics} />
    </div>
  );
}
