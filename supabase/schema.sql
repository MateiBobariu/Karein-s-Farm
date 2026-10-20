-- Karin's Farm checkout order requests.
-- Run this in the Supabase SQL Editor once before enabling checkout submissions.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_reference text not null unique,
  customer_name text not null,
  customer_email text not null,
  street_address text not null,
  city text not null,
  postal_code text not null,
  product_name text not null,
  quantity integer not null check (quantity between 1 and 10),
  unit_price_lei numeric(10, 2) not null check (unit_price_lei >= 0),
  subtotal_lei numeric(10, 2) not null check (subtotal_lei >= 0),
  discount_code text,
  discount_lei numeric(10, 2) not null default 0 check (discount_lei >= 0),
  total_before_delivery_lei numeric(10, 2) not null check (total_before_delivery_lei >= 0),
  currency text not null default 'RON' check (currency = 'RON'),
  status text not null default 'received' check (status in ('received', 'contacted', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;
revoke all privileges on table public.orders from anon, authenticated;
grant all privileges on table public.orders to service_role;

comment on table public.orders is
  'Checkout order requests for Karin''s Farm. Contains customer contact and delivery details; access only from the server-side Vercel API.';
