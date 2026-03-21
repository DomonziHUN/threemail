# Email Verification Setup Guide

## Zoho Mail Configuration

Az email megerősítési rendszer a Zoho Mail SMTP szerverét használja.

### 1. Zoho Mail Beállítások

A `.env` fájlban add meg a Zoho Mail jelszavadat:

```env
SMTP_HOST="smtp.zoho.eu"
SMTP_PORT="465"
SMTP_USER="support@threemail.fun"
SMTP_PASSWORD="your-zoho-mail-password-here"
SMTP_FROM="support@threemail.fun"
```

### 2. Zoho Mail App Password (Ajánlott)

Biztonsági okokból ajánlott App Password használata:

1. Jelentkezz be a Zoho Mail fiókba
2. Menj a **Settings** > **Security** > **App Passwords** menüpontra
3. Generálj egy új App Password-öt "ThreeMail App" néven
4. Másold be a generált jelszót a `.env` fájlba az `SMTP_PASSWORD` értékéhez

### 3. Funkciók

#### Regisztráció után:
- ✅ Automatikus bejelentkeztetés
- ✅ Email megerősítő link küldése a `support@threemail.fun` címről
- ✅ Felhasználó átirányítása a dashboardra

#### Email megerősítés:
- A felhasználó kap egy emailt a megerősítő linkkel
- A linkre kattintva megerősíti az email címét
- A személyes adatok oldalon látható a megerősítés státusza

#### Lakcím lezárás:
- Ha a felhasználó először megadja a teljes lakcímét (ország, város, utca, irányítószám), az automatikusan lezáródik
- Lezárt lakcím többé nem módosítható biztonsági okokból
- A beállítások oldalon jelezve van, ha a lakcím le van zárva

### 4. API Végpontok

- `POST /api/auth/register` - Regisztráció és email küldés
- `GET /api/auth/verify-email?token=...` - Email megerősítés
- `POST /api/auth/resend-verification` - Megerősítő email újraküldése
- `GET /api/user/profile` - Profil lekérése (emailVerified, addressLocked mezőkkel)
- `PATCH /api/user/profile` - Profil frissítése (lakcím lezárással)

### 5. Tesztelés

1. Regisztrálj egy új felhasználót
2. Ellenőrizd, hogy automatikusan be vagy-e jelentkeztetve
3. Nézd meg az email fiókot a megerősítő emailért
4. Kattints a megerősítő linkre
5. Ellenőrizd a beállítások oldalon, hogy "Megerősítve" jelenik-e meg
6. Add meg a lakcímet és mentsd el
7. Próbáld meg újra módosítani - nem fog menni

### 6. Hibaelhárítás

Ha az email nem érkezik meg:
- Ellenőrizd a `.env` fájlban az SMTP beállításokat
- Nézd meg a szerver konzolt az email küldési hibákért
- Ellenőrizd a Zoho Mail spam mappát
- Használj App Password-öt a normál jelszó helyett
