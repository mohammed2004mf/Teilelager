# User Stories

**Produkt:** Teilelager – Lager und Verkauf für die Werkstatt
**Stand:** 25.11.2026 (Entwurf, noch zu prüfen)
**Rolle:** R-01 Inhaber (einzige Nutzerrolle, siehe `stakeholder.md`)

Die Stories folgen der Vorlage *Als ROLLE möchte ich FUNKTION, um NUTZEN zu erreichen.* Der Nutzen ist die Begründung der Story. Jede Story hat eine ID (`US-xx`) und Akzeptanzkriterien, aus denen später die Akzeptanztests abgeleitet werden. Die Priorisierung folgt in `priorisierung.md`.

## Epics

| ID | Epic | Beschreibung |
|---|---|---|
| EP-01 | Teile verwalten | Als Inhaber möchte ich die Teile meines Lagers erfassen und pflegen, um sie wiederzufinden. |
| EP-02 | Kategorien | Als Inhaber möchte ich Teile in Kategorien ordnen, um das Lager übersichtlich zu halten. |
| EP-03 | Bestand führen | Als Inhaber möchte ich den Bestand pflegen und einsehen, um jederzeit zu wissen, was da ist. |
| EP-04 | Verkäufe | Als Inhaber möchte ich Verkäufe erfassen und auswerten, um nachzuvollziehen, was verkauft wurde. |
| EP-05 | Bedienung | Als Inhaber möchte ich das Programm bequem im Alltag nutzen können. |

## EP-01 Teile verwalten

### US-01 Neues Teil anlegen
Als Inhaber möchte ich ein neues Teil mit seinen Angaben anlegen, um es im Lager zu führen und wiederzufinden.

Akzeptanzkriterien:
- Ein Teil braucht eine Kategorie. Die Bezeichnung ist optional; bleibt sie leer, bildet das System den Namen aus der Kategorie und den wichtigsten Angaben (zum Beispiel „Reifen 165/65 R15 81T“).
- Optional lassen sich Artikelnummer, Lieferant, Lagerort, passende Fahrzeuge und die Einheit (Stück oder Packung) erfassen.
- Je nach Kategorie-Vorlage erscheinen zusätzliche Felder: Öl/Flüssigkeit (Viskosität, Freigabe, Gebinde), Filter (Hersteller), Reifen (Breite, Höhe, Zoll, Index, Saison, Marke, DOT).
- Existiert ein gleiches Teil schon im Lager, erscheint eine Warnung.
- Mit „Speichern und nächstes Teil“ lassen sich mehrere Teile hintereinander anlegen.

### US-02 Teil ändern
Als Inhaber möchte ich die Angaben eines Teils ändern, um Fehler oder neue Informationen zu korrigieren.

Akzeptanzkriterien:
- Ein Teil lässt sich aus der Lagerliste per Klick auf den Namen öffnen und bearbeiten.
- Alle Angaben außer dem Bestand sind änderbar; der Bestand ändert sich nur über Bestandsbuchungen (US-05, US-06, US-10).
- Nach dem Speichern ist die Änderung sofort sichtbar.

### US-03 Teil löschen
Als Inhaber möchte ich ein Teil löschen, das ich nicht mehr führe, um die Lagerliste sauber zu halten.

Akzeptanzkriterien:
- Ein Teil lässt sich im Bearbeitungsformular löschen.
- Das Teil verschwindet danach aus der Lagerliste.
- Bereits erfasste Verkäufe dieses Teils bleiben in der Verkaufsübersicht erhalten.

## EP-02 Kategorien

### US-04 Kategorien verwalten
Als Inhaber möchte ich Kategorien anlegen, umbenennen und löschen, um das Lager nach meinen Bedürfnissen zu ordnen.

Akzeptanzkriterien:
- Eine neue Kategorie bekommt einen Namen und eine Vorlage (Standard, Öl, Filter oder Reifen), die bestimmt, welche Felder die Teile haben.
- Ein Kategoriename ist eindeutig.
- Eine Kategorie lässt sich umbenennen.
- Eine Kategorie lässt sich nur löschen, wenn sie keine Teile mehr enthält.

## EP-03 Bestand führen

### US-05 Lieferung eintragen
Als Inhaber möchte ich eine Lieferung als Zugang eintragen, um den Bestand aktuell zu halten.

Akzeptanzkriterien:
- Ich wähle ein Teil, gebe die Menge ein und füge sie dem Bestand hinzu.
- Der neue Bestand wird danach deutlich angezeigt.
- Die Menge muss größer als 0 sein.
- Der Zugang lässt sich auch direkt in der Liste über „+“ eintragen.

### US-06 Bestand korrigieren
Als Inhaber möchte ich nach dem Nachzählen den richtigen Bestand direkt eintragen, um Abweichungen auszugleichen.

Akzeptanzkriterien:
- Ich kann für ein Teil den gezählten Bestand direkt eingeben und speichern.
- Danach zeigt das Programm den eingegebenen Wert als Bestand an.
- Außerdem lässt sich eine Menge wegnehmen, ohne dass sie als Verkauf zählt. Ist die Menge größer als der Bestand, erscheint eine Warnung.

