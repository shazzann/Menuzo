create table public.admins (
  id uuid default uuid_generate_v4() primary key,
  email text not null unique,
  role text default 'superadmin',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.admins enable row level security;

-- Only admins can read from the admins table
create policy "Admins can view admins"
  on public.admins for select
  using (
    auth.jwt() ->> 'email' = email
  );

-- Insert the initial super admin
insert into public.admins (email, role)
values ('ziharhasni@gmail.com', 'superadmin');
