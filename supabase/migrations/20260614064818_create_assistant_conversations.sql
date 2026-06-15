create table if not exists public.assistant_conversations (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'New chat',
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.assistant_conversations enable row level security;

create policy "assistant_conversations_select_authenticated"
  on public.assistant_conversations for select
  to authenticated
  using (true);

create policy "assistant_conversations_insert_authenticated"
  on public.assistant_conversations for insert
  to authenticated
  with check (true);

create policy "assistant_conversations_update_authenticated"
  on public.assistant_conversations for update
  to authenticated
  using (true)
  with check (true);

create policy "assistant_conversations_delete_authenticated"
  on public.assistant_conversations for delete
  to authenticated
  using (true);