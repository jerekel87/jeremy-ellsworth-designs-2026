create table if not exists public.workflow_runs (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references public.workflows(id) on delete cascade,
  status text not null default 'running',
  trigger text not null default 'manual',
  steps jsonb not null default '[]'::jsonb,
  assets jsonb not null default '[]'::jsonb,
  error text not null default '',
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists workflow_runs_workflow_id_idx
  on public.workflow_runs (workflow_id, started_at desc);

alter table public.workflow_runs enable row level security;

create policy "workflow_runs_select_authenticated"
  on public.workflow_runs for select
  to authenticated
  using (true);

create policy "workflow_runs_insert_authenticated"
  on public.workflow_runs for insert
  to authenticated
  with check (true);

create policy "workflow_runs_update_authenticated"
  on public.workflow_runs for update
  to authenticated
  using (true)
  with check (true);

create policy "workflow_runs_delete_authenticated"
  on public.workflow_runs for delete
  to authenticated
  using (true);
