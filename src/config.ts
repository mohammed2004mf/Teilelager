export interface Benutzer {
  name: string;
  email: string;
}

const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();
const benutzerRaw = (import.meta.env.VITE_BENUTZER ?? 'Mahmud:mahmud@teilelager.app,Kravan:kravan@teilelager.app').trim();

function parseBenutzer(raw: string): Benutzer[] {
  return raw
    .split(',')
    .map((eintrag) => eintrag.trim())
    .filter(Boolean)
    .map((eintrag) => {
      const i = eintrag.indexOf(':');
      return { name: eintrag.slice(0, i).trim(), email: eintrag.slice(i + 1).trim().toLowerCase() };
    })
    .filter((b) => b.name && b.email.includes('@'));
}

export const config = {
  supabaseUrl: url,
  supabaseAnonKey: anonKey,
  benutzer: parseBenutzer(benutzerRaw),
  istEingerichtet: url.startsWith('https://') && anonKey.length > 20,
};

export function nameZuEmail(email: string | undefined | null): string {
  if (!email) return 'Unbekannt';
  const treffer = config.benutzer.find((b) => b.email === email.toLowerCase());
  if (treffer) return treffer.name;
  const lokal = email.split('@')[0] ?? email;
  return lokal.charAt(0).toUpperCase() + lokal.slice(1);
}
