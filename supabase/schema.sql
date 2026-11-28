-- =====================================================================
--  Teilelager – Datenbank-Schema für Supabase
--  Einmal komplett im Supabase "SQL Editor" ausführen (Run).
--  Kann gefahrlos erneut ausgeführt werden, vorhandene Daten bleiben.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Tabellen
-- ---------------------------------------------------------------------

-- Kategorien (änderbar). "vorlage" bestimmt die Zusatzfelder der Teile.
create table if not exists public.kategorien (
  id          bigint generated always as identity primary key,
  name        text not null unique check (length(trim(name)) > 0),
  vorlage     text not null default 'standard'
              check (vorlage in ('standard', 'oel', 'filter', 'reifen')),
  sortierung  integer not null default 100,
  erstellt_am timestamptz not null default now()
);

-- Teile mit aktuellem Bestand
create table if not exists public.teile (
  id             bigint generated always as identity primary key,
  kategorie_id   bigint not null references public.kategorien(id) on delete restrict,
  bezeichnung    text not null check (length(trim(bezeichnung)) > 0),
  artikelnummer  text,
  ean            text,
  lieferant      text,
  lagerort       text,
  fahrzeuge      text,
  einheit        text not null default 'Stück' check (einheit in ('Stück', 'Packung')),
  bestand        integer not null default 0,
  -- Vorlage "oel"
  viskositaet    text,
  freigabe       text,
  gebinde        text,
  -- Vorlage "filter"
  hersteller     text,
  -- Vorlage "reifen"
  breite         integer,
  hoehe          integer,
  zoll           text,          -- Freitext, z. B. 16, R16C, ZR17
  reifen_index   text,
  saison         text check (saison is null or saison in ('Sommer', 'Winter', 'Ganzjahr')),
  marke          text,
  dot            text,
  erstellt_am    timestamptz not null default now(),
  geaendert_am   timestamptz not null default now()
);

create index if not exists teile_kategorie_idx on public.teile(kategorie_id);

-- Bestehende Datenbanken: "zoll" von Zahl auf Text umstellen (Buchstaben wie R16C oder ZR17 erlaubt).
-- Vorhandene Werte bleiben erhalten, aus 16.0 wird "16".
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'teile' and column_name = 'zoll' and data_type <> 'text'
  ) then
    alter table public.teile alter column zoll type text
      using regexp_replace(zoll::text, '\.0$', '');
  end if;
end $$;

-- Buchungen: gespeichert werden nur Verkäufe (und deren Rückgängig). Zugänge/Korrekturen nicht.
-- "menge" ist die Änderung des Bestands: Zugang +, Verkauf −, Korrektur ±, Storno = Gegenbuchung.
create table if not exists public.buchungen (
  id                bigint generated always as identity primary key,
  teil_id           bigint references public.teile(id) on delete set null,
  teil_bezeichnung  text not null,
  kategorie_name    text,
  art               text not null check (art in ('zugang', 'verkauf', 'korrektur', 'storno')),
  menge             integer not null,
  bestand_nachher   integer,
  person            text not null,
  notiz             text,
  storniert         boolean not null default false,
  storno_von        bigint references public.buchungen(id),
  erstellt_am       timestamptz not null default now()
);

create index if not exists buchungen_zeit_idx on public.buchungen(erstellt_am desc);
create index if not exists buchungen_art_zeit_idx on public.buchungen(art, erstellt_am desc);
create index if not exists buchungen_teil_idx on public.buchungen(teil_id);

-- ---------------------------------------------------------------------
-- 2. Hilfsfunktionen
-- ---------------------------------------------------------------------

-- Name der angemeldeten Person: aus der E-Mail-Adresse (mahmud@... → Mahmud)
create or replace function public.person_name()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select initcap(split_part(email, '@', 1)) from auth.users where id = auth.uid()),
    'Werkstatt'
  );
$$;

-- geaendert_am automatisch setzen
create or replace function public.setze_geaendert_am()
returns trigger
language plpgsql
as $$
begin
  new.geaendert_am := now();
  return new;
end;
$$;

drop trigger if exists teile_geaendert_am on public.teile;
create trigger teile_geaendert_am
  before update on public.teile
  for each row execute function public.setze_geaendert_am();

