# Priorisierung

**Produkt:** Teilelager – Lager und Verkauf für die Werkstatt
**Stand:** 25.11.2026 (Entwurf, noch zu prüfen)

Die Anforderungen werden nach der MoSCoW-Methode priorisiert. Jede Einstufung hat eine Begründung (Rationale). Maßstab ist der Nutzen für die Vision (`vision.md`): ein verlässlicher Überblick über das Lager und die Nachvollziehbarkeit der Verkäufe.

| Stufe | Bedeutung |
|---|---|
| **Must** | Ohne diese Anforderung erfüllt das Produkt seinen Zweck nicht. |
| **Should** | Wichtig und im Normalfall vorgesehen, das Produkt bleibt aber ohne sie grundsätzlich nutzbar. |
| **Could** | Wünschenswert, wenn Zeit und Aufwand es erlauben. |
| **Won't** | Bewusst nicht Teil dieses Produkts. |

Die Stufen steuern auch die Reihenfolge beim Testen: Must-Anforderungen werden zuerst und am gründlichsten getestet.

## 1 User Stories

| ID | User Story | Priorität | Begründung |
|---|---|---|---|
| US-01 | Neues Teil anlegen | **Must** | Ohne erfasste Teile gibt es kein Lager und keinen Überblick. |
| US-04 | Kategorien verwalten | **Must** | Jedes Teil gehört zu einer Kategorie; ohne Kategorien lassen sich keine Teile anlegen. |
| US-05 | Lieferung eintragen | **Must** | Der Bestand muss sich erhöhen lassen, sonst ist er nie aktuell. |
| US-07 | Teile suchen | **Must** | Bei rund 500 Teilen ist die Suche Voraussetzung für schnelles Buchen im Alltag. |
| US-10 | Verkauf erfassen | **Must** | Kernfunktion; ersetzt die Zettel für Verkäufe. |
| US-13 | Verkäufe auswerten | **Must** | Die Vision nennt die Nachvollziehbarkeit der Verkäufe ausdrücklich als Nutzen. |
| US-02 | Teil ändern | **Should** | Angaben müssen korrigierbar sein, das Programm bleibt aber ohne diese Funktion grundsätzlich nutzbar. |
| US-06 | Bestand korrigieren | **Should** | Nachzählen gleicht Abweichungen aus; ein Notbehelf über Zugang und Wegnehmen ist möglich. |
| US-08 | Lagerliste filtern | **Should** | Erleichtert die Arbeit bei vielen Teilen, die Suche deckt den Kernbedarf ab. |
| US-09 | Leere Teile erkennen | **Should** | Hilft beim rechtzeitigen Nachbestellen, ist aber nicht der Kern der Vision. |
| US-11 | Verkauf über den Bestand hinaus | **Should** | Schützt vor Fehlbuchungen, ohne den Verkauf zu verhindern. |
| US-12 | Verkauf rückgängig machen | **Should** | Fehleingaben müssen korrigierbar sein; selten benötigt. |
| US-15 | Auf dem Handy nutzen | **Should** | Nutzung in der Werkstatt ist wahrscheinlich; hängt mit NFR-05 und NFR-10 zusammen. |
| US-03 | Teil löschen | **Could** | Teile können notfalls mit Bestand 0 im Lager bleiben. |
| US-14 | Darstellung wählen | **Could** | Komfort ohne Einfluss auf den Zweck des Produkts. |

## 2 Nichtfunktionale Anforderungen

| ID | Anforderung | Priorität | Begründung |
|---|---|---|---|
| NFR-06 | Keine verlorenen Buchungen | **Must** | Ein falscher Bestand macht die Lagerübersicht wertlos. |
| NFR-08 | Zugriffsschutz und Datenschutz | **Must** | Die Nutzung ohne Anmeldung ist bewusst gewählt; das Restrisiko muss festgehalten und gering gehalten werden (keine personenbezogenen Daten, nicht indexierbar). |
| NFR-09 | Modularer, geprüfter Quellcode | **Must** | Die Projektaufgabe verlangt Struktur, Coding-Standard und Tests. |
| NFR-01 | Buchungen sind schnell sichtbar | **Should** | Wartezeiten bremsen die Nutzung im Alltag. |
| NFR-02 | Suche liefert Treffer sofort | **Should** | Unterstützt US-07; Zielwerte sind für 500 bis 1.000 Teile unkritisch. |
| NFR-03 | Erlernbarkeit ohne Einweisung | **Should** | Der Inhaber soll ohne Schulung starten können. |
| NFR-04 | Schutz vor Fehlbedienung | **Should** | Fehleingaben sollen auffallen; im Programm bereits umgesetzt. |
| NFR-05 | Nutzung auf dem Handy | **Should** | Wie bei US-15. |
| NFR-10 | Aktuelle Browser, installierbar | **Should** | Der Inhaber soll das Programm geräteunabhängig nutzen können. |
| NFR-07 | Erreichbarkeit im Betrieb | **Could** | Die Zielwerte sind Annahmen; der kostenlose Tarif setzt Grenzen (siehe RB-02). |

## 3 Use Cases

Die Priorität der Use Cases folgt den zugehörigen User Stories.

| ID | Use Case | Priorität |
|---|---|---|
| UC-01 | Verkauf erfassen | Must (US-10) |
| UC-03 | Lieferung eintragen | Must (US-05) |
| UC-05 | Neues Teil anlegen | Must (US-01) |
| UC-06 | Verkäufe auswerten | Must (US-13) |
| UC-02 | Verkauf rückgängig machen | Should (US-12) |
| UC-04 | Bestand korrigieren | Should (US-06) |

## 4 Bewusst nicht Teil des Produkts (Won't)

| Thema | Begründung |
|---|---|
| Datensicherung | Der Auftraggeber verzichtet bewusst darauf (siehe RB-05 in `nichtfunktionale-anforderungen.md`). |
| Anmeldung und Benutzerverwaltung | Das Programm wird nur vom Inhaber genutzt und auf Wunsch der Werkstatt ohne Anmeldung betrieben (siehe NFR-08). |

## 5 Offene Punkte (vom Nutzer zu klären)
- Stimmen die Einstufungen mit dem Nutzen für die Werkstatt überein? Die Einordnung beruht auf der Vision und dem vorhandenen Programm. Zum Beispiel kann der Auftraggeber Teile löschen (US-03) oder Verkaufsauswertungen (US-13) anders gewichten.
