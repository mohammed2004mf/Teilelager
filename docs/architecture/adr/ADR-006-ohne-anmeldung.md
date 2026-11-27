# ADR-006: Betrieb ohne Anmeldung

**Status:** Akzeptiert
**Umgesetzt seit:** 02.11.2026 (Commit „Ohne Anmeldung: Programm öffnet sich direkt“)
**Dokumentiert:** 27.11.2026

## Kontext
- Die erste Version (26.10.2026) hatte eine Anmeldung mit Namen und Passwort über Supabase. Am 02.11.2026 wurde sie zunächst auf „nur Passwort“ vereinfacht und danach ganz entfernt.
- Grund laut Code und README: Wunsch der Werkstatt, das Programm ohne Passwort direkt zu öffnen.
- Das Programm wird nur vom Inhaber genutzt (R-01) und speichert keine personenbezogenen Daten (NFR-08).
- Ohne Anmeldung kann jeder, der die Adresse kennt, lesen und buchen.

## Betrachtete Alternativen
1. **Anmeldung mit Name und Passwort** (ursprüngliche Lösung): sicher, aber für den Alltag des Inhabers umständlich.
2. **Anmeldung nur mit Passwort** (Zwischenlösung am 02.11.2026): einfacher, aber weiterhin eine Hürde.
3. **Ohne Anmeldung**, ergänzt um flankierende Maßnahmen: Seiten nicht indexierbar (`noindex` in `vercel.json`), nur HTTPS, keine personenbezogenen Daten, Adresse nicht weitergeben.

## Entscheidung
Variante 3, auf Wunsch des Auftraggebers. Die Bedienbarkeit hat für den Auftraggeber Vorrang vor dem Zugriffsschutz. Das Restrisiko wird bewusst akzeptiert; die flankierenden Maßnahmen begrenzen, wer die Anwendung findet und was dort zu holen ist.

## Konsequenzen
- \+ Das Programm öffnet sich sofort, ohne Passwort (Usability, Q-06).
- \+ Keine Verwaltung von Konten und Passwörtern.
- − Jeder mit der Adresse kann den Bestand sehen und buchen; die Zugriffsregeln der Datenbank sind dafür offen.
- − Buchungen sind keiner Person zuordenbar (im Feld `person` steht „Werkstatt“).
- − Sicherheit beruht darauf, dass die Adresse geheim bleibt („Security through Obscurity“).
- − Reste der früheren Anmeldung sind noch im Code (technische Schuld, siehe `../architekturstil.md`).

## Überwachung
Der Inhaber prüft die Verkaufsübersicht regelmäßig auf Verkäufe, die er nicht eingetragen hat. Tauchen solche auf oder wird die Adresse bekannt, wird die Anmeldung (Variante 1 oder 2) wieder eingeführt; der Status dieses ADR wechselt dann auf „ersetzt“.

## Bezug
Q-05, Q-06; NFR-03, NFR-08; R-01; ADR-002
