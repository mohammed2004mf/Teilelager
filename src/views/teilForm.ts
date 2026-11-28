import { backend } from '../backend';
import { store } from '../store';
import type { Kategorie, Teil, TeilEingabe, View, Vorlage } from '../types';
import { frage } from '../ui/modal';
import { toast } from '../ui/toast';
import { esc, fehlerText, ganzzahl, leerZuNull, reifenGroesse, zahl, zahlOderNull } from '../util';

function feld(
  name: string,
  label: string,
  wert: string | number | null | undefined,
  o: { typ?: string; platzhalter?: string; breit?: boolean; zusatz?: string; pflicht?: boolean; gross?: boolean } = {},
): string {
  return `<div class="feld${o.breit ? ' feld-breit' : ''}">
    <label for="f-${name}">${esc(label)}${o.zusatz ? ` <span class="label-zusatz">${esc(o.zusatz)}</span>` : ''}</label>
    <input id="f-${name}" name="${name}" type="${o.typ ?? 'text'}" class="input${o.gross ? ' input-zahl-gross' : ''}"
      value="${esc(wert ?? '')}"${o.platzhalter ? ` placeholder="${esc(o.platzhalter)}"` : ''}${o.pflicht ? ' required' : ''}
      ${o.typ === 'number' ? 'step="any" inputmode="decimal"' : ''}>
  </div>`;
}

function spezialHtml(vorlage: Vorlage, t: Partial<Teil>): string {
  switch (vorlage) {
    case 'oel':
      return `<section class="karte karte-polster karte-akzent stapel">
        <h2 class="h-klein">Angaben zum Öl / zur Flüssigkeit</h2>
        <div class="feld-raster">
          ${feld('viskositaet', 'Viskosität', t.viskositaet, { platzhalter: 'z. B. 5W-30' })}
          ${feld('freigabe', 'Freigabe', t.freigabe, { platzhalter: 'z. B. VW 504 00 / 507 00' })}
          ${feld('gebinde', 'Gebindegröße', t.gebinde, { platzhalter: 'z. B. 5 L' })}
        </div>
      </section>`;
    case 'filter':
      return `<section class="karte karte-polster karte-akzent stapel">
        <h2 class="h-klein">Angaben zum Filter</h2>
        <div class="feld-raster">
          ${feld('hersteller', 'Hersteller', t.hersteller, { platzhalter: 'z. B. MANN, MAHLE, BOSCH' })}
        </div>
      </section>`;
    case 'reifen': {
      const saison = t.saison ?? null;
      const radio = (s: string) =>
        `<label class="wahl-chip"><input type="radio" name="saison" value="${s}"${saison === s ? ' checked' : ''}>${s}</label>`;
      return `<section class="karte karte-polster karte-akzent stapel">
        <h2 class="h-klein">Angaben zum Reifen</h2>
        <div class="feld-raster feld-raster-3">
          ${feld('breite', 'Breite', t.breite, { typ: 'number', zusatz: '(mm)', platzhalter: 'z. B. 205', gross: true })}
          ${feld('hoehe', 'Höhe', t.hoehe, { typ: 'number', zusatz: '(Querschnitt in %)', platzhalter: 'z. B. 55', gross: true })}
          ${feld('zoll', 'Zoll', t.zoll, { zusatz: '(Felgendurchmesser)', platzhalter: 'z. B. 16 oder R16C', gross: true })}
        </div>
        <p class="grau">Ergibt die Reifengröße: <strong class="dunkel" id="reifen-vorschau">${esc(reifenGroesse({
          breite: t.breite ?? null,
          hoehe: t.hoehe ?? null,
          zoll: t.zoll ?? null,
          reifen_index: t.reifen_index ?? null,
        }) || '–')}</strong></p>
        <div class="feld-raster">
          ${feld('reifen_index', 'Last-/Geschwindigkeitsindex', t.reifen_index, { platzhalter: 'z. B. 91V' })}
          ${feld('dot', 'DOT (Woche/Jahr)', t.dot, { platzhalter: 'z. B. 2325' })}
        </div>
        <fieldset class="feldgruppe">
          <legend>Saison</legend>
          <div class="chip-reihe">${radio('Sommer')}${radio('Winter')}${radio('Ganzjahr')}</div>
        </fieldset>
      </section>`;
    }
    default:
      return '';
  }
}

