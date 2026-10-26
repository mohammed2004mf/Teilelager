import { esc } from '../util';

interface ToastOptionen {
  aktion?: { text: string; ausfuehren: () => void | Promise<void> };
  fehler?: boolean;
  dauer?: number;
}

/** Kurze Meldung unten rechts, optional mit "Rückgängig" */
export function toast(text: string, o: ToastOptionen = {}): void {
  const root = document.getElementById('toast-root');
  if (!root) return;
  const el = document.createElement('div');
  el.className = `toast${o.fehler ? ' toast-fehler' : ''}`;
  el.setAttribute('role', o.fehler ? 'alert' : 'status');
  el.innerHTML = `<span>${esc(text)}</span>${
    o.aktion ? `<button type="button" class="toast-aktion">${esc(o.aktion.text)}</button>` : ''
  }<button type="button" class="toast-zu" aria-label="Schließen">×</button>`;
  root.appendChild(el);
  const weg = () => {
    el.classList.add('toast-weg');
    window.setTimeout(() => el.remove(), 200);
  };
  const timer = window.setTimeout(weg, o.dauer ?? (o.aktion ? 8000 : o.fehler ? 7000 : 3500));
  el.querySelector('.toast-zu')?.addEventListener('click', () => {
    window.clearTimeout(timer);
    weg();
  });
  if (o.aktion) {
    const btn = el.querySelector<HTMLButtonElement>('.toast-aktion')!;
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      window.clearTimeout(timer);
      try {
        await o.aktion!.ausfuehren();
      } finally {
        weg();
      }
    });
  }
  // höchstens 4 Meldungen gleichzeitig
  while (root.children.length > 4) root.firstElementChild?.remove();
}
