# ADR-001: Schichtenarchitektur im Client mit Client-Server-Verteilung und Live-Aktualisierung

**Status:** Akzeptiert
**Umgesetzt seit:** 26.10.2026 (erste Version)
**Dokumentiert:** 27.11.2026

## Kontext
- Ein Nutzer (Inhaber) arbeitet von PC und Handy; beide sollen denselben Bestand sehen.
- Gleichzeitige Buchungen dürfen keinen Bestand verfälschen (Q-03, NFR-06).
- Buchungen und Suche sollen sich sofort anfühlen (Q-01, Q-02).
- Es gibt kein Budget für einen eigenen Server (RB-02).

## Betrachtete Alternativen
1. Monolith mit eigenem Server
2. Microservices
3. Reine Client-Anwendung ohne Server
4. Schichten im Client, zentrale Datenbank als Server, ereignisgesteuerte Live-Aktualisierung

## Entscheidung
Variante 4. Der Stil folgt aus den Qualitätsszenarien und Taktiken (Herleitung mit Attribute-Driven Design in `../architekturstil.md`): Die Integrität verlangt eine zentrale Datenbank (Client-Server), das Vorhalten der Daten verlangt eine eigene Anwendungsschicht im Client (Schichten), und die Abstimmung zwischen Geräten erfolgt über Ereignisse.

## Konsequenzen
- \+ Klare Trennung von Oberfläche, Abläufen und Datenzugriff (Wartbarkeit, Q-09).
- \+ Kein eigener Server nötig.
- \+ Schnelle Oberfläche durch Daten im Client.
- − Regeln liegen an zwei Orten (Client und Datenbank).
- − Gelockerte Schichtung: Einige Seiten greifen direkt auf den Datenzugriff zu; `ui/buchung.ts` hängt von Dialogen der Präsentation ab.

## Überwachung
Bei jeder größeren Änderung prüfen, ob neue Abhängigkeiten die Schichten weiter aufweichen (Paketdiagramm in `../komponenten.md` aktuell halten). Wird die Lockerung zum Problem, werden die direkten Zugriffe der Seiten über den Datenstand geführt.

## Bezug
Q-01, Q-02, Q-03, Q-09; NFR-01, NFR-02, NFR-06, NFR-09; RB-01, RB-02
