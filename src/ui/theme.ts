export type Theme = 'hell' | 'dunkel';

const KEY = 'teilelager.theme';

export function aktuellesTheme(): Theme {
  return document.documentElement.dataset.theme === 'dunkel' ? 'dunkel' : 'hell';
}

/** Gespeicherte Wahl, sonst die Einstellung von Windows/Browser */
export function gespeichertesTheme(): Theme {
  try {
    const t = localStorage.getItem(KEY);
    if (t === 'hell' || t === 'dunkel') return t;
  } catch {
    /* ignorieren */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dunkel' : 'hell';
}

export function setzeTheme(t: Theme, speichern = true): void {
  document.documentElement.dataset.theme = t;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t === 'dunkel' ? '#0b0e12' : '#161a1f');
  if (speichern) {
    try {
      localStorage.setItem(KEY, t);
    } catch {
      /* ignorieren */
    }
  }
  document.querySelectorAll<HTMLButtonElement>('[data-theme-umschalten]').forEach((b) => aktualisiereKnopf(b));
}

export function umschalten(): void {
  setzeTheme(aktuellesTheme() === 'dunkel' ? 'hell' : 'dunkel');
}

const SONNE =
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
const MOND =
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

function aktualisiereKnopf(b: HTMLButtonElement): void {
  const dunkel = aktuellesTheme() === 'dunkel';
  b.innerHTML = `${dunkel ? SONNE : MOND}<span class="theme-text">${dunkel ? 'Hell' : 'Dunkel'}</span>`;
  b.setAttribute('aria-label', dunkel ? 'Helles Design einschalten' : 'Dunkles Design einschalten');
  b.title = dunkel ? 'Helles Design' : 'Dunkles Design';
}

export function themeKnopfHtml(klasse = 'theme-knopf'): string {
  const dunkel = aktuellesTheme() === 'dunkel';
  return `<button type="button" class="${klasse}" data-theme-umschalten aria-label="${
    dunkel ? 'Helles Design einschalten' : 'Dunkles Design einschalten'
  }" title="${dunkel ? 'Helles Design' : 'Dunkles Design'}">${dunkel ? SONNE : MOND}<span class="theme-text">${
    dunkel ? 'Hell' : 'Dunkel'
  }</span></button>`;
}

/** Ein Klick-Handler für alle Umschalter auf der Seite */
export function verbindeThemeKnoepfe(): void {
  document.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('[data-theme-umschalten]')) umschalten();
  });
}
