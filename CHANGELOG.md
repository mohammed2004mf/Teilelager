# Changelog

Alle wesentlichen Änderungen am Teilelager-Programm. Pro Meilenstein gibt es ein Release (Tag): `v0.1`, `v0.2`, `v0.3`, `v0.9`, `v1.0`.

## [Unveröffentlicht]

## [0.2] – 2026-11-27 – Architektur

### Hinzugefügt
- Architekturdokumente in `docs/architecture/`:
  - `qualitaetsszenarien.md`: Utility Tree und 10 messbare Qualitätsszenarien (`Q-01` bis `Q-10`), ATAM-Kurzanalyse
  - `architekturstil.md`: Herleitung des Architekturstils mit Attribute-Driven Design (Schichten im Client, Client-Server, ereignisgesteuerte Live-Aktualisierung), Alternativen und Konsequenzen
  - `strukturen.md`: Modul-, dynamische und Allokationsstrukturen
  - `komponenten.md` und `diagramme/`: Komponenten-, Verteilungs- und Paketdiagramm in UML-Notation (PlantUML)
  - `adr/`: sechs Architecture Decision Records (`ADR-001` bis `ADR-006`)
  - `entscheidungen-und-nfr.md`: Zuordnung der Entscheidungen zu den nichtfunktionalen Anforderungen mit Trade-offs
  - `sichten.md`: Zuordnung der Dokumente zu den Sichten des 4+1-Modells
- Issues und Meilensteine für die weitere Planung sowie ein Projekt-Board auf GitHub.

### Bekannt
- Technische Schuld im Code, dokumentiert in `architekturstil.md`: `backup.ts` verletzt die Schichtung und wird nicht mehr genutzt; Reste der früheren Anmeldung sind noch vorhanden. Bereinigung im Meilenstein `v0.9` geplant.

## [0.1] – 2026-11-25 – Anforderungen

### Hinzugefügt
- Projektstruktur für die Dokumentation und Tests: `docs/`, `tests/`, `CHANGELOG.md`, `ki-nutzung.md`.
- Anforderungsdokumente in `docs/requirements/`:
  - `vision.md`: Produktvision mit Leitsatz, Problem, Zielgruppe, Nutzen und Zielen
  - `stakeholder.md`: Stakeholder (`SH-01` bis `SH-04`) und Nutzerrolle Inhaber (`R-01`)
  - `user-stories.md`: 5 Epics und 15 User Stories (`US-01` bis `US-15`) mit Akzeptanzkriterien
  - `use-cases.md`: Use-Case-Diagramm und 6 Use Cases (`UC-01` bis `UC-06`) in der Kursvorlage
  - `nichtfunktionale-anforderungen.md`: 10 messbare Qualitätsanforderungen (`NFR-01` bis `NFR-10`) und Randbedingungen (`RB-01` bis `RB-05`)
  - `priorisierung.md`: Priorisierung nach MoSCoW mit Begründung
- `ki-nutzung.md`: Offenlegung des KI-Einsatzes je Artefakt.

### Geändert
- `README.md` neu strukturiert: Installation, Start und Bedienung, Tests, Projektstruktur und Dokumentation; Betrieb (Supabase, Vercel) ans Ende verschoben; auf einen Nutzer angepasst.

### Entfernt
- Veraltete Angaben zu Anmeldung und Benutzerverwaltung aus der `README.md`.

## Frühere Entwicklung (vor `v0.1`, 26.10. bis 16.11.2026)

Die Anwendung entstand vor der Dokumentation. Die Änderungen sind hier aus der Git-Historie zusammengefasst.

### Hinzugefügt
- Erste Version des Teilelagers mit Lager, Verkauf, Supabase-Anbindung und heller/dunkler Darstellung (26.10.).
- Installierbar als App: Manifest und App-Symbole (27.10.).
- „Bestand ändern“: Hinzufügen und Wegnehmen auf einer Seite, neuer Bestand groß sichtbar (02.11.).
- Marke als eigenes Feld für alle Teile, in Liste, Verkauf und Bestandsänderung über der Bezeichnung (15.11.).
- Warnung, wenn ein neues Teil schon im Lager existiert (15.11.).
- Kategorien: Handy-Ansicht als Karten statt abgeschnittener Tabelle (16.11.).

### Geändert
- Anmeldung nur mit Passwort, danach ganz ohne Anmeldung: Das Programm öffnet sich direkt (02.11.).
- Kein Verlauf mehr: Es werden nur Verkäufe gespeichert (02.11.).

### Entfernt
- Knopf „Sicherung herunterladen“ (02.11.).
