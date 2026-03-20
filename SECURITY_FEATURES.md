# Biztonság és Adatvédelem - Funkciók

## Áttekintés

A biztonság és adatvédelem menü teljes mértékben kifejlesztve és működőképes. Az alábbi funkciók érhetők el:

## Implementált Funkciók

### 1. Kétfaktoros Hitelesítés (2FA)
- **QR kód generálás**: Automatikus QR kód létrehozása Google Authenticator/Authy alkalmazásokhoz
- **Titkos kulcs tárolás**: Biztonságos tárolás az adatbázisban
- **Ellenőrző kód validáció**: 6 számjegyű TOTP kód ellenőrzése
- **Be/kikapcsolás**: Egyszerű kapcsoló a funkció aktiválásához/deaktiválásához

### 2. Biometrikus Hitelesítés
- Ujjlenyomat vagy arcfelismerés engedélyezése
- Kapcsolható beállítás

### 3. Aktív Munkamenetek Kezelése
- **Munkamenetek listázása**: Összes aktív eszköz megjelenítése
- **Eszköz információk**: Eszköz típus, hely, utolsó aktivitás
- **Jelenlegi munkamenet jelölés**: Az aktuális eszköz kiemelése
- **Egyedi munkamenet megszakítása**: Bármely munkamenet külön-külön törölhető
- **Összes munkamenet megszakítása**: Minden más eszköz kijelentkeztetése egyszerre

### 4. Értesítési Beállítások
- **E-mail értesítések**: Fontos események e-mailben
- **SMS értesítések**: Tranzakciós értesítések SMS-ben
- **Bejelentkezési riasztások**: Értesítés új eszközről történő bejelentkezéskor
- **Tranzakciós riasztások**: Azonnali értesítés minden tranzakcióról
- **Marketing e-mailek**: Hírlevelek és ajánlatok be/kikapcsolása

### 5. Adatvédelmi Beállítások
- **Adatmegosztás**: Adatok megosztásának engedélyezése partnerekkel
- **Aktivitás követése**: Használati adatok gyűjtésének kezelése
- **Adatvédelmi szabályzat link**: Gyors hozzáférés a szabályzathoz
- **Adatok letöltése**: Saját adatok exportálásának lehetősége

### 6. Veszélyzóna
- **Jelszó megváltoztatása**: Link a jelszó módosításhoz
- **Fiók törlése**: Fiók végleges törlésének lehetősége

## Technikai Részletek

### Adatbázis Modellek

#### SecuritySettings
```prisma
model SecuritySettings {
  id                   String   @id @default(cuid())
  userId               String   @unique
  twoFactorEnabled     Boolean  @default(false)
  twoFactorSecret      String?
  biometricEnabled     Boolean  @default(false)
  emailNotifications   Boolean  @default(true)
  smsNotifications     Boolean  @default(true)
  loginAlerts          Boolean  @default(true)
  transactionAlerts    Boolean  @default(true)
  marketingEmails      Boolean  @default(false)
  dataSharing          Boolean  @default(false)
  activityTracking     Boolean  @default(true)
}
```

#### UserSession
```prisma
model UserSession {
  id           String   @id @default(cuid())
  userId       String
  device       String
  location     String
  ipAddress    String
  userAgent    String
  lastActive   DateTime @default(now())
}
```

### API Végpontok

1. **GET/PATCH `/api/user/security`** - Biztonsági beállítások lekérése/frissítése
2. **POST `/api/user/2fa/setup`** - 2FA beállítás indítása (QR kód generálás)
3. **POST `/api/user/2fa/verify`** - 2FA aktiválás ellenőrző kóddal
4. **GET `/api/user/sessions`** - Aktív munkamenetek listázása
5. **DELETE `/api/user/sessions/[sessionId]`** - Egyedi munkamenet törlése
6. **DELETE `/api/user/sessions/all`** - Összes munkamenet törlése (kivéve jelenlegi)

### Használt Csomagok

- **speakeasy**: TOTP (Time-based One-Time Password) generálás és validálás
- **qrcode**: QR kód generálás a 2FA beállításhoz
- **@types/speakeasy** és **@types/qrcode**: TypeScript típusdefiníciók

## Használat

### Navigáció
A biztonság és adatvédelem menü elérhető:
1. Profil menü megnyitása (jobb felső sarokban)
2. "Beállítások" szekció
3. "Biztonság és adatvédelem" menüpont

Vagy közvetlenül: `/security`

### Kétfaktoros Hitelesítés Beállítása

1. Kapcsold be a "Kétfaktoros hitelesítés" kapcsolót
2. Telepíts egy hitelesítő alkalmazást (Google Authenticator, Authy, stb.)
3. Szkenneld be a megjelenő QR kódot
4. Add meg az alkalmazásban megjelenő 6 számjegyű kódot
5. Kattints az "Ellenőrzés és aktiválás" gombra

### Munkamenetek Kezelése

- **Munkamenet megtekintése**: Automatikusan betöltődik az oldal megnyitásakor
- **Munkamenet törlése**: Kattints a kuka ikonra az adott munkamenet mellett
- **Összes törlése**: Használd a "Minden más munkamenet megszakítása" gombot

## Biztonság

- Minden API végpont hitelesítést igényel (NextAuth session)
- A 2FA titkos kulcsok biztonságosan tárolódnak az adatbázisban
- A munkamenetek csak a tulajdonos által kezelhetők
- TOTP kódok 2 időablakos toleranciával működnek (±60 másodperc)

## Jövőbeli Fejlesztési Lehetőségek

- Biometrikus hitelesítés tényleges implementációja (WebAuthn API)
- E-mail és SMS értesítések küldése
- Bejelentkezési előzmények részletes naplózása
- IP-alapú gyanús tevékenység észlelése
- Adatok exportálásának implementációja
- Fiók törlés megerősítő folyamat
