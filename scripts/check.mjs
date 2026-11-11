/** Validate the report structure and published denominators without refitting models. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(
  await readFile(path.join(root, "src/manifest.json"), "utf8"),
);
for (const file of manifest.scripts) {
  const checked = spawnSync(
    process.execPath,
    ["--check", path.join(root, file)],
    { encoding: "utf8" },
  );
  assert.equal(checked.status, 0, checked.stderr);
}
const html = await readFile(path.join(root, manifest.output), "utf8");
const data = new Map();
for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
  if (match[1].includes("application/json")) {
    data.set(/\bid="([^"]+)"/.exec(match[1])[1], JSON.parse(match[2]));
  }
}
assert.deepEqual([...data.keys()], manifest.data);
const roster = data.get("projectData"),
  types = data.get("typologyData");
assert.equal(new Set(roster.map((row) => row.pid)).size, 3618);
assert.equal(
  roster.filter((row) => row.final_classification === "Infrastructure").length,
  2300,
);
assert.equal(types.length, 2300);
assert.equal(types.filter((row) => !row.proposed_typology).length, 47);
const folds = data.get("rolling-model-data").folds;
assert.equal(folds.length, 6);
assert.equal(
  folds.reduce((sum, fold) => sum + fold.n, 0),
  5412,
);
assert.equal(
  folds.reduce((sum, fold) => sum + fold.events, 0),
  1533,
);
assert.equal(
  folds.reduce((sum, fold) => sum + fold.sizes[20].flagged, 0),
  1085,
);
assert.equal(
  folds.reduce((sum, fold) => sum + fold.sizes[20].correct, 0),
  584,
);
for (const id of [
  "earlier-fixed-model",
  "prediction-data",
  "pred-supporting-checks",
]) {
  assert.ok(!html.includes(`id="${id}"`), `Obsolete component remains: ${id}`);
}
assert.ok(
  !/<script\b[^>]*\bsrc=/i.test(html),
  "Portable report unexpectedly needs a remote script.",
);
console.log(
  "Syntax, embedded datasets, roster counts and rolling results passed.",
);
