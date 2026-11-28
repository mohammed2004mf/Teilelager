# KI-Nutzung

Offenlegung des Einsatzes generativer KI in diesem Projekt (Lehrveranstaltung Software Engineering, WS 2026/27).

- **Verwendetes Werkzeug:** Claude (Anthropic), über Claude Code.
- **Form der Angaben:** Pro Artefakt wird festgehalten, wofür die KI genutzt wurde und was selbst geprüft, geändert oder entschieden wurde.

## Übersicht je Artefakt

| Artefakt | KI-Einsatz (wofür) | Eigene Prüfung / Entscheidung |
|---|---|---|
| Projektstruktur (`docs/`, `tests/`, `CHANGELOG.md`, `ki-nutzung.md`) | Anlegen der Ordner und Platzhalterdateien nach der empfohlenen Struktur der Aufgabenstellung | _noch auszufüllen_ |
| Zuordnung ADR zu NFR und 4+1-Sichten (`docs/architecture/entscheidungen-und-nfr.md`, `docs/architecture/sichten.md`) | Entwurf der Zuordnungsmatrix mit positiven und negativen Wirkungen und Trade-offs sowie der Zuordnung der Dokumente zu den Sichten nach dem 4+1-Modell | _noch auszufüllen_ |
| Fehlerbehebung Zoll-Feld bei Reifen (`src/views/teilForm.ts`, `src/views/lagerliste.ts`, `src/util.ts`, `src/types.ts`, `src/backup.ts`, `supabase/schema.sql`) | Ursachenanalyse und Umsetzung: Zoll-Feld von Zahl auf Text umgestellt (Formular, Filter, Datentyp, Datenbankspalte mit Umstellung vorhandener Werte), Anzeige der Reifengröße und Zoll-Filter angepasst | Fehler vom Nutzer gemeldet; Anforderung (Buchstaben vor und nach der Zahl) vom Nutzer vorgegeben |
| Architecture Decision Records (`docs/architecture/adr/`) | Entwurf von sechs ADRs nach der Vorlage der Folien (Kontext, Alternativen, Entscheidung, Status, Konsequenzen, Überwachung); Umsetzungsdaten aus der Git-Historie, Alternativen nachträglich bewertet | Vom Nutzer durchgesehen und ohne inhaltliche Änderungen übernommen |
| Komponenten, Verteilung, Pakete (`docs/architecture/komponenten.md`, `docs/architecture/diagramme/`) | Erstellung von Komponenten-, Verteilungs- und Paketdiagramm als PlantUML-Quelltext nach der Notation der Folien und Erzeugung der SVG-Bilder; Beschreibung von Komponenten, Schnittstellen, Knoten und Kommunikationspfaden | Vom Nutzer durchgesehen und ohne inhaltliche Änderungen übernommen |
| Strukturen (`docs/architecture/strukturen.md`) | Ermittlung der Modul-, dynamischen und Allokationsstrukturen aus dem Quellcode und dem Datenbankschema (Importe, Datenfluss, Sperren in den Datenbankfunktionen) und Entwurf des Dokuments nach den Folien | Vom Nutzer durchgesehen und ohne inhaltliche Änderungen übernommen |
| Qualitätsszenarien (`docs/architecture/qualitaetsszenarien.md`) | Entwurf des Utility Tree und der messbaren Qualitätsszenarien aus den NFRs sowie einer ATAM-Kurzanalyse nach Folien und Übung 3 | Vom Nutzer durchgesehen und ohne inhaltliche Änderungen übernommen |
| Architekturstil (`docs/architecture/architekturstil.md`) | Analyse der Modulabhängigkeiten im Quellcode und Herleitung des Stils mit Attribute-Driven Design (Szenarien, Taktiken, Muster, Module, Schnittstellen, Prüfung gegen UC-01), Alternativen und Konsequenzen nach dem Architekturkapitel | Vom Nutzer durchgesehen und ohne inhaltliche Änderungen übernommen |
| Nichtfunktionale Anforderungen (`docs/requirements/nichtfunktionale-anforderungen.md`) | Entwurf von zehn messbaren Qualitätsanforderungen nach ISO/IEC 25010 und fünf Randbedingungen, abgeleitet aus dem vorhandenen Programm; Zielwerte sind teilweise Annahmen und als solche gekennzeichnet | Zielwerte vom Nutzer als zutreffend bestätigt. Angaben zur Teilezahl (ca. 500), zum Verzicht auf Datensicherung und zum Datenschutz stammen vom Nutzer |
| Priorisierung (`docs/requirements/priorisierung.md`) | Entwurf der MoSCoW-Einstufung mit Begründung für User Stories, nichtfunktionale Anforderungen und Use Cases | Einstufungen vom Nutzer als zutreffend bestätigt |
| Use Cases (`docs/requirements/use-cases.md`) | Entwurf des Use-Case-Diagramms (Mermaid) und von sechs Use Cases in der Vorlage des Kurses, abgeleitet aus den User Stories und dem vorhandenen Programm; dabei Korrektur eines Fehlers in `user-stories.md` und `README.md` (Ablauf „Rückgängig“) | Abläufe vom Nutzer durchgesehen und als zutreffend bestätigt |
| User Stories (`docs/requirements/user-stories.md`) | Entwurf der Epics, User Stories und Akzeptanzkriterien, abgeleitet aus dem vorhandenen Programm (Oberfläche und Quellcode) | Vom Nutzer durchgesehen und ohne inhaltliche Änderungen übernommen |
| Stakeholder und Nutzerrollen (`docs/requirements/stakeholder.md`) | Entwurf und Formulierung des Dokuments; Gliederung nach den Stakeholder-Kategorien aus dem Kurs (Kunde, Nutzer, Entwickler) | Die Angaben zu Auftraggeber, Nutzer und Anzahl der Nutzer stammen vom Nutzer |
| Produktvision (`docs/requirements/vision.md`) | Sprachliche und strukturelle Überarbeitung zu einem Fließtext mit Problem, Zielgruppe und Nutzen | Die Inhalte (Ausgangslage der Werkstatt, Zielgruppe, Nutzen) stammen vom Nutzer; die KI hat sie nur formuliert und gegliedert |

## Hinweise
- Die Angaben zur eigenen Prüfung werden ergänzt, sobald die jeweiligen Artefakte geprüft wurden.
- Der bereits vorhandene Quellcode (Commits vom 26.10. bis 16.11.2026) ist hier noch nicht eingeordnet; die Angaben zu seiner Entstehung werden ergänzt.
