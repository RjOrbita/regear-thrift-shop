-- ReGear Thrift Shop — Production Hardened Supabase Schema & RLS
-- Project ID: kdpontrsjvsllodehzxm (ap-southeast-1)

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  title text not null,
  category text not null check (category in ('Tees', 'Hoodies & Sweats', 'Jackets & Outerwear', 'Bottoms & Cargo', 'Caps & Accessories')),
  price_php integer not null check (price_php >= 0),
  size text not null,
  fit_notes text default '',
  condition_rating text not null,
  condition_notes text default '',
  status text not null default 'available' check (status in ('available', 'reserved', 'sold')),
  images text[] not null default '{}',
  era text default '90s / Y2K Archive',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_category on public.products (category);
create index if not exists idx_products_status on public.products (status);
create index if not exists idx_products_size on public.products (size);
create index if not exists idx_products_created_at on public.products (created_at desc);

alter table public.products enable row level security;

-- Public (anon) is strictly read-only; writes require authenticated regear_admin JWT
revoke insert, update, delete on table public.products from anon;
grant select on table public.products to anon;
grant select, insert, update, delete on table public.products to authenticated;

create policy "Public can view all products"
  on public.products
  for select
  to anon, authenticated
  using (true);

create policy "Allow insert products for storefront admin"
  on public.products
  for insert
  to authenticated
  with check (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'regear_admin'
    and price_php >= 0
    and char_length(title) > 0
  );

create policy "Allow update products for storefront admin"
  on public.products
  for update
  to authenticated
  using (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'regear_admin'
  )
  with check (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'regear_admin'
    and price_php >= 0
    and char_length(title) > 0
  );

create policy "Allow delete products for storefront admin"
  on public.products
  for delete
  to authenticated
  using (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'regear_admin'
  );
