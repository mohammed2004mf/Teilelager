# Teilelager – Lager & Verkauf für die Werkstatt

Webanwendung zur Lagerverwaltung einer Werkstatt: Bestand ansehen, Lieferungen eintragen, Verkäufe erfassen.
Das Programm wird vom Inhaber der Werkstatt genutzt. Änderungen erscheinen per Live-Aktualisierung sofort, auch wenn das Programm auf mehreren Geräten oder in mehreren Browser-Tabs geöffnet ist.

Entstanden als Projektarbeit in der Lehrveranstaltung *Software Engineering* (HS Flensburg, WS 2026/27).

> **Ohne Anmeldung:** Das Programm öffnet sich direkt, ohne Passwort. Jeder, der die Adresse kennt,
> kann den Bestand sehen und buchen – die Adresse daher nicht weitergeben.

**Technik:** TypeScript, HTML, CSS (gebaut mit Vite) · Supabase (Datenbank, Live-Aktualisierung) · Vercel (Hosting)

## Inhalt

1. [Voraussetzungen](#1-voraussetzungen)
2. [Installation](#2-installation)
3. [Start](#3-start)
4. [Bedienung](#4-bedienung)
5. [Tests](#5-tests)
6. [Projektstruktur und Dokumentation](#6-projektstruktur-und-dokumentation)
7. [Betrieb: Supabase und Vercel einrichten](#7-betrieb-supabase-und-vercel-einrichten)
8. [Häufige Fragen](#8-häufige-fragen)

---

## 1. Voraussetzungen

- [Node.js](https://nodejs.org) (Version „LTS“) mit `npm`
- Ein aktueller Browser (Chrome, Edge, Firefox oder Safari)
- Für den Echtbetrieb zusätzlich ein kostenloses [Supabase](https://supabase.com)-Konto (siehe [Abschnitt 7](#7-betrieb-supabase-und-vercel-einrichten))

## 2. Installation

```bash
git clone https://github.com/mohammed2004mf/Teilelager.git
cd Teilelager
npm install
```

## 3. Start

### 3.1 Ohne Einrichtung (Demo-Modus)

```bash
npm run dev
```

Dann im Browser die angezeigte Adresse öffnen (meist `http://localhost:5173`).

Solange Supabase nicht eingerichtet ist, läuft das Programm im **Demo-Modus** (gelber Balken oben):
Die Daten liegen nur in diesem Browser. Öffnet man das Programm in zwei Tabs, sieht man schon die Live-Aktualisierung.
Den Demo-Modus erzwingt man auch mit dem Zusatz `?demo` an der Adresse.

### 3.2 Mit Datenbank (Supabase)

1. Datenbank einrichten (einmalig, siehe [Abschnitt 7.1](#71-supabase-datenbank)).
2. Die Datei `.env.example` kopieren, als `.env.local` speichern und die zwei Werte eintragen:
   ```
   VITE_SUPABASE_URL=https://abcdefgh.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
3. `npm run dev` starten – jetzt ohne gelben Demo-Balken, mit den echten Daten.

### 3.3 Weitere Befehle

| Befehl | Zweck |
|---|---|
| `npm run dev` | Entwicklungsserver starten |
| `npm run build` | Typen prüfen (`tsc`) und die Anwendung nach `dist/` bauen |
| `npm run preview` | Die gebaute Version ansehen |

## 4. Bedienung

Oben gibt es zwei Bereiche: **Lager** (mit den Unterseiten Übersicht, Lagerliste, Bestand ändern, Neues Teil,
Kategorien) und **Verkauf**.

| Aufgabe | Wo |
|---|---|
| Teil schnell finden und buchen | **Lager → Übersicht** – Suchfeld oben, Treffer erscheinen sofort |
| Verkauf eintragen | **Verkauf** – oder in jeder Liste auf **−** klicken |
| Lieferung eintragen | **Lager → Bestand ändern** – oder in jeder Liste auf **+** klicken |
| Nachgezählt, Zahl stimmt nicht | **Lager → Bestand ändern → Bestand korrigieren** |
| Neues Teil anlegen | **Lager → Neues Teil** („Speichern und nächstes Teil“ für viele Teile hintereinander) |
| Teil ändern oder löschen | In der Lagerliste auf den Namen klicken |
| Kategorien verwalten | **Lager → Kategorien** (Vorlagen: Standard, Öl, Filter, Reifen) |
| Was wurde verkauft? | **Verkauf** – Heute / Woche / Monat / eigener Zeitraum |
| Fehler gemacht | **Rückgängig** in der Meldung unten rechts oder in den Listen |

- **Mehr verkaufen als da ist?** Es kommt eine Warnung. Mit „Trotzdem verkaufen“ wird der Bestand negativ
  (rot, „Im Minus – prüfen“), bis die Lieferung eingetragen oder korrigiert wird.
- **Supabase pausiert** kostenlose Projekte nach ca. 7 Tagen ohne Nutzung. Dann im Supabase-Dashboard beim
  Projekt auf **Restore** klicken – die Daten sind nicht weg.

## 5. Tests

Automatisierte Tests sind noch nicht vorhanden (Status: in Arbeit). Sie entstehen im Ordner [`tests/`](tests/),
das Testkonzept und die Testberichte in [`docs/testing/`](docs/testing/). Bis dahin prüft `npm run build`
zumindest die Typen.

## 6. Projektstruktur und Dokumentation

```
README.md             Diese Datei: Installation, Start, Bedienung
CHANGELOG.md          Änderungen je Release
ki-nutzung.md         Offenlegung der KI-Nutzung
docs/
  requirements/       Anforderungen (Vision, Stakeholder, Use Cases, User Stories, NFR)
  architecture/       Architekturstil, Komponenten, Architekturentscheidungen (ADRs)
  design/             Klassen- und Sequenzdiagramme, Datenmodell
  testing/            Testkonzept, Akzeptanztests, Testbericht
  change-request.md   Änderungsanforderung mit Impact-Analyse
  traceability.md     Traceability-Matrix
  reflexion.md        Reflexion
src/                  Quellcode
tests/                Automatisierte Tests
supabase/schema.sql   Datenbank: Tabellen, Buchungsfunktionen, Zugriffsrechte
```

**Aufbau des Quellcodes (`src/`)**

```
main.ts               Start und Seitenwechsel
backend.ts            Zugriff auf Supabase (und Demo-Modus)
store.ts              Daten im Speicher + Live-Aktualisierung
views/                Die Seiten: Übersicht, Lagerliste, Bestand ändern, Teil, Kategorien, Verkauf
ui/                   Bausteine: Kopfzeile, Buchen-Knöpfe, Fenster, Meldungen
backup.ts             Excel-Sicherung (derzeit nicht in die Oberfläche eingebunden)
styles.css            Aussehen
```

**Datenmodell:** `kategorien` (mit Vorlage standard/oel/filter/reifen) · `teile` (mit aktuellem Bestand) ·
`buchungen` (gespeichert werden Verkäufe und ihre Rückgängig-Buchungen).
Der Bestand ändert sich ausschließlich über die Datenbank-Funktionen `buchen`, `korrigieren` und `stornieren`,
damit bei gleichzeitigen Buchungen von mehreren Geräten nichts verloren geht.

---

## 7. Betrieb: Supabase und Vercel einrichten

### 7.1 Supabase (Datenbank)

1. Auf <https://supabase.com> ein kostenloses Konto anlegen.
2. **New project** → Name z. B. `teilelager`, ein sicheres Datenbank-Passwort vergeben (irgendwo notieren),
   Region **Frankfurt (eu-central-1)** wählen → **Create new project**. Kurz warten.
3. Links **SQL Editor** öffnen → **New query**, den kompletten Inhalt von [`supabase/schema.sql`](supabase/schema.sql)
   hineinkopieren und **Run** klicken. Es sollte „Success“ erscheinen. Damit gibt es die Tabellen, die Buchungsregeln,
   die Zugriffsrechte, die Live-Aktualisierung und die 5 Start-Kategorien (Öle & Flüssigkeiten, Filter, Reifen,
   Bremsen, Sonstiges). Das Skript kann gefahrlos erneut ausgeführt werden.
4. **Registrierung abschalten** (empfohlen): **Authentication → Sign In / Providers** →
   **„Allow new users to sign up“ ausschalten**. Das Programm benutzt keine Anmeldung.
5. **Schlüssel holen:** **Project Settings → API** (bzw. **API Keys** / **Data API**):
   - **Project URL** – z. B. `https://abcdefgh.supabase.co`
   - **anon / publishable key** – der *öffentliche* Schlüssel

⚠️ Niemals den **service_role / secret** Key verwenden – der darf nicht ins Programm.

⚠️ **Variablennamen anpassen:** Die Supabase-Oberfläche (z. B. unter **Connect**) zeigt die Werte für Next.js an,
mit den Namen `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Dieses Programm liest aber nur
`VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY`. Die Werte übernehmen, die Namen ersetzen – sonst bleibt der gelbe
Demo-Balken stehen.

### 7.2 Vercel (Hosting)

**Variante A: über GitHub (empfohlen)**
1. Dieses Repository auf <https://github.com> haben (ohne `node_modules` und ohne `.env.local` – das regelt die `.gitignore`).
2. Auf <https://vercel.com> mit GitHub anmelden → **Add New… → Project** → das Repository **Import**.
3. Vercel erkennt „Vite“ automatisch. Unter **Environment Variables** eintragen:
   - `VITE_SUPABASE_URL` = Project URL
   - `VITE_SUPABASE_ANON_KEY` = anon / publishable key
4. **Deploy**. Nach ca. 1 Minute gibt es eine Adresse wie `teilelager.vercel.app`.

Jede Änderung, die später auf GitHub hochgeladen wird, geht automatisch online.

**Variante B: direkt vom PC**
```bash
npx vercel           # beim ersten Mal anmelden und Fragen mit Enter bestätigen
npx vercel env add VITE_SUPABASE_URL
npx vercel env add VITE_SUPABASE_ANON_KEY
npx vercel --prod
```

> **Wichtig:** Nach dem Ändern von Environment Variables in Vercel einmal **Redeploy** auslösen,
> sonst gelten die alten Werte.

> **Hinweis zum Vercel-Tarif:** Der kostenlose Hobby-Tarif ist laut Vercel für nicht-kommerzielle Nutzung gedacht.
> Das Programm hängt nicht an Vercel – es kann unverändert auch auf Cloudflare Pages oder Netlify laufen
> (Build-Befehl `npm run build`, Ordner `dist`).

---

## 8. Häufige Fragen

**Gelber Balken „Demo-Modus“ auf Vercel oder lokal?**
Die Environment Variables fehlen oder sind falsch → in Vercel prüfen und **Redeploy**. Lokal die Datei `.env.local`
prüfen: Die Namen müssen genau `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY` lauten (nicht `NEXT_PUBLIC_…`).
Danach den Dev-Server mit `Strg+C` stoppen und `npm run dev` neu starten, denn ein Neuladen der Seite reicht nicht.

**Änderungen von einem anderen Gerät kommen nicht an?**
Seite neu laden. Wenn es dauerhaft nicht klappt: im SQL Editor `supabase/schema.sql` erneut ausführen
(schaltet die Live-Aktualisierung ein; vorhandene Daten bleiben erhalten).
