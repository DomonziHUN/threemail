import type { LucideIcon } from "lucide-react";
import {
  UserCog,
  Wallet,
  Gift,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";

export type ChatTopic = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tags: string[];
  quickNote: string;
};

export const chatTopics: ChatTopic[] = [
  {
    id: "personal-data",
    title: "Személyes adatok",
    description: "Név, cím, telefonszám vagy azonosítók frissítése",
    icon: UserCog,
    tags: ["adatmódosítás", "azonosítás", "KYC"],
    quickNote: "Segítünk frissíteni vagy ellenőrizni az adataidat.",
  },
  {
    id: "transactions",
    title: "Tranzakciók",
    description: "Kimenő és beérkező átutalások, kártyás fizetések",
    icon: Wallet,
    tags: ["jóváírás", "levonás", "kártyafizetés"],
    quickNote: "Megnézzük a kérdéses tranzakció részleteit azonnal.",
  },
  {
    id: "referrals",
    title: "Meghívások & bónusz",
    description: "Ajánlókód, meghívottak, bónusz jóváírás",
    icon: Gift,
    tags: ["ajánlás", "jutalom"],
    quickNote: "Segítünk, hogy minden bónuszt megkapj.",
  },
  {
    id: "conversion",
    title: "Átváltás és árfolyam",
    description: "Devizaváltás, árfolyam információk, díjak",
    icon: RefreshCcw,
    tags: ["árfolyam", "FX", "váltás"],
    quickNote: "Napi árfolyamok és költségek egyetlen üzenetben.",
  },
  {
    id: "security",
    title: "Biztonság",
    description: "Kártyazárolás, csalás gyanúja, incidensek",
    icon: ShieldCheck,
    tags: ["zárolás", "csalás", "riasztás"],
    quickNote: "Azonnali segítség, ha gyanús tevékenységet látsz.",
  },
];
