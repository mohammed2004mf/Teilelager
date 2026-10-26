import { createClient, type SupportedStorage } from '@supabase/supabase-js';
import { config } from './config';

const MERKEN_KEY = 'teilelager.angemeldetBleiben';

function sicher<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

/** "Auf diesem PC angemeldet bleiben": localStorage, sonst nur bis der Browser zu ist (sessionStorage). */
export function setzeAngemeldetBleiben(wert: boolean): void {
  sicher(() => localStorage.setItem(MERKEN_KEY, wert ? '1' : '0'), undefined);
}

function angemeldetBleiben(): boolean {
  return sicher(() => localStorage.getItem(MERKEN_KEY) !== '0', true);
}

const speicher: SupportedStorage = {
  getItem: (key) => sicher(() => localStorage.getItem(key) ?? sessionStorage.getItem(key), null),
  setItem: (key, value) => {
    sicher(() => {
      if (angemeldetBleiben()) {
        localStorage.setItem(key, value);
        sessionStorage.removeItem(key);
      } else {
        sessionStorage.setItem(key, value);
        localStorage.removeItem(key);
      }
    }, undefined);
  },
  removeItem: (key) => {
    sicher(() => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    }, undefined);
  },
};

export const supabase = createClient(
  config.supabaseUrl || 'https://nicht-eingerichtet.supabase.co',
  config.supabaseAnonKey || 'nicht-eingerichtet',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: speicher,
      storageKey: 'teilelager.auth',
    },
    realtime: {
      params: { eventsPerSecond: 10 },
    },
  },
);
