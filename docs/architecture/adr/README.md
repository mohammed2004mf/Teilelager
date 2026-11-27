# Architecture Decision Records (ADRs)

**Issue:** #8

Architekturentscheidungen werden als kurze ADRs festgehalten, wie in der Vorlesung vorgestellt. Jeder ADR enthält Titel, Status, Kontext, betrachtete Alternativen, Entscheidung mit Begründung und Konsequenzen (positiv und negativ). Wie im leichtgewichtigen Entscheidungsprozess („fail fast“) nennt jeder ADR außerdem, woran sich zeigt, ob die Entscheidung funktioniert.

**Status:** vorgeschlagen, akzeptiert, veraltet, ersetzt.

**Hinweis zur Entstehung:** Die Entscheidungen wurden mit dem Code getroffen und umgesetzt (26.10. bis 16.11.2026). Die ADRs halten sie nachträglich fest; das Umsetzungsdatum stammt aus der Git-Historie. Die betrachteten Alternativen wurden bei der nachträglichen Dokumentation bewertet und sind nicht in jedem Fall schon bei der ursprünglichen Entscheidung erwogen worden.

| ADR | Titel | Ebene (nach Vorlesung) | Status |
|---|---|---|---|
| [ADR-001](ADR-001-architekturstil.md) | Schichtenarchitektur im Client mit Client-Server-Verteilung und Live-Aktualisierung | Architekturstil | Akzeptiert |
| [ADR-002](ADR-002-supabase-als-backend.md) | Supabase als Backend statt eigenem Server | Herkunft von Komponenten, Deployment | Akzeptiert |
| [ADR-003](ADR-003-bestand-ueber-datenbankfunktionen.md) | Bestand nur über Datenbankfunktionen ändern | Integrationsansatz, Datenhaltung | Akzeptiert |
| [ADR-004](ADR-004-live-aktualisierung.md) | Live-Aktualisierung über Ereignisse statt regelmäßiger Abfragen | Integrationsansatz (asynchron) | Akzeptiert |
| [ADR-005](ADR-005-daten-im-client.md) | Kategorien und Teile im Client vorhalten | Datenhaltung, Effizienz | Akzeptiert |
| [ADR-006](ADR-006-ohne-anmeldung.md) | Betrieb ohne Anmeldung | Sicherheitsmaßnahmen | Akzeptiert |
