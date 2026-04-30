-- ============================================================
-- FRIDGE — Schéma PostgreSQL pour Supabase
-- Exécuter dans l'éditeur SQL de Supabase (Settings > SQL Editor)
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLE: users (profil étendu, lié à auth.users)
-- ============================================================
create table public.users (
  id                      uuid primary key references auth.users(id) on delete cascade,
  email                   text not null,
  household_size          int not null default 2,
  dietary_preferences     text[] not null default '{}',
  stripe_customer_id      text unique,
  stripe_subscription_id  text unique,
  subscription_status     text not null default 'inactive'
                          check (subscription_status in ('active', 'inactive', 'trialing', 'canceled', 'past_due')),
  created_at              timestamptz not null default now()
);

-- Déclencher la création du profil à l'inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- TABLE: recipes
-- ============================================================
create table public.recipes (
  id                uuid primary key default uuid_generate_v4(),
  title             text not null,
  description       text not null default '',
  photo_url         text,
  prep_time_minutes int not null default 30,
  servings_base     int not null default 4,
  tags              text[] not null default '{}',
  season            text[] not null default '{}',
  calories          int,
  proteins_g        float,
  carbs_g           float,
  fats_g            float,
  steps             jsonb not null default '[]',
  is_active         boolean not null default true,
  created_at        timestamptz not null default now()
);

-- Index recherche plein texte
create index recipes_title_fts_idx on public.recipes
  using gin(to_tsvector('french', title || ' ' || description));

-- Index sur les tags (pour les filtres)
create index recipes_tags_idx on public.recipes using gin(tags);
create index recipes_season_idx on public.recipes using gin(season);
create index recipes_is_active_idx on public.recipes(is_active);

-- ============================================================
-- TABLE: ingredients
-- ============================================================
create table public.ingredients (
  id               uuid primary key default uuid_generate_v4(),
  recipe_id        uuid not null references public.recipes(id) on delete cascade,
  name             text not null,
  quantity         float not null,
  unit             text not null,
  grocery_category text not null default 'autre'
);

create index ingredients_recipe_id_idx on public.ingredients(recipe_id);

-- ============================================================
-- TABLE: weekly_selection
-- ============================================================
create table public.weekly_selection (
  id               uuid primary key default uuid_generate_v4(),
  week_start_date  date not null,
  recipe_id        uuid not null references public.recipes(id) on delete cascade,
  unique (week_start_date, recipe_id)
);

create index weekly_selection_week_idx on public.weekly_selection(week_start_date);

-- ============================================================
-- TABLE: user_meal_plans
-- ============================================================
create table public.user_meal_plans (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.users(id) on delete cascade,
  week_start_date  date not null,
  day_of_week      int not null check (day_of_week between 1 and 7),
  meal_type        text not null check (meal_type in ('lunch', 'dinner')),
  recipe_id        uuid not null references public.recipes(id) on delete cascade,
  unique (user_id, week_start_date, day_of_week, meal_type)
);

create index user_meal_plans_user_week_idx on public.user_meal_plans(user_id, week_start_date);

-- ============================================================
-- TABLE: user_favorites
-- ============================================================
create table public.user_favorites (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  recipe_id   uuid not null references public.recipes(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, recipe_id)
);

create index user_favorites_user_id_idx on public.user_favorites(user_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Activer RLS sur toutes les tables
alter table public.users enable row level security;
alter table public.recipes enable row level security;
alter table public.ingredients enable row level security;
alter table public.weekly_selection enable row level security;
alter table public.user_meal_plans enable row level security;
alter table public.user_favorites enable row level security;

-- ---- users ----
create policy "users: lecture profil propre"
  on public.users for select
  using (auth.uid() = id);

create policy "users: mise à jour profil propre"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---- recipes ----
-- Lecture publique pour les recettes actives
create policy "recipes: lecture publique actives"
  on public.recipes for select
  using (is_active = true);

-- Les admins (service_role) peuvent tout faire — géré côté serveur
-- Pas de politique insert/update/delete pour les utilisateurs lambda

-- ---- ingredients ----
create policy "ingredients: lecture publique"
  on public.ingredients for select
  using (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_id and r.is_active = true
    )
  );

-- ---- weekly_selection ----
create policy "weekly_selection: lecture publique"
  on public.weekly_selection for select
  to authenticated
  using (true);

-- ---- user_meal_plans ----
create policy "meal_plans: lecture propre"
  on public.user_meal_plans for select
  using (auth.uid() = user_id);

create policy "meal_plans: insertion propre"
  on public.user_meal_plans for insert
  with check (auth.uid() = user_id);

create policy "meal_plans: suppression propre"
  on public.user_meal_plans for delete
  using (auth.uid() = user_id);

create policy "meal_plans: mise à jour propre"
  on public.user_meal_plans for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---- user_favorites ----
create policy "favorites: lecture propre"
  on public.user_favorites for select
  using (auth.uid() = user_id);

create policy "favorites: insertion propre"
  on public.user_favorites for insert
  with check (auth.uid() = user_id);

create policy "favorites: suppression propre"
  on public.user_favorites for delete
  using (auth.uid() = user_id);

-- ============================================================
-- RÔLE ADMIN (via claim JWT custom ou metadata Supabase)
-- ============================================================
-- Pour vérifier si un user est admin dans une policy :
-- (auth.jwt() ->> 'role') = 'admin'
-- À configurer dans Supabase : Auth > Users > Edit > Custom Claims
-- ou via la fonction ci-dessous (appelée par le service_role)

create or replace function public.set_admin_role(user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update auth.users
  set raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'
  where id = user_id;
end;
$$;

-- ============================================================
-- VUE utilitaire : recettes de la semaine courante
-- ============================================================
create or replace view public.current_week_recipes as
select
  ws.week_start_date,
  r.*
from public.weekly_selection ws
join public.recipes r on r.id = ws.recipe_id
where ws.week_start_date = date_trunc('week', current_date)::date
  and r.is_active = true;

-- ============================================================
-- FONCTION : générer la liste de courses d'un utilisateur
-- ============================================================
create or replace function public.get_shopping_list(
  p_user_id      uuid,
  p_week_start   date
)
returns table (
  ingredient_name  text,
  total_quantity   float,
  unit             text,
  grocery_category text
)
language sql
stable
security definer
as $$
  select
    i.name                                                        as ingredient_name,
    sum(i.quantity * (u.household_size::float / r.servings_base::float))  as total_quantity,
    i.unit,
    i.grocery_category
  from public.user_meal_plans mp
  join public.recipes r         on r.id = mp.recipe_id
  join public.ingredients i     on i.recipe_id = r.id
  join public.users u           on u.id = mp.user_id
  where mp.user_id = p_user_id
    and mp.week_start_date = p_week_start
  group by i.name, i.unit, i.grocery_category
  order by i.grocery_category, i.name;
$$;
