export type ChatTopic = {
  id: string;
  title: string;
  description: string;
  iconName: string;
  tags: string[];
  quickNote: string;
};

export const chatTopics: ChatTopic[] = [
  {
    id: "personal-data",
    title: "Személyes adatok",
    description: "Név, cím, telefonszám vagy azonosítók frissítése",
    iconName: "UserCog",
    tags: ["adatmódosítás", "azonosítás", "KYC"],
    quickNote: "Segítünk frissíteni vagy ellenőrizni az adataidat.",
  },
  {
    id: "transactions",
    title: "Tranzakciók",
    description: "Kimenő és beérkező átutalások, kártyás fizetések",
    iconName: "Wallet",
    tags: ["jóváírás", "levonás", "kártyafizetés"],
    quickNote: "Megnézzük a kérdéses tranzakció részleteit azonnal.",
  },
  {
    id: "referrals",
    title: "Meghívások & bónusz",
    description: "Ajánlókód, meghívottak, bónusz jóváírás",
    iconName: "Gift",
    tags: ["ajánlás", "jutalom"],
    quickNote: "Segítünk, hogy minden bónuszt megkapj.",
  },
  {
    id: "conversion",
    title: "Átváltás és árfolyam",
    description: "Devizaváltás, árfolyam információk, díjak",
    iconName: "RefreshCcw",
    tags: ["árfolyam", "FX", "váltás"],
    quickNote: "Napi árfolyamok és költségek egyetlen üzenetben.",
  },
  {
    id: "security",
    title: "Biztonság",
    description: "Kártyazárolás, csalás gyanúja, incidensek",
    iconName: "ShieldCheck",
    tags: ["zárolás", "csalás", "riasztás"],
    quickNote: "Azonnali segítség, ha gyanús tevékenységet látsz.",
  },
];
