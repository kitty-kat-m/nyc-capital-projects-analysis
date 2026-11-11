# Contributing

## Suggest a correction

Use the Report feedback issue template. Include the tab, chart title, proposed change and supporting evidence. Do not include personal contact information or private source files. Comments belong in GitHub Issues or pull requests; the published report itself is a viewing page.

## Make an update

1. Pull the latest `main` and create a branch.
2. Edit the appropriate file in `src/`; consult [Architecture](ARCHITECTURE.md).
3. Run `npm run build` and `npm run check`.
4. Open `docs/index.html` and check the affected tabs. Run `npm test` for behaviour or layout changes.
5. Commit both the maintained source and generated report. Open a pull request describing the change, its effect and validation.

Keep commentary concise. Put field definitions, formulas, sample exclusions and detailed tables in the chart's data-notes dropdown. A changed result must be accompanied by its data source and calculation rule.

The build reads existing embedded datasets from `docs/index.html`. For an approved replacement report, `node scripts/build.mjs --data-from /path/to/report.html` can preserve its five expected datasets while applying the maintained presentation. This is not a dataset reconciliation or model-training command: validate any replacement separately.

## Publish

GitHub Pages serves `docs/` on `main`. Merge a reviewed change, check the Pages build, then confirm the published report displays correctly. The website link remains the same.

Write access is managed by the repository owner through GitHub's collaborator settings. Visitors can submit issues or propose changes through a fork.

## Privacy and attribution

Keep audit ZIPs, source workbooks, raw exports, personal emails and local computer paths out of commits. Use a GitHub no-reply address. Preserve required third-party licence notices and public-data attribution.

The repository's earlier history was replaced for privacy in November 2026. Collaborators holding an older clone should re-clone and transfer only reviewed, unpublished work; do not restore old branches or files.