-- ---------------------------------------------------------------------
-- 3. Buchungs-Funktionen (der Bestand wird NUR hierüber geändert)
--    Alles passiert in einem Schritt, damit bei gleichzeitigen
--    Buchungen von zwei Personen nichts verloren geht.
-- ---------------------------------------------------------------------

-- Zugang oder Verkauf buchen. p_menge ist immer positiv.
create or replace function public.buchen(p_teil_id bigint, p_art text, p_menge integer, p_notiz text default null)
returns public.buchungen
language plpgsql
security definer
set search_path = public
as $$
declare
  v_teil   public.teile;
  v_delta  integer;
  v_kat    text;
  v_row    public.buchungen;
begin
  if p_art not in ('zugang', 'verkauf') then
    raise exception 'Ungültige Buchungsart: %', p_art;
  end if;
  if p_menge is null or p_menge <= 0 then
    raise exception 'Die Menge muss größer als 0 sein';
  end if;

  v_delta := case when p_art = 'zugang' then p_menge else -p_menge end;

  update public.teile
     set bestand = bestand + v_delta
   where id = p_teil_id
  returning * into v_teil;

  if not found then
    raise exception 'Teil nicht gefunden';
  end if;

  select name into v_kat from public.kategorien where id = v_teil.kategorie_id;

  if p_art = 'verkauf' then
    -- Nur Verkäufe werden gespeichert (für die Verkaufsübersicht)
    insert into public.buchungen (teil_id, teil_bezeichnung, kategorie_name, art, menge, bestand_nachher, person, notiz)
    values (v_teil.id, v_teil.bezeichnung, v_kat, p_art, v_delta, v_teil.bestand, public.person_name(), p_notiz)
    returning * into v_row;
  else
    -- Zugang: kein Verlauf, nur den neuen Bestand zurückmelden
    v_row.teil_id := v_teil.id;
    v_row.teil_bezeichnung := v_teil.bezeichnung;
    v_row.kategorie_name := v_kat;
    v_row.art := p_art;
    v_row.menge := v_delta;
    v_row.bestand_nachher := v_teil.bestand;
    v_row.person := 'Werkstatt';
    v_row.storniert := false;
    v_row.erstellt_am := now();
  end if;

  return v_row;
end;
$$;

-- Bestand auf einen gezählten Wert setzen (Korrektur / Anfangsbestand)
create or replace function public.korrigieren(p_teil_id bigint, p_neuer_bestand integer, p_notiz text default null)
returns public.buchungen
language plpgsql
security definer
set search_path = public
as $$
declare
  v_alt    integer;
  v_teil   public.teile;
  v_kat    text;
  v_row    public.buchungen;
begin
  if p_neuer_bestand is null then
    raise exception 'Bitte einen Bestand angeben';
  end if;

  select bestand into v_alt from public.teile where id = p_teil_id for update;
  if not found then
    raise exception 'Teil nicht gefunden';
  end if;
  if v_alt = p_neuer_bestand then
    return null;
  end if;

  update public.teile
     set bestand = p_neuer_bestand
   where id = p_teil_id
  returning * into v_teil;

  select name into v_kat from public.kategorien where id = v_teil.kategorie_id;

  -- Korrekturen werden nicht gespeichert (kein Verlauf), nur den neuen Bestand zurückmelden
  v_row.teil_id := v_teil.id;
  v_row.teil_bezeichnung := v_teil.bezeichnung;
  v_row.kategorie_name := v_kat;
  v_row.art := 'korrektur';
  v_row.menge := p_neuer_bestand - v_alt;
  v_row.bestand_nachher := v_teil.bestand;
  v_row.person := 'Werkstatt';
  v_row.notiz := coalesce(p_notiz, 'Korrektur');
  v_row.storniert := false;
  v_row.erstellt_am := now();

  return v_row;
end;
$$;

-- Buchung rückgängig machen (legt eine Gegenbuchung an, löscht nichts)
create or replace function public.stornieren(p_buchung_id bigint)
returns public.buchungen
language plpgsql
security definer
set search_path = public
as $$
declare
  v_b      public.buchungen;
  v_teil   public.teile;
  v_row    public.buchungen;
