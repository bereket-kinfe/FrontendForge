const SESSION_COOKIE = "ff_admin_session";

export function getSupabaseConfig() {
  const rawUrl = process.env.SUPABASE_URL || "";
  const anonKey = process.env.SUPABASE_ANON_KEY || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!rawUrl || !anonKey) return null;
  let url;
  try { url = new URL(rawUrl); } catch { return null; }
  if (!(["https:", "http:"].includes(url.protocol)) || (url.protocol === "http:" && !["localhost", "127.0.0.1"].includes(url.hostname))) return null;
  return { url: url.origin, anonKey, serviceRoleKey };
}

export function isSupabasePublicConfigured() {
  return Boolean(getSupabaseConfig());
}

export function isSupabaseAdminConfigured() {
  const config = getSupabaseConfig();
  return Boolean(config?.serviceRoleKey);
}

export async function supabaseRequest(path, { method = "GET", body, accessToken, admin = false, prefer, headers: extraHeaders = {} } = {}) {
  const config = getSupabaseConfig();
  if (!config) throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY.");
  if (admin && !config.serviceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing. Add it only to the server environment.");
  const apiKey = admin ? config.serviceRoleKey : config.anonKey;
  const authorization = admin ? config.serviceRoleKey : (accessToken || config.anonKey);
  const headers = { apikey: apiKey, Authorization: `Bearer ${authorization}`, ...extraHeaders };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (prefer) headers.Prefer = prefer;
  const response = await fetch(`${config.url}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store"
  });
  const raw = await response.text();
  let data = null;
  if (raw) {
    try { data = JSON.parse(raw); } catch { data = { message: raw }; }
  }
  if (!response.ok) {
    const error = new Error(data?.message || data?.error_description || data?.hint || `Supabase request failed (${response.status}).`);
    error.status = response.status;
    error.details = data;
    throw error;
  }
  return data;
}

export async function verifySupabaseUser(request) {
  const config = getSupabaseConfig();
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return { ok: false, status: 401, error: "Sign in to manage this store." };
  if (!config) return { ok: false, status: 503, error: "Supabase is not configured." };
  try {
    const user = await supabaseRequest("/auth/v1/user", { accessToken: token });
    if (!user?.id) return { ok: false, status: 401, error: "Your session is not valid. Sign in again." };
    return { ok: true, user, token };
  } catch {
    return { ok: false, status: 401, error: "Your session has expired. Sign in again." };
  }
}

export async function authorizeStore(request, storeSlug, roles = ["owner", "admin", "staff"]) {
  const auth = await verifySupabaseUser(request);
  if (!auth.ok) return auth;
  const safeSlug = String(storeSlug || "").trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(safeSlug)) return { ok: false, status: 400, error: "A valid store slug is required." };
  if (!isSupabaseAdminConfigured()) return { ok: false, status: 503, error: "Server-side Supabase configuration is incomplete." };
  try {
    const stores = await supabaseRequest(`/rest/v1/stores?slug=eq.${encodeURIComponent(safeSlug)}&select=id,slug,name,currency,delivery_fee,delivery_enabled,is_active&limit=1`, { admin: true });
    const store = stores?.[0];
    if (!store) return { ok: false, status: 404, error: "Store not found." };
    const members = await supabaseRequest(`/rest/v1/store_members?store_id=eq.${store.id}&user_id=eq.${auth.user.id}&select=role&limit=1`, { admin: true });
    const membership = members?.[0];
    if (!membership || !roles.includes(membership.role)) return { ok: false, status: 403, error: "Your account does not have permission for this store." };
    return { ok: true, user: auth.user, token: auth.token, store, membership };
  } catch (error) {
    return { ok: false, status: error.status || 502, error: error.message };
  }
}

export function sessionCookieName() { return SESSION_COOKIE; }
