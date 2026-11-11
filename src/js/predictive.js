(() => {
  const R = JSON.parse(
      document.getElementById("rolling-model-data").textContent,
    ),
    $ = (id) => document.getElementById(id),
    fmt = (n) => Number(n).toLocaleString("en-US"),
    pct = (n) => (100 * n).toFixed(1) + "%",
    date = (s) =>
      (({ "01": "January", "05": "May", "09": "September" })[s.slice(4)] ||
        s.slice(4)) +
      " " +
      s.slice(0, 4),
    esc = (s) =>
      String(s ?? "").replace(
        /[&<>"']/g,
        (c) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[c],
      );
  let fraction = 20,
    period = "202605",
    search = "",
    page = 0;
  function table(headers, rows) {
    return (
      '<div class="roll-table-wrap"><table><thead><tr>' +
      headers.map((x) => "<th>" + esc(x) + "</th>").join("") +
      "</tr></thead><tbody>" +
      rows
        .map(
          (r) =>
            "<tr>" + r.map((x) => "<td>" + esc(x) + "</td>").join("") + "</tr>",
        )
        .join("") +
      "</tbody></table></div>"
    );
  }
  function bars(id, rows, max = 1, suffix = "%") {
    $(id).innerHTML = rows
      .map(
        (r, i) =>
          '<div class="roll-bar-row"><span>' +
          esc(r.label) +
          '</span><div class="roll-track"><div style="width:' +
          Math.max(0, (100 * r.value) / max) +
          "%;background:" +
          (i ? "#365e78" : "#247f85") +
          '"></div></div><strong>' +
          esc(r.text ?? (suffix === "%" ? pct(r.value) : r.value)) +
          "</strong></div>",
      )
      .join("");
  }
  function totals() {
    const fs = R.folds;
    return {
      n: fs.reduce((a, f) => a + f.n, 0),
      events: fs.reduce((a, f) => a + f.events, 0),
      k: fs.reduce((a, f) => a + f.sizes[fraction].flagged, 0),
      tp: fs.reduce((a, f) => a + f.sizes[fraction].correct, 0),
    };
  }
  function overall() {
    let t = totals();
    $("roll-fold-table").innerHTML = table(
      [
        "Outcome report",
        "Eligible comparisons",
        "Later forecasts",
        "Review flags",
        "Correct flags",
        "Flags correct",
        "All comparisons: later",
      ],
      R.folds.map((f) => [
        date(f.period),
        fmt(f.n),
        fmt(f.events),
        fmt(f.sizes[fraction].flagged),
        fmt(f.sizes[fraction].correct),
        pct(f.sizes[fraction].correct / f.sizes[fraction].flagged),
        pct(f.events / f.n),
      ]),
    );
    let baseline = R.folds.reduce(
        (a, f) =>
          a + f.rules["Rule: share of earlier reports that slipped"].correct,
        0,
      ),
      severe = R.folds.reduce(
        (a, f) => a + f.rules["90-day setback: random forest"].correct,
        0,
      ),
      sevN = R.folds.reduce(
        (a, f) => a + f.rules["90-day setback: random forest"].events,
        0,
      ),
      k20 = R.folds.reduce((a, f) => a + f.sizes["20"].flagged, 0),
      tp20 = R.folds.reduce((a, f) => a + f.sizes["20"].correct, 0);
    $("roll-outcome-summary").innerHTML = table(
      [
        "Outcome predicted",
        "Review list",
        "Flags with that outcome",
        "Across all comparisons",
        "All changes found",
      ],
      [
        [
          "Any later forecast",
          "Highest " + fraction + "%",
          pct(t.tp / t.k) + " (" + fmt(t.tp) + " of " + fmt(t.k) + " flags)",
          pct(t.events / t.n),
          pct(t.tp / t.events),
        ],
        [
          "Forecast moves later by 90+ days",
          "Highest 20%",
          pct(severe / k20) +
            " (" +
            fmt(severe) +
            " of " +
            fmt(k20) +
            " flags)",
          pct(sevN / t.n),
          pct(severe / sevN),
        ],
      ],
    );
    $("roll-input-table").innerHTML = table(
      [
        "Information supplied",
        "Correct forecast-change flags",
        "Share of flags correct",
      ],
      [
        ["Schedule history and current phase", 534, "49.2%"],
        ["Schedule plus financial information", 563, "51.9%"],
        ["Schedule, finance, agency and location", 584, "53.8%"],
      ],
    );
    $("roll-capacity-table").innerHTML = table(
      [
        "Review list",
        "Review flags",
        "Correct flags",
        "Flags correct",
        "All later changes found",
      ],
      [10, 20, 30].map((x) => {
        let k = R.folds.reduce((a, f) => a + f.sizes[x].flagged, 0),
          tp = R.folds.reduce((a, f) => a + f.sizes[x].correct, 0);
        return [
          "Highest " + x + "%",
          fmt(k),
          fmt(tp),
          pct(tp / k),
          pct(tp / t.events),
        ];
      }),
    );
    assessment();
  }
  function assessment() {
    let f = R.folds.find((f) => f.period === period),
      k = f.sizes[fraction].flagged,
      chosen = f.scores.slice(0, k),
      tp = chosen.reduce((a, r) => a + r.target, 0),
      fp = k - tp,
      fn = f.events - tp,
      tn = f.n - f.events - fp;
    let t = totals(),
      allTP = t.tp,
      allFP = t.k - t.tp,
      allFN = t.events - t.tp,
      allTN = t.n - t.events - allFP;
    $("roll-assessment-title").textContent =
      "All six reporting assessments · September 2024–May 2026 · " +
      fmt(t.n) +
      " project/report comparisons · highest " +
      fraction +
      "% flagged in each period";
    $("roll-matrix").innerHTML = [
      [allTN, "Correctly left unflagged"],
      [allFP, "False alarms"],
      [allFN, "Later changes missed"],
      [allTP, "Correctly flagged"],
    ]
      .map(
        ([n, l]) =>
          "<div><strong>" + fmt(n) + "</strong><span>" + l + "</span></div>",
      )
      .join("");
    $("roll-assessment-findings").innerHTML =
      "<li><strong>Of " +
      fmt(t.k) +
      " review flags, " +
      fmt(allTP) +
      " correctly identify a later forecast.</strong> The other " +
      fmt(allFP) +
      " are false alarms.</li><li><strong>We find " +
      pct(allTP / t.events) +
      " of all later changes.</strong> " +
      fmt(allFN) +
      " changes are missed; " +
      fmt(allTN) +
      " unchanged or earlier forecasts are correctly left unflagged.</li>";
    $("roll-accuracy").textContent =
      "Across six periods, accuracy is " +
      pct((allTP + allTN) / t.n) +
      " (" +
      fmt(allTP + allTN) +
      " of " +
      fmt(t.n) +
      " comparisons). Always predicting unchanged/earlier would score " +
      pct((t.n - t.events) / t.n) +
      ". Each PID can recur across periods; these counts are comparisons, not distinct projects. Accuracy alone does not measure how useful the review list is.";
    let path = f.roc
      .map(
        (p, i) =>
          (i ? "L" : "M") +
          (60 + p.x * 650).toFixed(1) +
          "," +
          (330 - p.y * 290).toFixed(1),
      )
      .join(" ");
    $("roll-roc").innerHTML =
      '<svg viewBox="0 0 780 390" role="img" aria-label="ROC curve for selected reporting period" style="width:100%;max-height:360px"><path d="M60 40V330H710" stroke="#9fb3bf" fill="none"/><path d="M60 330L710 40" stroke="#bdcbd2" stroke-dasharray="6 6"/><path d="' +
      path +
      '" stroke="#247f85" stroke-width="3" fill="none"/><text x="385" y="375" text-anchor="middle">Share of unchanged/earlier forecasts incorrectly flagged (0–100%)</text><text x="17" y="185" transform="rotate(-90 17 185)" text-anchor="middle">Share of later changes found (0–100%)</text><text x="65" y="28">ROC AUC ' +
      f.auc.toFixed(2) +
      " · " +
      date(f.period) +
      '</text><text x="50" y="350">0</text><text x="685" y="350">100%</text><text x="22" y="45">100%</text></svg>';
    $("roll-roc-result").innerHTML =
      "<strong>For " +
      date(f.from_period) +
      "–" +
      date(f.period) +
      ", ROC AUC is " +
      f.auc.toFixed(2) +
      ".</strong> This indicates better-than-chance but imperfect ranking: " +
      "projects whose forecasts later moved back tend to appear nearer the " +
      "top of the review list. A score of 0.5 means chance ranking; 1.0 means perfect ranking.";
    const groups = {};
    for (const r of f.scores) {
      if (!r.typology || /review|unassigned/i.test(r.typology)) continue;
      let g = (groups[r.typology] ??= { n: 0, k: 0, ev: 0 });
      g.n++;
      g.k += r.rank <= k;
      g.ev += r.target;
    }
    const gg = Object.entries(groups)
      .map(([label, g]) => ({ label, ...g }))
      .sort((a, b) => b.k / b.n - a.k / a.n);
    bars(
      "roll-types",
      gg.slice(0, 10).map((g) => ({
        label: g.label,
        value: g.k / g.n,
        text: g.k + " of " + g.n + " flagged · " + pct(g.k / g.n),
      })),
    );
    $("roll-types-table").innerHTML = table(
      [
        "Infrastructure type",
        "Projects assessed",
        "Flagged for review",
        "Share flagged",
        "Later forecasts observed",
      ],
      gg.map((g) => [g.label, g.n, g.k, pct(g.k / g.n), g.ev]),
    );
    $("roll-list-note").textContent =
      "Ranked using " +
      date(f.from_period) +
      " or earlier information. Forecast changes were checked in " +
      date(f.period) +
      ". Top " +
      fraction +
      "%: " +
      fmt(k) +
      " of " +
      fmt(f.n) +
      " projects flagged. Higher rank means earlier review priority.";
    projectRows();
  }
  function projectRows() {
    let f = R.folds.find((f) => f.period === period),
      k = f.sizes[fraction].flagged;
    let rr = f.scores.filter(
      (r) =>
        [r.pid, r.name, r.typology, r.manager]
          .join(" ")
          .toLowerCase()
          .includes(search) &&
        (!$("roll-flagged-only").checked || r.rank <= k),
    );
    let pages = Math.max(1, Math.ceil(rr.length / 15));
    page = Math.min(page, pages - 1);
    $("roll-project-table").innerHTML = table(
      [
        "Rank",
        "PID / project",
        "Flagged?",
        "Observed result",
        "Assessment",
        "Earlier → later forecast",
        "Movement",
      ],
      rr.slice(page * 15, page * 15 + 15).map((r) => {
        let fl = r.rank <= k;
        return [
          r.rank,
          r.pid + " · " + r.name,
          fl ? "Yes" : "No",
          r.target ? "Forecast moved later" : "Unchanged / earlier",
          fl
            ? r.target
              ? "Correct flag"
              : "False alarm"
            : r.target
              ? "Missed change"
              : "Correctly unflagged",
          r.forecast_before + " → " + r.forecast_after,
          (r.movement_days > 0 ? "+" : "") + r.movement_days + " days",
        ];
      }),
    );
    $("roll-page").textContent =
      "Page " +
      (page + 1) +
      " of " +
      pages +
      " · " +
      fmt(rr.length) +
      " projects";
    $("roll-prev").disabled = page === 0;
    $("roll-next").disabled = page + 1 === pages;
  }
  $("roll-size").onchange = (e) => {
    fraction = Number(e.target.value);
    page = 0;
    overall();
  };
  $("roll-period").onchange = (e) => {
    period = e.target.value;
    page = 0;
    assessment();
  };
  $("roll-search").oninput = (e) => {
    search = e.target.value.toLowerCase();
    page = 0;
    projectRows();
  };
  $("roll-flagged-only").onchange = () => {
    page = 0;
    projectRows();
  };
  $("roll-prev").onclick = () => {
    page--;
    projectRows();
  };
  $("roll-next").onclick = () => {
    page++;
    projectRows();
  };
  $("roll-period").innerHTML = R.folds
    .map(
      (f) =>
        '<option value="' +
        f.period +
        '" ' +
        (f.period === period ? "selected" : "") +
        ">" +
        date(f.from_period) +
        " → " +
        date(f.period) +
        "</option>",
    )
    .join("");
  overall();
})();
