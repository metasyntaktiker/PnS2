import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readJson(relativePath) {
  return JSON.parse(await readFile(new URL(`../${relativePath}`, import.meta.url), "utf8"));
}

function expandLocalizationKeys(messages) {
  const root = {};
  for (const [key, value] of Object.entries(messages)) {
    const parts = key.split(".");
    let current = root;
    for (const part of parts.slice(0, -1)) {
      assert.ok(
        current[part] === undefined || typeof current[part] === "object",
        `Localization key "${key}" conflicts with a string value`
      );
      current[part] ??= {};
      current = current[part];
    }

    const leaf = parts.at(-1);
    assert.ok(
      current[leaf] === undefined || typeof current[leaf] !== "object",
      `Localization key "${key}" conflicts with a nested namespace`
    );
    current[leaf] = value;
  }
  return root;
}

test("system manifest has the expected Foundry compatibility and entry point", async () => {
  const manifest = await readJson("system.json");

  assert.equal(manifest.id, "PnS2");
  assert.equal(manifest.compatibility.minimum, "13");
  assert.equal(manifest.compatibility.verified, "14");
  assert.ok(manifest.esmodules.includes("scripts/system.js"));
});

for (const locale of ["en", "de"]) {
  test(`${locale} localization parses and dotted keys have no namespace conflicts`, async () => {
    const messages = await readJson(`lang/${locale}.json`);
    const tree = expandLocalizationKeys(messages);

    assert.equal(typeof tree.PnS2.Import.Tab, "string");
    assert.equal(typeof tree.PnS2.Import.NoData, "string");
    assert.equal(typeof tree.PnS2.Import.Success, "string");
  });
}
