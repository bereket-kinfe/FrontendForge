import fs from "node:fs/promises";
const base = new URL("../supabase/migrations/", import.meta.url);
const files = ["0001_store_platform.sql", "0002_order_permissions.sql"];
const content = (await Promise.all(files.map((file) => fs.readFile(new URL(file, base), "utf8")))).join("\n");
const required = [
  "create table if not exists public.stores",
  "create table if not exists public.store_members",
  "create table if not exists public.products",
  "create table if not exists public.orders",
  "create table if not exists public.order_items",
  "enable row level security",
  "create_store_order",
  "confirm_store_order",
  "cancel_store_order",
  "update_store_order_status",
  "revoke insert, update, delete on public.orders from anon, authenticated",
  "grant execute on function public.update_store_order_status(uuid,text) to authenticated"
];
const missing = required.filter((fragment) => !content.toLowerCase().includes(fragment.toLowerCase()));
if (missing.length) {
  console.error("Supabase migration check failed:", missing.join(", "));
  process.exit(1);
}
console.log(`Supabase migration structure check passed (${required.length} requirements across ${files.length} migrations).`);
