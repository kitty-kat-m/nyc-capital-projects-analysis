# Report architecture

## Maintained source

| Path                       | Responsibility                                                    |
| -------------------------- | ----------------------------------------------------------------- |
| `src/report.html`          | Page structure, tab content and data placeholders                 |
| `src/manifest.json`        | Explicit style, script and dataset assembly order                 |
| `src/styles/report.css`    | Consolidated page and chart styling                               |
| `src/js/shared.js`         | Search, escaping and common presentation helpers                  |
| `src/js/classification.js` | Classification search, filtering and export                       |
| `src/js/typologies.js`     | Typology table, search and counts                                 |
| `src/js/charts.js`         | Shared D3 chart and table helpers                                 |
| `src/js/descriptive.js`    | Infrastructure, budget and schedule views                         |
| `src/js/experiments.js`    | Supplementary predictive tests                                    |
| `src/js/predictive.js`     | Rolling model evaluation, summaries and project lists             |
| `src/js/historical.js`     | Aggregate historical coverage chart; no legacy project rows      |
| `src/js/navigation.js`     | Tab selection, initialisation and table presentation              |
| `src/vendor/`              | Existing D3 distribution and its licence                          |
| `scripts/build.mjs`        | Assemble the portable HTML                                        |
| `scripts/check.mjs`        | Validate syntax, datasets and headline totals                     |
| `tests/report.spec.mjs`    | Browser checks for navigation, charts, filters and narrow screens |
| `docs/index.html`          | Generated report served by GitHub Pages                           |

## Build and embedded data

The report is deliberately self-contained. The builder reads the five JSON payloads already embedded in `docs/index.html`, validates their JSON, and inserts them into the source template without recalculating them. It then embeds the CSS and JavaScript in manifest order. There are no remote script dependencies at report runtime.

The retained dataset IDs are `projectData`, `typologyData`, `descriptive-data`, `additional-prediction-data` and `rolling-model-data`. Their presence does not mean they use the same unit of observation or eligible sample; see the report's calculation notes.

Do not format the generated HTML or minified vendor library. Format maintained files with `npm run format`. The generated report remains large because it contains its data; GitHub marks it as generated so readers can focus on the source.

## Checks

`npm run check` confirms the build is current, checks JavaScript syntax and validates the master roster, unresolved typology count and rolling evaluation totals. Browser checks open all eight tabs, exercise project searches and predictive controls, verify historical scope and the 24 coverage bars, and check mobile page overflow. They validate the saved report rather than reproduce model fitting.

The Historical Data tab contains an overview, source comparisons and PID-identity explanations. Its source does not append historical rows to the five current datasets or alter model results. Private historical source workbooks, detailed compatibility audits and candidate extracts remain outside this repository.

`npm test` uses Playwright Chromium by default. An installed browser can be selected with `BROWSER_CHANNEL` or `BROWSER_EXECUTABLE`; an alternate Playwright module URL can be supplied through `PLAYWRIGHT_MODULE`. Test screenshots and results stay in `.test-results/`, outside version control.
