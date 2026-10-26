import { esc, ICON } from '../util';

interface FrageOptionen {
  titel: string;
  /** HTML (bereits escaped) */
  text: string;
  hinweis?: string;
  ja: string;
  nein?: string;
  gefahr?: boolean;
  warnung?: boolean;
}

function root(): HTMLElement {
  return document.getElementById('modal-root') as HTMLElement;
}

/** Eigenes Bestätigungsfenster (statt Browser-confirm) */
export function frage(o: FrageOptionen): Promise<boolean> {
  return new Promise((resolve) => {
    const vorher = document.activeElement as HTMLElement | null;
    const r = root();
    r.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal" role="alertdialog" aria-modal="true" aria-labelledby="modal-titel">
          <div class="modal-kopf">
            ${o.warnung ? `<span class="modal-icon">${ICON.warnung}</span>` : ''}
            <h2 id="modal-titel">${esc(o.titel)}</h2>
          </div>
          <p class="modal-text">${o.text}</p>
          ${o.hinweis ? `<p class="modal-hinweis">${o.hinweis}</p>` : ''}
          <div class="modal-knoepfe">
            <button type="button" class="btn" data-antwort="nein">${esc(o.nein ?? 'Abbrechen')}</button>
            <button type="button" class="btn ${o.gefahr ? 'btn-gefahr' : 'btn-primaer'}" data-antwort="ja">${esc(o.ja)}</button>
          </div>
        </div>
      </div>`;
    const fertig = (wert: boolean) => {
      r.innerHTML = '';
      document.removeEventListener('keydown', taste, true);
      vorher?.focus?.();
      resolve(wert);
    };
    const taste = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        fertig(false);
      }
    };
    document.addEventListener('keydown', taste, true);
    r.querySelector<HTMLButtonElement>('[data-antwort="ja"]')?.focus();
    r.querySelectorAll<HTMLButtonElement>('[data-antwort]').forEach((b) =>
      b.addEventListener('click', () => fertig(b.dataset.antwort === 'ja')),
    );
    r.querySelector('.modal-backdrop')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) fertig(false);
    });
  });
}

/** Eingabefenster mit einem Textfeld */
export function eingabe(titel: string, label: string, wert: string, ja = 'Speichern'): Promise<string | null> {
  return new Promise((resolve) => {
    const r = root();
    r.innerHTML = `
      <div class="modal-backdrop">
        <form class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-titel">
          <div class="modal-kopf"><h2 id="modal-titel">${esc(titel)}</h2></div>
          <div class="feld">
            <label for="modal-eingabe">${esc(label)}</label>
            <input id="modal-eingabe" class="input" type="text" value="${esc(wert)}" required>
          </div>
          <div class="modal-knoepfe">
            <button type="button" class="btn" data-antwort="nein">Abbrechen</button>
            <button type="submit" class="btn btn-primaer">${esc(ja)}</button>
          </div>
        </form>
      </div>`;
    const input = r.querySelector<HTMLInputElement>('#modal-eingabe')!;
    const fertig = (v: string | null) => {
      r.innerHTML = '';
      document.removeEventListener('keydown', taste, true);
      resolve(v);
    };
    const taste = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        fertig(null);
      }
    };
    document.addEventListener('keydown', taste, true);
    input.focus();
    input.select();
    r.querySelector('form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = input.value.trim();
      if (v) fertig(v);
    });
    r.querySelector('[data-antwort="nein"]')?.addEventListener('click', () => fertig(null));
  });
}
