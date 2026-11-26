import { notFound } from "next/navigation";
import ClientConfigEditor from "@/components/client/ClientConfigEditor";

export const dynamic = "force-dynamic";

export default function ClientStudioPage() {
  // The file editor writes to this local project on disk. It must never be exposed
  // as a public production administration surface.
  if (process.env.NODE_ENV !== "development") notFound();
  return <ClientConfigEditor />;
}
