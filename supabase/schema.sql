-- ════════════════════════════════════════════════════════════════════
-- Farah in Color – database schema
-- Run this once in Supabase → SQL Editor → New query → Run.
-- It is safe to run again (uses IF NOT EXISTS / OR REPLACE).
-- ════════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ── Paintings ────────────────────────────────────────────────────────
create table if not exists public.paintings (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  description  text not null default '',
  medium       text not null default 'Acrylic on canvas',
  width_cm     numeric(6,1),
  height_cm    numeric(6,1),
  year         int,
  price_usd    numeric(10,2) not null check (price_usd >= 0),
  status       text not null default 'available' check (status in ('available','reserved','sold')),
  featured     boolean not null default false,
  collection   text,
  style        text,
  colors       text[] not null default '{}',
  images       jsonb not null default '[]'::jsonb,   -- [{ "url": "...", "alt": "...", "path": "..." }]
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists paintings_status_idx on public.paintings(status);

-- ── Orders ───────────────────────────────────────────────────────────
create sequence if not exists public.order_number_seq start 1001;

create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  order_number      text not null unique default ('FIC-' || nextval('public.order_number_seq')),
  painting_id       uuid references public.paintings(id) on delete set null,
  painting_title    text not null,
  painting_slug     text,
  customer_name     text not null,
  phone             text not null,
  email             text,
  city              text not null,
  area              text not null,
  address           text not null,
  notes             text,
  subtotal_usd      numeric(10,2) not null,
  delivery_fee_usd  numeric(10,2) not null default 0,
  total_usd         numeric(10,2) not null,
  payment_method    text not null default 'cod',      -- ready for future online payments
  payment_status    text not null default 'unpaid' check (payment_status in ('unpaid','paid')),
  status            text not null default 'new' check (status in ('new','confirmed','delivered','cancelled')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists orders_status_idx on public.orders(status, created_at desc);

-- ── Commission requests ──────────────────────────────────────────────
create table if not exists public.commissions (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  email             text not null,
  phone             text,
  size              text not null,
  colors            text,
  budget_usd        numeric(10,2),
  description       text not null,
  reference_images  text[] not null default '{}',     -- storage paths in the private "commissions" bucket
  status            text not null default 'new' check (status in ('new','in_discussion','accepted','declined','completed')),
  created_at        timestamptz not null default now()
);

-- ── Contact messages ─────────────────────────────────────────────────
create table if not exists public.messages (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  email          text not null,
  phone          text,
  message        text not null,
  painting_slug  text,
  handled        boolean not null default false,
  created_at     timestamptz not null default now()
);

-- ── Settings (single row, editable from Admin → Settings) ───────────
create table if not exists public.settings (
  id                           int primary key default 1 check (id = 1),
  delivery_fee_usd             numeric(10,2) not null default 5,
  free_shipping_threshold_usd  numeric(10,2),
  whatsapp_number              text not null default '',
  notification_email           text not null default '',
  instagram_token              text,          -- refreshed automatically by the monthly cron
  instagram_token_refreshed_at timestamptz,
  updated_at                   timestamptz not null default now()
);
insert into public.settings (id) values (1) on conflict (id) do nothing;

-- ── updated_at triggers ──────────────────────────────────────────────
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists paintings_touch on public.paintings;
create trigger paintings_touch before update on public.paintings for each row execute function public.touch_updated_at();
drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders for each row execute function public.touch_updated_at();

-- ════════════════════════════════════════════════════════════════════
-- place_order: creates an order and reserves the painting in ONE step.
-- The row lock (FOR UPDATE) guarantees an original can never be ordered twice,
-- even if two people press "Order" at the same moment.
-- ════════════════════════════════════════════════════════════════════
create or replace function public.place_order(
  p_painting_id uuid, p_customer_name text, p_phone text, p_email text,
  p_city text, p_area text, p_address text, p_notes text,
  p_delivery_fee numeric, p_payment_method text default 'cod'
) returns public.orders
language plpgsql security definer set search_path = public as $$
declare
  v_painting public.paintings;
  v_order    public.orders;
begin
  select * into v_painting from public.paintings where id = p_painting_id for update;
  if not found then raise exception 'PAINTING_NOT_FOUND'; end if;
  if v_painting.status <> 'available' then raise exception 'PAINTING_NOT_AVAILABLE'; end if;

  insert into public.orders (painting_id, painting_title, painting_slug, customer_name, phone, email,
                             city, area, address, notes, subtotal_usd, delivery_fee_usd, total_usd, payment_method)
  values (v_painting.id, v_painting.title, v_painting.slug, p_customer_name, p_phone, nullif(p_email, ''),
          p_city, p_area, p_address, nullif(p_notes, ''), v_painting.price_usd, p_delivery_fee,
          v_painting.price_usd + p_delivery_fee, p_payment_method)
  returning * into v_order;

  update public.paintings set status = 'reserved' where id = v_painting.id;
  return v_order;
end $$;

-- Only the server (service role) may call place_order.
revoke all on function public.place_order(uuid,text,text,text,text,text,text,text,numeric,text) from public, anon, authenticated;

-- ── Order items (an order can contain several paintings) ─────────────
create table if not exists public.order_items (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null references public.orders(id) on delete cascade,
  painting_id    uuid references public.paintings(id) on delete set null,
  painting_title text not null,
  painting_slug  text,
  price_usd      numeric(10,2) not null
);
create index if not exists order_items_order_idx on public.order_items(order_id);
create index if not exists order_items_painting_idx on public.order_items(painting_id);

-- ════════════════════════════════════════════════════════════════════
-- place_cart_order: one order for one or more paintings (the cart).
-- Locks every painting, checks they are ALL still available, creates the
-- order + its items and reserves every painting, in one transaction.
-- If any painting was taken meanwhile, nothing is saved.
-- ════════════════════════════════════════════════════════════════════
create or replace function public.place_cart_order(
  p_painting_ids uuid[], p_customer_name text, p_phone text, p_email text,
  p_city text, p_area text, p_address text, p_notes text,
  p_delivery_fee numeric, p_payment_method text default 'cod'
) returns public.orders
language plpgsql security definer set search_path = public as $$
declare
  v_ids      uuid[];
  v_count    int;
  v_taken    text;
  v_subtotal numeric;
  v_titles   text;
  v_order    public.orders;
begin
  select array_agg(distinct x) into v_ids from unnest(p_painting_ids) x;
  if v_ids is null or array_length(v_ids, 1) = 0 then raise exception 'EMPTY_CART'; end if;

  -- Lock in a stable order to avoid deadlocks between two simultaneous carts
  perform 1 from public.paintings where id = any(v_ids) order by id for update;

  select count(*) into v_count from public.paintings where id = any(v_ids);
  if v_count <> array_length(v_ids, 1) then raise exception 'PAINTING_NOT_FOUND'; end if;

  select string_agg(title, ', ') into v_taken from public.paintings where id = any(v_ids) and status <> 'available';
  if v_taken is not null then raise exception 'PAINTING_NOT_AVAILABLE:%', v_taken; end if;

  select sum(price_usd), string_agg(title, ', ' order by title) into v_subtotal, v_titles
    from public.paintings where id = any(v_ids);

  insert into public.orders (painting_id, painting_title, painting_slug, customer_name, phone, email,
                             city, area, address, notes, subtotal_usd, delivery_fee_usd, total_usd, payment_method)
  values (case when array_length(v_ids, 1) = 1 then v_ids[1] end, v_titles,
          (select slug from public.paintings where id = v_ids[1] and array_length(v_ids, 1) = 1),
          p_customer_name, p_phone, nullif(p_email, ''), p_city, p_area, p_address, nullif(p_notes, ''),
          v_subtotal, p_delivery_fee, v_subtotal + p_delivery_fee, p_payment_method)
  returning * into v_order;

  insert into public.order_items (order_id, painting_id, painting_title, painting_slug, price_usd)
    select v_order.id, id, title, slug, price_usd from public.paintings where id = any(v_ids);

  update public.paintings set status = 'reserved' where id = any(v_ids);
  return v_order;
end $$;

revoke all on function public.place_cart_order(uuid[],text,text,text,text,text,text,text,numeric,text) from public, anon, authenticated;

-- ════════════════════════════════════════════════════════════════════
-- Row Level Security
-- Public visitors can only READ paintings. Everything else (orders,
-- commissions, messages, settings) is accessed by the server with the
-- service-role key after checking that the user is an admin.
-- ════════════════════════════════════════════════════════════════════
alter table public.paintings   enable row level security;
alter table public.orders      enable row level security;
alter table public.commissions enable row level security;
alter table public.messages    enable row level security;
alter table public.settings    enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Paintings are public" on public.paintings;
create policy "Paintings are public" on public.paintings for select using (true);

-- ── Storage buckets ──────────────────────────────────────────────────
-- "paintings": public images of the artworks.
-- "commissions": private reference images uploaded by customers.
insert into storage.buckets (id, name, public) values ('paintings', 'paintings', true)
  on conflict (id) do update set public = true;
insert into storage.buckets (id, name, public) values ('commissions', 'commissions', false)
  on conflict (id) do nothing;

-- Signed-in admins upload painting images straight from the browser.
-- (Public sign-ups must be DISABLED in Authentication → Providers → Email.)
drop policy if exists "Admins upload painting images" on storage.objects;
create policy "Admins upload painting images" on storage.objects
  for insert to authenticated with check (bucket_id = 'paintings');
drop policy if exists "Admins update painting images" on storage.objects;
create policy "Admins update painting images" on storage.objects
  for update to authenticated using (bucket_id = 'paintings');
drop policy if exists "Admins delete painting images" on storage.objects;
create policy "Admins delete painting images" on storage.objects
  for delete to authenticated using (bucket_id = 'paintings');
