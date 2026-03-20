# Biometrikus Hitelesítés - Telepítési Útmutató

## ✅ Implementáció Kész!

A biometrikus hitelesítés (WebAuthn) teljes mértékben implementálva és működőképes.

## 🎯 Funkciók

### Beállítások Oldalon (`/security`)
- **Biometrikus hitelesítés beállítása** gomb
- QR kód helyett böngésző natív dialógus
- Ujjlenyomat/Face ID/Windows Hello regisztráció
- Státusz megjelenítés (aktív/inaktív)

### Bejelentkezési Oldalon (`/login`)
- **"Bejelentkezés biometriával"** gomb
- E-mail cím megadása után aktív
- Automatikus ellenőrzés, hogy van-e regisztrált eszköz
- Sikeres hitelesítés után automatikus bejelentkezés

## 📦 Telepített Csomagok

```json
{
  "@simplewebauthn/server": "^10.0.0",
  "@simplewebauthn/browser": "^10.0.0"
}
```

## 🗄️ Adatbázis Módosítások

Új táblák:
- `WebAuthnCredential` - Regisztrált eszközök tárolása
- `WebAuthnChallenge` - Ideiglenes challenge-ek (5 perc lejárat)

## 🔧 VPS Telepítés

### 1. Környezeti Változók Beállítása

Szerkeszd a `.env` fájlt a VPS-en:

```bash
nano /var/www/threemail/.env
```

Add hozzá:

```env
# WebAuthn Configuration
NEXT_PUBLIC_RP_ID="yourdomain.com"
NEXT_PUBLIC_ORIGIN="https://yourdomain.com"
```

**FONTOS:** 
- `NEXT_PUBLIC_RP_ID` = domain név (pl. `bank.example.com`)
- `NEXT_PUBLIC_ORIGIN` = teljes URL HTTPS-el (pl. `https://bank.example.com`)
- **HTTPS kötelező** production-ben (localhost kivétel)

### 2. Kód Frissítése VPS-en

```bash
cd /var/www/threemail

# Kód pull
git pull origin main

# Függőségek telepítése
npm install

# Prisma migráció
npx prisma migrate deploy
npx prisma generate

# Build
npm run build

# PM2 restart
pm2 restart threemail
```

### 3. Ellenőrzés

```bash
# Logok megtekintése
pm2 logs threemail --lines 50

# Alkalmazás státusz
pm2 status
```

## 🧪 Tesztelés

### Lokális Fejlesztés

1. **Regisztráció:**
   - Jelentkezz be a fiókodba
   - Menj a `/security` oldalra
   - Kattints a "Biometrikus hitelesítés beállítása" gombra
   - Kövesd a böngésző utasításait (ujjlenyomat/Face ID)

2. **Bejelentkezés:**
   - Jelentkezz ki
   - Menj a `/login` oldalra
   - Add meg az e-mail címedet
   - Kattints a "Bejelentkezés biometriával" gombra
   - Hitelesítsd magad ujjlenyomattal/Face ID-val

### Production (VPS)

Ugyanaz, mint lokálisan, de:
- **HTTPS kötelező!**
- SSL tanúsítvány kell (Let's Encrypt)
- Domain név kell (nem működik IP címmel)

## 🌐 Böngésző Támogatás

| Böngésző | Verzió | Támogatás |
|----------|--------|-----------|
| Chrome   | 67+    | ✅ Teljes |
| Firefox  | 60+    | ✅ Teljes |
| Safari   | 13+    | ✅ Teljes |
| Edge     | 18+    | ✅ Teljes |

## 📱 Eszköz Támogatás

| Platform | Módszer |
|----------|---------|
| **macOS** | Touch ID |
| **iOS/iPadOS** | Touch ID, Face ID |
| **Windows 10+** | Windows Hello (ujjlenyomat, arc, PIN) |
| **Android 7+** | Ujjlenyomat olvasók |
| **Linux** | FIDO2 kulcsok |

## 🔒 Biztonság

### Működési Elv

1. **Regisztráció:**
   - Eszköz generál publikus/privát kulcspárt
   - Publikus kulcs → szerverre mentve
   - Privát kulcs → **soha nem hagyja el az eszközt**

2. **Bejelentkezés:**
   - Szerver küld egy challenge-t
   - Biometrikus ellenőrzés (ujjlenyomat/arc)
   - Privát kulccsal aláírás
   - Szerver ellenőrzi publikus kulccsal

### Előnyök

✅ **Ujjlenyomat/arc soha nem kerül átvitelre**  
✅ **Phishing védelem** - domain-hez kötött  
✅ **Nincs jelszó tárolás** szükséges  
✅ **Replay attack védelem**  

## 🚨 Gyakori Problémák

### "A böngésző nem támogatja"

**Megoldás:** Használj Chrome 67+, Firefox 60+, Safari 13+ vagy Edge 18+

### "Hiba a regisztráció során"

**Okok:**
1. Nem HTTPS (production-ben)
2. Hibás `NEXT_PUBLIC_RP_ID` vagy `NEXT_PUBLIC_ORIGIN`
3. Böngésző nem támogatja

**Ellenőrzés:**
```bash
# .env fájl ellenőrzése
cat .env | grep NEXT_PUBLIC

# Nginx konfiguráció (HTTPS)
sudo nginx -t
```

### "Nincs regisztrált biometrikus hitelesítés"

**Megoldás:** Először be kell állítani a `/security` oldalon

### Nem működik bejelentkezéskor

**Ellenőrzés:**
1. Van-e regisztrált eszköz az adatbázisban?
2. Ugyanaz a böngésző/eszköz?
3. HTTPS működik?

```bash
# Adatbázis ellenőrzése
npx prisma studio

# WebAuthnCredential tábla megtekintése
```

## 📊 API Végpontok

### Regisztráció
- `POST /api/webauthn/register/options` - Regisztrációs opciók
- `POST /api/webauthn/register/verify` - Regisztráció ellenőrzése

### Hitelesítés
- `POST /api/webauthn/authenticate/options` - Hitelesítési opciók
- `POST /api/webauthn/authenticate/verify` - Hitelesítés ellenőrzése

## 🔄 Frissítési Folyamat

Ha változtatásokat végzel a kódban:

```bash
# Lokálisan
git add .
git commit -m "WebAuthn updates"
git push origin main

# VPS-en
cd /var/www/threemail
git pull origin main
npm install
npx prisma generate
npm run build
pm2 restart threemail
```

## 📝 Megjegyzések

- A biometrikus adat **soha nem hagyja el az eszközt**
- Csak kriptográfiai aláírások kerülnek átvitelre
- Minden felhasználó több eszközt is regisztrálhat
- Challenge-ek 5 perc után lejárnak
- Counter alapú replay attack védelem

## ✨ Használat

### Felhasználói Folyamat

1. **Első beállítás:**
   - Bejelentkezés jelszóval
   - Beállítások → Biztonság
   - "Biometrikus hitelesítés beállítása"
   - Ujjlenyomat/Face ID szkennelés

2. **Következő bejelentkezések:**
   - Login oldal
   - E-mail megadása
   - "Bejelentkezés biometriával" gomb
   - Ujjlenyomat/Face ID → Kész!

## 🎉 Kész!

A biometrikus hitelesítés teljes mértékben működőképes és production-ready!
