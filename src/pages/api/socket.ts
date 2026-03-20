import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as HTTPServer } from "http";
import type { Socket as NetSocket } from "net";
import { Server as IOServer, Socket as IOSocket } from "socket.io";
import { randomUUID } from "crypto";

interface ChatPayload {
  topic: string;
  text: string;
  author?: "user" | "support";
}

interface JoinTopicPayload {
  topic: string;
  topicTitle: string;
  user: { id: string; fullName: string };
}

interface ServerWithIO extends HTTPServer {
  io?: IOServer;
}

interface SocketWithServer extends NetSocket {
  server: ServerWithIO;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

const chatHistory = new Map<string, any[]>();

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const socket = res.socket as SocketWithServer | undefined;
  if (!socket?.server) {
    res.status(500).json({ error: "Socket server not available" });
    return;
  }

  if (!socket.server.io) {
    console.log("Initializing Socket.IO server...");
    const io = new IOServer(socket.server, {
      path: "/api/socket",
      transports: ["polling", "websocket"],
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
      allowEIO3: true,
    });
    socket.server.io = io;

    io.on("connection", (client: IOSocket) => {
      console.log("Client connected:", client.id);

      client.on("join_topic", ({ topic, topicTitle, user }: JoinTopicPayload) => {
        console.log(`Client ${client.id} joining topic: ${topic}`);
        client.join(topic);
        const history = chatHistory.get(topic) || [];
        if (history.length) {
          client.emit("chat_history", history);
        }
      });

      client.on("admin_join_topic", ({ topic, adminName }: { topic: string; adminName: string }) => {
        console.log(`Admin ${adminName} joining topic: ${topic}`);
        client.join(topic);
        const history = chatHistory.get(topic) || [];
        client.emit("chat_history", history);
      });

      client.on("chat_message", (payload: ChatPayload & { operator?: string }) => {
        if (!payload?.topic || !payload?.text) return;
        const entry = {
          id: randomUUID(),
          author: payload.author ?? "user",
          operator: payload.operator,
          text: payload.text,
          topic: payload.topic,
          timestamp: new Date().toISOString(),
        };
        const history = chatHistory.get(payload.topic) || [];
        chatHistory.set(payload.topic, [...history, entry]);
        io.to(payload.topic).emit("chat_message", entry);

        // Only send automatic reply on first user message
        if (entry.author === "user") {
          const userMessages = history.filter((msg: any) => msg.author === "user");
          
          if (userMessages.length === 0) {
            // This is the first user message
            setTimeout(() => {
              const supportEntry = {
                id: randomUUID(),
                author: "support" as const,
                operator: "Ügyfélszolgálat",
                text: "Köszönjük az üzeneted! Kérlek írd le részletesen a problémádat, és egy ügyintézőnk hamarosan válaszol.",
                topic: payload.topic,
                timestamp: new Date().toISOString(),
              };
              const updated = chatHistory.get(payload.topic) || [];
              chatHistory.set(payload.topic, [...updated, supportEntry]);
              io.to(payload.topic).emit("chat_message", supportEntry);
            }, 800);
          }
          // No automatic reply for subsequent messages - admin will respond manually
        }
      });
    });
  }

  res.end();
}

const agents = ["Viktória", "Patrik", "Dóra", "Marcell", "Csilla"];

function pickRandomAgent() {
  return agents[Math.floor(Math.random() * agents.length)];
}

function generateReply(text: string) {
  const templates = [
    "Megnézem helyetted a részleteket, egy pillanat...",
    "Köszönjük az információt! Már dolgozunk rajta.",
    "Ha szeretnéd, rögtön tudunk intézkedni.",
    "Felvettem a kérésedet, hamarosan visszajelzek.",
  ];
  return templates[Math.floor(Math.random() * templates.length)] +
    (text.length > 60 ? "" : "" + "");
}
