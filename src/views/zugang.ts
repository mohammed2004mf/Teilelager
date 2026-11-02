import { backend } from '../backend';
import { store } from '../store';
import type { Buchung, Teil, View } from '../types';
import { artName, stornierenMitMeldung, zugang } from '../ui/buchung';
import { toast } from '../ui/toast';
import { delta, esc, fehlerText, ganzzahl, ICON, passtZuSuche, status, teilInfo, wann, zahl } from '../util';

export function zugangView(startId: number | null): View {
  let root: HTMLElement;
  let suche = '';
  let gewaehlt: number | null = startId;
  let menge = 1;
  let log: Buchung[] = [];
  let ladeTimer = 0;

  function renderTreffer(): void {
    const ziel = root.querySelector<HTMLElement>('#zugang-treffer')!;
    if (store.teile.length === 0) {
      ziel.innerHTML = `<p class="hinweis">Noch keine Teile. <a href="#/teil/neu">Erstes Teil anlegen</a></p>`;
      return;
    }
    const q = suche.trim();
    const liste = (q ? store.teile.filter((t) => passtZuSuche(t, store.kategorie(t.kategorie_id), q)) : store.teile).slice(0, 12);
    if (liste.length === 0) {
      ziel.innerHTML = `<p class="hinweis">Nichts gefunden für „${esc(q)}“.</p>`;
      return;
    }
    ziel.innerHTML = liste
      .map(
        (t) => `<button type="button" class="treffer-knopf" data-waehle="${t.id}" aria-pressed="${t.id === gewaehlt}">
          <span><span class="treffer-name">${esc(t.bezeichnung)}</span><span class="treffer-ort">${esc(
            [store.kategorie(t.kategorie_id)?.name, t.lagerort ? `Lagerort ${t.lagerort}` : ''].filter(Boolean).join(' · '),
          )}</span></span>
          <span class="treffer-zahl treffer-${status(t.bestand)}">${zahl(t.bestand)}</span>
        </button>`,
      )
      .join('');
  }

  function renderKarte(): void {
    const ziel = root.querySelector<HTMLElement>('#zugang-karte')!;
    const t: Teil | undefined = gewaehlt !== null ? store.teil(gewaehlt) : undefined;
    if (!t) {
      ziel.innerHTML = `<section class="karte karte-polster leer-zustand leer-zustand-klein">
        <h2>Teil auswählen</h2><p>Links ein Teil suchen und anklicken.</p></section>`;
      return;
    }
    const kat = store.kategorie(t.kategorie_id);
    const neu = t.bestand + menge;
    ziel.innerHTML = `
      <section class="karte karte-polster stapel">
        <div class="teil-kopf">
          <div>
            <div class="mini-label">${esc(kat?.name ?? '')}${t.lagerort ? ` · Lagerort ${esc(t.lagerort)}` : ''}</div>
            <div class="teil-kopf-name">${esc(t.bezeichnung)}</div>
            <div class="grau">${esc(teilInfo(t, kat))}</div>
          </div>
          <div class="teil-kopf-bestand">
            <div class="grau klein">Auf Lager</div>
            <div class="riesen-zahl ${t.bestand <= 0 ? 'text-rot' : ''}">${zahl(t.bestand)}</div>
          </div>
        </div>
        <form class="stapel" id="zugang-form">
          <h2 class="h-klein">Lieferung eintragen</h2>
          <div class="menge-zeile">
            <div class="feld">
              <label for="zugang-menge">Gelieferte Menge</label>
              <input id="zugang-menge" type="number" min="1" step="1" inputmode="numeric" class="input menge-gross" value="${menge}" data-zurueckhalten>
            </div>
            <div class="schnell-knoepfe" role="group" aria-label="Schnellauswahl">
              ${[1, 5, 10, 20].map((n) => `<button type="button" class="btn btn-schnell" data-schnell="${n}" aria-pressed="${n === menge}">${n}</button>`).join('')}
            </div>
          </div>
          <div class="vorschau">
            <div>Neuer Bestand: <span class="vorschau-zahl">${zahl(t.bestand)} + ${menge} = ${zahl(neu)}</span></div>
            <button type="submit" class="btn btn-primaer btn-gross">Zugang buchen</button>
          </div>
        </form>
      </section>
      <section class="karte karte-polster stapel">
        <h2 class="h-klein">Bestand korrigieren</h2>
        <p class="grau">Wenn ihr nachgezählt habt und die Zahl nicht stimmt. Wird als „Korrektur“ gespeichert.</p>
        <form class="menge-zeile" id="korrektur-form">
          <div class="feld">
            <label for="gezaehlt">Tatsächlich gezählt</label>
            <input id="gezaehlt" type="number" step="1" inputmode="numeric" class="input input-mittel" placeholder="z. B. ${Math.max(0, t.bestand)}" data-zurueckhalten>
          </div>
          <button type="submit" class="btn">Korrektur speichern</button>
        </form>
      </section>`;
  }

  function renderLog(): void {
    const ziel = root.querySelector<HTMLElement>('#zugang-log')!;
    if (log.length === 0) {
      ziel.innerHTML = '<p class="karte-leer">Noch keine Zugänge oder Korrekturen.</p>';
      return;
    }
    ziel.innerHTML = `<div class="scroll-x"><div class="liste" style="min-width:720px">${log
      .map(
        (b) => `<div class="log-tabelle-zeile${b.storniert ? ' log-storniert' : ''}">
          <span class="grau">${esc(wann(b.erstellt_am))}</span>
          <span class="etikett etikett-${b.art}">${esc(artName(b.art, b.notiz))}</span>
          <span class="fett">${esc(b.teil_bezeichnung)}</span>
          <span class="log-menge rechts">${delta(b.menge)}</span>
          <span class="rechts">${
            b.storniert
              ? '<span class="grau klein">rückgängig gemacht</span>'
              : b.art === 'storno'
                ? ''
                : `<button type="button" class="btn btn-klein" data-storno="${b.id}">Rückgängig</button>`
          }</span>
        </div>`,
      )
      .join('')}</div></div>`;
  }

  async function ladeLog(): Promise<void> {
    try {
      log = await backend.buchungen({ arten: ['zugang', 'korrektur'], limit: 15 });
      renderLog();
    } catch (e) {
      console.warn(e);
    }
  }

  return {
    mount(r) {
      root = r;
      root.innerHTML = `
        <div class="seiten-kopf">
          <div><h1>Zugang</h1><p class="grau">Lieferung eintragen oder Bestand nach dem Zählen korrigieren</p></div>
        </div>
        <div class="zwei-spalten">
          <section class="karte karte-polster stapel spalte-schmal">
            <label for="zugang-suche" class="h-klein">1. Teil suchen</label>
            <div class="suche-feld suche-feld-klein">
              <span class="suche-icon">${ICON.suche}</span>
              <input id="zugang-suche" type="search" class="input" autocomplete="off" placeholder="Name, Artikelnummer …">
            </div>
            <div class="treffer-liste" id="zugang-treffer"></div>
          </section>
          <div class="spalte-breit stapel" id="zugang-karte"></div>
        </div>
        <section class="karte karte-liste">
          <div class="karte-kopf"><h2>Letzte Zugänge und Korrekturen</h2></div>
          <div id="zugang-log"></div>
        </section>`;

      const sucheInput = root.querySelector<HTMLInputElement>('#zugang-suche')!;
      sucheInput.addEventListener('input', () => {
        suche = sucheInput.value;
        renderTreffer();
      });

      root.addEventListener('click', async (e) => {
        const el = e.target as HTMLElement;
        const wahl = el.closest<HTMLElement>('[data-waehle]');
        if (wahl) {
          gewaehlt = Number(wahl.dataset.waehle);
          menge = 1;
          renderTreffer();
          renderKarte();
          root.querySelector<HTMLInputElement>('#zugang-menge')?.focus();
          root.querySelector<HTMLInputElement>('#zugang-menge')?.select();
          return;
        }
        const schnell = el.closest<HTMLElement>('[data-schnell]');
        if (schnell) {
          menge = Number(schnell.dataset.schnell);
          renderKarte();
          return;
        }
        const storno = el.closest<HTMLElement>('[data-storno]');
        if (storno) {
          const b = log.find((x) => x.id === Number(storno.dataset.storno));
          if (b) {
            await stornierenMitMeldung(b);
            void ladeLog();
          }
        }
      });

      root.addEventListener('input', (e) => {
        const el = e.target as HTMLInputElement;
        if (el.id === 'zugang-menge') {
          menge = Math.max(0, ganzzahl(el.value, 0));
          const t = gewaehlt !== null ? store.teil(gewaehlt) : undefined;
          const vz = root.querySelector<HTMLElement>('.vorschau-zahl');
          if (t && vz) vz.textContent = `${zahl(t.bestand)} + ${menge} = ${zahl(t.bestand + menge)}`;
          root.querySelectorAll<HTMLButtonElement>('[data-schnell]').forEach((b) =>
            b.setAttribute('aria-pressed', String(Number(b.dataset.schnell) === menge)),
          );
        }
      });

      root.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const t = gewaehlt !== null ? store.teil(gewaehlt) : undefined;
        if (!t) return;
        const knopf = form.querySelector<HTMLButtonElement>('button[type="submit"]');
        if (knopf) knopf.disabled = true;
        try {
          if (form.id === 'zugang-form') {
            if (menge <= 0) {
              toast('Bitte eine Menge größer als 0 eingeben.', { fehler: true });
              return;
            }
            const b = await zugang(t, menge);
            if (b) {
              menge = 1;
              renderKarte();
              void ladeLog();
            }
          } else if (form.id === 'korrektur-form') {
            const feld = form.querySelector<HTMLInputElement>('#gezaehlt')!;
            if (feld.value.trim() === '') {
              toast('Bitte die gezählte Menge eingeben.', { fehler: true });
              return;
            }
            const neu = ganzzahl(feld.value, t.bestand);
            const b = await backend.korrigieren(t.id, neu, 'Nachgezählt');
            if (b) {
              store.uebernehmeBuchung(b);
              toast(`Bestand von ${t.bezeichnung} auf ${zahl(neu)} korrigiert.`);
              void ladeLog();
            } else {
              toast('Der Bestand stimmt schon – nichts geändert.');
            }
            feld.value = '';
          }
        } catch (err) {
          toast(fehlerText(err), { fehler: true });
        } finally {
          if (knopf) knopf.disabled = false;
        }
      });

      renderTreffer();
      renderKarte();
      void ladeLog();
      if (gewaehlt === null) sucheInput.focus();
    },
    update() {
      renderTreffer();
      renderKarte();
      window.clearTimeout(ladeTimer);
      ladeTimer = window.setTimeout(() => void ladeLog(), 100);
    },
    unmount() {
      window.clearTimeout(ladeTimer);
    },
  };
}
