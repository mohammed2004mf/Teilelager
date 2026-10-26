import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { config } from './config';
import type { Buchung, BuchungsArt, Kategorie, Teil, TeilEingabe, Vorlage } from './types';

export type Tabelle = 'kategorien' | 'teile' | 'buchungen';

export interface BuchungsFilter {
  arten?: BuchungsArt[];
  von?: Date;
  bis?: Date;
  limit?: number;
  nurAktive?: boolean;
}

export interface Backend {
  readonly istDemo: boolean;
  aktuelleEmail(): Promise<string | null>;
  anmelden(email: string, passwort: string): Promise<void>;
  abmelden(): Promise<void>;
  beiAbmeldung(cb: () => void): void;

  kategorien(): Promise<Kategorie[]>;
  teile(): Promise<Teil[]>;
  buchungen(filter: BuchungsFilter): Promise<Buchung[]>;

  teilAnlegen(daten: TeilEingabe): Promise<Teil>;
  teilAendern(id: number, daten: TeilEingabe): Promise<void>;
  teilLoeschen(id: number): Promise<void>;

  kategorieAnlegen(name: string, vorlage: Vorlage): Promise<void>;
  kategorieUmbenennen(id: number, name: string): Promise<void>;
  kategorieLoeschen(id: number): Promise<void>;

  buchen(teilId: number, art: 'zugang' | 'verkauf', menge: number, notiz?: string): Promise<Buchung>;
  korrigieren(teilId: number, neuerBestand: number, notiz?: string): Promise<Buchung | null>;
  stornieren(buchungId: number): Promise<Buchung>;

  /** Meldet Änderungen (auch vom anderen PC) */
  aufAenderungen(cb: (t: Tabelle) => void): () => void;
}

// ---------------------------------------------------------------------
// Supabase (echter Betrieb)
// ---------------------------------------------------------------------

function pruefe<T>(res: { data: T; error: unknown }): T {
  if (res.error) throw res.error;
  return res.data;
}

const supabaseBackend: Backend = {
  istDemo: false,

  async aktuelleEmail() {
    const { data } = await supabase.auth.getSession();
    return data.session?.user.email ?? null;
  },
  async anmelden(email, passwort) {
    const { error } = await supabase.auth.signInWithPassword({ email, password: passwort });
    if (error) throw error;
  },
  async abmelden() {
    await supabase.auth.signOut();
  },
  beiAbmeldung(cb) {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') cb();
    });
  },

  async kategorien() {
    return pruefe(await supabase.from('kategorien').select('*').order('sortierung').order('name')) as Kategorie[];
  },
  async teile() {
    return pruefe(await supabase.from('teile').select('*').order('bezeichnung')) as Teil[];
  },
  async buchungen(f) {
    let q = supabase.from('buchungen').select('*').order('erstellt_am', { ascending: false });
    if (f.arten?.length) q = q.in('art', f.arten);
    if (f.von) q = q.gte('erstellt_am', f.von.toISOString());
    if (f.bis) q = q.lt('erstellt_am', f.bis.toISOString());
    if (f.nurAktive) q = q.eq('storniert', false);
    q = q.limit(f.limit ?? 5000);
    return pruefe(await q) as Buchung[];
  },

  async teilAnlegen(daten) {
    return pruefe(await supabase.from('teile').insert(daten).select('*').single()) as Teil;
  },
  async teilAendern(id, daten) {
    pruefe(await supabase.from('teile').update(daten).eq('id', id));
  },
  async teilLoeschen(id) {
    pruefe(await supabase.from('teile').delete().eq('id', id));
  },

  async kategorieAnlegen(name, vorlage) {
    const max = pruefe(
      await supabase.from('kategorien').select('sortierung').order('sortierung', { ascending: false }).limit(1),
    ) as { sortierung: number }[];
    const sortierung = (max[0]?.sortierung ?? 0) + 10;
    pruefe(await supabase.from('kategorien').insert({ name, vorlage, sortierung }));
  },
  async kategorieUmbenennen(id, name) {
    pruefe(await supabase.from('kategorien').update({ name }).eq('id', id));
  },
  async kategorieLoeschen(id) {
    pruefe(await supabase.from('kategorien').delete().eq('id', id));
  },

  async buchen(teilId, art, menge, notiz) {
    return pruefe(
      await supabase.rpc('buchen', { p_teil_id: teilId, p_art: art, p_menge: menge, p_notiz: notiz ?? null }),
    ) as Buchung;
  },
  async korrigieren(teilId, neuerBestand, notiz) {
    const r = pruefe(
      await supabase.rpc('korrigieren', { p_teil_id: teilId, p_neuer_bestand: neuerBestand, p_notiz: notiz ?? null }),
    ) as Buchung | null;
    return r && r.id ? r : null;
  },
  async stornieren(buchungId) {
    return pruefe(await supabase.rpc('stornieren', { p_buchung_id: buchungId })) as Buchung;
  },

  aufAenderungen(cb) {
    const kanal: RealtimeChannel = supabase
      .channel('teilelager-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kategorien' }, () => cb('kategorien'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teile' }, () => cb('teile'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'buchungen' }, () => cb('buchungen'))
      .subscribe();
    return () => {
      void supabase.removeChannel(kanal);
    };
  },
};

