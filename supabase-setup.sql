-- =============================================================
-- Obol — Schema inicial
-- Pegar esto en Supabase > SQL Editor > New query > Run
-- =============================================================

-- 1. Tabla de perfiles (nombre visible del usuario)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  created_at timestamptz default now() not null
);

-- 2. Tabla de progreso sincronizado
create table if not exists public.user_progress (
  user_id uuid references auth.users on delete cascade primary key,
  completed_lessons text[] default '{}' not null,
  perfect_lessons   text[] default '{}' not null,
  total_xp          integer default 0 not null,
  level             integer default 1 not null,
  streak            integer default 0 not null,
  hearts            integer default 5 not null,
  language          text default 'es' not null,
  last_active_date  date,
  updated_at        timestamptz default now() not null
);

-- 3. Activar Row Level Security (nadie puede ver datos ajenos)
alter table public.profiles      enable row level security;
alter table public.user_progress enable row level security;

-- 4. Políticas: cada usuario solo accede a SUS datos
create policy "profiles: leer propio"    on public.profiles      for select using (auth.uid() = id);
create policy "profiles: actualizar"     on public.profiles      for update using (auth.uid() = id);
create policy "profiles: insertar"       on public.profiles      for insert with check (auth.uid() = id);

create policy "progress: leer propio"   on public.user_progress for select using (auth.uid() = user_id);
create policy "progress: actualizar"    on public.user_progress for update using (auth.uid() = user_id);
create policy "progress: insertar"      on public.user_progress for insert with check (auth.uid() = user_id);

-- 5. Trigger: al crear usuario → auto-crear perfil y progreso vacío
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');

  insert into public.user_progress (user_id)
  values (new.id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
