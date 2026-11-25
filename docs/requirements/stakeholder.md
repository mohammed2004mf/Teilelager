# Stakeholder und Nutzerrollen

**Produkt:** Teilelager – Lager und Verkauf für die Werkstatt
**Stand:** 25.11.2026

## 1 Stakeholder

Stakeholder sind alle Personen und Organisationen mit einem Interesse am System. Sie werden nach Rollen beschrieben, nicht nach Personen.

| ID | Rolle | Wer | Interesse |
|---|---|---|---|
| SH-01 | Auftraggeber (Kunde) | Werkstatt NAS Wallsbüll | Überblick über das gesamte Lager und eine einfachere tägliche Arbeit im Vergleich zur bisherigen Verwaltung auf Zetteln |
| SH-02 | Nutzer | Inhaber der Werkstatt (eine Person) | Teile und Bestände schnell erfassen, Verkäufe festhalten und nachvollziehen, wann sie stattgefunden haben |
| SH-03 | Entwickler | Studierender (Projektbearbeiter) | Ein lauffähiges, nachvollziehbar dokumentiertes und getestetes System im Rahmen der Projektaufgabe liefern |
| SH-04 | Lehrender | Dozent der Lehrveranstaltung Software Engineering | Zueinander passende Artefakte von den Anforderungen bis zum Test, nachvollziehbar im Repository |

Auftraggeber und Nutzer fallen in der Praxis zusammen: Die Werkstatt ist der Auftraggeber, genutzt wird das Programm vom Inhaber.

## 2 Nutzerrollen

Es gibt genau eine Nutzerrolle.

| ID | Rolle | Anzahl | Beschreibung |
|---|---|---|---|
| R-01 | Inhaber | 1 Person | Verwaltet das Lager der Werkstatt und erfasst Verkäufe. Er nutzt alle Funktionen des Systems. Eine Unterscheidung nach Berechtigungen gibt es nicht. |

Aufgaben der Rolle R-01 im System (aus dem vorhandenen Programm abgeleitet, in den Anforderungen genauer beschrieben):
- Teile und Kategorien anlegen, ändern und löschen
- Bestand ändern (Lieferung eintragen, Bestand korrigieren)
- Verkäufe erfassen und rückgängig machen
- Verkäufe nach Zeitraum auswerten

## 3 Weitere Anforderungsquellen und Randbedingungen

| Quelle | Beschreibung |
|---|---|
| Altsystem | Bisherige Verwaltung der Teile auf Zetteln. Das neue System ersetzt sie. |
| Technische Randbedingungen | Das Programm ist eine Webanwendung (TypeScript, Vite) mit Supabase als Datenbank und Vercel als Hosting. |
| Projektrahmen | Projektaufgabe der Lehrveranstaltung: Abgabe am 18.12.2026 als Release `v1.0` im GitHub-Repository. |
