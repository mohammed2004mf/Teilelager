# Architektursichten (4+1-Modell)

**Produkt:** Teilelager – Lager und Verkauf für die Werkstatt
**Stand:** 27.11.2026 (Entwurf, noch zu prüfen)

Wie Stadtpläne für verschiedene Zwecke zeigt jede Architektursicht einen eigenen Ausschnitt für bestimmte Stakeholder. Nach dem 4+1-Modell von Kruchten, wie in der Vorlesung vorgestellt, verbinden die Szenarien (+1) die vier Sichten. Dieses Dokument ordnet die vorhandenen Diagramme und Dokumente den Sichten zu.

## 1 Übersicht

| Sicht | Fokus | Elemente | Stakeholder | Diagramm | Fundort |
|---|---|---|---|---|---|
| Logisch | Funktionale Anforderungen | Klassen, Objekte, Beziehungen (`Teil`, `Kategorie`, `Buchung`) | Inhaber (Fachexperte), Entwickler | Klassendiagramm | `docs/design/` (Meilenstein `v0.3`) |
| Entwicklung | Statische Softwarestruktur | Module, Schichten, Komponenten | Entwickler, Dozent | Komponentendiagramm, Paketdiagramm | `komponenten.md`, `strukturen.md` |
| Prozess | Nebenläufigkeit, Abläufe, Performance | Abläufe zur Laufzeit, Ereignisse, Sperren | Entwickler | Sequenz- und Aktivitätsdiagramme, Tabellen zur Nebenläufigkeit | `strukturen.md` (Abschnitt 2), Sequenzdiagramme in `docs/design/` (`v0.3`) |
| Physisch | Deployment | Knoten, Artefakte, Kommunikationspfade | Entwickler (Betrieb) | Verteilungsdiagramm | `komponenten.md` (Abschnitt 2) |
| Szenarien (+1) | Verhalten aus Nutzersicht | Use Cases, Abläufe | alle | Use-Case-Diagramm | `docs/requirements/use-cases.md` |

## 2 Die Sichten am Beispiel Teilelager

| Sicht | Beispiel |
|---|---|
| Logisch | Ein Teil gehört zu einer Kategorie; eine Buchung (Verkauf oder Rückgängig) bezieht sich auf ein Teil. |
| Entwicklung | Präsentationsschicht → Anwendungsschicht → Datenzugriffsschicht im Client; Datenbank auf dem Server. |
| Prozess | Zwei Geräte buchen gleichzeitig auf dasselbe Teil; die Datenbank führt die Buchungen nacheinander aus, und der Live-Kanal meldet die Änderung an das andere Gerät. |
| Physisch | Die Webanwendung kommt von Vercel und läuft im Browser auf PC oder Handy; die Datenbank läuft bei Supabase. |
| Szenario | Teil suchen → Menge eingeben → Verkauf eintragen → neuer Bestand erscheint (UC-01). |

## 3 Begründung der gewählten Sichten

- **Entwicklung und Physisch** sind für den Entwickler die wichtigsten Sichten: Sie zeigen, wo Änderungen ansetzen und wie das System betrieben wird.
- **Prozess** ist nötig, weil die Integrität bei gleichzeitigen Buchungen (Q-03) der wichtigste Architekturtreiber ist und sich nur im Laufzeitverhalten zeigt.
- **Logisch** und die Sequenzdiagramme der Prozesssicht entstehen im Detailentwurf (Meilenstein `v0.3`) und werden dann hier verlinkt.
- **Szenarien** verbinden alle Sichten: UC-01 „Verkauf erfassen“ wird in `architekturstil.md` gegen den Entwurf geprüft und dient später als Grundlage für Sequenzdiagramm und Tests.
