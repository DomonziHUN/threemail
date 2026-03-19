#!/bin/bash
echo "🚀 Indul a telepítés/frissítés..."

# A GitHubbal összekötött automata frissítés lépése
git pull origin master

echo "📦 Függőségek telepítése..."
npm install

echo "🗄️ Adatbázis sémák és Prisma kliens generálása..."
npx prisma generate
npx prisma migrate deploy

echo "🏗️ Next.js alkalmazás buildelése..."
npm run build

echo "🔄 PM2 folyamat újraindítása..."
pm2 reload threemail-bank --update-env || pm2 start ecosystem.config.js

echo "✅ Kész! Az alkalmazás frissítve lett."
