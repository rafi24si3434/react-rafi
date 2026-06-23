-- ==================== SUPABASE RLS INFINITE RECURSION FIX ====================
-- Run this script in your Supabase SQL Editor (https://supabase.com)
-- This script fixes the "infinite recursion detected in policy for relation 'profiles'" error.

-- 1. DROP EXISTING CONFLICTING POLICIES
drop policy if exists "Enable select profiles for owners or admin" on public.profiles;
drop policy if exists "Enable update profiles for owners (basic) or admin (all)" on public.profiles;
drop policy if exists "Enable delete profiles for admin only" on public.profiles;
drop policy if exists "Enable insert profiles for admin" on public.profiles;
drop policy if exists "Allow full access to products for admins only" on public.products;
drop policy if exists "Allow admins to read all orders, members to read own" on public.orders;
drop policy if exists "Allow admins to modify/delete orders" on public.orders;
drop policy if exists "Allow admins to read all order items, members to read own" on public.order_items;
drop policy if exists "Allow admins to manage order items" on public.order_items;


-- 2. CREATE SECURITY DEFINER FUNCTIONS (Runs with bypass RLS, avoiding recursion)

-- Function to check if a user is an Admin
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


-- 3. RE-CREATE POLICIES USING THE SECURITY DEFINER FUNCTIONS

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
    public.is_admin(auth.uid())
    or (
      auth.uid() = id
      and public.is_owner_updating_basic_fields(id, role, points, tier)
    )
  );

create policy "Enable delete profiles for admin only" on public.profiles
  for delete using (
    public.is_admin(auth.uid())
  );

create policy "Enable insert profiles for admin" on public.profiles
  for insert with check (
    public.is_admin(auth.uid())
  );

-- --- Products Policies ---
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

create policy "Allow admins to manage order items" on public.order_items
  for all using (
    public.is_admin(auth.uid())
  );

-- ==================== END OF FIX ====================
