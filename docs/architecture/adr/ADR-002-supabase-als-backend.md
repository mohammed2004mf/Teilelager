# ADR-002: Supabase als Backend statt eigenem Server

**Status:** Akzeptiert
**Umgesetzt seit:** 26.10.2026 (erste Version)
**Dokumentiert:** 27.11.2026

## Kontext
- Das System braucht eine dauerhafte, gemeinsame Datenhaltung für alle Geräte des Inhabers.
- Es soll keine laufenden Kosten verursachen (RB-02) und wenig Betriebsaufwand haben.
- Änderungen sollen an andere Geräte gemeldet werden (Live-Aktualisierung).
- Entwickelt und betrieben wird das System von einer Person.

## Betrachtete Alternativen
1. **Eigener Server** (zum Beispiel Node.js mit PostgreSQL auf einem gemieteten Server): volle Kontrolle, aber Betrieb, Sicherheitsupdates und Kosten.
2. **Supabase** (Backend-as-a-Service: PostgreSQL, Programmierschnittstelle und Live-Kanal als Dienst, kostenloser Tarif).
3. **Firebase** (dokumentenorientierte Datenbank als Dienst): ebenfalls ohne eigenen Server, aber keine relationale Datenbank und keine Datenbankfunktionen in SQL.

## Entscheidung
Variante 2, Supabase. Begründung: Es liefert eine relationale Datenbank mit Transaktionen und Datenbankfunktionen (Voraussetzung für ADR-003), eine fertige Programmierschnittstelle und einen Live-Kanal (ADR-004), ohne dass ein Server betrieben werden muss. Der kostenlose Tarif reicht für einen Nutzer und rund 500 Teile.

## Konsequenzen
- \+ Kein eigener Server, keine laufenden Kosten, kein Patchen.
- \+ Relationale Datenbank mit Constraints, Transaktionen und Zugriffsregeln.
- \+ Live-Kanal ist ohne eigene Entwicklung verfügbar.
- − Abhängigkeit vom Anbieter (Vendor Lock-in). Die Schnittstelle `Backend` in `backend.ts` begrenzt die Folgen auf die Datenzugriffsschicht.
- − Der kostenlose Tarif pausiert das Projekt nach etwa 7 Tagen ohne Nutzung und erstellt selbst keine Sicherungen (siehe Q-04, RB-05).
- − Der öffentliche Schlüssel liegt im Client; der Schutz hängt an den Zugriffsregeln der Datenbank (siehe ADR-006).

## Überwachung
Erreichbarkeit im Betrieb beobachten (Q-04: mindestens 99 % im Monat). Häufen sich Pausen oder Ausfälle, wird ein bezahlter Tarif oder ein anderer Anbieter geprüft; dank der Schnittstelle `Backend` wäre nur der Datenzugriff betroffen.

## Bezug
Q-04, NFR-07; RB-01, RB-02, RB-05; ADR-003, ADR-004, ADR-006
