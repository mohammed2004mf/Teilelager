import { store } from '../store';
import type { Teil, View } from '../types';
import { teilZeileHtml, teilZeilenKopfHtml, verbindeBuchen } from '../ui/buchung';
import { esc, ICON, passtZuSuche, zahlOderNull } from '../util';

export function lagerlisteView(): View {
  let root: HTMLElement;
  let suche = '';
  let nurLeer = /[?&]leer/.test(location.hash);
  let katFilter: number | null = null;
  const reifen = { breite: null as number | null, hoehe: null as number | null, zoll: null as number | null };

  const reifenAktiv = () => reifen.breite !== null || reifen.hoehe !== null || reifen.zoll !== null;

  function gefiltert(): Teil[] {
    return store.teile.filter((t) => {
      const kat = store.kategorie(t.kategorie_id);
      if (katFilter !== null && t.kategorie_id !== katFilter) return false;
      if (nurLeer && t.bestand > 0) return false;
      if (reifenAktiv()) {
        if (kat?.vorlage !== 'reifen') return false;
        if (reifen.breite !== null && t.breite !== reifen.breite) return false;
        if (reifen.hoehe !== null && t.hoehe !== reifen.hoehe) return false;
        if (reifen.zoll !== null && Number(t.zoll) !== reifen.zoll) return false;
      }
      return passtZuSuche(t, kat, suche);
    });
  }

  function renderTabs(): void {
    const nav = root.querySelector<HTMLElement>('#kat-tabs')!;
    const tab = (id: number | null, name: string, anzahl: number) =>
      `<button type="button" class="tab" data-kat="${id ?? ''}"${katFilter === id ? ' aria-current="true"' : ''}>${esc(name)} <span class="tab-zahl">${anzahl}</span></button>`;
    nav.innerHTML =
      tab(null, 'Alle', store.teile.length) +
      store.kategorien.map((k) => tab(k.id, k.name, store.teile.filter((t) => t.kategorie_id === k.id).length)).join('');

    // Reifen-Filter nur zeigen, wenn es Reifen-Kategorien gibt und sie gerade sichtbar sind
    const reifenKats = store.kategorien.filter((k) => k.vorlage === 'reifen').map((k) => k.id);
    const zeigen = reifenKats.length > 0 && (katFilter === null || reifenKats.includes(katFilter));
    root.querySelector<HTMLElement>('#reifen-filter')!.hidden = !zeigen;
  }

  function renderListe(): void {
    const leer = store.teile.filter((t) => t.bestand <= 0).length;
    root.querySelector<HTMLElement>('#zaehler')!.innerHTML = `${store.teile.length} ${
      store.teile.length === 1 ? 'Teil' : 'Teile'
    }${leer ? ` · <span class="text-rot">${leer} leer</span>` : ''}`;

    const ziel = root.querySelector<HTMLElement>('#liste')!;
    if (store.teile.length === 0) {
      ziel.innerHTML = `<section class="karte leer-zustand">
        <h2>Noch keine Teile eingetragen</h2>
        <p>Hier erscheinen alle Teile, sobald ihr sie anlegt.</p>
        <a href="#/teil/neu" class="btn btn-primaer btn-gross">Erstes Teil anlegen</a>
      </section>`;
      return;
    }
    const liste = gefiltert();
    if (liste.length === 0) {
      ziel.innerHTML = `<section class="karte leer-zustand"><h2>Keine Teile gefunden</h2>
        <p>Mit diesen Filtern gibt es keine Treffer.</p>
        <button type="button" class="btn" data-filter-zuruecksetzen>Filter zurücksetzen</button></section>`;
      return;
    }
    const gruppen = store.kategorien
      .map((k) => ({ k, teile: liste.filter((t) => t.kategorie_id === k.id) }))
      .filter((g) => g.teile.length > 0);

    ziel.innerHTML = `<section class="karte karte-liste">
      <div class="scroll-x"><div class="liste">
        ${teilZeilenKopfHtml()}
        ${gruppen
          .map(
            (g) => `<div class="gruppe-kopf"><h2>${esc(g.k.name)} <span class="grau">${g.teile.length}</span></h2></div>
              ${g.teile.map((t) => teilZeileHtml(t)).join('')}`,
          )
          .join('')}
      </div></div>
      <p class="liste-fuss">${liste.length} von ${store.teile.length} Teilen angezeigt · Auf eine Zeile klicken zum Bearbeiten</p>
    </section>`;
  }

  function render(): void {
    renderTabs();
    renderListe();
  }

  return {
    mount(r) {
      root = r;
      root.innerHTML = `
        <div class="seiten-kopf">
          <div class="titel-zeile"><h1>Lagerliste</h1><span class="grau" id="zaehler"></span></div>
          <a href="#/teil/neu" class="btn btn-primaer">+ Neues Teil</a>
        </div>
        <section class="karte filter-karte">
          <div class="filter-zeile">
            <div class="suche-feld suche-feld-klein">
              <label for="lager-suche" class="nur-sr">Suche</label>
              <span class="suche-icon">${ICON.suche}</span>
              <input id="lager-suche" type="search" class="input" autocomplete="off" placeholder="Suchen: Bezeichnung, Artikelnummer, Fahrzeug …">
            </div>
            <div class="segment" role="group" aria-label="Status">
              <button type="button" data-leer="0" aria-pressed="${!nurLeer}">Alle Teile</button>
              <button type="button" data-leer="1" aria-pressed="${nurLeer}">Nur leere Teile</button>
            </div>
          </div>
          <div class="reifen-filter" id="reifen-filter" hidden>
            <span class="grau">Reifengröße:</span>
            <label class="nur-sr" for="f-breite">Breite</label>
            <input id="f-breite" type="number" class="input input-mini" placeholder="Breite" inputmode="numeric">
            <span class="grau" aria-hidden="true">/</span>
            <label class="nur-sr" for="f-hoehe">Höhe</label>
            <input id="f-hoehe" type="number" class="input input-mini" placeholder="Höhe" inputmode="numeric">
            <span class="grau" aria-hidden="true">R</span>
            <label class="nur-sr" for="f-zoll">Zoll</label>
            <input id="f-zoll" type="number" class="input input-mini" placeholder="Zoll" inputmode="decimal">
          </div>
          <nav class="tabs" id="kat-tabs" aria-label="Kategorien"></nav>
        </section>
        <div id="liste"></div>`;

      const sucheInput = root.querySelector<HTMLInputElement>('#lager-suche')!;
      sucheInput.addEventListener('input', () => {
        suche = sucheInput.value;
        renderListe();
      });

      root.querySelectorAll<HTMLButtonElement>('[data-leer]').forEach((b) =>
        b.addEventListener('click', () => {
          nurLeer = b.dataset.leer === '1';
          root.querySelectorAll<HTMLButtonElement>('[data-leer]').forEach((x) =>
            x.setAttribute('aria-pressed', String(x === b)),
          );
          renderListe();
        }),
      );

      (['breite', 'hoehe', 'zoll'] as const).forEach((feld) => {
        const el = root.querySelector<HTMLInputElement>(`#f-${feld}`)!;
        el.addEventListener('input', () => {
          reifen[feld] = zahlOderNull(el.value);
          renderListe();
        });
      });

      root.addEventListener('click', (e) => {
        const tab = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-kat]');
        if (tab) {
          katFilter = tab.dataset.kat ? Number(tab.dataset.kat) : null;
          render();
          return;
        }
        if ((e.target as HTMLElement).closest('[data-filter-zuruecksetzen]')) {
          suche = '';
          nurLeer = false;
          katFilter = null;
          reifen.breite = reifen.hoehe = reifen.zoll = null;
          root.querySelectorAll<HTMLInputElement>('.filter-karte input').forEach((i) => (i.value = ''));
          root.querySelectorAll<HTMLButtonElement>('[data-leer]').forEach((x) =>
            x.setAttribute('aria-pressed', String(x.dataset.leer === '0')),
          );
          render();
        }
      });

      verbindeBuchen(root);
      render();
      sucheInput.focus();
    },
    update() {
      render();
    },
  };
}