begin

  select * into v_b from public.buchungen where id = p_buchung_id for update;
  if not found then
    raise exception 'Buchung nicht gefunden';
  end if;
  if v_b.art = 'storno' then
    raise exception 'Eine Rückgängig-Buchung kann nicht rückgängig gemacht werden';
  end if;
  if v_b.storniert then
    raise exception 'Diese Buchung wurde schon rückgängig gemacht';
  end if;

  if v_b.teil_id is not null then
    update public.teile
       set bestand = bestand - v_b.menge
     where id = v_b.teil_id
    returning * into v_teil;
  end if;

  update public.buchungen set storniert = true where id = v_b.id;

  insert into public.buchungen (teil_id, teil_bezeichnung, kategorie_name, art, menge, bestand_nachher, person, notiz, storno_von)
  values (v_b.teil_id, v_b.teil_bezeichnung, v_b.kategorie_name, 'storno', -v_b.menge, v_teil.bestand,
          public.person_name(), 'Rückgängig: ' || v_b.art, v_b.id)
  returning * into v_row;

  return v_row;
end;
$$;

-- ---------------------------------------------------------------------
-- 4. Rechte und Zugriffsregeln (ohne Anmeldung nutzbar)
-- ---------------------------------------------------------------------

alter table public.kategorien enable row level security;
alter table public.teile      enable row level security;
alter table public.buchungen  enable row level security;

-- OHNE ANMELDUNG: Das Programm wird ohne Login benutzt (Wunsch der Werkstatt).
-- Jeder, der die Adresse der Webseite kennt, kann lesen und buchen.
revoke all on function public.buchen(bigint, text, integer, text) from public;
revoke all on function public.korrigieren(bigint, integer, text) from public;
revoke all on function public.stornieren(bigint) from public;
revoke all on function public.person_name() from public;

-- Kategorien: lesen, anlegen, umbenennen, löschen
grant select, insert, update, delete on public.kategorien to anon, authenticated;

-- Teile: alles außer dem Bestand direkt zu ändern (der geht nur über Buchungen)
revoke insert, update on public.teile from anon, authenticated;
grant select, delete on public.teile to anon, authenticated;
grant insert (kategorie_id, bezeichnung, artikelnummer, ean, lieferant, lagerort, fahrzeuge, einheit,
              viskositaet, freigabe, gebinde, hersteller, breite, hoehe, zoll, reifen_index, saison, marke, dot)
  on public.teile to anon, authenticated;
grant update (kategorie_id, bezeichnung, artikelnummer, ean, lieferant, lagerort, fahrzeuge, einheit,
              viskositaet, freigabe, gebinde, hersteller, breite, hoehe, zoll, reifen_index, saison, marke, dot)
  on public.teile to anon, authenticated;

-- Buchungen: nur lesen (neue Buchungen nur über die Funktionen oben)
revoke insert, update, delete on public.buchungen from anon, authenticated;
grant select on public.buchungen to anon, authenticated;

grant execute on function public.buchen(bigint, text, integer, text) to anon, authenticated;
grant execute on function public.korrigieren(bigint, integer, text) to anon, authenticated;
grant execute on function public.stornieren(bigint) to anon, authenticated;
grant execute on function public.person_name() to anon, authenticated;

drop policy if exists "angemeldet" on public.kategorien;
create policy "angemeldet" on public.kategorien
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "angemeldet" on public.teile;
create policy "angemeldet" on public.teile
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "angemeldet lesen" on public.buchungen;
create policy "angemeldet lesen" on public.buchungen
  for select to anon, authenticated using (true);

-- ---------------------------------------------------------------------
-- 5. Live-Aktualisierung einschalten
-- ---------------------------------------------------------------------
do $$
begin
  begin
    alter publication supabase_realtime add table public.kategorien;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.teile;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.buchungen;
  exception when duplicate_object then null;
  end;
end $$;

-- ---------------------------------------------------------------------
-- 6. Start-Kategorien (nur wenn noch keine vorhanden sind)
-- ---------------------------------------------------------------------
insert into public.kategorien (name, vorlage, sortierung)
select * from (values
  ('Öle & Flüssigkeiten', 'oel',      10),
  ('Filter',              'filter',   20),
  ('Reifen',              'reifen',   30),
  ('Bremsen',             'standard', 40),
  ('Sonstiges',           'standard', 50)
) as v(name, vorlage, sortierung)
where not exists (select 1 from public.kategorien);
