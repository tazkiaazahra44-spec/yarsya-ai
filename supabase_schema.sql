-- Table: push_subscriptions
create table if not exists public.push_subscriptions (
  endpoint text primary key,
  subscription jsonb not null,
  updated_at timestamptz not null default now()
);

-- Index for querying by updated_at
create index if not exists push_subscriptions_updated_idx on public.push_subscriptions (updated_at desc);