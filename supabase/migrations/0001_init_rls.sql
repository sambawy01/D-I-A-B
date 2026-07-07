-- DIAB — post-Drizzle migration: FK to auth.users, updated_at triggers, and RLS.
-- Run AFTER `npm run db:push` (or drizzle-kit migrate) creates the tables.
-- See docs/schema.md for rationale.

-- 1. Tie profiles to Supabase auth users, and auto-provision a profile on signup.
alter table public.profiles
  add constraint profiles_id_fkey
  foreign key (id) references auth.users (id) on delete cascade;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. updated_at maintenance via the moddatetime extension.
create extension if not exists moddatetime schema extensions;

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function extensions.moddatetime (updated_at);
create trigger deals_set_updated_at before update on public.deals
  for each row execute function extensions.moddatetime (updated_at);
create trigger deliverables_set_updated_at before update on public.deliverables
  for each row execute function extensions.moddatetime (updated_at);

-- 3. Row-Level Security — the ownership guardrail as a database rule.
alter table public.profiles enable row level security;
create policy profiles_self on public.profiles
  using (id = auth.uid()) with check (id = auth.uid());

alter table public.deals enable row level security;
create policy deals_owner on public.deals
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Direct children of deals
alter table public.deliverables enable row level security;
create policy deliverables_via_deal on public.deliverables
  using (exists (select 1 from public.deals d where d.id = deal_id and d.owner_id = auth.uid()))
  with check (exists (select 1 from public.deals d where d.id = deal_id and d.owner_id = auth.uid()));

alter table public.deal_revisions enable row level security;
create policy deal_revisions_via_deal on public.deal_revisions
  using (exists (select 1 from public.deals d where d.id = deal_id and d.owner_id = auth.uid()))
  with check (exists (select 1 from public.deals d where d.id = deal_id and d.owner_id = auth.uid()));

alter table public.messages enable row level security;
create policy messages_via_deal on public.messages
  using (exists (select 1 from public.deals d where d.id = deal_id and d.owner_id = auth.uid()))
  with check (exists (select 1 from public.deals d where d.id = deal_id and d.owner_id = auth.uid()));

-- assets: authorize through deliverable → deal
alter table public.assets enable row level security;
create policy assets_via_deal on public.assets
  using (exists (
    select 1 from public.deliverables dl join public.deals d on d.id = dl.deal_id
    where dl.id = deliverable_id and d.owner_id = auth.uid()))
  with check (exists (
    select 1 from public.deliverables dl join public.deals d on d.id = dl.deal_id
    where dl.id = deliverable_id and d.owner_id = auth.uid()));

-- comments: authorize through asset → deliverable → deal
alter table public.comments enable row level security;
create policy comments_via_deal on public.comments
  using (exists (
    select 1 from public.assets a
      join public.deliverables dl on dl.id = a.deliverable_id
      join public.deals d on d.id = dl.deal_id
    where a.id = asset_id and d.owner_id = auth.uid()))
  with check (exists (
    select 1 from public.assets a
      join public.deliverables dl on dl.id = a.deliverable_id
      join public.deals d on d.id = dl.deal_id
    where a.id = asset_id and d.owner_id = auth.uid()));
