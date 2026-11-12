/** Browser checks for the current report, using saved results rather than refitting models. */
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.resolve(
  root,
  process.env.REPORT_TEST_OUTPUT || ".test-results",
);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.BROWSER_CHANNEL
    ? { channel: process.env.BROWSER_CHANNEL }
    : {}),
  ...(process.env.BROWSER_EXECUTABLE
    ? { executablePath: process.env.BROWSER_EXECUTABLE }
    : {}),
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const snapshots = {};

try {
  await page.goto(pathToFileURL(path.join(root, "docs/index.html")).href);
  for (const tab of [
    "classification",
    "typologies",
    "overview",
    "pid-budget",
    "schedule",
    "predictive",
    "historical",
    "definitions",
  ]) {
    await page.locator(`#tab-${tab}`).click();
    const panel = page.locator(`#panel-${tab}`);
    assert.ok(await panel.isVisible(), `Panel did not open: ${tab}`);
    snapshots[tab] = await panel.evaluate((element) => ({
      charts: element.querySelectorAll("svg").length,
      tables: element.querySelectorAll("table").length,
      height: element.getBoundingClientRect().height,
      first: element.querySelector("h2")?.textContent,
    }));
    await page.screenshot({ path: path.join(output, `${tab}.png`) });
  }
  assert.equal(snapshots.overview.charts, 9);
  assert.equal(snapshots["pid-budget"].charts, 5);
  assert.equal(snapshots.schedule.charts, 6);
  assert.equal(snapshots.historical.charts, 1);
  assert.equal(await page.locator("#historical-coverage-chart .historical-bar").count(), 24);
  assert.match(await page.locator("#panel-historical").textContent(), /above \$25 million/);
  assert.match(await page.locator("#panel-historical").textContent(), /62 projects marked Completed/);
  assert.match(await page.locator("#panel-historical").textContent(), /Matching PID numbers are not reliable project matches/);

  await page.locator("#tab-classification").click();
  await page.locator("#search").fill("PID 595");
  assert.equal(await page.locator("#projectTableBody tr").count(), 1);
  assert.match(
    await page.locator("#projectTableBody").textContent(),
    /Oakwood Beach/,
  );
  await page.locator("#search-clear").click();
  assert.match(await page.locator("#resultCount").textContent(), /3,618/);

  await page.locator("#tab-typologies").click();
  await page.locator("#ty-filter").selectOption("review");
  assert.match(
    await page.locator("#ty-count").textContent(),
    /47 Infrastructure PIDs match/,
  );
  await page.locator("#ty-search").fill("PID 595");
  assert.equal(await page.locator("#ty-body tr").count(), 1);
  await page.locator("#ty-search-clear").click();

  await page.locator("#tab-predictive").click();
  assert.match(
    await page.locator("#roll-summary").textContent(),
    /logistic regression/,
  );
  assert.doesNotMatch(
    await page.locator("#roll-summary > .model-kicker").textContent(),
    /SIX-PERIOD/,
  );
  assert.match(
    await page.locator("#roll-roc-result").textContent(),
    /January 2026–May 2026, ROC AUC is 0.73/,
  );
  const summary = page.locator("#roll-outcome-summary");
  assert.equal(
    await page.locator(".rolling-extension-summary tbody tr").count(),
    4,
  );
  const extensions = await page
    .locator(".rolling-extension-summary")
    .textContent();
  for (const value of ["161", "2,152", "7.5%", "1,118", "578", "346", "76.1%"])
    assert.ok(extensions.includes(value), `Missing expanded result: ${value}`);
  assert.equal(
    await page.locator("#rolling-extension-notes").getAttribute("open"),
    null,
  );
  await page
    .locator("#pred-next-steps")
    .screenshot({ path: path.join(output, "expanded-experiments.png") });
  await page.locator("#rolling-extension-notes > summary").click();
  assert.equal(await page.locator("#rolling-extension-notes table").count(), 4);
  await page.locator("#rolling-extension-notes > summary").click();
  for (const value of ["53.8%", "28.3%", "38.1%", "38.6%", "419", "584"]) {
    assert.ok(
      (await summary.textContent()).includes(value),
      `Missing result: ${value}`,
    );
  }
  const matrix = await page.locator("#roll-matrix").textContent();
  for (const value of ["3,378", "501", "949", "584"])
    assert.ok(matrix.includes(value));
  assert.equal(await page.locator("#earlier-fixed-model").count(), 0);
  await page.locator("#roll-summary > details > summary").click();
  await page.locator("#roll-size").selectOption("10");
  assert.ok((await summary.textContent()).includes("57.3%"));
  await page.locator("#roll-size").selectOption("30");
  assert.ok((await summary.textContent()).includes("47.9%"));
  await page.locator("#roll-size").selectOption("20");
  assert.equal(await page.locator("#roll-fold-table tbody tr").count(), 6);
  await page.locator("#roll-project-details > summary").click();
  await page.locator("#roll-search").fill("595");
  assert.match(
    await page.locator("#roll-project-table").textContent(),
    /Oakwood/,
  );
  await page.locator("#roll-search").fill("");
  await page.locator("#roll-flagged-only").check();
  assert.match(await page.locator("#roll-page").textContent(), /184 projects/);
  await page.locator("#roll-period").selectOption("202409");
  assert.match(await page.locator("#roll-list-note").textContent(), /May 2024/);
  assert.match(
    await page.locator("#roll-roc-result").textContent(),
    /May 2024–September 2024/,
  );

  for (const tab of [
    "overview",
    "pid-budget",
    "schedule",
    "predictive",
    "historical",
    "definitions",
  ]) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator(`#tab-${tab}`).click();
    const width = await page.evaluate(() => ({
      viewport: innerWidth,
      page: document.documentElement.scrollWidth,
    }));
    assert.ok(
      width.page <= width.viewport,
      `Mobile overflow in ${tab}: ${JSON.stringify(width)}`,
    );
  }
  assert.deepEqual(errors, []);
  await writeFile(
    path.join(output, "results.json"),
    JSON.stringify({ snapshots, errors }, null, 2),
  );
  console.log(
    "Eight tabs, chart counts, historical scope, searches, typology review, predictive controls and mobile layout passed.",
  );
} finally {
  await browser.close();
}
