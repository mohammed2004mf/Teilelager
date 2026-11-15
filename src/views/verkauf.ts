import { backend } from '../backend';
import { store } from '../store';
import type { Buchung, View } from '../types';
import { stornierenMitMeldung, verkaufen } from '../ui/buchung';
import { toast } from '../ui/toast';
import { datum, esc, fehlerText, ganzzahl, ICON, passtZuSuche, status, zahl, zeit } from '../util';

type Zeitraum = 'heute' | 'woche' | 'monat' | 'frei';

function tagesanfang(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isoTag(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function vonIsoTag(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
}

export function verkaufView(): View {
  let root: HTMLElement;
  // Eintragen
  let suche = '';
  let gewaehlt: number | null = null;
  let menge = 1;
  // Auswertung
  let zeitraum: Zeitraum = 'monat';
  const heute = tagesanfang(new Date());
  let freiVon = new Date(heute.getFullYear(), heute.getMonth(), 1);
  let freiBis = heute;
  let verkaeufe: Buchung[] = [];
  let alleZeigen = false;
  let ladeTimer = 0;

  function bereich(): { von: Date; bis: Date; label: string } {
    const jetzt = new Date();
    const h = tagesanfang(jetzt);
    const morgen = new Date(h);
    morgen.setDate(h.getDate() + 1);
    switch (zeitraum) {
      case 'heute':
        return { von: h, bis: morgen, label: `heute, ${datum(h.toISOString())}` };
      case 'woche': {
        const mo = new Date(h);
        mo.setDate(h.getDate() - ((h.getDay() + 6) % 7));
        return { von: mo, bis: morgen, label: `diese Woche (seit ${datum(mo.toISOString())})` };
      }
      case 'monat': {
        const erster = new Date(h.getFullYear(), h.getMonth(), 1);
        return { von: erster, bis: morgen, label: `im ${h.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}` };
      }
      case 'frei': {
        const bis = new Date(freiBis);
        bis.setDate(bis.getDate() + 1);
        return { von: freiVon, bis, label: `vom ${datum(freiVon.toISOString())} bis ${datum(freiBis.toISOString())}` };
      }
    }
  }

  // ---------- Verkauf eintragen ----------

  function renderEintragen(): void {
    const ziel = root.querySelector<HTMLElement>('#vk-auswahl')!;
    const t = gewaehlt !== null ? store.teil(gewaehlt) : undefined;
    const sucheFeld = root.querySelector<HTMLElement>('#vk-suche-box')!;
    sucheFeld.hidden = !!t;

    if (t) {
      const neu = t.bestand - menge;
      ziel.innerHTML = `
        <div class="vk-gewaehlt">
          <div class="vk-teil">
            <span class="mini-label">Teil</span>
            ${t.marke ? `<span class="teil-marke">${esc(t.marke)}</span>` : ''}<div class="vk-teil-name">${esc(t.bezeichnung)}</div>
            <button type="button" class="link-knopf" data-vk-aendern>anderes Teil wählen</button>
          </div>
          <div class="feld">
            <span class="label">Auf Lager</span>
            <span class="bestand-zahl bestand-${status(t.bestand)}">${zahl(t.bestand)}</span>
          </div>
          <div class="feld">
            <label for="vk-menge">Menge</label>
            <div class="buchen">
              <button type="button" class="btn-rund btn-rund-gross" data-vk-schritt="-1" aria-label="Weniger">−</button>
              <input id="vk-menge" type="number" min="1" step="1" inputmode="numeric" class="menge menge-mittel" value="${menge}" data-zurueckhalten>
              <button type="button" class="btn-rund btn-rund-gross" data-vk-schritt="1" aria-label="Mehr">+</button>
            </div>
          </div>
          <button type="submit" class="btn btn-primaer btn-gross">Als verkauft eintragen</button>
        </div>
        <p class="grau" id="vk-vorschau">Der Lagerbestand sinkt dabei automatisch: <strong class="${neu < 0 ? 'text-rot' : 'dunkel'}">${zahl(t.bestand)} → ${zahl(neu)}</strong></p>`;
      return;
    }

    const q = suche.trim();
    if (!q) {
      ziel.innerHTML = store.teile.length
        ? '<p class="hinweis">Teil suchen und anklicken.</p>'
        : '<p class="hinweis">Noch keine Teile im Lager. <a href="#/teil/neu">Erstes Teil anlegen</a></p>';
      return;
    }
    const treffer = store.teile.filter((x) => passtZuSuche(x, store.kategorie(x.kategorie_id), q)).slice(0, 6);
    ziel.innerHTML = treffer.length
      ? `<div class="treffer-liste treffer-raster">${treffer
          .map(
            (x) => `<button type="button" class="treffer-knopf" data-vk-waehle="${x.id}">
              <span>${x.marke ? `<span class="teil-marke">${esc(x.marke)}</span>` : ''}<span class="treffer-name">${esc(x.bezeichnung)}</span><span class="treffer-ort">${esc(
                [store.kategorie(x.kategorie_id)?.name, x.lagerort ? `Lagerort ${x.lagerort}` : ''].filter(Boolean).join(' · '),
              )}</span></span>
              <span class="treffer-zahl treffer-${status(x.bestand)}">${zahl(x.bestand)}</span>
            </button>`,
          )
          .join('')}</div>`
      : `<p class="hinweis">Nichts gefunden für „${esc(q)}“.</p>`;
  }

  // ---------- Auswertung ----------

  function renderAuswertung(): void {
    const b = bereich();
    root.querySelector<HTMLElement>('#vk-titel')!.textContent = `Verkauft ${b.label}`;
    root.querySelectorAll<HTMLButtonElement>('[data-zeitraum]').forEach((x) =>
      x.setAttribute('aria-pressed', String(x.dataset.zeitraum === zeitraum)),
    );
    root.querySelector<HTMLElement>('#vk-frei')!.hidden = zeitraum !== 'frei';

    const summe = verkaeufe.reduce((s, v) => s + -v.menge, 0);
    const nachTeil = new Map<string, { name: string; kat: string; menge: number }>();
    verkaeufe.forEach((v) => {
      const key = v.teil_id !== null ? `id:${v.teil_id}` : `name:${v.teil_bezeichnung}`;
      const aktuell = v.teil_id !== null ? store.teil(v.teil_id) : undefined;
      const e = nachTeil.get(key) ?? {
        name: aktuell?.bezeichnung ?? v.teil_bezeichnung,
        kat: (aktuell ? store.kategorie(aktuell.kategorie_id)?.name : v.kategorie_name) ?? '',
        menge: 0,
      };
      e.menge += -v.menge;
      nachTeil.set(key, e);
    });
    const rangliste = [...nachTeil.values()].sort((a, c) => c.menge - a.menge || a.name.localeCompare(c.name));
    const top = rangliste[0];

    root.querySelector<HTMLElement>('#vk-kacheln')!.innerHTML = `
      <div class="karte kachel-stat"><span class="grau fett">Teile verkauft</span>
        <span class="kachel-zahl">${zahl(summe)} <span class="kachel-einheit">Stück</span></span></div>
      <div class="karte kachel-stat"><span class="grau fett">Verkäufe</span>
        <span class="kachel-zahl">${zahl(verkaeufe.length)}</span></div>
      <div class="karte kachel-stat"><span class="grau fett">Am meisten verkauft</span>
        ${top ? `<span class="kachel-top">${esc(top.name)}</span><span class="grau">${zahl(top.menge)} Stück</span>` : '<span class="kachel-top grau">–</span>'}
      </div>`;

    root.querySelector<HTMLElement>('#vk-nach-teil')!.innerHTML = rangliste.length
      ? `${rangliste
          .map(
            (e) => `<div class="summen-zeile">
              <div><div class="fett">${esc(e.name)}</div><div class="grau klein">${esc(e.kat)}</div></div>
              <span class="zahl-gross">${zahl(e.menge)}</span>
            </div>`,
          )
          .join('')}
        <div class="summen-zeile summen-total"><span class="fett">Summe</span><span class="zahl-gross">${zahl(summe)}</span></div>`
      : '<p class="karte-leer">In diesem Zeitraum wurde nichts verkauft.</p>';

    const liste = alleZeigen ? verkaeufe : verkaeufe.slice(0, 15);
    root.querySelector<HTMLElement>('#vk-einzeln')!.innerHTML = verkaeufe.length
      ? `${liste
          .map(
            (v) => `<div class="verkauf-zeile">
              <div class="grau klein"><div class="fett dunkel">${esc(datum(v.erstellt_am).slice(0, 6))}</div>${esc(zeit(v.erstellt_am))}</div>
              <div class="fett">${esc(v.teil_bezeichnung)}</div>
              <span class="zahl-mittel rechts">${zahl(-v.menge)}</span>
              <button type="button" class="btn btn-klein" data-vk-storno="${v.id}" title="Verkauf rückgängig machen">Rückgängig</button>
            </div>`,
          )
          .join('')}
        ${
          verkaeufe.length > 15 && !alleZeigen
            ? `<div class="liste-fuss"><button type="button" class="link-knopf" data-vk-alle>Alle ${verkaeufe.length} Verkäufe anzeigen</button></div>`
            : ''
        }`
      : '<p class="karte-leer">Keine Verkäufe in diesem Zeitraum.</p>';
  }

  async function ladeVerkaeufe(): Promise<void> {
    const b = bereich();
    try {
      verkaeufe = await backend.buchungen({ arten: ['verkauf'], von: b.von, bis: b.bis, nurAktive: true, limit: 10000 });
      renderAuswertung();
    } catch (e) {
      toast(fehlerText(e), { fehler: true });
    }
  }

  return {
    mount(r) {
      root = r;
      root.innerHTML = `
        <div class="seiten-kopf"><h1>Verkauf</h1></div>
        <form class="karte karte-polster stapel" id="vk-form" aria-labelledby="vk-eintragen">
          <h2 id="vk-eintragen" class="h-klein">Verkauf eintragen</h2>
          <div class="suche-feld suche-feld-klein" id="vk-suche-box">
            <label for="vk-suche" class="nur-sr">Teil suchen</label>
            <span class="suche-icon">${ICON.suche}</span>
            <input id="vk-suche" type="search" class="input" autocomplete="off" placeholder="Welches Teil wurde verkauft? Name, Artikelnummer …">
          </div>
          <div id="vk-auswahl"></div>
        </form>

        <section class="stapel">
          <div class="seiten-kopf seiten-kopf-klein">
            <h2 class="h-gross" id="vk-titel">Verkauft</h2>
            <div class="segment" role="group" aria-label="Zeitraum">
              <button type="button" data-zeitraum="heute">Heute</button>
              <button type="button" data-zeitraum="woche">Diese Woche</button>
              <button type="button" data-zeitraum="monat">Dieser Monat</button>
              <button type="button" data-zeitraum="frei">Zeitraum wählen …</button>
            </div>
          </div>
          <div class="frei-zeitraum" id="vk-frei" hidden>
            <div class="feld"><label for="vk-von">Von</label><input id="vk-von" type="date" class="input" value="${isoTag(freiVon)}"></div>
            <div class="feld"><label for="vk-bis">Bis</label><input id="vk-bis" type="date" class="input" value="${isoTag(freiBis)}"></div>
          </div>
          <div class="kacheln kacheln-3" id="vk-kacheln"></div>
          <div class="zwei-spalten zwei-spalten-gleich">
            <section class="karte karte-liste">
              <div class="karte-kopf"><h3>Nach Teil</h3></div>
              <div id="vk-nach-teil"></div>
            </section>
            <section class="karte karte-liste">
              <div class="karte-kopf"><h3>Einzelne Verkäufe</h3></div>
              <div id="vk-einzeln"></div>
            </section>
          </div>
        </section>`;

      const sucheInput = root.querySelector<HTMLInputElement>('#vk-suche')!;
      sucheInput.addEventListener('input', () => {
        suche = sucheInput.value;
        renderEintragen();
      });

      root.addEventListener('click', async (e) => {
        const el = e.target as HTMLElement;
        const wahl = el.closest<HTMLElement>('[data-vk-waehle]');
        if (wahl) {
          gewaehlt = Number(wahl.dataset.vkWaehle);
          menge = 1;
          renderEintragen();
          root.querySelector<HTMLInputElement>('#vk-menge')?.select();
          return;
        }
        if (el.closest('[data-vk-aendern]')) {
          gewaehlt = null;
          renderEintragen();
          sucheInput.focus();
          sucheInput.select();
          return;
        }
        const schritt = el.closest<HTMLElement>('[data-vk-schritt]');
        if (schritt) {
          menge = Math.max(1, menge + Number(schritt.dataset.vkSchritt));
          renderEintragen();
          return;
        }
        const zr = el.closest<HTMLElement>('[data-zeitraum]');
        if (zr) {
          zeitraum = zr.dataset.zeitraum as Zeitraum;
          alleZeigen = false;
          renderAuswertung();
          void ladeVerkaeufe();
          return;
        }
        if (el.closest('[data-vk-alle]')) {
          alleZeigen = true;
          renderAuswertung();
          return;
        }
        const storno = el.closest<HTMLElement>('[data-vk-storno]');
        if (storno) {
          const v = verkaeufe.find((x) => x.id === Number(storno.dataset.vkStorno));
          if (v) {
            await stornierenMitMeldung(v);
            void ladeVerkaeufe();
          }
        }
      });

      root.addEventListener('input', (e) => {
        const el = e.target as HTMLInputElement;
        if (el.id === 'vk-menge') {
          menge = Math.max(0, ganzzahl(el.value, 0));
          const t = gewaehlt !== null ? store.teil(gewaehlt) : undefined;
          const vs = root.querySelector<HTMLElement>('#vk-vorschau strong');
          if (t && vs) {
            vs.textContent = `${zahl(t.bestand)} → ${zahl(t.bestand - menge)}`;
            vs.className = t.bestand - menge < 0 ? 'text-rot' : 'dunkel';
          }
        }
      });

      root.addEventListener('change', (e) => {
        const el = e.target as HTMLInputElement;
        if (el.id === 'vk-von' || el.id === 'vk-bis') {
          const v = vonIsoTag((root.querySelector<HTMLInputElement>('#vk-von')!).value);
          const b = vonIsoTag((root.querySelector<HTMLInputElement>('#vk-bis')!).value);
          if (v && b) {
            freiVon = v <= b ? v : b;
            freiBis = v <= b ? b : v;
            void ladeVerkaeufe();
          }
        }
      });

      root.querySelector<HTMLFormElement>('#vk-form')!.addEventListener('submit', async (e) => {
        e.preventDefault();
        const t = gewaehlt !== null ? store.teil(gewaehlt) : undefined;
        if (!t) return;
        if (menge <= 0) {
          toast('Bitte eine Menge größer als 0 eingeben.', { fehler: true });
          return;
        }
        const b = await verkaufen(t, menge);
        if (b) {
          gewaehlt = null;
          menge = 1;
          suche = '';
          sucheInput.value = '';
          renderEintragen();
          sucheInput.focus();
          void ladeVerkaeufe();
        }
      });

      renderEintragen();
      renderAuswertung();
      void ladeVerkaeufe();
      sucheInput.focus();
    },
    update() {
      renderEintragen();
      window.clearTimeout(ladeTimer);
      ladeTimer = window.setTimeout(() => void ladeVerkaeufe(), 120);
    },
    unmount() {
      window.clearTimeout(ladeTimer);
    },
  };
}
