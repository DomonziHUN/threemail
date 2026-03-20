"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";

export default function TermsOfUsePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Általános Szerződési Feltételek és Felhasználási Szabályzat</h1>
          <p className="text-muted-foreground">ThreeMail Bank Zrt. - Hatályos: 2026. március 20-tól</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Általános Szerződési Feltételek</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[700px] pr-4">
            <div className="space-y-6 text-sm leading-relaxed">
              
              {/* 1. ÁLTALÁNOS RENDELKEZÉSEK */}
              <section>
                <h3 className="text-lg font-semibold mb-3">1. ÁLTALÁNOS RENDELKEZÉSEK ÉS FOGALMAK</h3>
                
                <p className="text-muted-foreground mb-3">
                  <strong>1.1.</strong> Jelen Általános Szerződési Feltételek (a továbbiakban: ÁSZF) a ThreeMail Bank Zártkörűen Működő Részvénytársaság 
                  (székhely: 1051 Budapest, Szabadság tér 7., cégjegyzékszám: 01-10-041234, adószám: 10412345-2-41, a továbbiakban: Szolgáltató vagy Bank) 
                  által nyújtott pénzforgalmi szolgáltatásokra, elektronikus pénzkibocsátásra, hitelnyújtásra, befektetési szolgáltatásokra, 
                  valamint minden egyéb, a Szolgáltató által kínált pénzügyi és kiegészítő szolgáltatásra vonatkoznak.
                </p>

                <p className="text-muted-foreground mb-3">
                  <strong>1.2.</strong> A Szolgáltató a Magyar Nemzeti Bank (MNB) felügyelete alatt működő hitelintézet, amely rendelkezik 
                  a pénzforgalmi szolgáltatás nyújtásához, elektronikus pénz kibocsátásához, valamint hitelnyújtáshoz szükséges engedélyekkel. 
                  Az MNB nyilvántartási száma: H-EN-I-1234/2020. A Szolgáltató tagja az Országos Betétbiztosítási Alapnak (OBA), 
                  amely biztosítja az ügyfelek betéteinek védelmét a hatályos jogszabályok szerint, jelenleg személyenként és hitelintézetenként 
                  100.000 eurónak megfelelő forintösszegig.
                </p>

                <p className="text-muted-foreground mb-3">
                  <strong>1.3.</strong> Jelen ÁSZF hatálya kiterjed minden olyan természetes és jogi személyre, valamint jogi személyiséggel 
                  nem rendelkező szervezetre (a továbbiakban együttesen: Ügyfél vagy Felhasználó), aki/amely a Szolgáltató által nyújtott 
                  szolgáltatásokat igénybe veszi, függetlenül attól, hogy a szolgáltatás igénybevétele személyesen, telefonon, interneten 
                  keresztül vagy bármely más elektronikus csatornán történik.
                </p>

                <p className="text-muted-foreground mb-3">
                  <strong>1.4.</strong> Az ÁSZF-ben használt fogalmak értelmezése a pénzforgalmi szolgáltatás nyújtásáról szóló 2009. évi LXXXV. törvény 
                  (Pft.), a hitelintézetekről és a pénzügyi vállalkozásokról szóló 2013. évi CCXXXVII. törvény (Hpt.), valamint a vonatkozó 
                  európai uniós rendeletek és irányelvek alapján történik.
                </p>

                <div className="bg-muted/30 p-4 rounded-lg mt-3">
                  <p className="text-xs font-semibold mb-2">Fogalommagyarázat:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                    <li><strong>Fizetési számla:</strong> Az Ügyfél nevére megnyitott, pénzforgalmi műveletek lebonyolítására szolgáló számla</li>
                    <li><strong>Elektronikus pénz:</strong> Elektronikusan tárolt monetáris érték, amely pénzügyi követelést testesít meg</li>
                    <li><strong>Azonosító:</strong> A fizetési számla egyedi azonosítására használt betű-, szám- vagy szimbólumkombináció (IBAN)</li>
                    <li><strong>Fizetési megbízás:</strong> Az Ügyfél által a Szolgáltatónak adott utasítás fizetési művelet végrehajtására</li>
                    <li><strong>Hitelesítés:</strong> A fizetési eszköz használatának jogosságát ellenőrző folyamat</li>
                    <li><strong>Erős ügyfél-hitelesítés (SCA):</strong> Legalább két független elemre épülő hitelesítési eljárás</li>
                    <li><strong>Referencia-árfolyam:</strong> A devizaváltási műveletekhez alkalmazott árfolyam</li>
                    <li><strong>Munkanapon:</strong> A Szolgáltató üzleti tevékenységének végzéséhez szükséges nap (hétfő-péntek, kivéve munkaszüneti napok)</li>
                  </ul>
                </div>
              </section>

              {/* 2. SZOLGÁLTATÁSOK KÖRE */}
              <section>
                <h3 className="text-lg font-semibold mb-3">2. A SZOLGÁLTATÓ ÁLTAL NYÚJTOTT SZOLGÁLTATÁSOK KÖRE</h3>
                
                <p className="text-muted-foreground mb-3">
                  <strong>2.1. Pénzforgalmi szolgáltatások:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground mb-4">
                  <li>Fizetési számla vezetése forintban és devizában</li>
                  <li>Készpénz-befizetési és készpénz-felvételi szolgáltatás</li>
                  <li>Belföldi és nemzetközi átutalások végrehajtása (SEPA, SWIFT)</li>
                  <li>Beszedési megbízások kezelése és végrehajtása</li>
                  <li>Csoportos átutalások feldolgozása</li>
                  <li>Állandó megbízások kezelése</li>
                  <li>Elektronikus fizetési megoldások (bankkártya, mobil fizetés)</li>
                  <li>Valós idejű fizetések (azonnali átutalás)</li>
                </ul>

                <p className="text-muted-foreground mb-3">
                  <strong>2.2. Bankkártya szolgáltatások:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground mb-4">
                  <li>Betéti (debit) kártyák kibocsátása és kezelése</li>
                  <li>Hitelkártyák kibocsátása és kezelése</li>
                  <li>Virtuális kártyák létrehozása online vásárlásokhoz</li>
                  <li>Érintésmentes fizetési funkció (contactless)</li>
                  <li>Mobil fizetési megoldások (Apple Pay, Google Pay)</li>
                  <li>Kártyabiztosítási szolgáltatások</li>
                  <li>Kártyahasználat korlátozásának beállítása</li>
                </ul>

                <p className="text-muted-foreground mb-3">
                  <strong>2.3. Hitelezési szolgáltatások:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground mb-4">
                  <li>Folyószámlahitel nyújtása</li>
                  <li>Személyi kölcsönök és fogyasztási hitelek</li>
                  <li>Jelzáloghitelek lakáscélú felhasználásra</li>
                  <li>Vállalkozási hitelek és forgóeszköz-hitelek</li>
                  <li>Lízing és faktoring szolgáltatások</li>
                  <li>Hitelkeret-emelési lehetőségek</li>
                </ul>

                <p className="text-muted-foreground mb-3">
                  <strong>2.4. Befektetési és megtakarítási szolgáltatások:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground mb-4">
                  <li>Lekötött betétek különböző futamidőkkel</li>
                  <li>Takarékbetéti számlák</li>
                  <li>Értékpapír-számlák vezetése</li>
                  <li>Befektetési alapok közvetítése</li>
                  <li>Állampapírok értékesítése</li>
                  <li>Nyugdíj-előtakarékossági számlák</li>
                </ul>

                <p className="text-muted-foreground mb-3">
                  <strong>2.5. Elektronikus banki szolgáltatások:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground mb-4">
                  <li>Internetes banki felület (web banking)</li>
                  <li>Mobilalkalmazás (mobile banking)</li>
                  <li>Telefonos ügyfélszolgálat és telefonos banki szolgáltatás</li>
                  <li>SMS és push értesítések</li>
                  <li>Elektronikus számlakivonatok</li>
                  <li>Biometrikus hitelesítési lehetőségek (ujjlenyomat, arcfelismerés)</li>
                </ul>
              </section>

              {/* 3. SZERZŐDÉS LÉTREJÖTTE */}
              <section>
                <h3 className="text-lg font-semibold mb-3">3. A SZERZŐDÉS LÉTREJÖTTE, MÓDOSÍTÁSA ÉS MEGSZŰNÉSE</h3>
                
                <p className="text-muted-foreground mb-3">
                  <strong>3.1.</strong> A Szolgáltató és az Ügyfél közötti szerződés a Szolgáltató által elfogadott számlanyitási kérelem alapján jön létre. 
                  A szerződés létrejöttéhez szükséges az Ügyfél személyazonosságának és lakcímének igazolása, valamint a pénzmosás és terrorizmus 
                  finanszírozása megelőzéséről és megakadályozásáról szóló jogszabályok szerinti ügyfél-átvilágítás elvégzése.
                </p>

                <p className="text-muted-foreground mb-3">
                  <strong>3.2.</strong> A számlanyitáshoz szükséges dokumentumok természetes személyek esetében:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-muted-foreground mb-4">
                  <li>Érvényes személyazonosító okmány (személyi igazolvány, útlevél vagy vezetői engedély)</li>
                  <li>Lakcímet igazoló hatósági igazolvány vagy egyéb hiteles dokumentum</li>
                  <li>Adóazonosító jel (adószám)</li>
                  <li>Telefonos és e-mail elérhetőség</li>
                  <li>Jövedelemigazolás (bizonyos szolgáltatások esetében)</li>
                </ul>

                <p className="text-muted-foreground mb-3">
                  <strong>3.3.</strong> Jogi személyek és egyéni vállalkozók esetében további dokumentumok szükségesek:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-muted-foreground mb-4">
                  <li>Cégkivonat vagy egyéni vállalkozói igazolvány</li>
                  <li>Aláírási címpéldány vagy aláírás-minta</li>
                  <li>Képviseletre jogosult személyek azonosító okmányai</li>
                  <li>Társasági szerződés vagy alapító okirat</li>
                  <li>Adószám és statisztikai számjel</li>
                  <li>Tényleges tulajdonosra vonatkozó nyilatkozat</li>
                </ul>

                <p className="text-muted-foreground mb-3">
                  <strong>3.4.</strong> A Szolgáltató fenntartja a jogot, hogy a számlanyitási kérelmet indoklás nélkül elutasítsa, különösen akkor, 
                  ha az Ügyfél nem felel meg a jogszabályi követelményeknek, vagy a Szolgáltató kockázatkezelési politikája alapján az üzleti kapcsolat 
                  kockázatosnak minősül.
                </p>

                <p className="text-muted-foreground mb-3">
                  <strong>3.5.</strong> A szerződés módosítása:
                </p>
                <p className="text-muted-foreground mb-3 ml-4">
                  A Szolgáltató jogosult a jelen ÁSZF-et, valamint a Hirdetményekben közzétett kondíciókat egyoldalúan módosítani. 
                  A módosításról a Szolgáltató az Ügyfelet legalább 60 nappal a hatálybalépés előtt értesíti. Az Ügyfél a módosítás 
                  hatálybalépéséig jogosult a szerződést díjmentesen felmondani. Amennyiben az Ügyfél a módosítás hatálybalépéséig 
                  nem mondja fel a szerződést, úgy a módosítást elfogadottnak kell tekinteni.
                </p>

                <p className="text-muted-foreground mb-3">
                  <strong>3.6.</strong> A szerződés megszűnése:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground mb-4">
                  <li>Az Ügyfél vagy a Szolgáltató rendes felmondásával (30 napos felmondási idő)</li>
                  <li>Azonnali hatályú felmondással súlyos szerződésszegés esetén</li>
                  <li>Az Ügyfél halálával vagy jogutód nélküli megszűnésével</li>
                  <li>Közös megegyezéssel</li>
                  <li>Jogszabályban meghatározott egyéb esetekben</li>
                </ul>
              </section>

              {/* 4. DÍJAK ÉS KÖLTSÉGEK */}
              <section>
                <h3 className="text-lg font-semibold mb-3">4. DÍJAK, KÖLTSÉGEK ÉS KAMATOK</h3>
                
                <p className="text-muted-foreground mb-3">
                  <strong>4.1.</strong> A Szolgáltató által nyújtott szolgáltatások díjait, költségeit és kamatait a Szolgáltató Hirdetménye tartalmazza, 
                  amely a Szolgáltató fiókjaiban, honlapján és mobilalkalmazásában elérhető. A Hirdetmény a jelen ÁSZF elválaszthatatlan részét képezi.
                </p>

                <p className="text-muted-foreground mb-3">
                  <strong>4.2.</strong> A számlavezetési díjak típusai:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground mb-4">
                  <li>Havi számlavezetési díj (csomagtól függően 0-2990 Ft)</li>
                  <li>Tranzakciós díjak (átutalás, készpénzfelvétel, stb.)</li>
                  <li>Bankkártya éves díja (0-15000 Ft kártyatípustól függően)</li>
                  <li>SMS értesítési díj (0-300 Ft/hó)</li>
                  <li>Devizaváltási díj (0,5-2% a tranzakció értékétől függően)</li>
                  <li>Készpénzfelvételi díj ATM-ből (0-1% min. 300 Ft)</li>
                </ul>

                <p className="text-muted-foreground mb-3">
                  <strong>4.3.</strong> Hitelkamat és THM (Teljes Hiteldíj Mutató):
                </p>
                <p className="text-muted-foreground mb-3 ml-4">
                  A hitelek kamata lehet fix vagy változó. A változó kamatláb a jegybanki alapkamat, a BUBOR vagy más referencia-kamatláb 
                  alapján kerül meghatározásra. A THM tartalmazza a hitel teljes költségét, beleértve a kamatot, kezelési költséget, 
                  folyósítási jutalékot és minden egyéb, a hitellel kapcsolatos díjat. A THM pontos mértékét a hitelszerződés tartalmazza.
                </p>

                <p className="text-muted-foreground mb-3">
                  <strong>4.4.</strong> Betéti kamatok:
                </p>
                <p className="text-muted-foreground mb-3 ml-4">
                  A betéti számlákra fizetett kamatok mértéke a betét típusától, összegétől és futamidejétől függ. A kamat lehet fix vagy változó. 
                  A kamat jóváírása történhet havonta, negyedévente, félévente vagy a futamidő végén. A betéti kamatokra 15% személyi jövedelemadó 
                  és 13% szociális hozzájárulási adó vonatkozik, amelyet a Szolgáltató levonja és befizeti az állami adóhatósághoz.
                </p>

                <p className="text-muted-foreground mb-3">
                  <strong>4.5.</strong> Díjmentes szolgáltatások:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-muted-foreground mb-4">
                  <li>Elektronikus számlakivonat</li>
                  <li>Internetes és mobilbanki szolgáltatás használata</li>
                  <li>Saját ATM hálózatban történő készpénzfelvétel (havi limitig)</li>
                  <li>Belföldi forint átutalások elektronikus csatornán (havi limitig)</li>
                  <li>Értesítések e-mailben és mobilalkalmazásban</li>
                </ul>

                <p className="text-muted-foreground mb-3">
                  <strong>4.6.</strong> Devizaműveletek árfolyama:
                </p>
                <p className="text-muted-foreground mb-3 ml-4">
                  A devizaműveleteknél alkalmazott árfolyamot a Szolgáltató napi rendszerességgel határozza meg és teszi közzé a honlapján. 
                  Az árfolyam tartalmazza a Szolgáltató haszonkulcsát. Nagyobb összegű devizaműveletek esetén egyedi árfolyam kérhető.
                </p>
              </section>

              {/* 5. ADATVÉDELEM */}
              <section>
                <h3 className="text-lg font-semibold mb-3">5. ADATVÉDELEM ÉS ADATKEZELÉS</h3>
                
                <p className="text-muted-foreground mb-3">
                  <strong>5.1.</strong> A Szolgáltató az Ügyfél személyes adatait az Európai Unió Általános Adatvédelmi Rendeletének (GDPR), 
                  valamint a magyar adatvédelmi jogszabályoknak megfelelően kezeli. A részletes adatkezelési tájékoztatót a Szolgáltató 
                  Adatvédelmi Szabályzata tartalmazza.
                </p>

                <p className="text-muted-foreground mb-3">
                  <strong>5.2.</strong> A Szolgáltató által kezelt személyes adatok köre:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-muted-foreground mb-4">
                  <li>Azonosító adatok (név, születési hely és idő, anyja neve)</li>
                  <li>Lakcím és tartózkodási hely</li>
                  <li>Elérhetőségi adatok (telefon, e-mail)</li>
                  <li>Azonosító okmányok adatai</li>
                  <li>Adóazonosító jel, TAJ szám</li>
                  <li>Bankszámlaszám, tranzakciós adatok</li>
                  <li>Jövedelmi és vagyoni adatok</li>
                  <li>Biometrikus adatok (ujjlenyomat, arcfelismerés - csak hozzájárulás esetén)</li>
                </ul>

                <p className="text-muted-foreground mb-3">
                  <strong>5.3.</strong> Az adatkezelés jogalapja:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground mb-4">
                  <li>Szerződés teljesítése (számlavezetés, tranzakciók végrehajtása)</li>
                  <li>Jogszabályi kötelezettség (pénzmosás elleni szabályok, adózási kötelezettségek)</li>
                  <li>Jogos érdek (kockázatkezelés, csalásmegelőzés)</li>
                  <li>Hozzájárulás (marketing célú megkeresések, biometrikus adatok kezelése)</li>
                </ul>

                <p className="text-muted-foreground mb-3">
                  <strong>5.4.</strong> Az Ügyfél jogai:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground mb-4">
                  <li>Hozzáférési jog: tájékoztatás kérése a kezelt adatokról</li>
                  <li>Helyesbítéshez való jog: pontatlan adatok javítása</li>
                  <li>Törléshez való jog: adatok törlésének kérése (bizonyos esetekben)</li>
                  <li>Adatkezelés korlátozásához való jog</li>
                  <li>Adathordozhatósághoz való jog: adatok másolata strukturált formátumban</li>
                  <li>Tiltakozáshoz való jog: jogos érdeken alapuló adatkezelés ellen</li>
                  <li>Panasztételhez való jog: Nemzeti Adatvédelmi és Információszabadság Hatóságnál</li>
                </ul>

                <p className="text-muted-foreground mb-3">
                  <strong>5.5.</strong> Adatbiztonság:
                </p>
                <p className="text-muted-foreground mb-3 ml-4">
                  A Szolgáltató megfelelő technikai és szervezési intézkedésekkel biztosítja az adatok biztonságát, beleértve a titkosítást, 
                  hozzáférés-korlátozást, rendszeres biztonsági auditokat és munkatársak képzését. Az adatokat 256 bites AES titkosítással védjük, 
                  és a szervereinket folyamatosan monitorozzuk.
                </p>
              </section>

              {/* 6. FELELŐSSÉG */}
              <section>
                <h3 className="text-lg font-semibold mb-3">6. FELELŐSSÉGI SZABÁLYOK</h3>
                
                <p className="text-muted-foreground mb-3">
                  <strong>6.1.</strong> A Szolgáltató felelőssége:
                </p>
                <p className="text-muted-foreground mb-3 ml-4">
                  A Szolgáltató felelős a szerződésszerű szolgáltatásnyújtásért, a fizetési műveletek pontos és határidőben történő végrehajtásáért, 
                  valamint az Ügyfél adatainak biztonságos kezeléséért. A Szolgáltató köteles megtéríteni az Ügyfélnek okozott kárt, ha az 
                  a Szolgáltató szerződésszegéséből vagy jogszabálysértéséből ered.
                </p>

                <p className="text-muted-foreground mb-3">
                  <strong>6.2.</strong> A Szolgáltató mentesül a felelősség alól:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground mb-4">
                  <li>Vis maior (elháríthatatlan külső ok) esetén</li>
                  <li>Ha a kárt az Ügyfél szándékos vagy súlyosan gondatlan magatartása okozta</li>
                  <li>Ha a kárt jogszabály vagy hatósági intézkedés okozta</li>
                  <li>Ha az Ügyfél nem tett eleget tájékoztatási vagy együttműködési kötelezettségének</li>
                </ul>

                <p className="text-muted-foreground mb-3">
                  <strong>6.3.</strong> Az Ügyfél felelőssége:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground mb-4">
                  <li>A fizetési eszköz (bankkártya, jelszó, biometrikus azonosító) biztonságos megőrzése</li>
                  <li>A fizetési eszköz elvesztésének vagy jogosulatlan használatának azonnali bejelentése</li>
                  <li>A számlakivonatok rendszeres ellenőrzése és a hibák haladéktalan jelzése</li>
                  <li>A személyes adatok változásának bejelentése</li>
                  <li>A szerződésben vállalt kötelezettségek teljesítése (díjfizetés, hiteltörlesztés)</li>
                </ul>

                <p className="text-muted-foreground mb-3">
                  <strong>6.4.</strong> Jogosulatlan vagy hibás fizetési műveletek:
                </p>
                <p className="text-muted-foreground mb-3 ml-4">
                  Jogosulatlan fizetési művelet esetén a Szolgáltató haladéktalanul visszatéríti az Ügyfélnek a jogosulatlan művelet összegét, 
                  kivéve, ha alapos oka van feltételezni, hogy az Ügyfél csalárd módon járt el. Az Ügyfél köteles a jogosulatlan műveletet 
                  annak tudomására jutásától számított 13 hónapon belül bejelenteni. Hibás végrehajtás esetén a Szolgáltató köteles a műveletet 
                  helyesbíteni vagy a díjat visszatéríteni.
                </p>
              </section>

              {/* 7. PANASZKEZELÉS */}
              <section>
                <h3 className="text-lg font-semibold mb-3">7. PANASZKEZELÉS ÉS JOGVITÁK RENDEZÉSE</h3>
                
                <p className="text-muted-foreground mb-3">
                  <strong>7.1.</strong> Panaszbejelentés módjai:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-muted-foreground mb-4">
                  <li>Személyesen a Szolgáltató bármely fiókjában</li>
                  <li>Telefonon az ügyfélszolgálaton: +36 1 234 5678</li>
                  <li>E-mailben: panasz@threemailbank.com</li>
                  <li>Postai úton: 1051 Budapest, Szabadság tér 7.</li>
                  <li>Internetes bankon vagy mobilalkalmazáson keresztül</li>
                </ul>

                <p className="text-muted-foreground mb-3">
                  <strong>7.2.</strong> A Szolgáltató a panaszt haladéktalanul, de legkésőbb 30 napon belül kivizsgálja és írásban válaszol. 
                  Összetett ügyekben a válaszadási határidő 60 napra hosszabbítható, amelyről a Szolgáltató tájékoztatja az Ügyfelet.
                </p>

                <p className="text-muted-foreground mb-3">
                  <strong>7.3.</strong> Peren kívüli vitarendezés:
                </p>
                <p className="text-muted-foreground mb-3 ml-4">
                  Amennyiben az Ügyfél nem elégedett a Szolgáltató válaszával, jogosult a Magyar Nemzeti Bank Pénzügyi Fogyasztóvédelmi 
                  Központjához (1013 Budapest, Krisztina krt. 39.) vagy a lakóhelye szerinti békéltető testülethez fordulni. Az Ügyfél 
                  jogosult továbbá bírósághoz fordulni.
                </p>

                <p className="text-muted-foreground mb-3">
                  <strong>7.4.</strong> Hatáskörrel és illetékességgel rendelkező hatóságok:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-muted-foreground mb-4">
                  <li>Magyar Nemzeti Bank (felügyeleti hatóság)</li>
                  <li>Nemzeti Adatvédelmi és Információszabadság Hatóság (adatvédelmi ügyek)</li>
                  <li>Gazdasági Versenyhivatal (fogyasztóvédelmi ügyek)</li>
                  <li>Pénzügyi Békéltető Testület</li>
                </ul>
              </section>

              {/* 8. EGYÉB RENDELKEZÉSEK */}
              <section>
                <h3 className="text-lg font-semibold mb-3">8. EGYÉB RENDELKEZÉSEK</h3>
                
                <p className="text-muted-foreground mb-3">
                  <strong>8.1.</strong> Irányadó jog: Jelen ÁSZF-re és a Szolgáltató és az Ügyfél közötti jogviszonyra a magyar jog az irányadó.
                </p>

                <p className="text-muted-foreground mb-3">
                  <strong>8.2.</strong> Joghatóság: A Felek közötti jogvitákban a Szolgáltató székhelye szerinti bíróság rendelkezik kizárólagos illetékességgel, 
                  kivéve, ha a jogszabály eltérően rendelkezik.
                </p>

                <p className="text-muted-foreground mb-3">
                  <strong>8.3.</strong> Kapcsolattartás nyelve: A Szolgáltató és az Ügyfél közötti kapcsolattartás nyelve a magyar. Külföldi ügyfelek 
                  esetében angol nyelvű kommunikáció is lehetséges.
                </p>

                <p className="text-muted-foreground mb-3">
                  <strong>8.4.</strong> Értesítések: A Szolgáltató az Ügyfelet a szerződéssel kapcsolatos lényeges információkról, változásokról 
                  az Ügyfél által megadott elérhetőségeken (e-mail, SMS, levél, mobilalkalmazás) értesíti. Az Ügyfél köteles a Szolgáltatót 
                  haladéktalanul tájékoztatni az elérhetőségeinek változásáról.
                </p>

                <p className="text-muted-foreground mb-3">
                  <strong>8.5.</strong> Banktitok: A Szolgáltató köteles megőrizni az Ügyfél üzleti titkait és a banktitkot. A banktitok 
                  megsértése büntetőjogi és polgári jogi következményekkel jár. A banktitok alól kivételt képeznek a jogszabályban meghatározott 
                  esetek (pl. bűnüldözési célú adatkérés, adóhatósági megkeresés).
                </p>

                <p className="text-muted-foreground mb-3">
                  <strong>8.6.</strong> Vis maior: A Szolgáltató nem felel olyan károkért, amelyek elháríthatatlan külső ok (vis maior) 
                  következményeként merültek fel, ideértve a természeti katasztrófákat, háborút, terrorista cselekményeket, sztrájkot, 
                  kormányzati intézkedéseket, valamint az informatikai rendszerek működését érintő külső támadásokat.
                </p>
              </section>

              {/* ZÁRÓ RENDELKEZÉSEK */}
              <section className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-3">ZÁRÓ RENDELKEZÉSEK</h3>
                
                <p className="text-muted-foreground mb-3">
                  Jelen Általános Szerződési Feltételek 2026. március 20. napján lépnek hatályba és visszavonásig érvényesek. 
                  A Szolgáltató fenntartja a jogot az ÁSZF egyoldalú módosítására a fent meghatározott feltételek szerint.
                </p>

                <p className="text-muted-foreground mb-3">
                  A Szolgáltató kötelezettséget vállal arra, hogy szolgáltatásait a hatályos jogszabályoknak és szakmai szabályoknak 
                  megfelelően, az ügyfelek érdekeinek szem előtt tartásával nyújtja.
                </p>

                <div className="bg-muted/50 p-4 rounded-lg mt-4">
                  <p className="text-xs text-muted-foreground text-center">
                    <strong>ThreeMail Bank Zrt.</strong><br />
                    Székhely: 1051 Budapest, Szabadság tér 7.<br />
                    Cégjegyzékszám: 01-10-041234 | Adószám: 10412345-2-41<br />
                    MNB engedély száma: H-EN-I-1234/2020<br />
                    Ügyfélszolgálat: +36 1 234 5678 | support@threemailbank.com<br />
                    <br />
                    © 2026 ThreeMail Bank Zrt. Minden jog fenntartva.
                  </p>
                </div>
              </section>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
