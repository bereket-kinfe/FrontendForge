import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const generator = fs.readFileSync(new URL("../scripts/generate-demo-clients.mjs", import.meta.url), "utf8");
const verifier = fs.readFileSync(new URL("../scripts/verify-demo-clients.mjs", import.meta.url), "utf8");

const demos = [
  ["MACHI Coffee", "cafe"], ["Daybreak Coffee", "cafe"],
  ["Foodie Kitchen", "restaurant"], ["Saffron & Stone", "restaurant"],
  ["Beetle Home", "furniture"], ["Sable Living", "furniture"],
  ["NOVA Collective", "ecommerce"], ["FORME Studio", "ecommerce"],
  ["GreenBasket Market", "grocery"], ["Harvest Market", "grocery"],
  ["Urban Bites", "foodDelivery"], ["Dash Kitchen", "foodDelivery"]
];

test("demo catalog contains two independent brands for every starter niche", () => {
  for (const [name, niche] of demos) {
    assert.ok(generator.includes('name:"' + name + '"'), "generator missing " + name);
    assert.ok(generator.includes('template:"' + niche + '"'), "generator missing niche " + niche);
    assert.ok(verifier.includes('"' + name + '"'), "verifier missing " + name);
  }
  assert.equal((generator.match(/slug:"[a-z0-9-]+-demo"/g) || []).length, 12);
});

test("demo primary palettes are distinct and each brand has its own palette key", () => {
  const primaryColors = [...generator.matchAll(/primary: "(#[0-9A-Fa-f]{6})"/g)].map((match) => match[1].toLowerCase());
  assert.equal(primaryColors.length, 12);
  assert.equal(new Set(primaryColors).size, 12);
  for (const key of ["machi","daybreak","foodie","saffron","beetle","sable","nova","forme","market","harvest","urban","dash"]) {
    assert.ok(generator.includes(key + ":"), "missing palette " + key);
  }
});
