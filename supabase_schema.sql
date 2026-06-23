-- SUPABASE DATABASE SCHEMA SQL
-- Run this script in your Supabase SQL Editor (https://supabase.com)

-- 1. CLEANUP (Optional - use with care)
-- drop trigger if exists on_auth_user_created on auth.users;
-- drop function if exists public.handle_new_user;
-- drop table if exists public.order_items;
-- drop table if exists public.orders;
-- drop table if exists public.products;
-- drop table if exists public.profiles;

-- 2. CREATE TABLE: profiles
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name varchar not null,
  email varchar not null unique,
  phone varchar,
  role varchar not null default 'Member' check (role in ('Admin', 'Member')),
  points integer not null default 0,
  tier varchar not null default 'Bronze' check (tier in ('Bronze', 'Silver', 'Gold', 'Platinum')),
  avatar_url text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- 3. CREATE TABLE: products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name varchar not null,
  code varchar not null unique,
  category varchar not null,
  brand varchar not null,
  price numeric not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  image_url text,
  description text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.products enable row level security;

-- 4. CREATE TABLE: orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.profiles(id) on delete restrict not null,
  total_original numeric not null check (total_original >= 0),
  discount_amount numeric not null default 0 check (discount_amount >= 0),
  total_final numeric not null check (total_final >= 0),
  status varchar not null default 'Pending' check (status in ('Pending', 'Completed', 'Cancelled')),
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.orders enable row level security;

-- 5. CREATE TABLE: order_items
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete restrict not null,
  quantity integer not null check (quantity > 0),
  price_at_purchase numeric not null check (price_at_purchase >= 0)
);

-- Enable RLS
alter table public.order_items enable row level security;

-- 6. CREATE TABLE: notes (For the Notes module)
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  title varchar not null,
  content text not null,
  status varchar not null default 'Active' check (status in ('Active', 'Draft', 'Archived')),
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.notes enable row level security;


-- ==================== SECURITY DEFINER FUNCTIONS TO AVOID RECURSION ====================

-- Function to check if a user is an Admin (bypasses RLS recursively)
create or replace function public.is_admin(user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = user_id and role = 'Admin'
  );
end;
$$ language plpgsql security definer;

-- Function to check if a user is updating their own basic profile fields and leaving sensitive fields unchanged
create or replace function public.is_owner_updating_basic_fields(
  user_id uuid,
  new_role varchar,
  new_points integer,
  new_tier varchar
)
returns boolean as $$
declare
  old_role varchar;
  old_points integer;
  old_tier varchar;
begin
  select role, points, tier into old_role, old_points, old_tier
  from public.profiles where id = user_id;
  
  return (new_role = old_role and new_points = old_points and new_tier = old_tier);
end;
$$ language plpgsql security definer;


-- ==================== TRIGGER FOR NEW USER SIGNUP ====================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role, points, tier, phone, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'Member'),
    0,
    'Bronze',
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://randomuser.me/api/portraits/lego/1.jpg')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ==================== RLS POLICIES ====================

-- --- Profiles Policies ---
create policy "Enable select profiles for owners or admin" on public.profiles
  for select using (
    auth.uid() = id 
    or public.is_admin(auth.uid())
  );

create policy "Enable update profiles for owners (basic) or admin (all)" on public.profiles
  for update using (
    auth.uid() = id 
    or public.is_admin(auth.uid())
  )
  with check (
    -- Admins can update anything
    public.is_admin(auth.uid())
    -- Members can only update basic fields (name, phone, avatar_url) leaving role, points, tier intact
    or (
      auth.uid() = id
      and public.is_owner_updating_basic_fields(id, role, points, tier)
    )
  );

-- Admins can delete profiles
create policy "Enable delete profiles for admin only" on public.profiles
  for delete using (
    public.is_admin(auth.uid())
  );

-- Allow profile creation for admins to add customers manually
create policy "Enable insert profiles for admin" on public.profiles
  for insert with check (
    public.is_admin(auth.uid())
  );


-- --- Products Policies ---
create policy "Allow public read access to products" on public.products
  for select using (true);

create policy "Allow full access to products for admins only" on public.products
  for all using (
    public.is_admin(auth.uid())
  );


-- --- Orders Policies ---
create policy "Allow admins to read all orders, members to read own" on public.orders
  for select using (
    public.is_admin(auth.uid())
    or member_id = auth.uid()
  );

create policy "Allow members to insert their own orders" on public.orders
  for insert with check (
    member_id = auth.uid()
  );

create policy "Allow admins to modify/delete orders" on public.orders
  for all using (
    public.is_admin(auth.uid())
  );


-- --- Order Items Policies ---
create policy "Allow admins to read all order items, members to read own" on public.order_items
  for select using (
    public.is_admin(auth.uid())
    or (exists (select 1 from public.orders where id = order_id and member_id = auth.uid()))
  );

create policy "Allow members to insert order items for their own orders" on public.order_items
  for insert with check (
    exists (select 1 from public.orders where id = order_id and member_id = auth.uid())
  );

create policy "Allow admins to manage order items" on public.order_items
  for all using (
    public.is_admin(auth.uid())
  );


-- --- Notes Policies ---
create policy "Allow anyone to read notes" on public.notes
  for select using (true);

create policy "Allow anyone to insert notes" on public.notes
  for insert with check (true);

create policy "Allow anyone to update notes" on public.notes
  for update using (true);

create policy "Allow anyone to delete notes" on public.notes
  for delete using (true);


-- ==================== SEED PRODUCTS DATA ====================

insert into public.products (name, code, category, brand, price, stock, image_url, description) values
('Razer DeathAdder V2', 'PRD-101', 'Mouse', 'Razer', 850000, 12, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7', 'Premium Razer gaming mouse with optical switches.'),
('Logitech G Pro X', 'PRD-102', 'Headset', 'Logitech', 1500000, 8, 'https://images.unsplash.com/photo-1546435770-a3e426bf472b', 'Wireless gaming headset with Blue VO!CE microphone.'),
('Asus TUF K3', 'PRD-103', 'Keyboard', 'Asus', 1200000, 15, 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae', 'Mechanical keyboard with durable design.'),
('HyperX Alloy FPS', 'PRD-104', 'Keyboard', 'HyperX', 980000, 9, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3', 'Compact keyboard ideal for FPS gaming.'),
('SteelSeries Rival 3', 'PRD-105', 'Mouse', 'SteelSeries', 650000, 20, 'https://images.unsplash.com/photo-1527814050087-3793815479db', 'Ergonomic gaming mouse with high-performance sensor.'),
('Corsair HS70', 'PRD-106', 'Headset', 'Corsair', 1350000, 7, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e', 'Wireless surround sound gaming headset.'),
('Samsung Odyssey G5', 'PRD-107', 'Monitor', 'Samsung', 4200000, 5, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf', 'Curved gaming monitor with 144Hz refresh rate.'),
('LG UltraGear 24GN600', 'PRD-108', 'Monitor', 'LG', 3100000, 11, 'https://images.unsplash.com/photo-1586210579191-33b45e38fa2c', 'IPS gaming monitor with 1ms response time.'),
('Razer BlackWidow', 'PRD-109', 'Keyboard', 'Razer', 1750000, 10, 'https://images.unsplash.com/photo-1595225476474-87563907a212', 'Iconic mechanical gaming keyboard with Razer Green switches.'),
('Logitech G502 Hero', 'PRD-110', 'Mouse', 'Logitech', 920000, 14, 'https://images.unsplash.com/photo-1563297007-0686b7003af7', 'Best selling gaming mouse with HERO 25K sensor.');
