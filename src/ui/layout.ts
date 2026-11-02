import { istDemoModus } from '../backend';
import { ICON } from '../util';
import { themeKnopfHtml } from './theme';

export type Bereich = 'lager' | 'verkauf';
export type LagerSeite = 'uebersicht' | 'lager' | 'zugang' | 'teil' | 'kategorien' | null;

const svg = (pfad: string) =>
  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${pfad}</svg>`;

const NAV_ICON = {
  uebersicht: svg('<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>'),
  lager: svg('<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/>'),
  zugang: svg('<path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M12 11v6M9 14l3 3 3-3"/>'),
  teil: svg('<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>'),
  kategorien: svg('<path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1.5"/>'),
  lagerBereich: svg('<path d="M3 21V8l9-5 9 5v13"/><path d="M7 21v-8h10v8"/><path d="M7 17h10"/>'),
  verkauf: svg('<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>'),
};

export function layoutHtml(bereich: Bereich, seite: LagerSeite): string {
  const sub = (id: Exclude<LagerSeite, null>, href: string, text: string) =>
    `<a href="${href}" class="subnav-link"${seite === id ? ' aria-current="page"' : ''}>${NAV_ICON[id]}<span>${text}</span></a>`;
  return `
    ${
      istDemoModus
        ? `<div class="demo-band" role="note"><strong>Demo-Modus:</strong> Die Daten liegen nur in diesem Browser. Für den echten Betrieb Supabase einrichten (siehe Anleitung).</div>`
        : ''
    }
    <div class="kopf-bereich">
      <header class="kopf">
        <div class="kopf-innen">
          <a href="#/" class="logo"><span class="logo-zeichen">${ICON.logo}</span><span>Teilelager</span></a>
          <nav class="bereiche" aria-label="Bereiche">
            <a href="#/" class="bereich-link"${bereich === 'lager' ? ' aria-current="page"' : ''}>${NAV_ICON.lagerBereich}<span>Lager</span></a>
            <a href="#/verkauf" class="bereich-link"${bereich === 'verkauf' ? ' aria-current="page"' : ''}>${NAV_ICON.verkauf}<span>Verkauf</span></a>
          </nav>
          <div class="benutzer">
            ${themeKnopfHtml()}
            <button type="button" class="btn-abmelden" data-abmelden>Abmelden</button>
          </div>
        </div>
      </header>
      ${
        bereich === 'lager'
          ? `<nav class="subnav" aria-label="Lager">
              <div class="subnav-innen">
                ${sub('uebersicht', '#/', 'Übersicht')}
                ${sub('lager', '#/lager', 'Lagerliste')}
                ${sub('zugang', '#/zugang', 'Zugang')}
                ${sub('teil', '#/teil/neu', 'Neues Teil')}
                ${sub('kategorien', '#/kategorien', 'Kategorien')}
              </div>
            </nav>`
          : ''
      }
    </div>
    <main id="seite" class="seite" tabindex="-1"></main>`;
}
