import { backend, type Tabelle } from './backend';
import type { Buchung, Kategorie, Teil } from './types';

type Hoerer = (t: Tabelle) => void;

class Store {
  kategorien: Kategorie[] = [];
  teile: Teil[] = [];
  benutzerEmail: string | null = null;

  private hoerer = new Set<Hoerer>();
  private stopLive: (() => void) | null = null;
  private timer: Partial<Record<Tabelle, number>> = {};

  async laden(): Promise<void> {
    const [k, t] = await Promise.all([backend.kategorien(), backend.teile()]);
    this.kategorien = k;
    this.teile = t;
  }

  /** Live-Aktualisierung starten (Änderungen vom anderen PC) */
  starteLive(): void {
    this.stopLive?.();
    this.stopLive = backend.aufAenderungen((tabelle) => this.planeNachladen(tabelle));
    // Wenn der Tab wieder sichtbar wird oder das Internet zurück ist: alles neu laden
    document.addEventListener('visibilitychange', this.beiSichtbar);
    window.addEventListener('online', this.beiSichtbar);
  }

  stoppeLive(): void {
    this.stopLive?.();
    this.stopLive = null;
    document.removeEventListener('visibilitychange', this.beiSichtbar);
    window.removeEventListener('online', this.beiSichtbar);
  }

  private beiSichtbar = () => {
    if (document.visibilityState === 'visible') {
      this.planeNachladen('kategorien');
      this.planeNachladen('teile');
      this.planeNachladen('buchungen');
    }
  };

  /** Mehrere schnelle Änderungen zusammenfassen */
  private planeNachladen(tabelle: Tabelle): void {
    window.clearTimeout(this.timer[tabelle]);
    this.timer[tabelle] = window.setTimeout(() => void this.nachladen(tabelle), 150);
  }

  private async nachladen(tabelle: Tabelle): Promise<void> {
    try {
      if (tabelle === 'kategorien') this.kategorien = await backend.kategorien();
      if (tabelle === 'teile') this.teile = await backend.teile();
      if (tabelle === 'buchungen') {
        // Buchungen ändern auch den Bestand
        this.teile = await backend.teile();
      }
      this.melde(tabelle);
    } catch (e) {
      console.warn('Nachladen fehlgeschlagen', e);
    }
  }

  /** Nach einer eigenen Buchung sofort den neuen Bestand zeigen (ohne auf den Server zu warten) */
  uebernehmeBuchung(b: Buchung | null): void {
    if (!b || b.teil_id === null || b.bestand_nachher === null) return;
    const t = this.teile.find((x) => x.id === b.teil_id);
    if (t) t.bestand = b.bestand_nachher;
    this.melde('buchungen');
  }

  melde(t: Tabelle): void {
    this.hoerer.forEach((h) => h(t));
  }

  abonnieren(h: Hoerer): () => void {
    this.hoerer.add(h);
    return () => this.hoerer.delete(h);
  }

  kategorie(id: number): Kategorie | undefined {
    return this.kategorien.find((k) => k.id === id);
  }

  teil(id: number): Teil | undefined {
    return this.teile.find((t) => t.id === id);
  }
}

export const store = new Store();
