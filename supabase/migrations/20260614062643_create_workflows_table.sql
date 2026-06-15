create table if not exists public.workflows (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Untitled workflow',
  description text not null default '',
  nodes jsonb not null default '[]'::jsonb,
  edges jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.workflows enable row level security;

create policy "workflows_select_authenticated"
  on public.workflows for select
  to authenticated
  using (true);

create policy "workflows_insert_authenticated"
  on public.workflows for insert
  to authenticated
  with check (true);

create policy "workflows_update_authenticated"
  on public.workflows for update
  to authenticated
  using (true)
  with check (true);

create policy "workflows_delete_authenticated"
  on public.workflows for delete
  to authenticated
  using (true);
