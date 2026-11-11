/** Build the portable HTML from maintained source and its existing data payloads. */
import { readFile, writeFile, rename } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (name) => readFile(path.join(root, name), "utf8");
const manifest = JSON.parse(await read("src/manifest.json"));
const dataArgument = process.argv.indexOf("--data-from");
const dataFile =
  dataArgument < 0 ? manifest.output : process.argv[dataArgument + 1];
if (!dataFile) throw new Error("--data-from requires an HTML report path.");
const currentReport = await readFile(path.resolve(root, dataFile), "utf8");
const payloads = new Map();

for (const match of currentReport.matchAll(
  /<script\b([^>]*)>([\s\S]*?)<\/script>/g,
)) {
  if (!match[1].includes("application/json")) continue;
  const id = /\bid="([^"]+)"/.exec(match[1])?.[1];
  if (id) payloads.set(id, match[2]);
}

let html = await read("src/report.html");
for (const id of manifest.data) {
  const payload = payloads.get(id);
  if (!payload) throw new Error(`Missing embedded dataset: ${id}`);
  JSON.parse(payload);
  html = html.replace(
    `<!-- REPORT:DATA:${id} -->`,
    () => `<script type="application/json" id="${id}">${payload}</script>`,
  );
}

const css = (await Promise.all(manifest.styles.map(read))).join("\n");
html = html.replace("<!-- REPORT:STYLES -->", () => `<style>\n${css}</style>`);
const scripts = await Promise.all(
  manifest.scripts.map(async (name) => {
    const code = await read(name);
    if (/<\/script/i.test(code))
      throw new Error(`Unsafe inline script terminator: ${name}`);
    return `<!-- ${name} -->\n<script>\n${code}</script>`;
  }),
);
html = html.replace("<!-- REPORT:SCRIPTS -->", () => scripts.join("\n"));
if (/<!-- REPORT:/.test(html))
  throw new Error("An unresolved source marker remains.");

if (process.argv.includes("--check")) {
  if (html !== (await read(manifest.output))) {
    throw new Error("The generated report is stale. Run npm run build.");
  }
  console.log("Generated report matches the maintained source.");
} else {
  const destination = path.join(root, manifest.output);
  const temporary = `${destination}.tmp`;
  await writeFile(temporary, html, "utf8");
  await rename(temporary, destination);
  console.log(
    `Built ${manifest.output}; preserved ${payloads.size} embedded datasets.`,
  );
}
