# Production store database setup (Supabase/Postgres)

FrontendForge includes a multi-store Postgres schema, row-level security policies, public catalog/order endpoints and authenticated store-admin APIs. This is a deployable integration scaffold. It is not connected to a live Supabase project until you configure credentials and apply both migrations.

## 1. Create a Supabase project

1. Create a Supabase project in your account.
2. In Project Settings → API, copy the project URL, anon/publishable key, and service-role/secret key.
3. In Authentication → Providers, enable Email and Password.
4. Create an owner user through Authentication → Users (do not insert directly into `auth.users`).

## 2. Apply migrations in order

Open the Supabase SQL Editor and run these files in order:

1. `supabase/migrations/0001_store_platform.sql`
2. `supabase/migrations/0002_order_permissions.sql`

The schema creates stores, store members, products, orders and order items. RLS controls public catalog access and authenticated store membership. Public order creation is performed through a database RPC that recalculates totals from current database prices and checks tracked stock. Order confirmation reserves stock atomically. Payment gateway integration is intentionally not included.

Run the local migration structure check with:

```bash
npm run check:sql
```

This verifies required SQL structures are present; it does not execute SQL against your Supabase instance. You must run the migrations in your project and verify there are no SQL Editor errors.

## 3. Configure the server environment

Copy `.env.example` to `.env.local` in the FrontendForge master or in a deployed client application:

```env
NEXT_PUBLIC_SITE_URL=https://your-store-domain.example
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_ONLY_SERVICE_ROLE_KEY
PUBLIC_SITE_ORIGINS=https://your-store-domain.example
```

Never use a `NEXT_PUBLIC_` prefix for `SUPABASE_SERVICE_ROLE_KEY`. Never commit `.env.local`, and never put the service-role key into browser code, client configuration JSON, or screenshots. Configure the same environment variables in your hosting provider's server environment.

`PUBLIC_SITE_ORIGINS` is an optional comma-separated allowlist for approved mutation origins. The site's own origin is permitted automatically.

## 4. Create a store and attach its owner

After creating the owner account in Supabase Auth, run SQL like this, substituting the verified values:

```sql
insert into public.stores
  (slug, name, tagline, currency, delivery_enabled, delivery_fee, contact, theme)
values
  ('machi-coffee', 'MACHI Coffee', 'Coffee for brighter days', 'ETB', true, 120,
   '{"phone":"+251900000000","whatsapp":"+251900000000","email":"hello@example.com"}'::jsonb,
   '{"primary":"#0874a8","secondary":"#f6eee2","background":"#fffaf2","surface":"#f4eee5","text":"#24201d","accent":"#80a88b"}'::jsonb)
on conflict (slug) do nothing;

insert into public.store_members (store_id, user_id, role)
select s.id, u.id, 'owner'
from public.stores s
cross join auth.users u
where s.slug = 'machi-coffee'
  and u.email = 'the-owner-email@example.com'
on conflict (store_id, user_id) do update set role = excluded.role;
```

Use a unique slug per business. Create one store row per client, and attach separate users/roles for each business. The owner/admin can manage products and store settings; staff can review and progress orders.

## 5. Use the admin workspace

Run the project or visit the deployed application and open `/admin`.

1. Sign in with the Supabase Auth user.
2. Enter the exact store slug.
3. Click **Load store**.
4. Use **Store profile** to update the business name, address, opening hours, contact, currency, delivery settings and theme.
5. Use **Products & stock** to add products, change prices, adjust stock and publish/hide products.
6. Use **Orders** to review orders and progress them through pending → confirmed → preparing → ready → completed, or cancel where allowed.

The admin APIs validate the session and store membership on every request. Product and store writes use the service role only on the server after that membership check. Order status transitions are additionally enforced in SQL using the authenticated user's membership.

## 6. Public data endpoints

- `GET /api/storefront/{storeSlug}/products` returns active store details and active catalog data.
- `POST /api/storefront/{storeSlug}/orders` accepts customer details and product IDs/quantities. The database reads prices from its own product rows; client-supplied totals are ignored.

Example order body:

```json
{
  "customer": {
    "name": "Demo Customer",
    "phone": "+251911000000",
    "email": "customer@example.com",
    "fulfillment": "delivery",
    "address": "Bole, Addis Ababa",
    "notes": "Call on arrival"
  },
  "items": [
    { "product_id": "123e4567-e89b-42d3-a456-426614174000", "quantity": 2, "options": { "size": "Large" } }
  ]
}
```

Product IDs must be UUIDs from the database catalog. The API will reject arbitrary product IDs, invalid quantities, missing delivery addresses and invalid customer fields.

## 7. Operational security notes

- Serve production sites over HTTPS.
- Keep the service-role key only in server environment variables.
- Keep admin user accounts separate for each business; assign minimum roles.
- Configure email confirmation and strong passwords in Supabase Auth.
- Configure provider-level rate limits/bot protection for public order submission before high-traffic use. The application validates payloads and limits request size, but does not claim a distributed IP rate limiter.
- Add backups, alerting and retention rules to the Supabase project.
- Review data-processing, privacy and customer-consent obligations for each client.
- Payments are not implemented. No card details are collected or stored by this project.

## 8. What is not automatic

Creating a client website folder does not automatically provision a Supabase store, create Auth users, insert products, configure DNS, deploy a site, or connect a payment provider. Create the store and its first owner, then add product records through the admin workspace or authorized API. Connect the generated storefront UI to the live catalog only after the business has been provisioned and tested.
