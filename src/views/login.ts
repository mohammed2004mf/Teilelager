import { backend, istDemoModus } from '../backend';
import { config } from '../config';
import { setzeAngemeldetBleiben } from '../supabase';
import type { View } from '../types';
import { fehlerText, ICON } from '../util';
import { themeKnopfHtml } from '../ui/theme';

export function loginView(nachAnmeldung: () => void): View {
  return {
    mount(root) {
      const benutzer = config.benutzer;
      root.innerHTML = `
        <div class="login-seite">
          <div class="login-theme">${themeKnopfHtml('theme-knopf theme-knopf-login')}</div>
          <main class="login-box">
            <div class="login-logo">${ICON.logo}<span>Teilelager</span></div>
            <form class="karte login-form" novalidate>
              <h1>Anmelden</h1>
              <div class="feld">
                <label for="passwort">Passwort</label>
                <input id="passwort" name="passwort" class="input input-gross" type="password" autocomplete="current-password" required>
              </div>
              <label class="checkbox"><input type="checkbox" name="merken" checked> Auf diesem PC angemeldet bleiben</label>
              <p class="login-fehler" role="alert" hidden></p>
              <button type="submit" class="btn btn-primaer btn-gross">Anmelden</button>
            </form>
            <p class="login-fuss">${
              istDemoModus
                ? 'Demo-Modus: Supabase ist noch nicht eingerichtet. Jedes Passwort funktioniert.'
                : 'Nur für die Werkstatt. Eine Registrierung gibt es nicht.'
            }</p>
          </main>
        </div>`;

      const form = root.querySelector<HTMLFormElement>('form')!;
      const fehler = root.querySelector<HTMLElement>('.login-fehler')!;
      const pw = root.querySelector<HTMLInputElement>('#passwort')!;
      pw.focus();

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const daten = new FormData(form);
        const passwort = String(daten.get('passwort') ?? '');
        if (!passwort) {
          fehler.textContent = 'Bitte das Passwort eingeben.';
          fehler.hidden = false;
          pw.focus();
          return;
        }
        const knopf = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
        knopf.disabled = true;
        knopf.textContent = 'Anmelden …';
        fehler.hidden = true;
        setzeAngemeldetBleiben(daten.get('merken') === 'on');
        try {
          // Kein Name mehr: Das Passwort wird nacheinander bei den hinterlegten Konten probiert.
          // So funktionieren alle bisherigen Passwörter weiter.
          let letzterFehler: unknown = null;
          let ok = false;
          for (const b of benutzer) {
            try {
              await backend.anmelden(b.email, passwort);
              ok = true;
              break;
            } catch (versuch) {
              letzterFehler = versuch;
            }
          }
          if (!ok) throw letzterFehler ?? new Error('Passwort falsch.');
          nachAnmeldung();
        } catch (err) {
          fehler.textContent = fehlerText(err);
          fehler.hidden = false;
          knopf.disabled = false;
          knopf.textContent = 'Anmelden';
          pw.select();
        }
      });
    },
    update() {
      /* nichts */
    },
  };
}
