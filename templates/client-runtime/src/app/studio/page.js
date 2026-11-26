import { headers } from "next/headers";
import { notFound } from "next/navigation";
import ClientConfigEditor from "@/components/client/ClientConfigEditor";

export const dynamic = "force-dynamic";

export default async function ClientStudioPage() {
  const requestHeaders = await headers();
  const host = String(requestHeaders.get("host") || "").toLowerCase();
  const hostname = host.startsWith("[") ? host.split("]")[0] + "]" : host.split(":")[0];
  const isLoopback = ["localhost", "127.0.0.1", "[::1]"].includes(hostname);
  const isAllowedEnvironment = process.env.NODE_ENV === "development" || process.env.FORGE_LOCAL_PREVIEW === "1";

  // The editor is local-only, including when production output is under E2E review.
  if (!isLoopback || !isAllowedEnvironment) notFound();
  return <ClientConfigEditor />;
}
