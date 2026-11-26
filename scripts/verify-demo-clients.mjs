import fs from "node:fs";
import path from "node:path";
import { runClientAudit } from "./audit-client.mjs";

const root = path.resolve("client-projects");
const expected = [
  ["machi-coffee-demo", "MACHI Coffee", "cafe"],
  ["foodie-kitchen-demo", "Foodie Kitchen", "restaurant"],
  ["beetle-home-demo", "Beetle Home", "furniture"],
  ["nova-collective-demo", "NOVA Collective", "ecommerce"],
  ["greenbasket-market-demo", "GreenBasket Market", "grocery"],
  ["urban-bites-demo", "Urban Bites", "foodDelivery"]
];
const errors = [];
const seenColors = new Set();
for (const [slug, name, template] of expected) {
  const folder = path.join(root, slug);
  const configPath = path.join(folder, "src/config/client-project.json");
  if (!fs.existsSync(configPath)) { errors.push(`${slug}: missing client-project.json`); continue; }
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  if (config.slug !== slug || config.brand.name !== name || config.template !== template) errors.push(`${slug}: client identity/template mismatch`);
  if (!fs.existsSync(path.join(folder, "src/app/page.js"))) errors.push(`${slug}: missing generated homepage`);
  if (!fs.existsSync(path.join(folder, "src/components/commerce/ClientCommerceExperience.js"))) errors.push(`${slug}: missing reusable commerce engine`);
  if (!fs.existsSync(path.join(folder, "public/brand-logo.svg"))) errors.push(`${slug}: missing client logo`);
  if (config.brand.logoUrl !== "/brand-logo.svg") errors.push(`${slug}: configured logo does not point to the generated client logo`);
  for (const required of [
    "src/app/studio/page.js",
    "src/components/client/ClientConfigEditor.js",
    "src/app/api/client-config/route.js",
    "src/app/api/client-assets/route.js",
    "src/lib/client-config-validation.mjs",
    "src/lib/client-config.mjs",
    "playwright.config.mjs",
    "tests/e2e/client-site.spec.js"
  ]) {
    if (!fs.existsSync(path.join(folder, required))) errors.push(`${slug}: missing client runtime feature ${required}`);
  }
  if (fs.existsSync(path.join(folder, "src/app/forge"))) errors.push(`${slug}: internal Forge dashboard leaked into client project`);
  if (fs.existsSync(path.join(folder, ".env.local")) || fs.existsSync(path.join(folder, "node_modules")) || fs.existsSync(path.join(folder, ".next"))) errors.push(`${slug}: private environment or build output leaked into client copy`);
  if (seenColors.has(config.theme.primary)) errors.push(`${slug}: duplicate primary color palette`);
  seenColors.add(config.theme.primary);
  const audit = runClientAudit(folder);
  if (!audit.ok) errors.push(`${slug}: release audit failed — ${audit.issues.join("; ")}`);
}
if (errors.length) {
  console.error("Demo client verification failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log(`Verified ${expected.length} independent client websites: unique identities and palettes, generated routes, shared commerce component, client editor, validated local config and asset APIs, Playwright QA scaffolding, client logo, clean project boundary and release audit.`);