### US-07 Teile suchen
Als Inhaber möchte ich Teile schnell über ein Suchfeld finden, um nicht lange in der Liste zu suchen.

Akzeptanzkriterien:
- Die Suche findet Teile nach Bezeichnung, Artikelnummer, Reifengröße und Fahrzeug.
- Treffer erscheinen sofort beim Tippen.
- Ohne Treffer erscheint ein entsprechender Hinweis.

### US-08 Lagerliste filtern
Als Inhaber möchte ich die Lagerliste nach Kategorie, Status und Reifengröße filtern, um gezielt Teile zu finden.

Akzeptanzkriterien:
- Die Liste lässt sich nach Kategorie und nach Status (zum Beispiel nur leere Teile) filtern.
- Reifen lassen sich nach Breite, Höhe und Zoll filtern.
- Die Filter lassen sich mit einem Klick zurücksetzen.

### US-09 Leere Teile erkennen
Als Inhaber möchte ich auf einen Blick sehen, welche Teile leer sind, um rechtzeitig nachzubestellen.

Akzeptanzkriterien:
- Die Übersicht zeigt die Teile mit einem Bestand von 0 oder weniger als „Leer – nachbestellen“.
- Sind keine Teile leer, erscheint eine entsprechende Meldung.
- Ein negativer Bestand wird als „Im Minus – prüfen“ hervorgehoben.

## EP-04 Verkäufe

### US-10 Verkauf erfassen
Als Inhaber möchte ich einen Verkauf eintragen, um festzuhalten, was verkauft wurde, und den Bestand automatisch zu verringern.

Akzeptanzkriterien:
- Ich wähle ein Teil, gebe die Menge ein und trage den Verkauf ein.
- Der Bestand sinkt dabei um die verkaufte Menge.
- Der Verkauf wird mit Datum und Uhrzeit gespeichert.
- Der Verkauf lässt sich auch direkt in der Liste über „−“ eintragen.

### US-11 Verkauf über den Bestand hinaus
Als Inhaber möchte ich vor einem Verkauf über den Bestand hinaus gewarnt werden, um Fehler zu vermeiden, aber trotzdem verkaufen zu können.

Akzeptanzkriterien:
- Übersteigt die Menge den Bestand, erscheint eine Warnung.
- Mit „Trotzdem verkaufen“ wird der Verkauf gebucht und der Bestand wird negativ.
- Ein negativer Bestand wird hervorgehoben, bis er durch eine Lieferung oder Korrektur ausgeglichen ist.

### US-12 Verkauf rückgängig machen
Als Inhaber möchte ich einen Verkauf rückgängig machen, um Fehleingaben zu korrigieren.

Akzeptanzkriterien:
- In der Verkaufsübersicht hat jeder Verkauf einen Knopf „Rückgängig“.
- Vor dem Rückgängigmachen fragt das Programm nach einer Bestätigung.
- Der Bestand wird dabei wieder um die verkaufte Menge erhöht und der Verkauf als rückgängig gemacht gekennzeichnet.
- Ein Verkauf lässt sich nur einmal rückgängig machen.

### US-13 Verkäufe auswerten
Als Inhaber möchte ich meine Verkäufe nach Zeitraum ansehen, um nachzuvollziehen, was wann verkauft wurde.

Akzeptanzkriterien:
- Der Zeitraum lässt sich wählen: heute, diese Woche, dieser Monat oder ein eigener Zeitraum.
- Die Auswertung zeigt die Anzahl verkaufter Teile, die am meisten verkauften Teile und die einzelnen Verkäufe.
- Gibt es im Zeitraum keine Verkäufe, erscheint ein entsprechender Hinweis.

## EP-05 Bedienung

### US-14 Darstellung wählen
Als Inhaber möchte ich zwischen heller und dunkler Darstellung wechseln, um das Programm bei jeder Beleuchtung angenehm zu lesen.

Akzeptanzkriterien:
- In der Kopfzeile gibt es einen Knopf zum Wechseln der Darstellung.

### US-15 Auf dem Handy nutzen
Als Inhaber möchte ich das Programm auf dem Handy bedienen und als App installieren, um es direkt in der Werkstatt zu nutzen.

Akzeptanzkriterien:
- Die Seiten sind auf kleinen Bildschirmen bedienbar (zum Beispiel erscheinen die Kategorien dort als Karten statt als Tabelle).
- Das Programm lässt sich über den Browser als App installieren.

## Offene Punkte (vom Nutzer zu klären)
- Stimmen die Epics und Stories mit dem tatsächlichen Alltag in der Werkstatt überein, und fehlen Wünsche (zum Beispiel Nachbestellung, Lieferanten, Rechnungen)?
- Sind die Akzeptanzkriterien messbar genug? Die Messgrößen (zum Beispiel Antwortzeiten) folgen in den nichtfunktionalen Anforderungen.
