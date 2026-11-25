# Nichtfunktionale Anforderungen

**Produkt:** Teilelager – Lager und Verkauf für die Werkstatt
**Stand:** 25.11.2026 (Entwurf, noch zu prüfen)

Qualitätsanforderungen beschreiben, wie gut das System seine Funktionen erbringt. Sie sind hier messbar formuliert und nach den Qualitätsmerkmalen der ISO/IEC 25010 gegliedert, wie im Kurs vorgestellt. Jede Anforderung hat eine ID (`NFR-xx`), eine Prüfmethode und eine Begründung (Rationale). Die Priorität folgt in `priorisierung.md`.

**Spalte „Herkunft“:**
- *Programm*: Die Eigenschaft hat das vorhandene Programm bereits, sie wird hier als Anforderung festgehalten.
- *Annahme*: Der Zielwert ist ein Vorschlag und noch mit dem Auftraggeber abzustimmen.

## 1 Übersicht

| ID | Merkmal | Anforderung (Kurzform) | Herkunft |
|---|---|---|---|
| NFR-01 | Zeitverhalten | Buchungen sind schnell sichtbar | Annahme |
| NFR-02 | Zeitverhalten | Suche liefert Treffer sofort | Auftraggeber / Annahme |
| NFR-03 | Bedienbarkeit | Erlernbarkeit ohne Einweisung | Annahme |
| NFR-04 | Bedienbarkeit | Schutz vor Fehlbedienung | Programm |
| NFR-05 | Bedienbarkeit | Nutzung auf dem Handy | Annahme |
| NFR-06 | Zuverlässigkeit | Keine verlorenen Buchungen | Programm |
| NFR-07 | Verfügbarkeit | Erreichbarkeit im Betrieb | Annahme |
| NFR-08 | Sicherheit | Zugriffsschutz und Datenschutz | Programm |
| NFR-09 | Wartbarkeit | Modularer, geprüfter Quellcode | Programm / Annahme |
| NFR-10 | Kompatibilität | Aktuelle Browser, installierbar | Annahme |

## 2 Anforderungen im Detail

### NFR-01 Buchungen sind schnell sichtbar
**Merkmal:** Effizienz – Zeitverhalten
**Anforderung:** Nach dem Eintragen eines Verkaufs, einer Lieferung oder einer Korrektur zeigt das System den neuen Bestand bei normaler Internetverbindung innerhalb von **2 Sekunden** an.
**Prüfung:** Zeit zwischen Klick und angezeigtem neuen Bestand messen, 20 Buchungen, mindestens 95 % davon unter 2 Sekunden.
**Rationale:** Der Inhaber bucht nebenbei im Arbeitsalltag; Wartezeiten würden die Nutzung bremsen.
**Bezug:** US-05, US-06, US-10, UC-01, UC-03, UC-04
**Herkunft:** Annahme

### NFR-02 Suche liefert Treffer sofort
**Merkmal:** Effizienz – Zeitverhalten
**Anforderung:** Bei bis zu **1.000 Teilen** im Lager erscheinen die Treffer der Suche innerhalb von **1 Sekunde** nach dem Tippen.
**Prüfung:** Testdaten mit 1.000 Teilen anlegen, Suchbegriffe eingeben und die Zeit bis zur Trefferanzeige messen.
**Rationale:** Teile sollen schnell gefunden werden, damit Verkäufe nicht aufgehalten werden. Das Lager umfasst nach Angabe des Auftraggebers heute etwa 500 Teile; der Zielwert von 1.000 Teilen lässt Platz für Wachstum.
**Bezug:** US-07, US-08
**Herkunft:** Auftraggeber (ca. 500 Teile) / Annahme (Zielwerte für Zeit und Wachstum)

