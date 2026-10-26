import { backend } from '../backend';
import { store } from '../store';
import type { View, Vorlage } from '../types';
import { eingabe, frage } from '../ui/modal';
import { toast } from '../ui/toast';
import { esc, fehlerText } from '../util';

export const VORLAGEN: { id: Vorlage; name: string; felder: string }[] = [
  { id: 'standard', name: 'Standard', felder: 'Nur die gemeinsamen Felder: Bezeichnung, Artikelnr., Lagerort, Lieferant, Fahrzeuge' },
  { id: 'oel', name: 'wie Öle', felder: '+ Viskosität, Freigabe, Gebindegröße' },
  { id: 'filter', name: 'wie Filter', felder: '+ Hersteller' },
  { id: 'reifen', name: 'wie Reifen', felder: '+ Breite, Höhe, Zoll, Index, Saison, Marke, DOT' },
];

export function vorlageName(v: Vorlage): string {
  return VORLAGEN.find((x) => x.id === v)?.name ?? v;
}

export function kategorienView(): View {
  let root: HTMLElement;

  function renderListe(): void {
    const ziel = root.querySelector<HTMLElement>('#kat-liste')!;
    if (store.kategorien.length === 0) {
      ziel.innerHTML = '<p class="karte-leer">Noch keine Kategorien. Rechts die erste anlegen.</p>';
      return;
    }
    ziel.innerHTML = `<div class="scroll-x"><div class="liste" style="min-width:560px">
      <div class="kat-zeile kat-zeile-kopf" aria-hidden="true"><span>Kategorie</span><span>Vorlage</span><span class="rechts">Teile</span><span></span></div>
      ${store.kategorien
        .map((k) => {
          const anzahl = store.teile.filter((t) => t.kategorie_id === k.id).length;
          return `<div class="kat-zeile">
            <span class="fett gross">${esc(k.name)}</span>
            <span><span class="etikett">${esc(vorlageName(k.vorlage))}</span></span>
            <span class="rechts zahl-mittel">${anzahl}</span>
            <span class="knopf-reihe-klein">
              <button type="button" class="btn btn-klein" data-umbenennen="${k.id}">Umbenennen</button>
              ${
                anzahl === 0
                  ? `<button type="button" class="btn btn-klein btn-gefahr-rand" data-kat-loeschen="${k.id}">Löschen</button>`
                  : `<button type="button" class="btn btn-klein" disabled title="Erst alle Teile in eine andere Kategorie verschieben">Löschen</button>`
              }
            </span>
          </div>`;
        })
        .join('')}
    </div></div>
    <p class="liste-fuss">Löschen geht nur, wenn keine Teile mehr in der Kategorie sind.</p>`;
  }

  return {
    mount(r) {
      root = r;
      root.innerHTML = `
        <div class="seiten-kopf"><h1>Kategorien</h1></div>
        <div class="zwei-spalten">
          <section class="karte karte-liste spalte-breit" id="kat-liste"></section>
          <form class="karte karte-polster karte-akzent stapel spalte-schmal" id="kat-form">
            <h2>Neue Kategorie</h2>
            <div class="feld">
              <label for="kat-name">Name</label>
              <input id="kat-name" name="name" class="input" type="text" placeholder="z. B. Werkzeug" required>
            </div>
            <fieldset class="feldgruppe">
              <legend>Welche Felder sollen die Teile haben?</legend>
              <div class="stapel-klein">
                ${VORLAGEN.map(
                  (v, i) => `<label class="vorlage-karte">
                    <input type="radio" name="vorlage" value="${v.id}"${i === 0 ? ' checked' : ''}>
                    <span><span class="vorlage-name">${esc(v.name)}</span><span class="vorlage-felder">${esc(v.felder)}</span></span>
                  </label>`,
                ).join('')}
              </div>
            </fieldset>
            <button type="submit" class="btn btn-primaer btn-gross">Kategorie anlegen</button>
          </form>
        </div>`;

      root.querySelector<HTMLFormElement>('#kat-form')!.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement;
        const d = new FormData(form);
        const name = String(d.get('name') ?? '').trim();
        const vorlage = String(d.get('vorlage') ?? 'standard') as Vorlage;
        if (!name) {
          toast('Bitte einen Namen eingeben.', { fehler: true });
          return;
        }
        try {
          await backend.kategorieAnlegen(name, vorlage);
          await store.laden();
          store.melde('kategorien');
          form.reset();
          toast(`Kategorie „${name}“ angelegt.`);
        } catch (err) {
          toast(fehlerText(err), { fehler: true });
        }
      });

      root.addEventListener('click', async (e) => {
        const el = e.target as HTMLElement;
        const um = el.closest<HTMLElement>('[data-umbenennen]');
        if (um) {
          const k = store.kategorie(Number(um.dataset.umbenennen));
          if (!k) return;
          const neu = await eingabe('Kategorie umbenennen', 'Neuer Name', k.name);
          if (!neu || neu === k.name) return;
          try {
            await backend.kategorieUmbenennen(k.id, neu);
            await store.laden();
            store.melde('kategorien');
            toast('Kategorie umbenannt.');
          } catch (err) {
            toast(fehlerText(err), { fehler: true });
          }
          return;
        }
        const lo = el.closest<HTMLElement>('[data-kat-loeschen]');
        if (lo) {
          const k = store.kategorie(Number(lo.dataset.katLoeschen));
          if (!k) return;
          const ok = await frage({
            titel: 'Kategorie löschen?',
            text: `Die Kategorie <strong>${esc(k.name)}</strong> wird gelöscht.`,
            ja: 'Löschen',
            gefahr: true,
          });
          if (!ok) return;
          try {
            await backend.kategorieLoeschen(k.id);
            await store.laden();
            store.melde('kategorien');
            toast('Kategorie gelöscht.');
          } catch (err) {
            toast(fehlerText(err), { fehler: true });
          }
        }
      });

      renderListe();
    },
    update() {
      renderListe();
    },
  };
}
