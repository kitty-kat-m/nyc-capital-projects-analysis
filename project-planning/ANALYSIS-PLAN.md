# Analysis plan

## Current classification baseline

On 20 October 2026, at the user’s direction, version 10 adopted all 3,618 supplied other-team PID labels and saved reasons as the working baseline: 1,197 Public Building, 2,148 Infrastructure and 273 Review. This replaces v9’s automatic period-specific classification for current reporting. Labels use pooled history; unique-PID summaries show latest available details. Historical comparison findings below describe the earlier review state. Source transformations and analysis measures still need independent verification. See [version 10](../v10MCPModelCategorisation-AllPeriods.html).

Draft based on the supplied 2025 memo, the twelve-slide dashboard variables deck and v9. These are proposed definitions pending dictionary and data validation. Apply the same definitions to Public Buildings and Infrastructure and show excluded and missing-data counts.

## First deliverable

A common descriptive report should show coverage by period; unique included PIDs by domain, sponsor, managing agency and borough; phase distributions; sponsor-to-manager shares; and missingness of milestone and financial fields. Show counts and denominators. Multi-sponsor, multi-manager and multi-borough PIDs require an explicit attribution rule and may overlap.

Then add valid phase durations, reported reasons for delay and changes in forecasts. Budget results should follow the budget-link validation rather than use a naive sum over PID rows.

## Proposed variables

| Variable | Definition and handling |
| --- | --- |
| Design Phase Duration | Actual design end minus actual design start, in days. Both dates required; quarantine negative values. |
| Construction Procurement Phase Duration | Actual procurement end minus actual procurement start, in days. Verify source mappings for actual_construction and actual_construction_1. |
| Construction Phase Duration | Actual construction end minus actual construction start, in days. Incomplete phases are missing for completed-phase duration, not zero. |
| Forecast Total Project Duration | Forecast completion minus actual design start, in days. This is a forecast-based approximation, not completed elapsed duration. The memo's written start-minus-finish order would yield negative durations and should be corrected explicitly. |
| Actual duration for completed projects | Actual construction end minus actual design start, where valid; label the construction-end boundary because administrative close-out can continue. |
| Duration percentage change | 100 × (current valid duration − prior valid duration) / prior valid duration, within the same PID and verified schedule scope. Undefined when prior duration is zero. Keep period gaps visible. |
| Duration average percentage change | Mean of defined consecutive duration percentage changes per PID, with the number of usable pairs. Actual completed-phase dates may be constant; changes can reflect date corrections rather than performance deterioration. |
| Spend to date percentage | Prefer the existing documented field. Validate whether stored as fraction or percent; check zero budgets and out-of-range values. Use spend/budget only as a labelled fallback or reconciliation. |
| Forecast movement in days | Current forecast completion minus prior forecast completion, after confirming source semantics. Positive means later under this proposed convention. A forecast revision is not proof of missing an original contractual deadline. |
| Budget change | Current minus prior budget in dollars and percent at the verified budget grain. Establish baseline and denominator; do not call every revision an overrun. |
| Year-on-year budget change | Compare the same reporting month one year apart where both exist; do not replace with the nearest arbitrary earlier observation. |
| Delay reasons | Preserve raw text; normalise categories and derive separate indicators. Support multiple reasons per observation if present. Missing reason is not automatically no delay. |
| Self-managed indicator | Sponsor equals managing agency under a documented rule for multiple linked agencies. Compare distributions and complexity; avoid causal claims about efficiency. |

The source materials describe budget_variance and variance_day using wording that leaves subtraction direction unclear. Verify stored signs and matching-period rules against the dictionary and a small set of source records before using them.

## Data tables and validation

- Schedule panel: one row per verified schedule key and reporting period, with classification version, inclusion flags, milestones and reasons.
- Budget panel: one row per verified budget key and reporting period; a separate fiscal-year table when required.
- Link bridge: all distinct same-period PID–FMS links, including agency identifiers required by source keys. Keep unmatched budget-only records visible.
- Classification reference: PID, period or explicit validity range, proposed and accepted domain, review state, evidence, reviewer and decision date.

Check key uniqueness, period coverage, duplicate links, missing dates, reversed milestones, zero denominators and row-count changes at each join. Reconcile portfolio counts to the source and show which records each metric excludes. Do not infer the timing of a phase transition precisely from widely spaced snapshots.

## Analysis order

1. Coverage and data-quality report, followed by portfolio composition and phase distribution.
2. Sponsor/managing-agency relationships and descriptive duration distributions, including medians and sample sizes.
3. Delay-reason comparisons across domains, agencies, typologies and boroughs, using consistent denominators.
4. Within-PID forecast changes and within-budget financial changes, then valid completed-project duration versus spend relationships.
5. Regression or prediction only after outcome definitions, enough usable data and leakage controls are established.

For prediction, use information available at the prediction date, split by time and prevent repeated observations of the same PID from leaking across training and evaluation. Reasons for delay recorded after the outcome cannot serve as early predictors. Report associations as associations, allowing for project size, complexity and observation-window differences.

## Limits and decisions

The memo's 2.5-year observation window describes its historical context. v9 covers ten reporting snapshots from May 2023 to May 2026; usable coverage for each variable and each additional source remains unverified. Earlier actual milestones may predate the observed reporting window.

Keep completed-project and ongoing-project analyses separate where their measurement differs. Use verified population data only if a density comparison is pursued; borough-level associations alone do not establish project-level causes. Defer agency efficiency rankings and broad capital-planning claims until a defensible method and suitable evidence exist.

Every final report should include a dictionary appendix, transformation definitions, exclusions, classification baseline, snapshot dates, missingness, sample sizes and methodological limitations.
