export type Vorlage = 'standard' | 'oel' | 'filter' | 'reifen';

export type Saison = 'Sommer' | 'Winter' | 'Ganzjahr';

export interface Kategorie {
  id: number;
  name: string;
  vorlage: Vorlage;
  sortierung: number;
}

export interface Teil {
  id: number;
  kategorie_id: number;
  bezeichnung: string;
  artikelnummer: string | null;
  ean: string | null;
  lieferant: string | null;
  lagerort: string | null;
  fahrzeuge: string | null;
  einheit: 'Stück' | 'Packung';
  bestand: number;
  viskositaet: string | null;
  freigabe: string | null;
  gebinde: string | null;
  hersteller: string | null;
  breite: number | null;
  hoehe: number | null;
  zoll: string | null;
  reifen_index: string | null;
  saison: Saison | null;
  marke: string | null;
  dot: string | null;
  erstellt_am: string;
  geaendert_am: string;
}

/** Felder, die beim Anlegen/Bearbeiten gesendet werden (ohne Bestand) */
export type TeilEingabe = Omit<Teil, 'id' | 'bestand' | 'erstellt_am' | 'geaendert_am'>;

export type BuchungsArt = 'zugang' | 'verkauf' | 'korrektur' | 'storno';

export interface Buchung {
  id: number;
  teil_id: number | null;
  teil_bezeichnung: string;
  kategorie_name: string | null;
  art: BuchungsArt;
  menge: number;
  bestand_nachher: number | null;
  person: string;
  notiz: string | null;
  storniert: boolean;
  storno_von: number | null;
  erstellt_am: string;
}

export interface View {
  /** Baut die Seite einmal auf */
  mount(root: HTMLElement): void;
  /** Wird aufgerufen, wenn sich Daten geändert haben (z. B. durch den anderen PC) */
  update(): void;
  /** Aufräumen beim Verlassen der Seite */
  unmount?(): void;
}
