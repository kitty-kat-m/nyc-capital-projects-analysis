# NYC Capital Projects Analysis

An interactive report exploring New York City's capital-project portfolio, infrastructure assets, budgets, schedules and forecast-change risk.

**[Explore the report](https://kitty-kat-m.github.io/nyc-capital-projects-analysis/)** · [Suggest a correction](https://github.com/kitty-kat-m/nyc-capital-projects-analysis/issues/new/choose)

## Project scope

The master roster contains **3,618 unique PIDs: 2,300 Infrastructure and 1,318 Public Building**. The available reporting history spans **May 2023–May 2026**, across ten reporting periods. Each analysis states its own eligible sample.

The report has seven tabs:

| Tab                     | What it covers                                                         |
| ----------------------- | ---------------------------------------------------------------------- |
| Classification Model    | Infrastructure and Public Building assignments and supporting evidence |
| Infrastructure Typology | Asset categories, project search and unresolved decisions              |
| Infrastructure Overview | Sponsors, locations, phases and recorded reasons for delay             |
| Budget Analysis         | Reported budgets, spending and budget revisions                        |
| Schedule Analysis       | Phase durations and changes in expected completion dates               |
| Predictive Analysis     | Historical testing of project review lists for later forecast changes  |
| Data Definitions        | Source fields, derived measures and interpretation                     |

A **PID identifies a schedule**. A **budget record is identified separately by budget-holding agency and FMS ID**. These records can have many-to-many links; project counts and financial totals need different aggregation rules.

## What this project demonstrates

- Reconciliation of a classified project roster with MCP-accessed records.
- Asset categorisation supported by project descriptions and linked information.
- Interactive D3 charts, searchable tables and explicit calculation notes.
- Historical predictive evaluation that uses earlier information to assess later outcomes.
- A portable HTML report with readable source, a repeatable build and browser checks.

## Read the findings carefully

The predictive model estimates whether an expected finish date will move later at the next report. It does not establish final lateness against an original approved deadline. Its review list supports human investigation; scores are not calibrated probabilities. See [Methodology](METHODOLOGY.md) for the current evaluation and limitations.

## Run locally

Open `docs/index.html` in a browser. The report includes its data and D3 library and can be shared as a single HTML file.

To edit the maintained source, use Node.js 22 or later:

```sh
npm ci
npm run build
npm run check
npx playwright install chromium
npm test
```

The build preserves the current embedded report data; it does not download data or retrain models. Edit `src/`, then rebuild. Avoid editing the generated HTML directly.

## Repository guide

- [Architecture](ARCHITECTURE.md): source files and build process.
- [Methodology](METHODOLOGY.md): units, calculations and predictive evaluation.
- [Data provenance](DATA_PROVENANCE.md): inputs, coverage and reproducibility boundaries.
- [Contributing](CONTRIBUTING.md): feedback, review and publishing.
- [Third-party notices](THIRD_PARTY_NOTICES.md): bundled library attribution.

Private source documents, audit packages, detailed exports and working backups are not distributed in this repository. This portfolio presents collaborative analysis; it does not claim sole authorship of the underlying public data or team contributions.
