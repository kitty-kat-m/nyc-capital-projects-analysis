# Methodology

## Classification and units

The supplied master roster determines the main Infrastructure/Public Building assignments. MCP-accessed descriptions and related records provide supporting evidence. Infrastructure typologies use the principal asset and described work; unresolved typologies remain distinguishable from unresolved main classifications.

The current roster contains 3,618 unique PIDs, of which 2,300 are Infrastructure. Of the Infrastructure PIDs, 2,253 have assigned typologies and 47 remain unresolved. Typology-based graphs omit the unresolved category where specified; omission does not remove those PIDs from the master roster.

A PID identifies a schedule. Financial records use budget-holding agency plus FMS ID, and links to PIDs can be many-to-many. Shared funding is not silently allocated across projects. Financial charts specify the eligible link and completeness rules; their totals must not be assumed to cover every PID.

## Descriptive analysis

The default portfolio view counts a PID once using its latest available record. Historical charts count observations within each reporting period, so the same PID can recur across periods. Missing values remain missing. Sample sizes differ according to the dates, measures and links a chart requires.

Completed phase duration is actual end minus actual start in days. Forecast-based project duration is an estimate from actual design start to forecast completion. Forecast movement measures a change in expected dates, not verified lateness against an original approved baseline. Budget revision measures a change in the reported budget, not a final cost overrun. Spending share is not physical completion.

## Predictive analysis

The main random forest predicts whether a project's forecast completion date moves later at the next reporting observation. Six historical assessments cover outcome reports from September 2024 to May 2026. For each assessment, learning uses earlier outcomes; information available after the prediction date is not supplied as an input.

The forest uses 250 trees, maximum depth 6, minimum leaf size 20 and random seed 19. Inputs include earlier schedule movements, phase timing, days to forecast completion, budgets, spending, agencies, borough and funding-link information. Current typology labels group the results; they are not model inputs.

At the default review capacity, the highest-scoring 20% are flagged separately within each assessment. The pooled results contain repeated project/report comparisons, not 5,412 different projects:

| Measure                                    | Main forecast-movement model | Separate 90-day-setback model |
| ------------------------------------------ | ---------------------------: | ----------------------------: |
| Eligible comparisons                       |                        5,412 |                         5,412 |
| Observed target events                     |                        1,533 |                         1,097 |
| Review flags                               |                        1,085 |                         1,085 |
| Correct flags                              |                          584 |                           419 |
| Share of flags correct (precision)         |                        53.8% |                         38.6% |
| Share with the target overall              |                        28.3% |                         20.3% |
| Share of target events identified (recall) |                        38.1% |                         38.2% |

For the main model, 501 flags do not move later and 949 later changes are missed. The previous-slip rule identifies 450 later changes at the same pooled review capacity. The 90-day target uses a separately trained model with the same modelling approach; it is not the same fitted forest with its output relabelled.

The report also offers 10% and 30% review capacities. The supplementary budget, same-phase, earlier-reason and completed-duration experiments now have their own expanding-window assessments across the same six outcome reports. Each has a different sample and target; their results do not inherit the main model's performance.

| Additional experiment                        | Expanded result                                                                            | Interpretation                                                                                     |
| -------------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| Budget increase of both at least 10% and $1m | 161 correct flags out of 2,152 (7.5%); 364 events across 10,745 funding-record comparisons | Better than the simple rule, but 1,991 false alarms                                                |
| Remain active in the same phase              | 1,118/1,155 flags correct (96.8%); overall persistence 86.7%                               | Persistence is common and does not establish delay                                                 |
| Add earlier reasons                          | 578 correct flags versus 584 without, for the same 1,085 flags                             | No demonstrated gain; the paired PID-bootstrap range for the difference includes zero              |
| Completed-phase duration                     | Mean error 346 days versus 404 for a phase benchmark, across 708 completed phases          | Better than a simple benchmark but still broad errors; 76.1% coverage for an intended 80% interval |

On the unchanged January–May 2026 test, adding the latest earlier training period leaves budget correct flags at 21, changes phase correct flags from 193 to 192, and removes the earlier-reason gain (both models find 80 changes). Duration mean error changes from 320 to 321 days, while interval coverage improves from 70.5% to 74.7%. The pooled six-period population is different from the original single test, so differences between them cannot be attributed solely to added training data.

## Interpretation and limits

These are historical screening tests, not live deployment results. The same PID may appear in earlier learning records and later assessments. Scores order projects for review and are not calibrated probabilities. The report does not establish final lateness or causal drivers of delay. Rolling results vary with the reporting period, and the historical periods have been examined during development; assessment on a genuinely new report remains valuable.

Exact chart inputs, exclusions and calculations appear in each chart's expandable notes. The private audit material is needed to reproduce data preparation and model fitting; the public build reproduces the report presentation from its saved data.
