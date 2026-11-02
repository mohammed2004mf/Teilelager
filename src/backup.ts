import ExcelJS from 'exceljs';
import { backend } from './backend';
import { store } from './store';
import { reifenGroesse } from './util';
import { artName } from './ui/buchung';
import { vorlageName } from './views/kategorien';

/** Alle Daten als Excel-Datei herunterladen (Sicherung) */
export async function sicherungHerunterladen(): Promise<void> {
  await store.laden();
  const buchungen = await backend.buchungen({ limit: 1_000_000 });

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Teilelager';
  wb.created = new Date();

  const kopfStil = (ws: ExcelJS.Worksheet) => {
    const kopf = ws.getRow(1);
    kopf.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    kopf.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1D4E89' } };
    ws.views = [{ state: 'frozen', ySplit: 1 }];
    ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: ws.columnCount } };
  };

  // Teile
  const wsTeile = wb.addWorksheet('Teile');
  wsTeile.columns = [
    { header: 'ID', key: 'id', width: 7 },
    { header: 'Kategorie', key: 'kategorie', width: 20 },
    { header: 'Bezeichnung', key: 'bezeichnung', width: 38 },
    { header: 'Bestand', key: 'bestand', width: 9 },
    { header: 'Einheit', key: 'einheit', width: 9 },
    { header: 'Lagerort', key: 'lagerort', width: 11 },
    { header: 'Artikelnummer', key: 'artikelnummer', width: 18 },
    { header: 'Barcode (EAN)', key: 'ean', width: 16 },
    { header: 'Lieferant', key: 'lieferant', width: 18 },
    { header: 'Passende Fahrzeuge', key: 'fahrzeuge', width: 30 },
    { header: 'Viskosität', key: 'viskositaet', width: 11 },
    { header: 'Freigabe', key: 'freigabe', width: 20 },
    { header: 'Gebinde', key: 'gebinde', width: 9 },
    { header: 'Hersteller', key: 'hersteller', width: 14 },
    { header: 'Reifengröße', key: 'groesse', width: 18 },
    { header: 'Breite', key: 'breite', width: 8 },
    { header: 'Höhe', key: 'hoehe', width: 7 },
    { header: 'Zoll', key: 'zoll', width: 7 },
    { header: 'Index', key: 'reifen_index', width: 8 },
    { header: 'Saison', key: 'saison', width: 10 },
    { header: 'Marke', key: 'marke', width: 14 },
    { header: 'DOT', key: 'dot', width: 8 },
  ];
  store.teile.forEach((t) =>
    wsTeile.addRow({
      ...t,
      kategorie: store.kategorie(t.kategorie_id)?.name ?? '',
      groesse: reifenGroesse(t),
      zoll: t.zoll !== null ? Number(t.zoll) : null,
    }),
  );
  kopfStil(wsTeile);

  // Buchungen (inkl. Verkäufe)
  const wsBuch = wb.addWorksheet('Buchungen');
  wsBuch.columns = [
    { header: 'Datum', key: 'datum', width: 18, style: { numFmt: 'dd.mm.yyyy hh:mm' } },
    { header: 'Art', key: 'art', width: 12 },
    { header: 'Teil', key: 'teil', width: 38 },
    { header: 'Kategorie', key: 'kategorie', width: 20 },
    { header: 'Menge (±)', key: 'menge', width: 10 },
    { header: 'Bestand danach', key: 'bestand', width: 14 },
    { header: 'Rückgängig gemacht', key: 'storniert', width: 18 },
    { header: 'Notiz', key: 'notiz', width: 24 },
    { header: 'Buchungs-ID', key: 'id', width: 12 },
    { header: 'Teil-ID', key: 'teil_id', width: 9 },
  ];
  buchungen.forEach((b) =>
    wsBuch.addRow({
      // Excel kennt keine Zeitzonen: Ortszeit als "Wandzeit" eintragen
      datum: (() => {
        const d = new Date(b.erstellt_am);
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000);
      })(),
      art: artName(b.art),
      teil: b.teil_bezeichnung,
      kategorie: b.kategorie_name ?? '',
      menge: b.menge,
      bestand: b.bestand_nachher,
      storniert: b.storniert ? 'ja' : '',
      notiz: b.notiz ?? '',
      id: b.id,
      teil_id: b.teil_id,
    }),
  );
  kopfStil(wsBuch);

  // Kategorien
  const wsKat = wb.addWorksheet('Kategorien');
  wsKat.columns = [
    { header: 'ID', key: 'id', width: 7 },
    { header: 'Name', key: 'name', width: 26 },
    { header: 'Vorlage', key: 'vorlage', width: 14 },
    { header: 'Reihenfolge', key: 'sortierung', width: 12 },
  ];
  store.kategorien.forEach((k) => wsKat.addRow({ ...k, vorlage: vorlageName(k.vorlage) }));
  kopfStil(wsKat);

  const puffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([puffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  a.href = url;
  a.download = `Teilelager_Sicherung_${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 5000);
}
