import type { Kategorie, Teil } from './types';

/** Text sicher in HTML einsetzen */
export function esc(wert: unknown): string {
  if (wert === null || wert === undefined) return '';
  return String(wert)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Zahl mit echtem Minuszeichen */
export function zahl(n: number): string {
  return n < 0 ? `−${Math.abs(n).toLocaleString('de-DE')}` : n.toLocaleString('de-DE');
}

/** Änderung mit Vorzeichen, z. B. +20 / −1 */
export function delta(n: number): string {
  return n > 0 ? `+${n.toLocaleString('de-DE')}` : zahl(n);
}

export function reifenGroesse(t: Pick<Teil, 'breite' | 'hoehe' | 'zoll' | 'reifen_index'>): string {
  if (!t.breite && !t.hoehe && !t.zoll) return '';
  const zoll = t.zoll !== null && t.zoll !== undefined ? String(t.zoll).replace('.', ',').replace(/,0$/, '') : '';
  const basis = `${t.breite ?? '?'}/${t.hoehe ?? '?'} R${zoll || '?'}`;
  return t.reifen_index ? `${basis} ${t.reifen_index}` : basis;
}

/** Kurze Zusatz-Zeile unter dem Namen, je nach Vorlage der Kategorie */
export function teilInfo(t: Teil, kat: Kategorie | undefined): string {
  const teile: string[] = [];
  if (t.artikelnummer) teile.push(`Art.-Nr. ${t.artikelnummer}`);
  switch (kat?.vorlage) {
    case 'oel':
      if (t.viskositaet) teile.push(t.viskositaet);
      if (t.freigabe) teile.push(t.freigabe);
      if (t.gebinde) teile.push(t.gebinde);
      break;
    case 'filter':
      if (t.hersteller) teile.push(t.hersteller);
      break;
    case 'reifen': {
      const g = reifenGroesse(t);
      if (g) teile.push(g);
      if (t.saison) teile.push(t.saison);
      if (t.marke) teile.push(t.marke);
      if (t.dot) teile.push(`DOT ${t.dot}`);
      break;
    }
    default:
      break;
  }
  if (t.fahrzeuge) teile.push(t.fahrzeuge);
  return teile.join(' · ');
}

function normalisiere(s: string): string {
  return s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
}

/** Alle Wörter der Suche müssen irgendwo im Teil vorkommen */
export function passtZuSuche(t: Teil, kat: Kategorie | undefined, suche: string): boolean {
  const woerter = normalisiere(suche).split(/\s+/).filter(Boolean);
  if (woerter.length === 0) return true;
  const heuhaufen = normalisiere(
    [
      t.bezeichnung, t.artikelnummer, t.ean, t.lieferant, t.lagerort, t.fahrzeuge,
      t.viskositaet, t.freigabe, t.gebinde, t.hersteller, t.marke, t.saison, t.dot,
      reifenGroesse(t), kat?.name,
    ]
      .filter(Boolean)
      .join(' '),
  );
  // "ölfilter" soll auch "Öl-Filter" finden: Leerzeichen/Bindestriche zusätzlich ignorieren
  const kompakt = heuhaufen.replace(/[\s\-/]/g, '');
  return woerter.every((w) => heuhaufen.includes(w) || kompakt.includes(w.replace(/[\s\-/]/g, '')));
}

export type Status = 'ok' | 'leer' | 'minus';

export function status(bestand: number): Status {
  if (bestand < 0) return 'minus';
  if (bestand === 0) return 'leer';
  return 'ok';
}

export function statusText(bestand: number, einheit: string): string {
  const s = status(bestand);
  if (s === 'minus') return 'Im Minus – prüfen';
  if (s === 'leer') return 'Leer';
  return einheit;
}

export function zeit(iso: string): string {
  return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

export function datum(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** "Heute 14:40", "Gestern 09:12" oder "Mo, 05.10. 11:00" */
export function wann(iso: string): string {
  const d = new Date(iso);
  const heute = new Date();
  const gestern = new Date();
  gestern.setDate(heute.getDate() - 1);
  const gleich = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (gleich(d, heute)) return `Heute ${zeit(iso)}`;
  if (gleich(d, gestern)) return `Gestern ${zeit(iso)}`;
  const tag = d.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });
  return `${tag} ${zeit(iso)}`;
}

export function leerZuNull(s: FormDataEntryValue | null): string | null {
  const v = typeof s === 'string' ? s.trim() : '';
  return v === '' ? null : v;
}

export function zahlOderNull(s: FormDataEntryValue | null): number | null {
  const v = typeof s === 'string' ? s.trim().replace(',', '.') : '';
  if (v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function ganzzahl(s: string | null | undefined, fallback = 0): number {
  const n = parseInt(String(s ?? '').trim(), 10);
  return Number.isFinite(n) ? n : fallback;
}

/** Fehlermeldungen von Supabase verständlich machen */
export function fehlerText(e: unknown): string {
  const msg =
    typeof e === 'object' && e !== null && 'message' in e ? String((e as { message: unknown }).message) : String(e);
  const code = typeof e === 'object' && e !== null && 'code' in e ? String((e as { code: unknown }).code) : '';
  if (code === '23503') return 'Das geht nicht: Es hängen noch Teile oder Buchungen daran.';
  if (code === '23505') return 'Diesen Namen gibt es schon.';
  if (/Failed to fetch|NetworkError|network/i.test(msg)) return 'Keine Verbindung zum Server. Ist das Internet da?';
  if (/JWT|not authenticated|Nicht angemeldet/i.test(msg)) return 'Die Anmeldung ist abgelaufen. Bitte neu anmelden.';
  if (/Invalid login credentials/i.test(msg)) return 'Passwort falsch.';
  return msg || 'Unbekannter Fehler';
}

export const ICON = {
  logo: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
  suche: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  download: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>',
  warnung: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 2 21h20L12 3z"/><path d="M12 10v5"/><path d="M12 18h.01"/></svg>',
};
