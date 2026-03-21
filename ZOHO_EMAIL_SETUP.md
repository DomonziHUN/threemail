# Zoho Mail Avatar és Spam Megelőzés

## Miért megy az email spamba?

### 1. **SPF és DKIM beállítások hiánya**
A domain-ednek (`threemail.fun`) nincs megfelelően beállítva az SPF és DKIM rekordja.

### Megoldás: DNS beállítások

Menj a domain szolgáltatódhoz (ahol a `threemail.fun` domain van) és add hozzá ezeket a DNS rekordokat:

#### SPF Record (TXT)
```
Név: @
Típus: TXT
Érték: v=spf1 include:zoho.eu ~all
```

#### DKIM Record (TXT)
1. Menj a Zoho Mail Admin Console-ba: https://mailadmin.zoho.eu
2. Email Configuration → Domains → threemail.fun
3. DKIM → Generate DKIM Key
4. Másold ki a generált DKIM kulcsot
5. Add hozzá a DNS-hez:
```
Név: zoho._domainkey
Típus: TXT
Érték: [a Zoho által generált kulcs]
```

#### DMARC Record (opcionális, de ajánlott)
```
Név: _dmarc
Típus: TXT
Érték: v=DMARC1; p=none; rua=mailto:support@threemail.fun
```

### 2. **Email Header javítások**

Az email-ben már hozzáadtam:
- ✅ Proper From name: `ThreeMail <support@threemail.fun>`
- ✅ Reply-To header
- ✅ X-Mailer header
- ✅ Priority headers

---

## Zoho Avatar (Profilkép) Beállítása

### Módszer 1: Zoho Mail Settings (Ajánlott)

1. **Jelentkezz be a Zoho Mail-be**: https://mail.zoho.eu
2. **Settings (Beállítások)** → Jobb felső sarokban a fogaskerék ikon
3. **Mail Settings** → **From Address**
4. Válaszd ki a `support@threemail.fun` címet
5. **Profile Picture** → **Upload Image**
6. Tölts fel egy képet (ajánlott méret: 200x200px, max 5MB)
7. **Save**

### Módszer 2: Zoho Account Profile Picture

1. Menj a Zoho Account beállításokhoz: https://accounts.zoho.eu
2. **Profile** → **Profile Picture**
3. Tölts fel egy képet
4. Ez automatikusan megjelenik minden Zoho szolgáltatásban

### Módszer 3: Gravatar (ha működik)

1. Menj a https://gravatar.com oldalra
2. Regisztrálj a `support@threemail.fun` email címmel
3. Tölts fel profilképet
4. Várj 15-30 percet a cache frissülésére

**Megjegyzés:** A Gravatar nem mindig működik Zoho Mail-lel, ezért az 1. vagy 2. módszer ajánlott.

---

## Email Teszt

Miután beállítottad a DNS rekordokat (SPF, DKIM):

1. **Várj 24-48 órát** a DNS propagációra
2. Tesztelj egy emailt: https://www.mail-tester.com
3. Küldj egy tesztemailt a megadott címre
4. Ellenőrizd a pontszámot (10/10 a cél)

### Gyors teszt parancsok (szerveren):

```bash
# SPF ellenőrzés
dig TXT threemail.fun +short

# DKIM ellenőrzés
dig TXT zoho._domainkey.threemail.fun +short
```

---

## Spam elkerülése - Checklist

- [ ] SPF rekord hozzáadva
- [ ] DKIM rekord hozzáadva
- [ ] DMARC rekord hozzáadva (opcionális)
- [ ] Zoho domain verified
- [ ] Avatar/profilkép beállítva
- [ ] Email headers rendben (már kész)
- [ ] Tesztmail 10/10 pontszám

---

## Gyakori hibák

### "Email goes to spam even with SPF/DKIM"
- Ellenőrizd, hogy a DNS rekordok propagálódtak-e (24-48 óra)
- Használj email authentication checker-t: https://mxtoolbox.com/spf.aspx

### "Avatar nem jelenik meg"
- Töröld a böngésző cache-t
- Várj 15-30 percet
- Próbáld meg inkább a Zoho Mail Settings-ben feltölteni

### "DKIM verification failed"
- Ellenőrizd, hogy a DKIM kulcs pontosan úgy van-e beillesztve, ahogy a Zoho generálta
- Ne legyen extra szóköz vagy sortörés
