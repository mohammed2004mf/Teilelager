import './styles.css';
import { store } from './store';
import type { View } from './types';
import { layoutHtml, type Bereich, type LagerSeite } from './ui/layout';
import { verbindeThemeKnoepfe } from './ui/theme';
import { esc, fehlerText } from './util';
import { uebersichtView } from './views/uebersicht';
import { lagerlisteView } from './views/lagerliste';
import { zugangView } from './views/zugang';
import { teilFormView } from './views/teilForm';
import { kategorienView } from './views/kategorien';
import { verkaufView } from './views/verkauf';

const app = document.getElementById('app') as HTMLElement;

let aktuell: View | null = null;
let aktuellerLayoutSchluessel = '';
let ausstehend = false;

interface Route {
  bereich: Bereich;
  seite: LagerSeite;
  view: () => View;
  titel: string;
}

function route(hash: string): Route {
  const pfad = (hash.replace(/^#/, '').split('?')[0] ?? '') || '/';
  const teile = pfad.split('/').filter(Boolean);
  switch (teile[0]) {
    case undefined:
      return { bereich: 'lager', seite: 'uebersicht', view: uebersichtView, titel: 'Übersicht' };
    case 'lager':
      return { bereich: 'lager', seite: 'lager', view: lagerlisteView, titel: 'Lagerliste' };
    case 'zugang': {
      const id = Number(teile[1]);
      return { bereich: 'lager', seite: 'zugang', view: () => zugangView(Number.isFinite(id) ? id : null), titel: 'Zugang' };
    }
    case 'teil': {
      const id = teile[1] === 'neu' || !teile[1] ? null : Number(teile[1]);
      return {
        bereich: 'lager',
        seite: id === null ? 'teil' : null,
        view: () => teilFormView(id),
        titel: id === null ? 'Neues Teil' : 'Teil bearbeiten',
      };
    }
    case 'kategorien':
      return { bereich: 'lager', seite: 'kategorien', view: kategorienView, titel: 'Kategorien' };
    case 'verkauf':
      return { bereich: 'verkauf', seite: null, view: verkaufView, titel: 'Verkauf' };
    default:
      return { bereich: 'lager', seite: 'uebersicht', view: uebersichtView, titel: 'Übersicht' };
  }
}

function zeigeSeite(): void {
  aktuell?.unmount?.();
  aktuell = null;
  ausstehend = false;
  const r = route(location.hash);
  const schluessel = `${r.bereich}|${r.seite}`;
  if (schluessel !== aktuellerLayoutSchluessel || !document.getElementById('seite')) {
    app.innerHTML = layoutHtml(r.bereich, r.seite);
    aktuellerLayoutSchluessel = schluessel;
  }
  const seite = document.getElementById('seite') as HTMLElement;
  seite.innerHTML = '';
  document.title = `${r.titel} · Teilelager`;
  aktuell = r.view();
  aktuell.mount(seite);
  window.scrollTo(0, 0);
}

/** Nicht neu zeichnen, während jemand in einem Feld tippt – erst danach */
function aktualisiere(): void {
  if (!aktuell) return;
  const fokus = document.activeElement as HTMLElement | null;
  const seite = document.getElementById('seite');
  if (fokus && seite?.contains(fokus) && fokus.matches('input.menge, input[data-zurueckhalten]')) {
    ausstehend = true;
    return;
  }
  aktuell.update();
}

document.addEventListener('focusout', () => {
  window.setTimeout(() => {
    if (ausstehend) {
      ausstehend = false;
      aktualisiere();
    }
  }, 50);
});

async function starteApp(): Promise<void> {
  try {
    // Ohne Anmeldung: direkt laden (Wunsch der Werkstatt)
    app.innerHTML = '<div class="boot">Daten werden geladen …</div>';
    await store.laden();
    store.starteLive();
    window.removeEventListener('hashchange', zeigeSeite);
    window.addEventListener('hashchange', zeigeSeite);
    zeigeSeite();
  } catch (e) {
    app.innerHTML = `<div class="boot boot-fehler"><p><strong>Fehler beim Laden.</strong></p><p>${esc(fehlerText(e))}</p>
      <p><button class="btn btn-primaer" type="button" data-neu-laden>Neu laden</button></p></div>`;
    app.querySelector('[data-neu-laden]')?.addEventListener('click', () => location.reload());
  }
}

verbindeThemeKnoepfe();
store.abonnieren(() => aktualisiere());

void starteApp();
