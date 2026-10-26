# Teilelager – Lager & Verkauf für die Werkstatt

Ein einfaches Programm für Mahmud und Kravan: Bestand sehen, Lieferungen eintragen,
Verkäufe erfassen. Beide sehen Änderungen sofort auf ihrem eigenen PC.

**Technik:** TypeScript, HTML, CSS (gebaut mit Vite) · Supabase (Datenbank, Anmeldung, Live-Aktualisierung) · Vercel (Hosting)

---

## Inhalt

1. [Ausprobieren ohne Einrichtung (Demo-Modus)](#1-ausprobieren-ohne-einrichtung-demo-modus)
2. [Supabase einrichten (Datenbank)](#2-supabase-einrichten-datenbank)
3. [Auf Vercel ins Internet stellen](#3-auf-vercel-ins-internet-stellen)
4. [Im Alltag](#4-im-alltag)
5. [Häufige Fragen](#5-häufige-fragen)
6. [Aufbau des Programms](#6-aufbau-des-programms)

---

## 1. Ausprobieren ohne Einrichtung (Demo-Modus)

Voraussetzung: [Node.js](https://nodejs.org) (Version „LTS“) ist installiert.

```bash
npm install
npm run dev
```

Dann im Browser die angezeigte Adresse öffnen (meist `http://localhost:5173`).

Solange Supabase nicht eingerichtet ist, läuft das Programm im **Demo-Modus** (gelber Balken oben):
Jedes Passwort funktioniert, und die Daten liegen nur in diesem Browser. Öffnet man das Programm in
zwei Tabs, sieht man schon die Live-Aktualisierung.

---

## 2. Supabase einrichten (Datenbank)

### 2.1 Projekt anlegen
1. Auf <https://supabase.com> ein kostenloses Konto anlegen.
2. **New project** → Name z. B. `teilelager`, ein sicheres Datenbank-Passwort vergeben (irgendwo notieren),
   Region **Frankfurt (eu-central-1)** wählen → **Create new project**. Kurz warten.

### 2.2 Tabellen anlegen
1. Links **SQL Editor** öffnen → **New query**.
2. Den kompletten Inhalt der Datei [`supabase/schema.sql`](supabase/schema.sql) hineinkopieren.
3. **Run** klicken. Es sollte „Success“ erscheinen.

Damit gibt es die Tabellen, die Buchungsregeln, die Zugriffsrechte, die Live-Aktualisierung
und die 5 Start-Kategorien (Öle & Flüssigkeiten, Filter, Reifen, Bremsen, Sonstiges).

### 2.3 Registrierung abschalten
**Authentication → Sign In / Providers** (bzw. **Settings**) → **„Allow new users to sign up“ ausschalten** → Speichern.
So kann sich niemand Fremdes ein Konto anlegen.

### 2.4 Die zwei Benutzer anlegen
**Authentication → Users → Add user → Create new user**, jeweils mit **„Auto Confirm User“** angehakt:

| Name   | E-Mail                    | Passwort        |
|--------|---------------------------|-----------------|
| Mahmud | `mahmud@teilelager.app`   | selbst wählen   |
| Kravan | `kravan@teilelager.app`   | selbst wählen   |

Die E-Mail-Adressen müssen nicht echt sein – sie dienen nur als Benutzername.
Der Name, der im Protokoll erscheint, kommt aus dem Teil vor dem `@` (mahmud → „Mahmud“).

> Andere Adressen? Dann unten bei `VITE_BENUTZER` dieselben Adressen eintragen.

### 2.5 Schlüssel holen
**Project Settings → API** (bzw. **API Keys** / **Data API**):
- **Project URL** – z. B. `https://abcdefgh.supabase.co`
- **anon / publishable key** – der *öffentliche* Schlüssel

⚠️ Niemals den **service_role / secret** Key verwenden – der darf nicht ins Programm.

### 2.6 Lokal testen (optional)
Die Datei `.env.example` kopieren, als `.env.local` speichern und die Werte eintragen:

```
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_BENUTZER=Mahmud:mahmud@teilelager.app,Kravan:kravan@teilelager.app
```

Dann `npm run dev` – jetzt ohne gelben Demo-Balken, mit echter Anmeldung.

---

## 3. Auf Vercel ins Internet stellen

### Variante A: über GitHub (empfohlen)
1. Auf <https://github.com> ein **privates** Repository anlegen (z. B. `teilelager`) und diesen Ordner hochladen
   (ohne `node_modules` und ohne `.env.local` – das regelt die Datei `.gitignore`).
2. Auf <https://vercel.com> mit GitHub anmelden → **Add New… → Project** → das Repository **Import**.
3. Vercel erkennt „Vite“ automatisch. Unter **Environment Variables** eintragen:
   - `VITE_SUPABASE_URL` = Project URL
   - `VITE_SUPABASE_ANON_KEY` = anon / publishable key
   - `VITE_BENUTZER` = `Mahmud:mahmud@teilelager.app,Kravan:kravan@teilelager.app`
4. **Deploy**. Nach ca. 1 Minute gibt es eine Adresse wie `teilelager.vercel.app`.

Jede Änderung, die später auf GitHub hochgeladen wird, geht automatisch online.

### Variante B: direkt vom PC
```bash
npx vercel           # beim ersten Mal anmelden und Fragen mit Enter bestätigen
npx vercel env add VITE_SUPABASE_URL
npx vercel env add VITE_SUPABASE_ANON_KEY
npx vercel env add VITE_BENUTZER
npx vercel --prod
```

> **Wichtig:** Nach dem Ändern von Environment Variables in Vercel einmal **Redeploy** auslösen,
> sonst gelten die alten Werte.

> **Hinweis zum Vercel-Tarif:** Der kostenlose Hobby-Tarif ist laut Vercel für nicht-kommerzielle Nutzung gedacht.
> Bei Unsicherheit kurz beim Vercel-Support nachfragen. Das Programm hängt nicht an Vercel – es kann
> unverändert auch auf Cloudflare Pages oder Netlify laufen (Build-Befehl `npm run build`, Ordner `dist`).

---

## 4. Im Alltag

| Aufgabe | Wo |
|---|---|
| Teil schnell finden und buchen | **Lager → Übersicht** – Suchfeld oben, Treffer erscheinen sofort |
| Verkauf eintragen | **Verkauf** – oder in jeder Liste auf **−** klicken |
| Lieferung eintragen | **Lager → Zugang** – oder in jeder Liste auf **+** klicken |
| Nachgezählt, Zahl stimmt nicht | **Lager → Zugang → Bestand korrigieren** |
| Neues Teil | **Lager → Neues Teil** („Speichern und nächstes Teil“ für viele Teile hintereinander) |
| Teil ändern oder löschen | In der Lagerliste auf den Namen klicken |
| Was wurde verkauft? | **Verkauf** – Heute / Woche / Monat / eigener Zeitraum |
| Fehler gemacht | **Rückgängig** in der Meldung unten rechts oder in den Listen |

- **Mehr verkaufen als da ist?** Es kommt eine Warnung. Mit „Trotzdem verkaufen“ wird der Bestand negativ
  (rot, „Im Minus – prüfen“), bis die Lieferung eingetragen oder korrigiert wird.
- **Sicherung:** Einmal pro Woche auf **Übersicht → Sicherung herunterladen (Excel)** klicken und die Datei aufheben.
  Der kostenlose Supabase-Tarif macht selbst keine Sicherungen.
- **Supabase pausiert** kostenlose Projekte nach ca. 7 Tagen ohne Nutzung (z. B. Betriebsurlaub).
  Dann im Supabase-Dashboard beim Projekt auf **Restore** klicken – die Daten sind nicht weg.

---

## 5. Häufige Fragen

**Passwort ändern?**
Supabase → **SQL Editor** → ausführen (Adresse und neues Passwort anpassen):
```sql
update auth.users
   set encrypted_password = extensions.crypt('NeuesPasswort123', extensions.gen_salt('bf'))
 where email = 'mahmud@teilelager.app';
```

**„Passwort falsch“, obwohl es stimmt?**
Prüfen, ob der Benutzer in Supabase mit „Auto Confirm“ angelegt wurde und die E-Mail in `VITE_BENUTZER` exakt gleich ist.

**Gelber Balken „Demo-Modus“ auf Vercel?**
Die Environment Variables fehlen oder sind falsch → in Vercel prüfen und **Redeploy**.

**Änderungen vom anderen PC kommen nicht an?**
Seite neu laden. Wenn es dauerhaft nicht klappt: im SQL Editor `supabase/schema.sql` erneut ausführen
(schaltet die Live-Aktualisierung ein; vorhandene Daten bleiben erhalten).

---

## 6. Aufbau des Programms

```
index.html            Startseite
src/main.ts           Start, Seitenwechsel, Anmeldung
src/backend.ts        Zugriff auf Supabase (und Demo-Modus)
src/store.ts          Daten im Speicher + Live-Aktualisierung
src/views/            Die Seiten: Übersicht, Lagerliste, Zugang, Teil, Kategorien, Verkauf, Anmeldung
src/ui/               Bausteine: Kopfzeile, Buchen-Knöpfe, Fenster, Meldungen
src/backup.ts         Excel-Sicherung
src/styles.css        Aussehen
supabase/schema.sql   Datenbank: Tabellen, Buchungsfunktionen, Zugriffsrechte
```

**Datenmodell:** `kategorien` (mit Vorlage standard/oel/filter/reifen) · `teile` (mit aktuellem Bestand) ·
`buchungen` (jede Bewegung: zugang, verkauf, korrektur, storno – wird nie gelöscht).
Der Bestand ändert sich ausschließlich über die Datenbank-Funktionen `buchen`, `korrigieren` und `stornieren`,
damit bei gleichzeitigen Buchungen von zwei PCs nichts verloren geht.

**Befehle:** `npm run dev` (Entwicklung) · `npm run build` (prüfen + bauen nach `dist/`) · `npm run preview` (gebaute Version ansehen)
