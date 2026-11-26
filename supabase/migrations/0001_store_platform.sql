-- FrontendForge multi-tenant store foundation (Supabase/PostgreSQL)
-- Apply in Supabase SQL Editor or through the Supabase CLI.
create extension if not exists pgcrypto;

create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  currency text not null default 'ETB' check (currency ~ '^[A-Z]{3}$'),
  locale text not null default 'en',
  delivery_fee numeric(12,2) not null default 0 check (delivery_fee >= 0),
  delivery_enabled boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.store_members (
  store_id uuid not null references public.stores(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'staff' check (role in ('owner','admin','staff')),
  created_at timestamptz not null default now(),
  primary key (store_id, user_id)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  slug text not null,
  sku text,
  name text not null,
  description text not null default '',
  category text not null default 'Featured',
  price numeric(12,2) not null check (price >= 0),
  stock integer check (stock is null or stock >= 0),
  is_active boolean not null default true,
  image_url text,
  images jsonb not null default '[]'::jsonb check (jsonb_typeof(images) = 'array'),
  options jsonb not null default '{}'::jsonb check (jsonb_typeof(options) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, slug),
  unique (store_id, sku)
);
create index if not exists products_store_active_idx on public.products(store_id, is_active, category);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete restrict,
  order_number text not null unique,
  status text not null default 'pending' check (status in ('pending','confirmed','preparing','ready','completed','cancelled')),
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  fulfillment text not null default 'pickup' check (fulfillment in ('pickup','delivery')),
  delivery_address text,
  customer_notes text,
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  subtotal numeric(12,2) not null check (subtotal >= 0),
  delivery_fee numeric(12,2) not null default 0 check (delivery_fee >= 0),
  total numeric(12,2) not null check (total >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_store_created_idx on public.orders(store_id, created_at desc);
create index if not exists orders_store_status_idx on public.orders(store_id, status);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_snapshot jsonb not null,
  selected_options jsonb not null default '{}'::jsonb,
  unit_price numeric(12,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity between 1 and 99),
  line_total numeric(12,2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);
create index if not exists order_items_order_idx on public.order_items(order_id);

create or replace function public.is_store_member(p_store_id uuid, p_roles text[] default array['owner','admin'])
returns boolean
language sql stable security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.store_members sm
    where sm.store_id = p_store_id and sm.user_id = auth.uid() and sm.role = any(p_roles)
  );
$$;
revoke all on function public.is_store_member(uuid,text[]) from public;
grant execute on function public.is_store_member(uuid,text[]) to authenticated;

alter table public.stores enable row level security;
alter table public.store_members enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Public storefront reads only active stores/products. Store membership controls writes.
drop policy if exists stores_public_read on public.stores;
create policy stores_public_read on public.stores for select using (is_active = true);
drop policy if exists stores_member_read on public.stores;
create policy stores_member_read on public.stores for select to authenticated using (public.is_store_member(id, array['owner','admin','staff']));
drop policy if exists store_members_self_read on public.store_members;
create policy store_members_self_read on public.store_members for select to authenticated using (user_id = auth.uid());
drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products for select using (is_active = true and exists(select 1 from public.stores s where s.id = store_id and s.is_active));
drop policy if exists products_admin_insert on public.products;
create policy products_admin_insert on public.products for insert to authenticated with check (public.is_store_member(store_id, array['owner','admin']));
drop policy if exists products_admin_update on public.products;
create policy products_admin_update on public.products for update to authenticated using (public.is_store_member(store_id, array['owner','admin'])) with check (public.is_store_member(store_id, array['owner','admin']));
drop policy if exists products_admin_delete on public.products;
create policy products_admin_delete on public.products for delete to authenticated using (public.is_store_member(store_id, array['owner','admin']));
drop policy if exists orders_admin_read on public.orders;
create policy orders_admin_read on public.orders for select to authenticated using (public.is_store_member(store_id, array['owner','admin','staff']));
drop policy if exists orders_admin_update on public.orders;
create policy orders_admin_update on public.orders for update to authenticated using (public.is_store_member(store_id, array['owner','admin','staff'])) with check (public.is_store_member(store_id, array['owner','admin','staff']));
drop policy if exists order_items_admin_read on public.order_items;
create policy order_items_admin_read on public.order_items for select to authenticated using (exists(select 1 from public.orders o where o.id = order_id and public.is_store_member(o.store_id, array['owner','admin','staff'])));

-- Anonymous customer checkout. Prices are always read from the database, never trusted from the browser.
create or replace function public.create_store_order(p_store_slug text, p_customer jsonb, p_items jsonb)
returns jsonb
language plpgsql security definer
set search_path = public, pg_temp
as $$
declare
  v_store public.stores%rowtype;
  v_line jsonb;
  v_product public.products%rowtype;
  v_qty integer;
  v_subtotal numeric(12,2) := 0;
  v_delivery numeric(12,2) := 0;
  v_fulfillment text;
  v_order public.orders%rowtype;
  v_item_count integer := 0;
begin
  select * into v_store from public.stores where slug = p_store_slug and is_active = true;
  if not found then raise exception 'Store not found or inactive'; end if;
  if coalesce(length(trim(p_customer->>'name')),0) not between 2 and 120
     or coalesce(length(trim(p_customer->>'phone')),0) not between 5 and 40 then
    raise exception 'Customer name and phone are required';
  end if;
  if length(coalesce(p_customer->>'email','')) > 254
     or length(coalesce(p_customer->>'address','')) > 500
     or length(coalesce(p_customer->>'notes','')) > 1000 then
    raise exception 'Customer details exceed the allowed length';
  end if;
  if jsonb_typeof(p_customer) is distinct from 'object' then
    raise exception 'Customer details must be an object';
  end if;
  if jsonb_typeof(p_items) is distinct from 'array' then
    raise exception 'Order items must be an array';
  end if;
  if jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 40 then
    raise exception 'Order must contain between 1 and 40 items';
  end if;
  v_fulfillment := case when p_customer->>'fulfillment' = 'delivery' then 'delivery' else 'pickup' end;
  if v_fulfillment = 'delivery' then
    if not v_store.delivery_enabled then raise exception 'Delivery is not available for this store'; end if;
    v_delivery := v_store.delivery_fee;
    if coalesce(trim(p_customer->>'address'),'') = '' then raise exception 'Delivery address is required'; end if;
  end if;

  for v_line in select value from jsonb_array_elements(p_items) loop
    v_item_count := v_item_count + 1;
    if jsonb_typeof(v_line) is distinct from 'object'
       or coalesce(v_line->>'product_id','') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
       or coalesce(v_line->>'quantity','') !~ '^[0-9]{1,2}$' then
      raise exception 'An order item contains an invalid product or quantity';
    end if;
    v_qty := (v_line->>'quantity')::integer;
    if v_qty < 1 or v_qty > 99 then raise exception 'Item quantity must be between 1 and 99'; end if;
    if v_line ? 'options' and jsonb_typeof(v_line->'options') is distinct from 'object' then
      raise exception 'Product options must be an object';
    end if;
    select * into v_product from public.products
      where id = (v_line->>'product_id')::uuid and store_id = v_store.id and is_active = true;
    if not found then raise exception 'An item is unavailable'; end if;
    if v_product.stock is not null and v_product.stock < v_qty then raise exception 'Insufficient stock for %', v_product.name; end if;
    v_subtotal := v_subtotal + (v_product.price * v_qty);
  end loop;

  insert into public.orders(store_id, order_number, customer_name, customer_phone, customer_email, fulfillment, delivery_address, customer_notes, currency, subtotal, delivery_fee, total)
  values (v_store.id, upper(substr(replace(gen_random_uuid()::text,'-',''),1,10)), trim(p_customer->>'name'), trim(p_customer->>'phone'), nullif(trim(p_customer->>'email'),''), v_fulfillment, nullif(trim(p_customer->>'address'),''), nullif(trim(p_customer->>'notes'),''), v_store.currency, v_subtotal, v_delivery, v_subtotal + v_delivery)
  returning * into v_order;

  for v_line in select value from jsonb_array_elements(p_items) loop
    v_qty := (v_line->>'quantity')::integer;
    select * into v_product from public.products where id = (v_line->>'product_id')::uuid and store_id = v_store.id and is_active = true;
    insert into public.order_items(order_id, product_id, product_snapshot, selected_options, unit_price, quantity, line_total)
    values (v_order.id, v_product.id, jsonb_build_object('name',v_product.name,'slug',v_product.slug,'sku',v_product.sku,'category',v_product.category), coalesce(v_line->'options','{}'::jsonb), v_product.price, v_qty, v_product.price * v_qty);
  end loop;

  return jsonb_build_object('id',v_order.id,'order_number',v_order.order_number,'status',v_order.status,'currency',v_order.currency,'subtotal',v_order.subtotal,'delivery_fee',v_order.delivery_fee,'total',v_order.total);
end;
$$;
revoke all on function public.create_store_order(text,jsonb,jsonb) from public;
grant execute on function public.create_store_order(text,jsonb,jsonb) to anon, authenticated;

-- Confirm pending order and decrement tracked inventory atomically.
create or replace function public.confirm_store_order(p_order_id uuid)
returns jsonb
language plpgsql security definer
set search_path = public, pg_temp
as $$
declare
  v_order public.orders%rowtype;
  v_item record;
  v_product public.products%rowtype;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'Order not found'; end if;
  if not public.is_store_member(v_order.store_id, array['owner','admin','staff']) then raise exception 'Not authorized'; end if;
  if v_order.status <> 'pending' then raise exception 'Only pending orders can be confirmed'; end if;
  for v_item in select product_id, quantity from public.order_items where order_id = p_order_id and product_id is not null loop
    select * into v_product from public.products where id = v_item.product_id for update;
    if found and v_product.stock is not null then
      if v_product.stock < v_item.quantity then raise exception 'Insufficient stock for %', v_product.name; end if;
      update public.products set stock = stock - v_item.quantity, updated_at = now() where id = v_product.id;
    end if;
  end loop;
  update public.orders set status = 'confirmed', updated_at = now() where id = p_order_id returning * into v_order;
  return jsonb_build_object('id',v_order.id,'order_number',v_order.order_number,'status',v_order.status);
end;
$$;
revoke all on function public.confirm_store_order(uuid) from public;
grant execute on function public.confirm_store_order(uuid) to authenticated;

create or replace function public.cancel_store_order(p_order_id uuid)
returns jsonb
language plpgsql security definer
set search_path = public, pg_temp
as $$
declare
  v_order public.orders%rowtype;
  v_item record;
  v_product public.products%rowtype;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'Order not found'; end if;
  if not public.is_store_member(v_order.store_id, array['owner','admin','staff']) then raise exception 'Not authorized'; end if;
  if v_order.status in ('completed','cancelled') then raise exception 'Order cannot be cancelled from its current state'; end if;
  if v_order.status in ('confirmed','preparing','ready') then
    for v_item in select product_id, quantity from public.order_items where order_id = p_order_id and product_id is not null loop
      select * into v_product from public.products where id = v_item.product_id for update;
      if found and v_product.stock is not null then update public.products set stock = stock + v_item.quantity, updated_at = now() where id = v_product.id; end if;
    end loop;
  end if;
  update public.orders set status = 'cancelled', updated_at = now() where id = p_order_id returning * into v_order;
  return jsonb_build_object('id',v_order.id,'order_number',v_order.order_number,'status',v_order.status);
end;
$$;
revoke all on function public.cancel_store_order(uuid) from public;
grant execute on function public.cancel_store_order(uuid) to authenticated;