### NFR-03 Erlernbarkeit ohne Einweisung
**Merkmal:** Usability – Erlernbarkeit
**Anforderung:** Der Inhaber kann ohne Einweisung innerhalb von **5 Minuten** erstmals einen Verkauf erfassen (UC-01).
**Prüfung:** Nutzertest mit dem Inhaber; Zeit von der ersten Anzeige bis zum erfolgreich gebuchten Verkauf messen.
**Rationale:** Das Programm soll die Zettelwirtschaft ersetzen, ohne dass Schulungsaufwand entsteht.
**Bezug:** UC-01, US-10
**Herkunft:** Annahme

### NFR-04 Schutz vor Fehlbedienung
**Merkmal:** Usability – Schutz vor Fehlbedienung
**Anforderung:**
- Ein Verkauf oder Wegnehmen über den vorhandenen Bestand hinaus wird nur nach einer ausdrücklichen Bestätigung gebucht („Trotzdem verkaufen“ bzw. „Trotzdem wegnehmen“).
- Ein Verkauf wird nur nach einer Bestätigung rückgängig gemacht.
- Eine Menge kleiner oder gleich 0 wird in **100 %** der Fälle abgelehnt.
**Prüfung:** Akzeptanztests zu US-10, US-11, US-12.
**Rationale:** Fehleingaben sollen auffallen und sich korrigieren lassen, bevor der Bestand falsch wird.
**Bezug:** US-05, US-10, US-11, US-12, UC-01, UC-02
**Herkunft:** Programm

### NFR-05 Nutzung auf dem Handy
**Merkmal:** Usability – Bedienbarkeit
**Anforderung:** Alle Seiten sind auf Bildschirmbreiten ab **360 Pixel** ohne horizontales Scrollen bedienbar.
**Prüfung:** Seiten in der Entwicklerumgebung des Browsers bei 360 Pixel Breite durchgehen.
**Rationale:** Der Inhaber soll das Programm in der Werkstatt auch am Handy nutzen können.
**Bezug:** US-15
**Herkunft:** Annahme

### NFR-06 Keine verlorenen Buchungen
**Merkmal:** Zuverlässigkeit / Sicherheit – Integrität
**Anforderung:** Der Bestand ändert sich ausschließlich über die Buchungsfunktionen der Datenbank (`buchen`, `korrigieren`, `stornieren`). Werden zwei Buchungen gleichzeitig von verschiedenen Geräten ausgelöst, entspricht der Endbestand in **100 %** der Fälle der Summe aller Buchungen.
**Prüfung:** Automatisierter oder manueller Test mit zwei gleichzeitigen Buchungen auf dasselbe Teil; Endbestand mit der Summe vergleichen.
**Rationale:** Ein falscher Bestand macht die Lagerübersicht wertlos.
**Bezug:** US-05, US-06, US-10, US-12
**Herkunft:** Programm

### NFR-07 Erreichbarkeit im Betrieb
**Merkmal:** Zuverlässigkeit – Verfügbarkeit
**Anforderung:** Das System ist im Monat zu mindestens **99 %** erreichbar (das sind etwa 7 Stunden Ausfall im Monat). Nach einer Pause des Datenbankdienstes ist es nach spätestens **10 Minuten** wiederhergestellt.
**Prüfung:** Auswertung der Erreichbarkeit über einen Monat (zum Beispiel mit einem Überwachungsdienst), Wiederherstellung nach einer Pause einmal durchspielen.
**Rationale:** Das Programm ersetzt die Zettel und soll in den Arbeitszeiten der Werkstatt verfügbar sein. Der kostenlose Tarif des Datenbankdienstes pausiert Projekte nach etwa 7 Tagen ohne Nutzung; das ist ein bekanntes Risiko.
**Bezug:** alle Use Cases
**Herkunft:** Annahme

