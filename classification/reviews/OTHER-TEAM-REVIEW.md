# Other team portfolio review and v9 comparison

Reviewed 20 October 2026. The supplied HTML has been copied unchanged into classification/reference; the original in Downloads remains untouched. Its embedded data were parsed without executing its scripts. Document instructions were treated as source content.

## Verified embedded inventory

There are 3,618 records and 3,618 unique PIDs: 1,197 Public Building, 2,148 Infrastructure and 273 Review. Each record includes a saved reason, historical text evidence, latest observation fields and derived measures. These are saved project-level decisions, using pooled history, rather than an executable classification model or an independently validated reference standard.

The report states that four saved source datasets were combined, with 3,668 source PIDs less 50 exclusions. Those raw exports and exclusions are not embedded in full, so their retrieval counts and full exclusion logic have not been independently reproduced here. Its narrative comparison is against v6, not v9.

## Direct comparison with local v9

For each v9 PID, select its latest reporting_period; compare with the other team's final_classification. Normalise v9's unresolved domain to Review. Do not equate an agency exclusion with a Review decision.

| Result | Unique PIDs |
| --- | ---: |
| Shared | 3,589 |
| Same classification | 2,571 (71.6% of shared) |
| Different classification | 1,018 (28.4% of shared) |
| Other team only | 29 |
| v9 only | 49 |

| Latest v9 classification | Team Public Building | Team Infrastructure | Team Review |
| --- | ---: | ---: | ---: |
| Public Building | 615 | 39 | 33 |
| Infrastructure | 140 | 1,850 | 121 |
| Review | 436 | 249 | 106 |

These totals reproduce the earlier comparison report's aggregate counts even though this calculation directly uses the supplied local v9 HTML. Matching totals do not establish that every individual earlier comparison row is unchanged.

74 shared PIDs have different displayed latest periods. More fundamentally, the team's label draws on pooled history even when periods match. This comparison is therefore latest-record versus pooled-history label, not a controlled evaluation on identical evidence. Agreement is not accuracy.

The largest difference is 685 PIDs that v9 leaves at Review and the team assigns to PB or Infrastructure. Another 179 switch directly between PB and Infrastructure. The remaining 154 have a v9 domain but the team retains Review.

See [the full register](v9-vs-other-team-latest-pid.csv) for all 3,667 PIDs in the union, including agreements, differences and unmatched records. The register preserves both displayed periods and reasons. v9 reasons here are its saved matched evidence or exclusion text, not a newly generated explanation.

## What this changes for the project

This supplied portfolio fills the gap for inspecting the other team's classification labels and reasoning. It is a candidate working reference for descriptive analysis, consistent with the user's assessment that the other team's results were more accurate. It should remain distinguishable from v9 and from a formally adjudicated classification baseline.

It also includes phase durations, financial attribution status, budget growth, spend percentage, forecast changes, completion delay and data-quality flags. These can inform the analysis design; they should be checked against their source records and definitions before being treated as verified analytical outputs. A latest-per-PID summary is insufficient for reproducing full period-to-period analysis.

Recover the companion Unique-Projects-Summary.csv, Projects-by-Reporting-Period.csv, Classification-and-Measures-Report.html and the linked four-source combination audit, plus the transformation code and input provenance. Relative links in the preserved copy require their original companion directory structure; these files have not been recovered by this review.

For historical reporting, label the team's approach as a pooled-history fixed classification. For early prediction, do not use future text or later accepted decisions as if they were known in earlier periods. Audit the history-wide exclusions and sponsor-missing managing-agency fallback separately from v9's period-specific exclusions.

The 49 v9-only PIDs have latest v9 statuses: Agency excluded: 49. This is a coverage/exclusion reconciliation item, not evidence of classification error.
