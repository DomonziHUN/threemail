# Live Chat Setup Guide

A ThreeMail Bank alkalmazás most már tartalmaz egy valós idejű Socket.IO alapú live chat rendszert.

## Telepítés

### 1. Függőségek telepítése

```bash
npm install
```

Ez telepíti a következő új csomagokat:
- `socket.io` - Socket.IO szerver
- `socket.io-client` - Socket.IO kliens
- `framer-motion` - Animációk a floating chat gombhoz

### 2. Környezeti változók

Nincs szükség új környezeti változókra. A meglévő `.env` fájl elegendő.

### 3. Build és indítás

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

## Működés

### Felhasználói élmény

1. **Floating Chat Gomb**: Minden dashboard oldalon megjelenik egy zöld lebegő gomb a jobb alsó sarokban.

2. **Chat Oldal** (`/chat`): 
   - Témaválasztó kártyák (Személyes adatok, Tranzakciók, Meghívások, Átváltás, Biztonság)
   - Minden témához tartozik ikon, leírás és gyors címkék

3. **Chat Ablak**:
   - Valós idejű Socket.IO kapcsolat
   - Ügyintéző avatárok és nevek
   - Gépelés indikátor
   - Automatikus görgetés
   - Enter = küldés, Shift+Enter = új sor

### Technikai részletek

**Backend:**
- `src/pages/api/socket.ts` - Socket.IO API route (Next.js Pages API)
- Memóriában tárolt chat history (topic alapján)
- Automatikus support válaszok random ügyintézőktől

**Frontend:**
- `src/components/chat/chat-window.tsx` - Socket.IO kliens komponens
- `src/components/chat/chat-interface.tsx` - Témaválasztó UI
- `src/components/chat/chat-launcher.tsx` - Floating gomb
- `src/lib/chat-topics.ts` - Témák konfigurációja

**Routing:**
- `/chat` - Chat oldal (dashboard layout alatt)
- `/api/socket` - Socket.IO endpoint

## VPS Deployment

### GitHub → VPS workflow

1. **Push a GitHub-ra:**
```bash
git add .
git commit -m "Add live chat with Socket.IO"
git push origin main
```

2. **VPS-en pull és build:**
```bash
cd /var/www/threemail
git pull origin main
npm install
npm run build
pm2 restart threemail
```

### PM2 konfiguráció

Ha még nincs PM2 setup, hozd létre az `ecosystem.config.js` fájlt:

```javascript
module.exports = {
  apps: [{
    name: 'threemail',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/threemail',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

Indítás:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Nginx konfiguráció

Socket.IO-hoz szükséges WebSocket támogatás:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/socket {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Nginx újraindítás:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Tesztelés

1. Indítsd el az alkalmazást: `npm run dev`
2. Jelentkezz be a dashboardra
3. Kattints a zöld "Live chat" gombra jobb alul
4. Válassz egy témát
5. Írj egy üzenetet és nyomj Enter-t
6. ~1-3 másodperc múlva érkezik egy automatikus válasz

## Testreszabás

### Új témák hozzáadása

Szerkeszd: `src/lib/chat-topics.ts`

```typescript
{
  id: "new-topic",
  title: "Új téma",
  description: "Leírás",
  icon: IconComponent,
  tags: ["címke1", "címke2"],
  quickNote: "Gyors megjegyzés",
}
```

### Support válaszok módosítása

Szerkeszd: `src/pages/api/socket.ts` → `generateReply()` függvény

### Ügyintézők nevei

Szerkeszd: `src/pages/api/socket.ts` → `agents` tömb

## Hibakeresés

**Socket.IO nem kapcsolódik:**
- Ellenőrizd, hogy a Next.js szerver fut-e
- Nézd meg a böngésző konzolt (F12)
- Ellenőrizd a Network tab-ot WebSocket kapcsolatokért

**TypeScript hibák:**
- Futtasd: `npm install` (telepíti a socket.io type definíciókat)
- Ha továbbra is hibák vannak, próbáld: `npm run build`

**Production build hibák:**
- Socket.IO Pages API route-ot használ (nem App Router API)
- Győződj meg róla, hogy a `src/pages/api/socket.ts` létezik

## Jövőbeli fejlesztések

- [ ] Valódi admin dashboard chat kezeléshez
- [ ] Chat history mentése adatbázisba
- [ ] Fájl feltöltés támogatás
- [ ] Push értesítések új üzenetekről
- [ ] Chat szoba archiválás
- [ ] Ügyintéző státusz kezelés (online/offline/busy)
