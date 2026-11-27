# Architekturentscheidungen und nichtfunktionale Anforderungen

**Produkt:** Teilelager – Lager und Verkauf für die Werkstatt
**Stand:** 27.11.2026 (Entwurf, noch zu prüfen)
**Issue:** #9

Die Projektaufgabe fragt: Welche Architekturentscheidung unterstützt welche nichtfunktionale Anforderung? Die Tabelle ordnet die ADRs aus `adr/` den nichtfunktionalen Anforderungen (`NFR-xx`) und den daraus abgeleiteten Qualitätsszenarien (`Q-xx`, siehe `qualitaetsszenarien.md`) zu. Wie in der Vorlesung betont, kann eine Entscheidung ein Qualitätsmerkmal stärken und ein anderes belasten (Trade-off); deshalb werden auch negative Wirkungen gezeigt.

**Legende:** `+` unterstützt · `−` belastet · leer: kein nennenswerter Einfluss

## 1 Matrix

| NFR (Szenario) | ADR-001 Stil | ADR-002 Supabase | ADR-003 Datenbankfunktionen | ADR-004 Ereignisse | ADR-005 Daten im Client | ADR-006 ohne Anmeldung |
|---|---|---|---|---|---|---|
| NFR-01 Buchungen schnell sichtbar (Q-01) | + | | + | + | + | |
| NFR-02 Suche sofort (Q-02) | + | | | | + | |
| NFR-03 Erlernbarkeit (Q-06) | | | | | | + |
| NFR-04 Schutz vor Fehlbedienung (Q-07) | | | + | | | |
| NFR-05 Nutzung auf dem Handy (Q-08) | | | | | | |
| NFR-06 Keine verlorenen Buchungen (Q-03) | + | + | + | | | |
| NFR-07 Erreichbarkeit (Q-04) | | − | | | | |
| NFR-08 Zugriffs- und Datenschutz (Q-05) | | | | | | − |
| NFR-09 Wartbarkeit (Q-09) | + | | − | | | |
| NFR-10 Browser, installierbar (Q-10) | + | | | | | |

## 2 Begründung je Zuordnung

| NFR | ADR | Wirkung | Begründung |
|---|---|---|---|
| NFR-01 | ADR-001 | + | Die Anwendungsschicht im Client übernimmt den neuen Bestand ohne weitere Anfrage. |
| NFR-01 | ADR-003 | + | Die Datenbankfunktion liefert den neuen Bestand direkt mit der Antwort; eine Anfrage pro Buchung. |
| NFR-01 | ADR-004 | + | Andere Geräte erfahren über Ereignisse sofort von der Änderung, ohne auf eine nächste Abfrage zu warten. |
| NFR-01 | ADR-005 | + | Der Bestand liegt im Datenstand des Clients und wird dort sofort aktualisiert. |
| NFR-02 | ADR-001 | + | Die Schichtung ermöglicht einen eigenen Datenstand im Client, in dem gesucht wird. |
| NFR-02 | ADR-005 | + | Suche und Filter laufen im Speicher des Clients ohne Netzverzögerung. |
| NFR-03 | ADR-006 | + | Das Programm öffnet sich ohne Passwort; der Einstieg entfällt. |
| NFR-04 | ADR-003 | + | Die Datenbank lehnt Mengen ≤ 0 ab und verhindert doppeltes Rückgängigmachen, unabhängig von der Oberfläche. |
| NFR-05 | – | – | Wird durch die Gestaltung der Oberfläche erreicht (Stylesheet), nicht durch eine Architekturentscheidung. |
| NFR-06 | ADR-001 | + | Die Client-Server-Verteilung schafft eine zentrale Stelle für alle Buchungen. |
| NFR-06 | ADR-002 | + | Supabase bietet eine relationale Datenbank mit Transaktionen und Zeilensperren. |
| NFR-06 | ADR-003 | + | Jede Bestandsänderung ist ein atomarer Schritt; gleichzeitige Buchungen laufen nacheinander. |
| NFR-07 | ADR-002 | − | Der kostenlose Tarif pausiert das Projekt nach etwa 7 Tagen ohne Nutzung; die Erreichbarkeit hängt vom Anbieter ab. |
| NFR-08 | ADR-006 | − | Ohne Anmeldung kann jeder mit der Adresse lesen und buchen. Abgemildert durch `noindex`, HTTPS und den Verzicht auf personenbezogene Daten. |
| NFR-09 | ADR-001 | + | Getrennte Schichten und die Schnittstelle `Backend` erleichtern Änderungen und Tests (zum Beispiel mit dem Demo-Backend). |
| NFR-09 | ADR-003 | − | Ein Teil der Geschäftslogik liegt in SQL und ist schwerer automatisiert zu testen. |
| NFR-10 | ADR-001 | + | Der Client ist eine reine Webanwendung und läuft in jedem aktuellen Browser. |

## 3 Trade-offs

| Trade-off | Entscheidung | Abwägung |
|---|---|---|
| Usability gegen Sicherheit | ADR-006 | NFR-03 wird gestärkt, NFR-08 geschwächt. Der Auftraggeber hat die Bedienbarkeit bewusst vorgezogen. |
| Integrität gegen Testbarkeit | ADR-003 | NFR-06 (Must) wird gesichert, NFR-09 erschwert. Die Integrität hat Vorrang, weil ein falscher Bestand die Vision verfehlt. |
| Kosten gegen Verfügbarkeit | ADR-002 | Keine laufenden Kosten (RB-02), dafür geringere Erreichbarkeit (NFR-07, Could). |

## 4 Abdeckung

- Alle Must-Anforderungen (NFR-06, NFR-08, NFR-09) sind mindestens einer Entscheidung zugeordnet. NFR-08 wird von ADR-006 bewusst geschwächt; das Risiko ist im ADR dokumentiert und akzeptiert.
- NFR-05 (Handy) hängt nicht an einer Architekturentscheidung, sondern an der Gestaltung der Oberfläche.