// ---------------------------------------------------------------------
// Demo-Modus: läuft komplett im Browser, ohne Supabase.
// Zum Ausprobieren vor der Einrichtung. Zwei Browser-Tabs synchronisieren sich live.
// ---------------------------------------------------------------------

interface DemoDaten {
  kategorien: Kategorie[];
  teile: Teil[];
  buchungen: Buchung[];
  naechsteId: number;
  angemeldet: string | null;
}

const DEMO_KEY = 'teilelager.demo';

function demoStart(): DemoDaten {
  return {
    kategorien: [
      { id: 1, name: 'Öle & Flüssigkeiten', vorlage: 'oel', sortierung: 10 },
      { id: 2, name: 'Filter', vorlage: 'filter', sortierung: 20 },
      { id: 3, name: 'Reifen', vorlage: 'reifen', sortierung: 30 },
      { id: 4, name: 'Bremsen', vorlage: 'standard', sortierung: 40 },
      { id: 5, name: 'Sonstiges', vorlage: 'standard', sortierung: 50 },
    ],
    teile: [],
    buchungen: [],
    naechsteId: 100,
    angemeldet: null,
  };
}

function ladeDemo(): DemoDaten {
  try {
    const raw = localStorage.getItem(DEMO_KEY);
    if (raw) return JSON.parse(raw) as DemoDaten;
  } catch {
    /* ignorieren */
  }
  return demoStart();
}

