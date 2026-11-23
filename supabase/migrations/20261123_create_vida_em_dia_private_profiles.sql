create table public.vida_em_dia_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 payload jsonb not null default '{"version":1,"items":[],"settings":{"name":"","mealTimes":["07:30","12:30","19:30"],"weeklyBudget":500}}'::jsonb,
 revision bigint not null default 1 check (revision > 0),
 updated_at timestamptz not null default now(),
 constraint vida_em_dia_payload_object check (jsonb_typeof(payload) = 'object'),
 constraint vida_em_dia_payload_size check (octet_length(payload::text) <= 5000000)
);
alter table public.vida_em_dia_profiles enable row level security;
create policy "Read own profile" on public.vida_em_dia_profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy "Insert own profile" on public.vida_em_dia_profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own profile" on public.vida_em_dia_profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Delete own profile" on public.vida_em_dia_profiles for delete to authenticated using ((select auth.uid()) = user_id);
grant select, insert, update, delete on public.vida_em_dia_profiles to authenticated;
revoke all on public.vida_em_dia_profiles from anon;
