import { backend } from '../backend';
import { store } from '../store';
import type { Buchung, Teil } from '../types';
import { esc, fehlerText, ganzzahl, status, statusText, teilInfo, zahl } from '../util';
import { frage } from './modal';
import { toast } from './toast';

const ARTNAME: Record<string, string> = {
  zugang: 'Zugang',
  verkauf: 'Verkauf',
  korrektur: 'Korrektur',
  storno: 'Rückgängig',
};

export function artName(art: string, notiz?: string | null): string {
  if (art === 'korrektur' && notiz === 'Anfangsbestand') return 'Anfangsbestand';
  return ARTNAME[art] ?? art;
}

/** Stückzahl als farbiger Kasten mit Text darunter */
export function bestandHtml(t: Teil, klein = false): string {
  const s = status(t.bestand);
  return `<div class="bestand">
    <span class="bestand-zahl bestand-${s}${klein ? ' bestand-klein' : ''}">${zahl(t.bestand)}</span>
    <span class="bestand-text bestand-text-${s}">${esc(statusText(t.bestand, t.einheit))}</span>
  </div>`;
}

/** − [Menge] + */
export function buchenKnoepfeHtml(t: Teil): string {
  return `<div class="buchen" data-teil-id="${t.id}">
    <button type="button" class="btn-rund" data-buchen="verkauf" aria-label="${esc(t.bezeichnung)} verkaufen" title="Verkaufen">−</button>
    <input type="number" class="menge" value="1" min="1" step="1" inputmode="numeric" aria-label="Menge für ${esc(t.bezeichnung)}">
    <button type="button" class="btn-rund" data-buchen="zugang" aria-label="Zugang für ${esc(t.bezeichnung)}" title="Zugang (Lieferung)">+</button>
  </div>`;
}

/** Eine Zeile wie in der Lagerliste */
export function teilZeileHtml(t: Teil, o: { kategorieZeigen?: boolean } = {}): string {
  const kat = store.kategorie(t.kategorie_id);
  const info = teilInfo(t, kat);
  return `<div class="teil-zeile teil-zeile-klickbar" data-bearbeiten="${t.id}" title="Klicken zum Bearbeiten">
    <div class="teil-name">
      ${o.kategorieZeigen && kat ? `<div class="mini-label">${esc(kat.name)}</div>` : ''}
      <a class="teil-titel" href="#/teil/${t.id}" title="Teil bearbeiten">${esc(t.bezeichnung)}</a>
      ${info ? `<div class="teil-info">${esc(info)}</div>` : ''}
    </div>
    <span class="teil-ort">${esc(t.lagerort ?? '')}</span>
    ${bestandHtml(t)}
    ${buchenKnoepfeHtml(t)}
  </div>`;
}

export function teilZeilenKopfHtml(): string {
  return `<div class="teil-zeile teil-zeile-kopf" aria-hidden="true">
    <span>Teil</span><span>Lagerort</span><span class="zentriert">Bestand</span><span class="rechts">− Verkauf · + Zugang</span>
  </div>`;
}

/** Verkauf buchen – mit Warnung, wenn nicht genug da ist */
export async function verkaufen(t: Teil, menge: number): Promise<Buchung | null> {
  if (menge <= 0) return null;
  if (menge > t.bestand) {
    const ok = await frage({
      titel: 'Nicht genug auf Lager',
      text: `Laut Programm ${t.bestand === 1 ? 'ist' : 'sind'} nur <strong>${zahl(t.bestand)} ${esc(t.einheit)}</strong> von <strong>${esc(
        t.bezeichnung,
      )}</strong> da. Trotzdem <strong>${menge} verkaufen</strong>?`,
      hinweis: `Der Bestand steht danach auf <strong class="text-rot">${zahl(t.bestand - menge)}</strong>. Am besten danach nachzählen oder die fehlende Lieferung eintragen.`,
      ja: 'Trotzdem verkaufen',
      warnung: true,
    });
    if (!ok) return null;
  }
  try {
    const b = await backend.buchen(t.id, 'verkauf', menge);
    store.uebernehmeBuchung(b);
    // Keine Meldung beim Verkauf (gewünscht) – Rückgängig geht über die Verkaufsseite
    return b;
  } catch (e) {
    toast(fehlerText(e), { fehler: true });
    return null;
  }
}

export async function zugang(t: Teil, menge: number): Promise<Buchung | null> {
  if (menge <= 0) return null;
  try {
    const b = await backend.buchen(t.id, 'zugang', menge);
    store.uebernehmeBuchung(b);
    // Keine Meldung beim Zugang (gewünscht) – Rückgängig geht über die Seite "Zugang"
    return b;
  } catch (e) {
    toast(fehlerText(e), { fehler: true });
    return null;
  }
}

export async function stornierenMitMeldung(b: Buchung): Promise<void> {
  const ok = await frage({
    titel: 'Buchung rückgängig machen?',
    text: `${esc(artName(b.art))} <strong>${esc(b.teil_bezeichnung)}</strong> (${b.menge > 0 ? '+' : ''}${zahl(
      b.menge,
    )}) wird rückgängig gemacht. Der Bestand wird entsprechend angepasst.`,
    ja: 'Rückgängig machen',
  });
  if (!ok) return;
  try {
    const s = await backend.stornieren(b.id);
    store.uebernehmeBuchung(s);
    toast('Rückgängig gemacht.');
  } catch (e) {
    toast(fehlerText(e), { fehler: true });
  }
}

/** Klicks auf − / + in einem Bereich behandeln (Event-Delegation) */
export function verbindeBuchen(root: HTMLElement): void {
  root.addEventListener('click', async (e) => {
    const ziel = e.target as HTMLElement;
    // Klick irgendwo auf die Zeile (außer auf − / Menge / +) öffnet "Teil bearbeiten"
    const zeile = ziel.closest<HTMLElement>('[data-bearbeiten]');
    if (zeile && root.contains(zeile) && !ziel.closest('.buchen, a, button, input, select, textarea')) {
      if (window.getSelection()?.toString()) return; // Text markieren soll nicht wegspringen
      location.hash = `#/teil/${zeile.dataset.bearbeiten}`;
      return;
    }
    const btn = ziel.closest<HTMLButtonElement>('[data-buchen]');
    if (!btn || !root.contains(btn)) return;
    const box = btn.closest<HTMLElement>('[data-teil-id]');
    if (!box) return;
    const t = store.teil(Number(box.dataset.teilId));
    if (!t) return;
    const input = box.querySelector<HTMLInputElement>('input.menge');
    const menge = Math.max(1, ganzzahl(input?.value, 1));
    btn.disabled = true;
    try {
      const b = btn.dataset.buchen === 'verkauf' ? await verkaufen(t, menge) : await zugang(t, menge);
      if (b && input) input.value = '1';
    } finally {
      btn.disabled = false;
    }
  });
  // Enter im Mengenfeld = Zugang? Nein – zu gefährlich. Enter tut nichts.
  root.addEventListener('keydown', (e) => {
    const el = e.target as HTMLElement;
    if (e.key === 'Enter' && el.matches('input.menge')) e.preventDefault();
  });
}
