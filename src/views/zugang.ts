import { backend } from '../backend';
import { store } from '../store';
import type { Teil, View } from '../types';
import { zugang } from '../ui/buchung';
import { frage } from '../ui/modal';
import { toast } from '../ui/toast';
import { esc, fehlerText, ganzzahl, ICON, passtZuSuche, status, teilInfo, zahl } from '../util';

export function zugangView(startId: number | null): View {
  let root: HTMLElement;
  let suche = '';
  let gewaehlt: number | null = startId;
  let menge = 1;
  let zuletztHinzu: { id: number; menge: number } | null = null; // menge < 0 = weggenommen

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
    const zuletzt = zuletztHinzu && zuletztHinzu.id === t.id ? zuletztHinzu.menge : 0;
    ziel.innerHTML = `
      <section class="karte karte-polster stapel-gross">
        <div>
          <div class="mini-label">${esc(kat?.name ?? '')}${t.lagerort ? ` · Lagerort ${esc(t.lagerort)}` : ''}</div>
          <div class="teil-kopf-name">${esc(t.bezeichnung)}</div>
          <div class="grau">${esc(teilInfo(t, kat))}</div>
        </div>
        <div class="zugang-bestand${zuletzt > 0 ? ' zugang-bestand-neu' : zuletzt < 0 ? ' zugang-bestand-weg' : ''}">
          <span class="grau">Auf Lager</span>
          <span class="riesen-zahl ${t.bestand <= 0 ? 'text-rot' : ''}">${zahl(t.bestand)}</span>
          ${zuletzt > 0 ? `<span class="zugang-plus">${zuletzt} hinzugefügt</span>` : ''}
          ${zuletzt < 0 ? `<span class="zugang-minus">${-zuletzt} weggenommen</span>` : ''}
        </div>
        <form class="zugang-einfach" id="zugang-form">
          <div class="feld">
            <label for="zugang-menge">Wie viele?</label>
            <input id="zugang-menge" type="number" min="1" step="1" inputmode="numeric" class="input menge-gross" value="${menge}" data-zurueckhalten>
          </div>
          <button type="submit" class="btn btn-primaer btn-gross" data-richtung="plus">+ Hinzufügen</button>
          <button type="submit" class="btn btn-gross btn-weg" data-richtung="minus">− Wegnehmen</button>
        </form>
        <details class="korrektur-klein">
          <summary>Zahl stimmt nicht? Bestand direkt eintragen</summary>
          <form class="zugang-einfach" id="korrektur-form">
            <div class="feld">
              <label for="gezaehlt">Richtiger Bestand</label>
              <input id="gezaehlt" type="number" step="1" inputmode="numeric" class="input input-mittel" placeholder="${Math.max(0, t.bestand)}" data-zurueckhalten>
            </div>
            <button type="submit" class="btn">Speichern</button>
          </form>
        </details>
      </section>`;
  }

  return {
    mount(r) {
      root = r;
      root.innerHTML = `
        <div class="seiten-kopf">
          <div><h1>Bestand ändern</h1><p class="grau">Teil auswählen, Menge eingeben, hinzufügen oder wegnehmen.</p></div>
        </div>
        <div class="zwei-spalten">
          <section class="karte karte-polster stapel spalte-schmal">
            <label for="zugang-suche" class="h-klein">Teil suchen</label>
            <div class="suche-feld suche-feld-klein">
              <span class="suche-icon">${ICON.suche}</span>
              <input id="zugang-suche" type="search" class="input" autocomplete="off" placeholder="Name, Artikelnummer …">
            </div>
            <div class="treffer-liste" id="zugang-treffer"></div>
          </section>
          <div class="spalte-breit stapel" id="zugang-karte"></div>
        </div>`;

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
          zuletztHinzu = null;
          renderTreffer();
          renderKarte();
          root.querySelector<HTMLInputElement>('#zugang-menge')?.focus();
          root.querySelector<HTMLInputElement>('#zugang-menge')?.select();
          return;
        }
      });

      root.addEventListener('input', (e) => {
        const el = e.target as HTMLInputElement;
        if (el.id === 'zugang-menge') {
          menge = Math.max(0, ganzzahl(el.value, 0));
        }
      });

      root.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const t = gewaehlt !== null ? store.teil(gewaehlt) : undefined;
        if (!t) return;
        const knoepfe = [...form.querySelectorAll<HTMLButtonElement>('button[type="submit"]')];
        knoepfe.forEach((k) => (k.disabled = true));
        try {
          if (form.id === 'zugang-form') {
            if (menge <= 0) {
              toast('Bitte eine Menge größer als 0 eingeben.', { fehler: true });
              return;
            }
            const richtung = ((e as SubmitEvent).submitter as HTMLButtonElement | null)?.dataset.richtung ?? 'plus';
            let ok = false;
            if (richtung === 'minus') {
              // Wegnehmen: nur die Zahl ändern, wird nicht als Verkauf gezählt
              if (menge > t.bestand) {
                const weiter = await frage({
                  titel: 'Nicht genug auf Lager',
                  text: `Es ${t.bestand === 1 ? 'ist' : 'sind'} nur <strong>${zahl(t.bestand)}</strong> da. Trotzdem <strong>${menge}</strong> wegnehmen?`,
                  hinweis: `Der Bestand steht danach auf <strong class="text-rot">${zahl(t.bestand - menge)}</strong>.`,
                  ja: 'Trotzdem wegnehmen',
                  warnung: true,
                });
                if (!weiter) return;
              }
              const b = await backend.korrigieren(t.id, t.bestand - menge, 'Weggenommen');
              if (b) store.uebernehmeBuchung(b);
              ok = true;
            } else {
              ok = !!(await zugang(t, menge));
            }
            if (ok) {
              zuletztHinzu = { id: t.id, menge: richtung === 'minus' ? -menge : menge };
              menge = 1;
              renderKarte();
              root.querySelector<HTMLInputElement>('#zugang-menge')?.select();
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
              zuletztHinzu = null;
              store.uebernehmeBuchung(b);
              toast(`Bestand auf ${zahl(neu)} geändert.`);
            } else {
              toast('Der Bestand stimmt schon – nichts geändert.');
            }
            feld.value = '';
          }
        } catch (err) {
          toast(fehlerText(err), { fehler: true });
        } finally {
          knoepfe.forEach((k) => (k.disabled = false));
        }
      });

      renderTreffer();
      renderKarte();
      if (gewaehlt === null) sucheInput.focus();
    },
    update() {
      renderTreffer();
      renderKarte();
    },
  };
}
