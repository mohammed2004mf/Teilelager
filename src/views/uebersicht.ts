import { store } from '../store';
import type { View } from '../types';
import { teilZeileHtml, teilZeilenKopfHtml, verbindeBuchen } from '../ui/buchung';
import { esc, ICON, passtZuSuche, zeit } from '../util';

const MAX_TREFFER = 8;

export function uebersichtView(): View {
  let root: HTMLElement;
  let suche = '';

  function renderSuche(): void {
    const ziel = root.querySelector<HTMLElement>('#suche-ergebnis')!;
    const q = suche.trim();
    if (!q) {
      ziel.innerHTML = `<p class="hinweis">Einfach lostippen, z. B. „5W-30“, „W 712“, „205/55“ oder „Golf 7“. Die Treffer erscheinen sofort.</p>`;
      return;
    }
    const treffer = store.teile.filter((t) => passtZuSuche(t, store.kategorie(t.kategorie_id), q));
    if (treffer.length === 0) {
      ziel.innerHTML = `<p class="hinweis hinweis-dunkel">Nichts gefunden für „${esc(q)}“. <a href="#/teil/neu">Als neues Teil anlegen</a></p>`;
      return;
    }
    const gezeigt = treffer.slice(0, MAX_TREFFER);
    ziel.innerHTML = `
      <p class="treffer-anzahl">${
        treffer.length === 1
          ? '1 Treffer'
          : treffer.length > MAX_TREFFER
            ? `${treffer.length} Treffer – die ersten ${MAX_TREFFER}. <a href="#/lager">Alle in der Lagerliste</a>`
            : `${treffer.length} Treffer`
      }</p>
      <div class="liste-rahmen"><div class="scroll-x"><div class="liste">
        ${gezeigt.map((t) => teilZeileHtml(t, { kategorieZeigen: true })).join('')}
      </div></div></div>`;
  }

  function renderRest(): void {
    root.querySelector<HTMLElement>('#stand')!.textContent = `Stand: ${new Date().toLocaleDateString('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })} · ${zeit(new Date().toISOString())} Uhr`;

    const inhalt = root.querySelector<HTMLElement>('#uebersicht-inhalt')!;
    if (store.teile.length === 0) {
      inhalt.innerHTML = `
        <section class="karte leer-zustand">
          <h2>Noch keine Teile eingetragen</h2>
          <p>Legt euer erstes Teil an – danach seht ihr hier, was leer ist.</p>
          <a href="#/teil/neu" class="btn btn-primaer btn-gross">Erstes Teil anlegen</a>
        </section>`;
      return;
    }
    const leer = store.teile.filter((t) => t.bestand <= 0).sort((a, b) => a.bestand - b.bestand);
    const da = store.teile.length - leer.length;

    inhalt.innerHTML = `
      <div class="kacheln">
        <a href="#/lager?leer" class="kachel kachel-rot">
          <span class="kachel-label"><span class="punkt punkt-rot"></span>Leer</span>
          <span class="kachel-zahl">${leer.length}</span>
          <span class="kachel-text">${leer.length === 1 ? 'Teil ist' : 'Teile sind'} leer oder im Minus</span>
        </a>
        <a href="#/lager" class="kachel kachel-gruen">
          <span class="kachel-label"><span class="punkt punkt-gruen"></span>Auf Lager</span>
          <span class="kachel-zahl">${da}</span>
          <span class="kachel-text">${da === 1 ? 'Teil ist' : 'Teile sind'} vorrätig</span>
        </a>
      </div>
      <section class="karte karte-liste">
        <div class="karte-kopf"><h2>Leer – nachbestellen</h2><span class="grau">Teile mit 0 Stück oder weniger</span></div>
        ${
          leer.length === 0
            ? '<p class="karte-leer">Alles da – kein Teil ist leer.</p>'
            : `<div class="scroll-x"><div class="liste">${teilZeilenKopfHtml()}${leer.map((t) => teilZeileHtml(t, { kategorieZeigen: true })).join('')}</div></div>`
        }
      </section>`;
  }

  return {
    mount(r) {
      root = r;
      root.innerHTML = `
        <div class="seiten-kopf">
          <h1>Übersicht</h1>
          <div class="seiten-kopf-rechts">
            <span class="grau" id="stand"></span>
          </div>
        </div>
        <section class="karte suche-karte" aria-label="Suche">
          <div class="suche-feld">
            <label for="schnellsuche" class="nur-sr">Teil suchen</label>
            <span class="suche-icon">${ICON.suche}</span>
            <input id="schnellsuche" type="search" class="input suche-input" autocomplete="off"
              placeholder="Teil suchen: Name, Artikelnummer, Reifengröße, Fahrzeug …">
          </div>
          <div id="suche-ergebnis"></div>
        </section>
        <div id="uebersicht-inhalt" class="stapel-gross"></div>`;

      const input = root.querySelector<HTMLInputElement>('#schnellsuche')!;
      input.addEventListener('input', () => {
        suche = input.value;
        renderSuche();
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          input.value = '';
          suche = '';
          renderSuche();
        }
      });
      verbindeBuchen(root);
      renderSuche();
      renderRest();
      input.focus();
    },
    update() {
      renderSuche();
      renderRest();
    },
  };
}