export function teilFormView(teilId: number | null): View {
  let root: HTMLElement;
  const istNeu = teilId === null;
  // Beim "Speichern und nächstes" die Kategorie behalten
  let letzteKategorie: number | null = null;

  function vorlageVon(katId: number): Vorlage {
    return store.kategorie(katId)?.vorlage ?? 'standard';
  }

  function render(): void {
    const t: Partial<Teil> | undefined = istNeu ? {} : store.teil(teilId!);
    if (!t) {
      root.innerHTML = `<section class="karte leer-zustand"><h2>Teil nicht gefunden</h2>
        <p>Vielleicht wurde es gerade gelöscht.</p><a href="#/lager" class="btn">Zur Lagerliste</a></section>`;
      return;
    }
    if (store.kategorien.length === 0) {
      root.innerHTML = `<section class="karte leer-zustand"><h2>Zuerst eine Kategorie anlegen</h2>
        <p>Jedes Teil gehört zu einer Kategorie.</p><a href="#/kategorien" class="btn btn-primaer">Zu den Kategorien</a></section>`;
      return;
    }
    const katId = t.kategorie_id ?? letzteKategorie ?? store.kategorien[0]!.id;
    const kats: Kategorie[] = store.kategorien;

    root.innerHTML = `
      <div class="seite-schmal stapel-gross">
        <div>
          <a href="#/lager" class="zurueck">← Zurück zur Lagerliste</a>
          <h1>${istNeu ? 'Neues Teil anlegen' : 'Teil bearbeiten'}</h1>
        </div>
        <form id="teil-form" class="stapel-gross" novalidate>
          <section class="karte karte-polster stapel">
            <h2 class="h-klein">Grunddaten</h2>
            <div class="feld-raster">
              ${feld('marke', 'Marke', t.marke, { platzhalter: 'z. B. LIQUI MOLY, MANN, Continental' })}
              ${feld('bezeichnung', 'Bezeichnung', t.bezeichnung, { pflicht: true, platzhalter: 'z. B. Benzin System Reiniger' })}
              <div class="feld">
                <label for="f-kategorie">Kategorie</label>
                <select id="f-kategorie" name="kategorie_id" class="input">
                  ${kats.map((k) => `<option value="${k.id}"${k.id === katId ? ' selected' : ''}>${esc(k.name)}</option>`).join('')}
                </select>
                <span class="feld-hilfe">Die Felder darunter passen sich der Kategorie an.</span>
              </div>
              ${feld('artikelnummer', 'Artikelnummer', t.artikelnummer, { platzhalter: 'z. B. vom Lieferschein' })}
              ${feld('lieferant', 'Lieferant', t.lieferant)}
              ${feld('ean', 'Barcode (EAN)', t.ean, { zusatz: '– optional' })}
            </div>
          </section>
          <div id="spezial">${spezialHtml(vorlageVon(katId), t)}</div>
          <section class="karte karte-polster stapel">
            <h2 class="h-klein">Lager und Bestand</h2>
            <div class="feld-raster">
              ${feld('lagerort', 'Lagerort (Regal/Fach)', t.lagerort, { platzhalter: 'z. B. B1-2' })}
              ${
                istNeu
                  ? feld('anfangsbestand', 'Anfangsbestand', 0, { typ: 'number' })
                  : `<div class="feld"><span class="label">Aktueller Bestand</span>
                      <div class="bestand-anzeige"><strong class="riesen-zahl-klein">${zahl(t.bestand ?? 0)}</strong>
                      <a href="#/zugang/${t.id}">Zugang / Korrektur →</a></div></div>`
              }
              <div class="feld">
                <label for="f-einheit">Einheit</label>
                <select id="f-einheit" name="einheit" class="input">
                  <option${t.einheit !== 'Packung' ? ' selected' : ''}>Stück</option>
                  <option${t.einheit === 'Packung' ? ' selected' : ''}>Packung</option>
                </select>
              </div>
              <div class="feld feld-breit">
                <label for="f-fahrzeuge">Passende Fahrzeuge</label>
                <textarea id="f-fahrzeuge" name="fahrzeuge" class="input" rows="2" placeholder="z. B. Golf 7, Audi A3 8V">${esc(t.fahrzeuge ?? '')}</textarea>
              </div>
            </div>
          </section>
          <p class="form-fehler" role="alert" hidden></p>
          <div class="knopf-reihe">
            ${!istNeu ? '<button type="button" class="btn btn-gefahr-rand" data-loeschen>Teil löschen</button><span class="abstand"></span>' : ''}
            <a href="#/lager" class="btn">Abbrechen</a>
            ${istNeu ? '<button type="submit" class="btn" data-weiter="1">Speichern und nächstes Teil</button>' : ''}
            <button type="submit" class="btn btn-primaer" data-weiter="0">${istNeu ? 'Teil speichern' : 'Änderungen speichern'}</button>
          </div>
        </form>
      </div>`;
    if (istNeu) root.querySelector<HTMLInputElement>('#f-bezeichnung')?.focus();
  }

  /** Gleiche Artikelnummer oder gleiche Marke + Bezeichnung = gibt es schon */
  function findeDoppeltes(d: TeilEingabe): Teil | undefined {
    const n = (x: string | null | undefined) => (x ?? '').toLowerCase().replace(/[\s\-/.]/g, '');
    return store.teile.find(
      (t) =>
        (n(d.artikelnummer) !== '' && n(t.artikelnummer) === n(d.artikelnummer)) ||
        (n(t.bezeichnung) === n(d.bezeichnung) && n(t.marke) === n(d.marke)),
    );
  }

  function eingabeAusForm(form: HTMLFormElement): TeilEingabe | string {
    const d = new FormData(form);
    const bezeichnung = leerZuNull(d.get('bezeichnung'));
    if (!bezeichnung) return 'Bitte eine Bezeichnung eingeben.';
    const kategorie_id = Number(d.get('kategorie_id'));
    const v = vorlageVon(kategorie_id);
    const ganz = (n: number | null) => (n === null ? null : Math.round(n));
    return {
      kategorie_id,
      bezeichnung,
      artikelnummer: leerZuNull(d.get('artikelnummer')),
      ean: leerZuNull(d.get('ean')),
      lieferant: leerZuNull(d.get('lieferant')),
      lagerort: leerZuNull(d.get('lagerort')),
      fahrzeuge: leerZuNull(d.get('fahrzeuge')),
      einheit: d.get('einheit') === 'Packung' ? 'Packung' : 'Stück',
      viskositaet: v === 'oel' ? leerZuNull(d.get('viskositaet')) : null,
      freigabe: v === 'oel' ? leerZuNull(d.get('freigabe')) : null,
      gebinde: v === 'oel' ? leerZuNull(d.get('gebinde')) : null,
      hersteller: v === 'filter' ? leerZuNull(d.get('hersteller')) : null,
      breite: v === 'reifen' ? ganz(zahlOderNull(d.get('breite'))) : null,
      hoehe: v === 'reifen' ? ganz(zahlOderNull(d.get('hoehe'))) : null,
      zoll: v === 'reifen' ? leerZuNull(d.get('zoll')) : null,
      reifen_index: v === 'reifen' ? leerZuNull(d.get('reifen_index'))?.toUpperCase() ?? null : null,
      saison: v === 'reifen' ? ((leerZuNull(d.get('saison')) as TeilEingabe['saison']) ?? null) : null,
      marke: leerZuNull(d.get('marke')),
      dot: v === 'reifen' ? leerZuNull(d.get('dot')) : null,
    };
  }

  return {
    mount(r) {
      root = r;
      render();

      root.addEventListener('change', (e) => {
        const el = e.target as HTMLElement;
        if (el.id === 'f-kategorie') {
          const katId = Number((el as HTMLSelectElement).value);
          const t = istNeu ? {} : (store.teil(teilId!) ?? {});
          root.querySelector<HTMLElement>('#spezial')!.innerHTML = spezialHtml(vorlageVon(katId), t);
        }
      });

      root.addEventListener('input', (e) => {
        const el = e.target as HTMLInputElement;
        if (['f-breite', 'f-hoehe', 'f-zoll', 'f-reifen_index'].includes(el.id)) {
          const wert = (id: string) => root.querySelector<HTMLInputElement>(`#${id}`)?.value ?? '';
          const v = reifenGroesse({
            breite: zahlOderNull(wert('f-breite')),
            hoehe: zahlOderNull(wert('f-hoehe')),
            zoll: wert('f-zoll').trim() || null,
            reifen_index: wert('f-reifen_index').trim().toUpperCase() || null,
          });
          const ziel = root.querySelector<HTMLElement>('#reifen-vorschau');
          if (ziel) ziel.textContent = v || '–';
        }
      });

      root.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const submitter = (e as SubmitEvent).submitter as HTMLButtonElement | null;
        const weiter = submitter?.dataset.weiter === '1';
        const fehler = root.querySelector<HTMLElement>('.form-fehler')!;
        const daten = eingabeAusForm(form);
        if (typeof daten === 'string') {
          fehler.textContent = daten;
          fehler.hidden = false;
          root.querySelector<HTMLInputElement>('#f-bezeichnung')?.focus();
          return;
        }
        fehler.hidden = true;
        if (istNeu) {
          const vorhanden = findeDoppeltes(daten);
          if (vorhanden) {
            const kat = store.kategorie(vorhanden.kategorie_id);
            const ok = await frage({
              titel: 'Dieses Teil gibt es schon im Lager',
              text: `<strong>${esc([vorhanden.marke, vorhanden.bezeichnung].filter(Boolean).join(' '))}</strong>${
                vorhanden.artikelnummer ? ` (Art.-Nr. ${esc(vorhanden.artikelnummer)})` : ''
              } ist bereits eingetragen${kat ? ` in „${esc(kat.name)}“` : ''}.`,
              hinweis: `Aktuell auf Lager: <strong>${zahl(vorhanden.bestand)} ${esc(vorhanden.einheit)}</strong>${
                vorhanden.lagerort ? ` · Lagerort ${esc(vorhanden.lagerort)}` : ''
              }. Neue Stückzahl bitte über „Bestand ändern“ eintragen.`,
              ja: 'Trotzdem neu anlegen',
              nein: 'Abbrechen',
              warnung: true,
            });
            if (!ok) return;
          }
        }
        form.querySelectorAll<HTMLButtonElement>('button').forEach((b) => (b.disabled = true));
        try {
          if (istNeu) {
            const neu = await backend.teilAnlegen(daten);
            const anfang = ganzzahl(String(new FormData(form).get('anfangsbestand') ?? '0'), 0);
            if (anfang !== 0) await backend.korrigieren(neu.id, anfang, 'Anfangsbestand');
            await store.laden();
            store.melde('teile');
            toast(`„${daten.bezeichnung}“ wurde angelegt.`);
            if (weiter) {
              letzteKategorie = daten.kategorie_id;
              render();
            } else {
              location.hash = '#/lager';
            }
          } else {
            await backend.teilAendern(teilId!, daten);
            await store.laden();
            store.melde('teile');
            toast('Änderungen gespeichert.');
            location.hash = '#/lager';
          }
        } catch (err) {
          fehler.textContent = fehlerText(err);
          fehler.hidden = false;
          form.querySelectorAll<HTMLButtonElement>('button').forEach((b) => (b.disabled = false));
        }
      });

      root.addEventListener('click', async (e) => {
        if (!(e.target as HTMLElement).closest('[data-loeschen]')) return;
        const t = store.teil(teilId!);
        if (!t) return;
        const ok = await frage({
          titel: 'Teil löschen?',
          text: `<strong>${esc(t.bezeichnung)}</strong> wird endgültig aus der Lagerliste entfernt.`,
          hinweis: 'Die bisherigen Verkäufe bleiben in der Verkaufsübersicht erhalten.',
          ja: 'Endgültig löschen',
          gefahr: true,
        });
        if (!ok) return;
        try {
          await backend.teilLoeschen(t.id);
          await store.laden();
          store.melde('teile');
          toast(`„${t.bezeichnung}“ wurde gelöscht.`);
          location.hash = '#/lager';
        } catch (err) {
          toast(fehlerText(err), { fehler: true });
        }
      });
    },
    update() {
      // Formular nicht überschreiben, während jemand tippt.
      // Nur reagieren, wenn das bearbeitete Teil inzwischen gelöscht wurde.
      if (!istNeu && !store.teil(teilId!)) render();
    },
  };
}
