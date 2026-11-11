# Data provenance and coverage

## Inputs

The report combines a supplied master classification workbook with capital-project records accessed through the NYC capital-project MCP. The source families cover citywide budget and schedule information, budget/spend history and variance, schedule history and variance, and budget/spend by fiscal year.

The available reporting periods are May and September 2023; January, May and September 2024; January, May and September 2025; and January and May 2026. Reporting dates describe the observations, not the date this website was last edited.

The main classification roster retains all 3,618 master PIDs. The current Infrastructure history export covers 2,282 of the 2,300 Infrastructure PIDs and 16,132 observations; 18 roster PIDs have no history row in that export. Each analysis has additional eligibility checks.

The current predictive results were reconciled to the November 2026 export build used for the analysis. They replace assessments based on an older, smaller November export. Export creation time is separate from the underlying reporting periods; this report does not claim a live upstream refresh.

## Public and private material

The public HTML contains the project-level information and saved results needed by its charts and search tables. It is therefore more detailed than a static presentation. The repository does not separately distribute source workbooks, raw export files, private review documents, modelling audit packages or local backups.

MCP access supports retrieval and reconciliation; it does not itself establish the correctness of a classification. Codex-assisted development supports data processing, classification review and report authoring; saved labels and calculations still require subject-matter review.

## Reproducibility boundary

The maintained public source and build reproduce the report from the five embedded JSON datasets. The build does not query the MCP, recreate source joins or refit models. A full analytical reproduction requires the matching private exports, preparation steps and modelling scripts. Do not infer a successful model reproduction from a successful website build.

The Data Definitions tab and chart-level notes are the most detailed guide to the fields and derived measures currently displayed.
