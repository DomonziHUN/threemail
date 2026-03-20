import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as HTTPServer } from "http";
import type { Socket } from "net";
import { Server as IOServer } from "socket.io";
import { randomUUID } from "crypto";

interface ChatPayload {
  topic: string;
  text: string;
  author?: "user" | "support";
}

interface ServerWithIO extends HTTPServer {
  io?: IOServer;
}

interface SocketWithServer extends Socket {
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
  if (!socket) {
    res.status(500).end();
    return;
  }

  if (!socket.server.io) {
    const io = new IOServer(socket.server, {
      path: "/api/socket",
      transports: ["websocket", "polling"],
    });
    socket.server.io = io;

    io.on("connection", (client) => {
      client.on("join_topic", ({ topic, topicTitle, user }) => {
        client.join(topic);
        const history = chatHistory.get(topic) || [];
        if (history.length) {
          client.emit("chat_history", history);
        }
        const welcome = {
          id: randomUUID(),
          author: "support",
          operator: "Ügyfélszolgálat",
          text: `Kapcsolódtál a(z) ${topicTitle} témához. Adj meg részleteket, segítünk!`,
          timestamp: new Date().toISOString(),
        };
        chatHistory.set(topic, [...history, welcome]);
        client.emit("system_message", welcome);
      });

      client.on("chat_message", (payload: ChatPayload) => {
        if (!payload?.topic || !payload?.text) return;
        const entry = {
          id: randomUUID(),
          author: payload.author ?? "user",
          text: payload.text,
          topic: payload.topic,
          timestamp: new Date().toISOString(),
        };
        const history = chatHistory.get(payload.topic) || [];
        chatHistory.set(payload.topic, [...history, entry]);
        io.to(payload.topic).emit("chat_message", entry);

        if (entry.author === "user") {
          setTimeout(() => {
            const supportEntry = {
              id: randomUUID(),
              author: "support" as const,
              operator: pickRandomAgent(),
              text: generateReply(payload.text),
              topic: payload.topic,
              timestamp: new Date().toISOString(),
            };
            const updated = chatHistory.get(payload.topic) || [];
            chatHistory.set(payload.topic, [...updated, supportEntry]);
            io.to(payload.topic).emit("chat_message", supportEntry);
          }, 1200 + Math.random() * 1500);
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
