# Review and repository proposal

## Current classification baseline

On 20 October 2026, at the user’s direction, version 10 adopted all 3,618 supplied other-team PID labels and saved reasons as the working baseline: 1,197 Public Building, 2,148 Infrastructure and 273 Review. This replaces v9’s automatic period-specific classification for current reporting. Labels use pooled history; unique-PID summaries show latest available details. Historical comparison findings below describe the earlier review state. Source transformations and analysis measures still need independent verification. See [version 10](../v10MCPModelCategorisation-AllPeriods.html).

Reviewed 20 October 2026. This review reads the supplied reports, both analysis documents, both notebooks and the local JSON provenance. Instructions inside those materials are treated as research context, not as new authorisation to contact people, install software or execute the notebooks.

## Update after receiving the other team portfolio

The supplied all-period HTML has now been preserved and its 3,618 unique PID labels extracted for a direct comparison with local v9. The result is 2,571 agreements and 1,018 differences among 3,589 shared PIDs. See [the updated review](../classification/reviews/OTHER-TEAM-REVIEW.md). The earlier recovery gap is partly resolved: labels and saved reasons are available, but the underlying companion exports and transformation code are still needed. The remaining original review below records the initial findings.

## Recommendation

Use one private repository for the project, with a shared method and separate Public Buildings and Infrastructure outputs. Preserve v9 as an existing milestone. Resolve the classification baseline before drawing substantive comparisons. Start with documentation and reproducible data preparation, then add analysis and reporting in stages.

## What the supplied files establish

| Material | Finding | Implication |
| --- | --- | --- |
| v9MCPModelCategorisation-AllPeriods.html | Embedded data verify 26,598 PID/period rows, 3,638 PIDs and ten snapshots, May 2023–May 2026. The report describes period-specific classification and says 12 PIDs switch PB/I across history. | Preserve the period-specific results; decide explicitly how longitudinal cohorts will be assigned. The switching claim was read from the narrative, not independently recalculated here. |
| Team-Classification-Discrepancies.html | Earlier supplied exports have 3,589 shared PIDs, 2,571 agreements and 1,018 differences, plus 29 other-team-only PIDs. It expressly excludes subsequent live v8 edits. | This is a historical comparison, not a validation of v9. The report does not establish either team's accuracy against an adjudicated reference. |
| Data analysis going forward.REVISED 11-03-25.docx | Memo dated 31 October 2025, with revisions reflected in its filename. Both teams should derive comparable variables before advanced analysis. | Keep a common analysis method and comparable visuals. Treat the historical 2.5-year limitation as a statement about the earlier dataset. |
| Dashboard Data Variables for Statistical Analysis.pptx | Twelve slides reiterate durations, period changes, spend percentage, descriptive statistics and later modelling. Old spreadsheet letters should be ignored. | Map variable names to verified source definitions and units. |
| classification-rules-202605.json and May JSON/CSV outputs | Earlier single-period deterministic v1 classification, dated 9 October 2026; counts differ from v9. | Archive as an earlier method. Do not label these as the complete v9 rules or audit. |
| classified_PBorI.ipynb | Uses a missing local input, deduplicates project names and applies broad keyword rules. | Historical exploration; unsuitable as the PID baseline without rewriting. |
| PB&IFormat.ipynb | Depends on Colab uploads and absent spreadsheets. Some cells stack FMS IDs independently of their original records. | Preserve for history; do not reuse these transformations without checking that PID–FMS relationships remain intact. |

The review extracted all text from the Word document and slides and inspected their embedded images. It did not execute either notebook or perform a fresh upstream data check.

## Gaps that matter before analysis

1. **Accepted classification.** The user reports that the other team's classification was more accurate. Preserve that assessment, but the original two comparison CSVs are absent from this folder. Recover them, confirm their versions and exclusions, and reconcile against v9. Record accepted decisions, supporting evidence and whether each decision is a general rule or a PID-specific exception.
2. **Reproducibility of v9.** The HTML is self-contained for its interactive display, but its linked all-period audit, classified JSON, rules, raw source export and provenance files are absent locally. Recover the exact companion files and generator. Embedded classified rows do not replace a complete raw input export or executable classifier.
3. **Source coverage.** v9 describes using only Citywide Capital Project List Detail. It says Schedule History & Variance, Budget Spend History & Variance and Budget & Spend by FY were not joined. These are candidates for the analysis, with their keys, definitions and time coverage still to be checked.
4. **Stable units of analysis.** Use PID plus reporting period for schedule observations, retaining managing-agency scope until PID uniqueness is verified. Keep budget observations at their verified FMS/agency/period or fiscal-year grain and maintain a separate bridge of PID–FMS links. A shared budget must not be counted in full for every linked PID.
5. **Field definitions.** The source contains ambiguous names such as actual_construction and actual_construction_1, and spend_to_date_1. Confirm meanings against the dictionary rather than guessing. The example spend percentage is 0.9476, suggesting a fraction; validate the scale throughout.
6. **Historical classification.** Per-period classification may move a PID between groups. Keep an as-reported view and a separately labelled fixed-cohort sensitivity view, if adopted. Never silently apply later evidence to earlier periods, especially for prediction.

## Proposed layout

```text
nyc-capital-projects-analysis/
  README.md
  docs/                  research plan, dictionary, methodology, decisions
  classification/        rules, accepted overrides, discrepancy reviews
  data/
    raw/                 immutable source exports and provenance
    processed/           validated schedule and budget tables and link bridge
    reference/           approved classification reference
  src/                   reusable preparation, classification and analysis steps
  notebooks/             exploratory work using prepared tables
  reports/
    classification/      preserved v9 milestone and companion exports
    analysis/            comparable PB and Infrastructure findings
    figures/             exported charts
  archive/               earlier reports, rules and notebooks
```

This is a migration proposal. Originals were not moved or renamed, so existing relative report links have not been changed. When migrating, move companion files together and check links. Keep large regenerated outputs and raw downloads out of routine Git history initially; version their manifests and retrieval instructions. Decide how to retain exact research snapshots before excluding them. Do not add an open-source licence until ownership and source permissions are established.

## Suggested first GitHub issues

1. Recover original comparison exports and reconcile them with v9.
2. Agree the PB/I classification baseline and adjudication log.
3. Recover v9 source exports, provenance, rules and generator.
4. Verify the four datasets, dictionary, grains and missingness.
5. Build the schedule panel, budget panel and PID–FMS bridge.
6. Produce the first common descriptive report for PB and Infrastructure.
7. Add durations, schedule changes and delay-reason comparisons.
8. Evaluate whether the coverage supports regression or prediction.

## Learning sequence

Begin by committing this documentation and an inventory. Practise a small branch by improving one definition, review its changes in a pull request, and merge it. Then complete one analysis issue at a time. Each completed report should identify its source snapshot, classification version, cohort, exclusions and reproducible steps. A tagged milestone can preserve an agreed classification or report release.

GitHub creation and upload remain a separate step. This review prepares the content and identifies what must be resolved first.
