# ThreeMail Bank - Setup Guide

## Gyors kezdés

### 1. Környezeti változók beállítása

Hozz létre egy `.env` fájlt a projekt gyökerében:

```bash
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
CARD_ENCRYPTION_KEY="your-32-byte-encryption-key-change-this"
```

**Fontos:** Generálj biztonságos kulcsokat production környezetben!

### 2. Függőségek telepítése

```bash
npm install
```

### 3. Adatbázis inicializálása

```bash
# Prisma kliens generálása
npm run db:generate

# Adatbázis migrációk futtatása
npm run db:migrate

# Teszt adatok betöltése (opcionális)
npm run db:seed
```

### 4. Fejlesztői szerver indítása

```bash
npm run dev
```

Nyisd meg a böngészőben: http://localhost:3000

## Teszt felhasználók (seed után)

### Admin
- Email: `admin@threemail.hu`
- Jelszó: `Admin123!`

### Normál felhasználó
- Email: `test@threemail.hu`
- Jelszó: `Test123!`

## Hasznos parancsok

```bash
# Fejlesztés
npm run dev              # Dev szerver indítása
npm run build            # Production build
npm run start            # Production szerver
npm run lint             # Kód ellenőrzés

# Adatbázis
npm run db:generate      # Prisma kliens generálása
npm run db:migrate       # Migrációk futtatása
npm run db:seed          # Teszt adatok betöltése
npm run db:studio        # Prisma Studio (adatbázis UI)
```

## Funkciók

✅ Regisztráció és bejelentkezés (NextAuth)
✅ Dashboard egyenleggel és tranzakciókkal
✅ Virtuális bankkártya kezelés (generálás, zárolás, PIN/CVV)
✅ Pénz hozzáadása (banki utalási adatok)
✅ Meghívórendszer referral kóddal
✅ Profil és jelszó kezelés
✅ Admin felület (felhasználók, egyenleg módosítás)
✅ Titkosított kártyaadatok (AES-256-GCM)
✅ Mobile-first responsive design
✅ Zöld Wise-szerű UI/UX

## Technológiai stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 3, shadcn/ui komponensek
- **Backend:** Next.js API Routes, NextAuth.js
- **Adatbázis:** SQLite (Prisma ORM)
- **Validáció:** Zod
- **Űrlapok:** React Hook Form
- **Ikonok:** Lucide React
- **Értesítések:** Sonner

## Projekt struktúra

```
threemail/
├── prisma/
│   ├── schema.prisma          # Adatbázis séma
│   └── seed.ts                # Teszt adatok
├── public/
│   └── logo.svg               # ThreeMail logó
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/           # Auth oldalak (login, register)
│   │   ├── (dashboard)/      # Védett oldalak
│   │   └── api/              # API route-ok
│   ├── components/           # React komponensek
│   │   ├── ui/              # Alap UI komponensek
│   │   ├── auth/            # Auth formok
│   │   ├── dashboard/       # Dashboard komponensek
│   │   ├── cards/           # Kártya komponensek
│   │   ├── add-money/       # Pénz hozzáadás
│   │   └── layout/          # Layout komponensek
│   ├── lib/                 # Utility könyvtárak
│   │   ├── auth.ts         # NextAuth konfig
│   │   ├── prisma.ts       # Prisma kliens
│   │   ├── crypto.ts       # Titkosítás
│   │   ├── generate.ts     # Generátorok
│   │   ├── validations.ts  # Zod sémák
│   │   └── utils.ts        # Segédfüggvények
│   ├── hooks/              # Custom React hooks
│   └── types/              # TypeScript típusok
└── package.json
```

## Biztonság

- Jelszavak bcrypt hash-eléssel tárolva
- Kártyaadatok AES-256-GCM titkosítással
- NextAuth session JWT-vel
- Környezeti változók `.env` fájlban (gitignore-olva)
- Admin jogosultság ellenőrzés

## Következő lépések

1. Állítsd be a környezeti változókat
2. Futtasd a migrációkat és seedet
3. Próbáld ki a teszt felhasználókkal
4. Customize-old a design-t igényeid szerint
5. Production környezetben használj PostgreSQL-t SQLite helyett
