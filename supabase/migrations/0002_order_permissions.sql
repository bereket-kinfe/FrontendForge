-- Multi-tenant store profile and branding fields used by the public storefront.
alter table public.stores add column if not exists tagline text not null default '';
alter table public.stores add column if not exists description text not null default '';
alter table public.stores add column if not exists address text not null default '';
alter table public.stores add column if not exists opening_hours text not null default '';
alter table public.stores add column if not exists logo_url text;
alter table public.stores add column if not exists hero_image_url text;
alter table public.stores add column if not exists theme jsonb not null default '{}'::jsonb check (jsonb_typeof(theme) = 'object');
alter table public.stores add column if not exists contact jsonb not null default '{}'::jsonb check (jsonb_typeof(contact) = 'object');
revoke insert, update, delete on public.stores from anon, authenticated;
grant select on public.stores to anon, authenticated;

-- Tighten customer/admin privileges and route status changes through audited RPCs.
-- Apply after 0001_store_platform.sql.

-- Do not allow browser sessions to directly edit order totals or customer data.
drop policy if exists orders_admin_update on public.orders;
revoke insert, update, delete on public.orders from anon, authenticated;
grant select on public.orders to authenticated;
revoke insert, update, delete on public.order_items from anon, authenticated;
grant select on public.order_items to authenticated;

-- Public catalog columns are intentionally limited. Service-role admin APIs can
-- still read/write the full product row after their own membership check.
revoke select on public.products from anon, authenticated;
grant select (id, store_id, slug, name, description, category, price, stock, is_active, image_url, images, options)
  on public.products to anon, authenticated;

create or replace function public.update_store_order_status(p_order_id uuid, p_status text)
returns jsonb
language plpgsql security definer
set search_path = public, pg_temp
as $$
declare
  v_order public.orders%rowtype;
  v_allowed text[];
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'Order not found'; end if;
  if not public.is_store_member(v_order.store_id, array['owner','admin','staff']) then
    raise exception 'Not authorized';
  end if;

  if p_status = 'confirmed' then
    return public.confirm_store_order(p_order_id);
  elsif p_status = 'cancelled' then
    return public.cancel_store_order(p_order_id);
  end if;

  v_allowed := case v_order.status
    when 'confirmed' then array['preparing']
    when 'preparing' then array['ready']
    when 'ready' then array['completed']
    else array[]::text[]
  end;
  if not (p_status = any(v_allowed)) then
    raise exception 'Invalid order status transition from % to %', v_order.status, p_status;
  end if;
  update public.orders
    set status = p_status, updated_at = now()
    where id = p_order_id
    returning * into v_order;
  return jsonb_build_object('id', v_order.id, 'order_number', v_order.order_number, 'status', v_order.status);
end;
$$;
revoke all on function public.update_store_order_status(uuid,text) from public;
grant execute on function public.update_store_order_status(uuid,text) to authenticated;

-- Keep privileged functions unavailable to anonymous users except the public
-- customer-order RPC created explicitly in migration 0001.
revoke all on function public.confirm_store_order(uuid) from anon;
revoke all on function public.cancel_store_order(uuid) from anon;
