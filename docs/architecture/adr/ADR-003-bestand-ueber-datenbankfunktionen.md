# ADR-003: Bestand nur über Datenbankfunktionen ändern

**Status:** Akzeptiert
**Umgesetzt seit:** 26.10.2026 (erste Version); angepasst am 02.11.2026 („Kein Verlauf mehr: nur Verkäufe werden gespeichert“)
**Dokumentiert:** 27.11.2026

## Kontext
- Der Inhaber kann von mehreren Geräten gleichzeitig buchen.
- Berechnet jeder Client den neuen Bestand selbst und schreibt ihn zurück, überschreibt eine Buchung die andere (verlorenes Update durch eine Race Condition, siehe `../strukturen.md`).
- Ein falscher Bestand macht die Lagerübersicht wertlos (Q-03, NFR-06; Priorität Must).

## Betrachtete Alternativen
1. **Bestand im Client berechnen** und als Wert speichern: einfach, aber anfällig für verlorene Updates.
2. **Optimistische Sperre** (Versionsnummer je Teil, Konflikt wird erkannt und die Buchung wiederholt): sicher, aber jeder Client muss Konflikte behandeln.
3. **Datenbankfunktionen** `buchen`, `korrigieren`, `stornieren`, die den Bestand atomar in einer Transaktion ändern; direktes Schreiben des Bestands ist durch die Zugriffsregeln verboten.

## Entscheidung
Variante 3. Begründung: Die Integrität wird an einer einzigen Stelle durchgesetzt. PostgreSQL sperrt die Zeile des Teils während der Buchung (`update … set bestand = bestand + delta`, bei Korrekturen `select … for update`); gleichzeitige Buchungen werden nacheinander ausgeführt. Die Clients brauchen keine eigene Konfliktbehandlung, und die Funktion liefert den neuen Bestand gleich zurück (Q-01).

## Konsequenzen
- \+ Keine verlorenen Buchungen, unabhängig von der Zahl der Geräte.
- \+ Regeln wie „Menge größer als 0“ und „ein Verkauf nur einmal rückgängig“ gelten für jeden Aufruf.
- \+ Eine Anfrage pro Buchung; der neue Bestand kommt mit der Antwort.
- − Geschäftslogik liegt teilweise in SQL und ist schwerer automatisiert zu testen als TypeScript.
- − Die Logik ist auf Client (Warnungen) und Datenbank (Regeln) verteilt.
- − Zugänge und Korrekturen werden seit dem 02.11.2026 nicht mehr als Verlauf gespeichert, nur Verkäufe; Bestandsänderungen sind dadurch nicht vollständig nachvollziehbar.

## Überwachung
Test zu Q-03 im Meilenstein `v0.9`: zwei gleichzeitige Buchungen auf dasselbe Teil, Endbestand muss der Summe entsprechen. Fällt der Test durch oder tauchen im Betrieb unerklärliche Bestände auf, wird die Entscheidung überprüft.

## Bezug
Q-01, Q-03; NFR-04, NFR-06; US-05, US-06, US-10, US-12; UC-01 bis UC-04
