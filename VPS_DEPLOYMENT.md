# VPS Telepítési Lépések - Biztonság és Adatvédelem Funkciók

## Előfeltételek

- Node.js 18+ telepítve
- npm vagy yarn telepítve
- Git telepítve
- PM2 vagy hasonló process manager (opcionális, de ajánlott)

## 1. Kód Feltöltése VPS-re

```bash
# SSH kapcsolódás a VPS-hez
ssh user@your-vps-ip

# Projekt klónozása vagy feltöltése
git clone your-repo-url /var/www/threemail
cd /var/www/threemail
```

## 2. Környezeti Változók Beállítása

```bash
# .env fájl létrehozása
cp .env.example .env
nano .env
```

Szükséges környezeti változók:
```env
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="https://your-domain.com"
```

## 3. Függőségek Telepítése

```bash
# NPM csomagok telepítése
npm install

# Vagy yarn használata esetén
yarn install
```

## 4. Prisma Adatbázis Beállítása

```bash
# Prisma Client generálása
npx prisma generate

# Adatbázis migrációk futtatása
npx prisma migrate deploy

# Opcionális: Seed adatok betöltése
npm run db:seed
```

## 5. Alkalmazás Build

```bash
# Next.js production build
npm run build
```

## 6. PM2 Beállítása (Ajánlott)

```bash
# PM2 telepítése globálisan (ha még nincs)
npm install -g pm2

# Alkalmazás indítása PM2-vel
pm2 start npm --name "threemail" -- start

# PM2 automatikus újraindítás beállítása rendszerindításkor
pm2 startup
pm2 save
```

## 7. Nginx Reverse Proxy Beállítása

```bash
# Nginx telepítése (ha még nincs)
sudo apt update
sudo apt install nginx

# Nginx konfiguráció létrehozása
sudo nano /etc/nginx/sites-available/threemail
```

Nginx konfiguráció:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Konfiguráció engedélyezése
sudo ln -s /etc/nginx/sites-available/threemail /etc/nginx/sites-enabled/

# Nginx újraindítása
sudo nginx -t
sudo systemctl restart nginx
```

## 8. SSL Tanúsítvány Telepítése (Let's Encrypt)

```bash
# Certbot telepítése
sudo apt install certbot python3-certbot-nginx

# SSL tanúsítvány beszerzése
sudo certbot --nginx -d your-domain.com

# Automatikus megújítás tesztelése
sudo certbot renew --dry-run
```

## 9. Tűzfal Beállítása

```bash
# UFW tűzfal engedélyezése
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

## 10. Biztonsági Ellenőrzések

### Adatbázis Jogosultságok
```bash
# SQLite adatbázis fájl jogosultságok
chmod 600 /var/www/threemail/prisma/dev.db
chown www-data:www-data /var/www/threemail/prisma/dev.db
```

### .env Fájl Védelme
```bash
chmod 600 /var/www/threemail/.env
chown www-data:www-data /var/www/threemail/.env
```

## 11. Monitoring és Logging

```bash
# PM2 logok megtekintése
pm2 logs threemail

# PM2 monit
pm2 monit

# Nginx logok
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 12. Frissítések Telepítése

```bash
# Kód frissítése
cd /var/www/threemail
git pull origin main

# Függőségek frissítése
npm install

# Prisma migrációk
npx prisma migrate deploy
npx prisma generate

# Újra build
npm run build

# PM2 restart
pm2 restart threemail
```

## Speciális Beállítások a Biztonság Funkcióhoz

### 2FA QR Kód Generálás
A `speakeasy` és `qrcode` csomagok már telepítve vannak a függőségekkel.

### Session Management
A munkamenet kezeléshez győződj meg róla, hogy:
- NextAuth megfelelően van konfigurálva
- Session tárolás működik (alapértelmezetten JWT)

### Rate Limiting (Opcionális, de ajánlott)

Nginx rate limiting a 2FA végpontokhoz:
```nginx
# /etc/nginx/nginx.conf
http {
    limit_req_zone $binary_remote_addr zone=2fa:10m rate=5r/m;
    
    # ...
}

# /etc/nginx/sites-available/threemail
location /api/user/2fa {
    limit_req zone=2fa burst=2;
    proxy_pass http://localhost:3000;
    # ... többi proxy beállítás
}
```

## Troubleshooting

### Alkalmazás nem indul
```bash
# PM2 logok ellenőrzése
pm2 logs threemail --lines 100

# Port foglaltság ellenőrzése
sudo netstat -tlnp | grep :3000
```

### Adatbázis hiba
```bash
# Prisma kapcsolat tesztelése
npx prisma db push

# Migrációk állapota
npx prisma migrate status
```

### 2FA nem működik
```bash
# Ellenőrizd a környezeti változókat
cat .env | grep NEXTAUTH

# Prisma Client újragenerálása
npx prisma generate

# Alkalmazás újraindítása
pm2 restart threemail
```

## Teljesítmény Optimalizálás

### Node.js Memória Limit
```bash
# PM2 indítás memória limittel
pm2 start npm --name "threemail" -- start --max-memory-restart 500M
```

### Nginx Caching
```nginx
# Static fájlok cache-elése
location /_next/static {
    proxy_pass http://localhost:3000;
    proxy_cache_valid 200 60m;
    add_header Cache-Control "public, immutable";
}
```

## Backup Stratégia

```bash
# Adatbázis backup script
#!/bin/bash
BACKUP_DIR="/var/backups/threemail"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cp /var/www/threemail/prisma/dev.db $BACKUP_DIR/db_backup_$DATE.db

# Régi backupok törlése (30 napnál régebbiek)
find $BACKUP_DIR -name "db_backup_*.db" -mtime +30 -delete
```

Cron job beállítása:
```bash
# Crontab szerkesztése
crontab -e

# Napi backup 2:00-kor
0 2 * * * /path/to/backup-script.sh
```

## Ellenőrzési Lista

- [ ] Node.js és npm telepítve
- [ ] Projekt feltöltve VPS-re
- [ ] .env fájl beállítva
- [ ] Függőségek telepítve
- [ ] Prisma migrációk lefuttatva
- [ ] Production build elkészítve
- [ ] PM2 beállítva és fut
- [ ] Nginx reverse proxy konfigurálva
- [ ] SSL tanúsítvány telepítve
- [ ] Tűzfal beállítva
- [ ] Fájl jogosultságok ellenőrizve
- [ ] Monitoring beállítva
- [ ] Backup stratégia implementálva
- [ ] Biztonság funkciók tesztelve

## Hasznos Parancsok

```bash
# Alkalmazás státusz
pm2 status

# Alkalmazás újraindítása
pm2 restart threemail

# Logok valós időben
pm2 logs threemail --lines 50

# Nginx újratöltése
sudo systemctl reload nginx

# Rendszer erőforrások
htop
df -h
free -m
```
