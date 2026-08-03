-- Progreso del quiz "Probalo" (docs/index.html), guardado por usuario logueado
-- via magic link. Correr una sola vez en el SQL Editor del proyecto Supabase.

create table public.quiz_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  estado jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.quiz_progress enable row level security;

create policy "select_own_progress" on public.quiz_progress
  for select using (auth.uid() = user_id);

create policy "insert_own_progress" on public.quiz_progress
  for insert with check (auth.uid() = user_id);

create policy "update_own_progress" on public.quiz_progress
  for update using (auth.uid() = user_id);

-- Necesario porque el proyecto tiene "Automatically expose new tables"
-- desactivado (recomendado por Supabase): sin este grant, ni siquiera un
-- usuario logueado podria leer/escribir su propia fila.
grant select, insert, update on public.quiz_progress to authenticated;
