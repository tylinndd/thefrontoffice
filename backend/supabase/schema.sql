-- =============================================================
-- The Front Office - Supabase Schema Migration
-- =============================================================

create extension if not exists pg_trgm;

-- 1. PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  team_name text not null,
  logo_url text,
  logo_description text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, team_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'team_name', 'My Syndicate'));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at on profile changes
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

-- 2. PLAYER CACHE
create table public.player_cache (
  id serial primary key,
  nba_player_id integer unique not null,
  full_name text not null,
  team_abbreviation text,
  position text,
  is_active boolean default true,
  updated_at timestamptz default now() not null
);

alter table public.player_cache enable row level security;

create policy "Authenticated users can read players"
  on public.player_cache for select
  to authenticated
  using (true);

create index idx_player_cache_name on public.player_cache using gin (full_name gin_trgm_ops);
create index idx_player_cache_nba_id on public.player_cache (nba_player_id);

-- 3. GAME LOGS
create table public.game_logs (
  id serial primary key,
  nba_player_id integer not null references public.player_cache(nba_player_id) on delete cascade,
  game_id text not null,
  game_date date not null,
  matchup text,
  wl text,
  min real,
  pts integer,
  reb integer,
  ast integer,
  stl integer,
  blk integer,
  tov integer,
  fg3m integer,
  fg3a integer,
  fgm integer,
  fga integer,
  ftm integer,
  fta integer,
  plus_minus real,
  created_at timestamptz default now() not null,
  unique (nba_player_id, game_id)
);

alter table public.game_logs enable row level security;

create policy "Authenticated users can read game logs"
  on public.game_logs for select
  to authenticated
  using (true);

create index idx_game_logs_player_date on public.game_logs (nba_player_id, game_date desc);

-- 4. BETS
create table public.bets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  nba_player_id integer not null,
  player_name text not null,
  category text not null check (category in ('PTS', 'REB', 'AST', '3PM', 'STL', 'BLK', 'PRA')),
  line numeric(5,1) not null,
  direction text not null check (direction in ('over', 'under')),
  model_probability numeric(5,4),
  market_probability numeric(5,4),
  edge numeric(5,4),
  confidence_score numeric(5,4),
  hit_rate numeric(5,4),
  result text default 'pending' check (result in ('pending', 'won', 'lost')),
  odds integer,
  stake numeric(10,2),
  payout numeric(10,2),
  game_date date,
  created_at timestamptz default now() not null,
  settled_at timestamptz
);

alter table public.bets enable row level security;

create policy "Users can view own bets"
  on public.bets for select
  using (auth.uid() = user_id);

create policy "Users can insert own bets"
  on public.bets for insert
  with check (auth.uid() = user_id);

create policy "Users can update own bets"
  on public.bets for update
  using (auth.uid() = user_id);

create index idx_bets_user on public.bets (user_id, created_at desc);

-- 5. PARLAYS
create table public.parlays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text,
  status text default 'active' check (status in ('active', 'settled', 'cancelled')),
  simulated_probability numeric(5,4),
  market_implied_probability numeric(5,4),
  total_odds integer,
  stake numeric(10,2),
  potential_payout numeric(10,2),
  result text default 'pending' check (result in ('pending', 'won', 'lost')),
  created_at timestamptz default now() not null,
  settled_at timestamptz
);

alter table public.parlays enable row level security;

create policy "Users can view own parlays"
  on public.parlays for select
  using (auth.uid() = user_id);

create policy "Users can insert own parlays"
  on public.parlays for insert
  with check (auth.uid() = user_id);

create policy "Users can update own parlays"
  on public.parlays for update
  using (auth.uid() = user_id);

create policy "Users can delete own parlays"
  on public.parlays for delete
  using (auth.uid() = user_id);

create index idx_parlays_user on public.parlays (user_id, created_at desc);

-- 6. PARLAY LEGS
create table public.parlay_legs (
  id uuid primary key default gen_random_uuid(),
  parlay_id uuid not null references public.parlays(id) on delete cascade,
  bet_id uuid not null references public.bets(id) on delete cascade,
  created_at timestamptz default now() not null,
  unique (parlay_id, bet_id)
);

alter table public.parlay_legs enable row level security;

create policy "Users can view own parlay legs"
  on public.parlay_legs for select
  using (
    exists (
      select 1 from public.parlays
      where parlays.id = parlay_legs.parlay_id
        and parlays.user_id = auth.uid()
    )
  );

create policy "Users can insert own parlay legs"
  on public.parlay_legs for insert
  with check (
    exists (
      select 1 from public.parlays
      where parlays.id = parlay_legs.parlay_id
        and parlays.user_id = auth.uid()
    )
  );

create policy "Users can delete own parlay legs"
  on public.parlay_legs for delete
  using (
    exists (
      select 1 from public.parlays
      where parlays.id = parlay_legs.parlay_id
        and parlays.user_id = auth.uid()
    )
  );

create index idx_parlay_legs_parlay on public.parlay_legs (parlay_id);
create index idx_parlay_legs_bet on public.parlay_legs (bet_id);
