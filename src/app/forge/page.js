import { redirect } from "next/navigation";

// Keep the old URL working while the root route remains the single Studio entry point.
export default function LegacyForgeRoute() {
  redirect("/");
}
