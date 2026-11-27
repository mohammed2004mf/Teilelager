# ADR-005: Kategorien und Teile im Client vorhalten

**Status:** Akzeptiert
**Umgesetzt seit:** 26.10.2026 (erste Version)
**Dokumentiert:** 27.11.2026

## Kontext
- Die Suche soll Treffer beim Tippen liefern (Q-02: ≤ 1 s bei 1.000 Teilen).
- Nach einer Buchung soll der neue Bestand sofort erscheinen (Q-01).
- Das Lager umfasst nach Angabe des Auftraggebers rund 500 Teile.
- Verkäufe werden nur in der Verkaufsübersicht gebraucht und wachsen mit der Zeit.

## Betrachtete Alternativen
1. **Suche auf dem Server:** jede Eingabe als Anfrage an die Datenbank; wenig Daten im Client, aber Netzverzögerung bei jedem Tastendruck.
2. **Alle Daten im Client**, einschließlich aller Verkäufe.
3. **Kategorien und Teile im Client, Verkäufe nach Bedarf vom Server** gefiltert nach Zeitraum.

## Entscheidung
Variante 3. Begründung: Kategorien und Teile sind wenige und werden ständig gebraucht; im Speicher (`store.ts`) laufen Suche und Filter ohne Server-Anfrage. Verkäufe wachsen dagegen unbegrenzt und werden nur für die Auswertung gebraucht; sie werden in `views/verkauf.ts` je Zeitraum abgefragt.

## Konsequenzen
- \+ Suche und Filter reagieren sofort, auch bei schwacher Verbindung.
- \+ Eigene Buchungen werden ohne weitere Anfrage im Datenstand übernommen.
- \+ Die Menge der Verkäufe belastet den Start nicht.
- − Beim Start werden alle Kategorien und Teile geladen; bei sehr großen Lagern würde das langsamer (Risiko zu Q-02).
- − Der Datenstand muss mit dem Server abgestimmt werden (siehe ADR-004).
- − Die Verkaufsübersicht greift direkt auf den Datenzugriff zu (gelockerte Schichtung).

## Überwachung
Messung zu Q-02 im Meilenstein `v0.9` mit 1.000 Testteilen. Wächst das Lager deutlich über 1.000 Teile, wird eine Suche auf dem Server erneut geprüft.

## Bezug
Q-01, Q-02; NFR-01, NFR-02; US-07, US-08, US-13; ADR-004
