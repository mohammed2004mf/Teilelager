# ADR-004: Live-Aktualisierung über Ereignisse statt regelmäßiger Abfragen

**Status:** Akzeptiert
**Umgesetzt seit:** 26.10.2026 (erste Version)
**Dokumentiert:** 27.11.2026

## Kontext
- Ist das Programm auf mehreren Geräten oder in mehreren Tabs offen, soll eine Buchung überall sichtbar werden.
- Änderungen sind selten (ein Nutzer, einzelne Buchungen pro Minute).
- Der kostenlose Tarif begrenzt die Last (RB-02).

## Betrachtete Alternativen
1. **Keine Abstimmung:** Andere Geräte sehen Änderungen erst nach dem Neuladen der Seite.
2. **Regelmäßige Abfragen (Polling)**, zum Beispiel alle 10 Sekunden alle Teile laden: einfach, aber viele Anfragen ohne Änderung und Verzögerung bis zur nächsten Abfrage.
3. **Ereignisse über den Live-Kanal von Supabase (Publish/Subscribe):** Der Server meldet Änderungen an den Tabellen; der Client lädt nur dann nach.

## Entscheidung
Variante 3. Begründung: Anfragen entstehen nur bei tatsächlichen Änderungen. `store.ts` abonniert die Tabellen `kategorien`, `teile` und `buchungen`, fasst Ereignisse innerhalb von 150 ms zusammen und lädt die betroffenen Daten nach. Beim Zurückkehren in den Tab und nach Wiederherstellung der Internetverbindung wird alles neu geladen, damit verpasste Ereignisse keine Lücke hinterlassen.

## Konsequenzen
- \+ Andere Geräte sehen Änderungen fast sofort.
- \+ Kaum zusätzliche Last, solange nichts geändert wird.
- \+ Im Demo-Modus funktioniert dasselbe zwischen Tabs über `BroadcastChannel`.
- − Dauerhafte WebSocket-Verbindung pro offenem Tab.
- − Ereignisse während einer Verbindungsunterbrechung gehen verloren; abgefangen nur durch das Neuladen beim Wiederverbinden.
- − Nach jedem Ereignis werden die Teile vollständig neu geladen statt nur der geänderten Zeile.

## Überwachung
Bei den Tests prüfen: Eine Buchung auf Gerät A ist auf Gerät B nach wenigen Sekunden sichtbar. Treten im Betrieb veraltete Anzeigen auf, wird die Wiederverbindung überprüft oder ergänzend ein seltenes Polling eingeführt.

## Bezug
Q-01; NFR-01; ADR-002, ADR-005
