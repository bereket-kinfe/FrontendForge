const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function isLocalForgeRequest(request) {
  if (process.env.NODE_ENV === "production") return false;
  const host = String(request.headers.get("host") || "").toLowerCase();
  const hostname = host.startsWith("[") ? host.split("]")[0] + "]" : host.split(":")[0];
  if (!LOCAL_HOSTS.has(hostname)) return false;
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      const parsed = new URL(origin);
      if (parsed.host.toLowerCase() !== host) return false;
    } catch { return false; }
  }
  return true;
}