### NFR-08 Zugriffsschutz und Datenschutz
**Merkmal:** Sicherheit – Vertraulichkeit
**Anforderung:**
- Das Programm wird ohne Anmeldung genutzt (Wunsch der Werkstatt); der Zugriff ist nur für Personen vorgesehen, die die Adresse kennen. Die Adresse wird nicht weitergegeben.
- Die Seiten sind für Suchmaschinen nicht indexierbar (Hinweis `noindex`).
- Die Verbindung erfolgt ausschließlich verschlüsselt über HTTPS.
- Es werden keine personenbezogenen Daten gespeichert, nur Teile, Bestände und Verkäufe (bestätigt vom Projektbearbeiter).
**Prüfung:** Kopfzeile `X-Robots-Tag` der ausgelieferten Seite prüfen, Aufruf über `http://` testen, Datenbankfelder auf personenbezogene Daten prüfen.
**Rationale:** Der Auftraggeber wünscht eine Nutzung ohne Passwort. Das Risiko (jeder mit der Adresse kann buchen) wird bewusst in Kauf genommen und in der Reflexion bewertet.
**Bezug:** alle Use Cases
**Herkunft:** Programm

### NFR-09 Modularer, geprüfter Quellcode
**Merkmal:** Wartbarkeit – Modularität, Testbarkeit
**Anforderung:**
- Der Quellcode ist nach Aufgaben getrennt (Zugriff auf die Datenbank, Datenhaltung, Seiten, Bausteine).
- `npm run build` läuft ohne Typfehler durch.
- Ein dokumentierter Coding-Standard wird per Linter ohne Fehler eingehalten.
- Die Kernlogik hat automatisierte Tests, die alle bestehen.
**Prüfung:** `npm run build`, Linter und Testlauf in jedem Pull Request bzw. vor jedem Release ausführen.
**Rationale:** Die Aufgabe verlangt Struktur, Standard und Tests; zudem soll das Programm später änderbar bleiben.
**Bezug:** Projektaufgabe, Artefakte Implementierung und Tests
**Herkunft:** Programm (Typprüfung, Struktur) / Annahme (Linter, Tests, noch nicht vorhanden)

### NFR-10 Aktuelle Browser, installierbar
**Merkmal:** Kompatibilität / Portabilität
**Anforderung:** Das Programm läuft in den jeweils aktuellen Versionen von Chrome, Edge, Firefox und Safari ohne Funktionsverlust und lässt sich über den Browser als App installieren.
**Prüfung:** Die Use Cases UC-01 bis UC-06 in den vier Browsern durchspielen; Installation als App einmal testen.
**Rationale:** Der Inhaber soll das Programm auf verschiedenen Geräten ohne eigene Installation nutzen können.
**Bezug:** US-15
**Herkunft:** Annahme

## 3 Randbedingungen

| ID | Randbedingung | Begründung |
|---|---|---|
| RB-01 | Webanwendung mit TypeScript, Vite, Supabase (Datenbank) und Vercel (Hosting) | Bereits vorhandene technische Basis |
| RB-02 | Kostenlose Tarife von Supabase und Vercel | Budget des Auftraggebers; Folge: Pause der Datenbank bei Nichtnutzung (siehe NFR-07) |
| RB-03 | Abgabe der Projektaufgabe am 18.12.2026 als Release `v1.0` im GitHub-Repository | Vorgabe der Lehrveranstaltung |
| RB-04 | Installation und Start nach den Schritten der `README.md` | Vorgabe der Projektaufgabe |
| RB-05 | Keine Datensicherung: Der Auftraggeber verzichtet bewusst darauf. Es gibt keine Sicherungsfunktion in der Oberfläche. | Entscheidung des Auftraggebers. Folge und akzeptiertes Risiko: Bei Datenverlust (zum Beispiel Ausfall oder Löschung des Datenbankprojekts) lassen sich Bestände und Verkäufe nicht wiederherstellen, denn der kostenlose Datenbanktarif sichert selbst nichts. Das Risiko wird in der Reflexion bewertet. |

## 4 Offene Punkte (vom Nutzer zu klären)
- Stimmen die Zielwerte (Zeiten, 1.000 Teile als Obergrenze, Verfügbarkeit 99 %, Browser)?
