# NYC capital projects classification and analysis

[Open the latest interactive report](https://kitty-kat-m.github.io/nyc-capital-projects-analysis/)

The shared report covers project classification, Infrastructure typologies, overview, budget analysis, schedule analysis, predictive analysis and data definitions. The published version is dated 9 November 2026.

- [Leave report feedback](https://github.com/kitty-kat-m/nyc-capital-projects-analysis/issues/new/choose)
- [How to edit, review and publish updates](CONTRIBUTING.md)

GitHub Pages publishes `docs/index.html`. The link stays the same when the report is updated. Older files below are retained as historical project material.


This project separates NYC capital project PIDs into Public Buildings and Infrastructure, then compares their delivery, schedules, spending and reported reasons for delay.

Status: the latest report is published through GitHub Pages from `docs/index.html`; earlier reports and planning files are retained below.

## Start here

- [Review and repository proposal](project-planning/REVIEW-AND-REPOSITORY-PLAN.md)
- [Analysis plan and variable definitions](project-planning/ANALYSIS-PLAN.md)
- [File inventory with SHA-256 checksums](project-planning/file-inventory.csv)
- [Historical classification report v10](v10MCPModelCategorisation-AllPeriods.html)
- [Original classification report v9](v9MCPModelCategorisation-AllPeriods.html)
- [Earlier team comparison](Team-Classification-Discrepancies.html)

Original files remain in their existing locations. The proposed folder layout is documented in the review; it has not yet been applied.

## Other team portfolio

The supplied other-team all-period portfolio is now preserved locally. See the [direct v9 comparison and review](classification/reviews/OTHER-TEAM-REVIEW.md) and [complete PID register](classification/reviews/v9-vs-other-team-latest-pid.csv). Its 3,618 pooled-history labels are adopted in version 10 at the user’s direction; full source and measure reproduction still require companion files.

## Verified local v9 coverage

The embedded report data contain 26,598 PID/reporting-period observations, 3,638 distinct PIDs and ten reporting periods from May 2023 to May 2026. The latest period contains 3,063 PIDs: 596 included Public Buildings, 1,785 included Infrastructure, 646 Needs Review and 36 agency exclusions. These counts were read from the report's embedded JSON, rather than inferred from older May-only files.

A PID identifies a schedule project. An FMS ID identifies a budget. Their relationship can be many-to-many. Project counts and budget totals require different aggregation rules.

