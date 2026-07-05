-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (Extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  subscription_plan text default 'free',
  subscription_status text default 'active',
  subscription_expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Shops Table (Each user gets one shop)
create table public.shops (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null default 'My Kitchen',
  tagline text,
  description text,
  logo text,
  banner text,
  location text,
  contact_number text,
  email text,
  is_open boolean default true,
  instagram text,
  facebook text,
  website text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- 3. Categories Table
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  shop_id uuid references public.shops(id) on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Food Items Table
create table public.food_items (
  id uuid default uuid_generate_v4() primary key,
  shop_id uuid references public.shops(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  tagline text,
  image text,
  original_price numeric not null,
  discount numeric default 0,
  final_price numeric not null,
  is_special_offer boolean default false,
  is_available boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.shops enable row level security;
alter table public.categories enable row level security;
alter table public.food_items enable row level security;

-- Policies for Profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Users can update their own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- Policies for Shops
create policy "Anyone can view shops"
  on public.shops for select
  using ( true );

create policy "Users can create their shop"
  on public.shops for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own shop"
  on public.shops for update
  using ( auth.uid() = user_id );

-- Policies for Categories
create policy "Anyone can view categories"
  on public.categories for select
  using ( true );

create policy "Shop owners can insert categories"
  on public.categories for insert
  with check ( auth.uid() in (select user_id from public.shops where id = shop_id) );

create policy "Shop owners can update categories"
  on public.categories for update
  using ( auth.uid() in (select user_id from public.shops where id = shop_id) );

create policy "Shop owners can delete categories"
  on public.categories for delete
  using ( auth.uid() in (select user_id from public.shops where id = shop_id) );

-- Policies for Food Items
create policy "Anyone can view food items"
  on public.food_items for select
  using ( true );

create policy "Shop owners can insert food items"
  on public.food_items for insert
  with check ( auth.uid() in (select user_id from public.shops where id = shop_id) );

create policy "Shop owners can update food items"
  on public.food_items for update
  using ( auth.uid() in (select user_id from public.shops where id = shop_id) );

create policy "Shop owners can delete food items"
  on public.food_items for delete
  using ( auth.uid() in (select user_id from public.shops where id = shop_id) );

-- Trigger to automatically create a profile and shop for new users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_shop_id uuid;
begin
  -- 1. Create Profile
  insert into public.profiles (id, email)
  values (new.id, new.email);
  
  -- 2. Create Shop
  insert into public.shops (user_id, email)
  values (new.id, new.email)
  returning id into new_shop_id;


  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