function createDemoBackend(): Backend {
  let d = ladeDemo();
  const hoerer = new Set<(t: Tabelle) => void>();
  let bc: BroadcastChannel | null = null;
  try {
    bc = new BroadcastChannel('teilelager-demo');
    bc.onmessage = (ev: MessageEvent<Tabelle>) => {
      d = ladeDemo();
      hoerer.forEach((h) => h(ev.data));
    };
  } catch {
    bc = null;
  }

  const speichern = (t: Tabelle) => {
    try {
      localStorage.setItem(DEMO_KEY, JSON.stringify(d));
    } catch {
      /* ignorieren */
    }
    bc?.postMessage(t);
    hoerer.forEach((h) => h(t));
  };
  const id = () => d.naechsteId++;
  const person = () => {
    const email = d.angemeldet ?? '';
    return config.benutzer.find((b) => b.email === email)?.name ?? 'Demo';
  };
  const warte = () => new Promise((r) => setTimeout(r, 60));
  const kopie = <T>(x: T): T => JSON.parse(JSON.stringify(x)) as T;
  const teilOder = (teilId: number): Teil => {
    const t = d.teile.find((x) => x.id === teilId);
    if (!t) throw new Error('Teil nicht gefunden');
    return t;
  };
  const neueBuchung = (t: Teil, art: BuchungsArt, menge: number, notiz: string | null, stornoVon: number | null = null) => {
    const b: Buchung = {
      id: id(),
      teil_id: t.id,
      teil_bezeichnung: t.bezeichnung,
      kategorie_name: d.kategorien.find((k) => k.id === t.kategorie_id)?.name ?? null,
      art,
      menge,
      bestand_nachher: t.bestand,
      person: person(),
      notiz,
      storniert: false,
      storno_von: stornoVon,
      erstellt_am: new Date().toISOString(),
    };
    d.buchungen.unshift(b);
    return b;
  };

  return {
    istDemo: true,
    async aktuelleEmail() {
      d = ladeDemo();
      return d.angemeldet;
    },
    async anmelden(email, passwort) {
      await warte();
      if (passwort.length < 1) throw new Error('Bitte ein Passwort eingeben.');
      d.angemeldet = email;
      speichern('teile');
    },
    async abmelden() {
      d.angemeldet = null;
      speichern('teile');
    },
    beiAbmeldung() {
      /* im Demo nicht nötig */
    },

    async kategorien() {
      return kopie([...d.kategorien].sort((a, b) => a.sortierung - b.sortierung || a.name.localeCompare(b.name)));
    },
    async teile() {
      return kopie([...d.teile].sort((a, b) => a.bezeichnung.localeCompare(b.bezeichnung)));
    },
    async buchungen(f) {
      let r = d.buchungen.filter((b) => {
        const t = new Date(b.erstellt_am).getTime();
        if (f.arten?.length && !f.arten.includes(b.art)) return false;
        if (f.von && t < f.von.getTime()) return false;
        if (f.bis && t >= f.bis.getTime()) return false;
        if (f.nurAktive && b.storniert) return false;
        return true;
      });
      r = r.slice(0, f.limit ?? 5000);
      return kopie(r);
    },

    async teilAnlegen(daten) {
      await warte();
      const jetzt = new Date().toISOString();
      const t: Teil = { ...daten, id: id(), bestand: 0, erstellt_am: jetzt, geaendert_am: jetzt };
      d.teile.push(t);
      speichern('teile');
      return kopie(t);
    },
    async teilAendern(teilId, daten) {
      await warte();
      const t = teilOder(teilId);
      Object.assign(t, daten, { geaendert_am: new Date().toISOString() });
      speichern('teile');
    },
    async teilLoeschen(teilId) {
      await warte();
      d.teile = d.teile.filter((t) => t.id !== teilId);
      d.buchungen.forEach((b) => {
        if (b.teil_id === teilId) b.teil_id = null;
      });
      speichern('teile');
    },

    async kategorieAnlegen(name, vorlage) {
      await warte();
      if (d.kategorien.some((k) => k.name.toLowerCase() === name.toLowerCase())) {
        throw Object.assign(new Error('doppelt'), { code: '23505' });
      }
      const sortierung = Math.max(0, ...d.kategorien.map((k) => k.sortierung)) + 10;
      d.kategorien.push({ id: id(), name, vorlage, sortierung });
      speichern('kategorien');
    },
    async kategorieUmbenennen(katId, name) {
      await warte();
      if (d.kategorien.some((k) => k.id !== katId && k.name.toLowerCase() === name.toLowerCase())) {
        throw Object.assign(new Error('doppelt'), { code: '23505' });
      }
      const k = d.kategorien.find((x) => x.id === katId);
      if (k) k.name = name;
      speichern('kategorien');
    },
    async kategorieLoeschen(katId) {
      await warte();
      if (d.teile.some((t) => t.kategorie_id === katId)) {
        throw Object.assign(new Error('fk'), { code: '23503' });
      }
      d.kategorien = d.kategorien.filter((k) => k.id !== katId);
      speichern('kategorien');
    },

    async buchen(teilId, art, menge, notiz) {
      await warte();
      if (menge <= 0) throw new Error('Die Menge muss größer als 0 sein');
      const t = teilOder(teilId);
      const dlt = art === 'zugang' ? menge : -menge;
      t.bestand += dlt;
      const b = neueBuchung(t, art, dlt, notiz ?? null);
      speichern('buchungen');
      return kopie(b);
    },
    async korrigieren(teilId, neuerBestand, notiz) {
      await warte();
      const t = teilOder(teilId);
      if (t.bestand === neuerBestand) return null;
      const dlt = neuerBestand - t.bestand;
      t.bestand = neuerBestand;
      const b = neueBuchung(t, 'korrektur', dlt, notiz ?? 'Korrektur');
      speichern('buchungen');
      return kopie(b);
    },
    async stornieren(buchungId) {
      await warte();
      const b = d.buchungen.find((x) => x.id === buchungId);
      if (!b) throw new Error('Buchung nicht gefunden');
      if (b.art === 'storno') throw new Error('Eine Rückgängig-Buchung kann nicht rückgängig gemacht werden');
      if (b.storniert) throw new Error('Diese Buchung wurde schon rückgängig gemacht');
      const t = b.teil_id !== null ? d.teile.find((x) => x.id === b.teil_id) : undefined;
      if (t) t.bestand -= b.menge;
      b.storniert = true;
      const s: Buchung = {
        id: id(),
        teil_id: b.teil_id,
        teil_bezeichnung: b.teil_bezeichnung,
        kategorie_name: b.kategorie_name,
        art: 'storno',
        menge: -b.menge,
        bestand_nachher: t ? t.bestand : null,
        person: person(),
        notiz: `Rückgängig: ${b.art}`,
        storniert: false,
        storno_von: b.id,
        erstellt_am: new Date().toISOString(),
      };
      d.buchungen.unshift(s);
      speichern('buchungen');
      return kopie(s);
    },

    aufAenderungen(cb) {
      hoerer.add(cb);
      return () => hoerer.delete(cb);
    },
  };
}

/** Demo-Modus, wenn Supabase noch nicht eingerichtet ist oder ?demo in der Adresse steht */
export const istDemoModus = !config.istEingerichtet || new URLSearchParams(location.search).has('demo');

export const backend: Backend = istDemoModus ? createDemoBackend() : supabaseBackend;
