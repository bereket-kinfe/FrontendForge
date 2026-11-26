import { isLocalForgeRequest } from "@/lib/forge/local-only.mjs";
import { NextResponse } from "next/server";
import { normalizeForgePayload } from "@/lib/forge/project.mjs";
import { createClientProjectCopy } from "@/lib/forge/copy.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  if (!isLocalForgeRequest(request)) {
    return NextResponse.json({ error: "For safety, project-copy generation is restricted to the local FrontendForge development server." }, { status: 403 });
  }
  try {
    const input = await request.json();
    const config = normalizeForgePayload(input);
    const target = await createClientProjectCopy(process.cwd(), config);
    return NextResponse.json({
      ok: true,
      projectName: config.brand.name,
      slug: config.slug,
      path: target,
      startCommands: ["npm install", "npm run dev"],
      localUrl: "http://localhost:3000",
      orderUrl: config.orderEnabled ? `http://localhost:3000/order/${config.slug}` : null,
      integrationCount: Object.values(config.integrations).filter((item) => item.provider !== "Not selected").length,
      message: "Client project copy created successfully. Open its folder in VS Code and install dependencies."
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create the client project.";
    const status = error?.code === "CLIENT_PROJECT_EXISTS" ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
