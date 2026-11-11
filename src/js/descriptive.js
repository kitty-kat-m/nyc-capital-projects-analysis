const chartBriefs = {
  "status-period":
    "How the recorded delivery pipeline changes: one count per PID, per reporting date.",
  "phase-borough":
    "Where the work sits in the delivery pipeline: latest recorded phase within each borough.",
  "spend-type":
    "How much of each project\u2019s reported budget has been spent, averaged equally within each asset type.",
  "spend-time-heat":
    "Average spending percentage within each combination of infrastructure type and completed construction duration.",
  "phase-spread":
    "Design, procurement and construction means for the same completed-project cohort within each type.",
  "forecast-type":
    "First-to-latest forecast delay per project, averaged within each infrastructure type. Labels show average days and eligible PID count.",
};
function applyChartPresentation(article, card) {
  const brief = chartBriefs[card.id];
  if (brief && !article.querySelector(".chart-reading-line")) {
    const note = document.createElement("p");
    note.className = "chart-reading-line";
    note.textContent = brief;
    article.querySelector("h2").after(note);
  }
  if (
    [
      "bar",
      "mean-spend",
      "schedule-forecast",
      "schedule-histogram",
      "schedule-trend",
    ].includes(card.kind)
  ) {
    article.querySelectorAll(".pred-chart svg rect").forEach((rect) => {
      if (!rect.closest("defs")) rect.style.fill = "#589fa1";
    });
  }
}
window.NYCOverviewStacks = (() => {
  const ink = "#23384c",
    grid = "#e5ebf0",
    font = '"Segoe UI", Arial, sans-serif';
  const phaseColors = {
    "Pre-Design": "#a7b6c8",
    Design: "#346c9c",
    Procurement: "#27a3ab",
    Construction: "#547f9b",
    "Close-out": "#176c69",
    Completed: "#315c52",
    "Other recorded states": "#aeb8c3",
    "No schedule observation": "#d4dce5",
    "Other / unknown": "#aeb8c3",
  };
  const agencyColors = {
    DPR: "#247d82",
    DOT: "#244965",
    DEP: "#547f9b",
    EDC: "#668f94",
    DSNY: "#536c7e",
    DOC: "#8299ad",
    NYPD: "#36969e",
    DCAS: "#7695a0",
    DCLA: "#91aeb8",
    FDNY: "#466773",
    BPL: "#6f9fb4",
    HPD: "#4f8680",
    QPL: "#9aafbe",
    MOR: "#426e7f",
    "DEP, DOT": "#3e748f",
    "DOT, DPR": "#174f60",
    "No schedule observation": "#d4dce5",
    Unknown: "#d4dce5",
  };
  const types = [
    "#244965",
    "#247d82",
    "#589fa1",
    "#7190aa",
    "#3f6c84",
    "#8bb9b5",
    "#326b6c",
    "#9cabbc",
    "#4e8fa9",
    "#a9c9c7",
    "#536c7e",
    "#7a9c9d",
    "#355d78",
    "#b8cbd3",
    "#698491",
    "#d4dce5",
  ];
  function wrap(text, width = 46) {
    text.each(function () {
      let t = d3.select(this),
        x = t.attr("x") || 0,
        words = t.text().split(/\s+/),
        lines = [],
        line = "";
      for (let w of words) {
        if ((line + " " + w).length > width && line) {
          lines.push(line);
          line = w;
        } else line += (line ? " " : "") + w;
      }
      if (line) lines.push(line);
      t.text("");
      lines.forEach((l, i) =>
        t
          .append("tspan")
          .attr("x", x)
          .attr("dy", i ? "1.15em" : `${0.32 - (lines.length - 1) * 0.55}em`)
          .text(l),
      );
    });
  }
  function colors(series, mode) {
    let c = d3.scaleOrdinal().domain(series).range(types);
    return (k) =>
      mode === "agency"
        ? agencyColors[k] || c(k)
        : mode === "phase"
          ? phaseColors[k] || "#aeb8c3"
          : k === "Needs typology review"
            ? "#ce9345"
            : c(k);
  }
  function svgRoot(el, w, h, label) {
    const root = d3.select(el).html("");
    const svg = root
      .append("svg")
      .attr("viewBox", `0 0 ${w} ${h}`)
      .attr("role", "img")
      .attr("aria-label", label)
      .style("font-family", font);
    svg.append("title").text(label);
    return svg;
  }
  function legend(
    svg,
    series,
    color,
    x,
    y,
    width = 190,
    gap = 25,
    wrapAt = 27,
  ) {
    series.forEach((k, i) => {
      let g = svg
        .append("g")
        .attr("class", "stack-legend-item")
        .attr("transform", `translate(${x},${y + i * gap})`);
      g.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("rx", 2)
        .attr("fill", color(k));
      g.append("text")
        .attr("x", 20)
        .attr("y", 6)
        .attr("fill", ink)
        .style("font-size", "12px")
        .text(k)
        .call((t) => wrap(t, wrapAt));
    });
  }
  function horizontal(el, rows, mode) {
    const labels = [...new Set(rows.map((r) => r.label))],
      series = [
        ...new Set(rows.filter((r) => r.value > 0).map((r) => r.group)),
      ].sort((a, b) =>
        mode === "agency"
          ? d3.sum(
              rows.filter((r) => r.group === b),
              (r) => r.value,
            ) -
            d3.sum(
              rows.filter((r) => r.group === a),
              (r) => r.value,
            )
          : 0,
      ),
      totals = new Map(
        labels.map((l) => [
          l,
          d3.sum(
            rows.filter((r) => r.label === l),
            (r) => r.value,
          ),
        ]),
      );
    labels.sort((a, b) => totals.get(b) - totals.get(a) || d3.ascending(a, b));
    const values = new Map(
      rows.map((r) => [r.label + "\u0001" + r.group, r.value]),
    );
    const data = labels.map((label) =>
      Object.fromEntries([
        ["label", label],
        ...series.map((k) => [k, values.get(label + "\u0001" + k) || 0]),
      ]),
    );
    const layers = d3.stack().keys(series)(data),
      w = 1400,
      legendRows = Math.ceil(series.length / 4),
      bottom = 80 + legendRows * 30,
      h = Math.max(540, labels.length * 48 + 30 + bottom),
      m = { l: 325, r: 80, t: 25, b: bottom },
      svg = svgRoot(
        el,
        w,
        h,
        mode === "agency"
          ? "Infrastructure typologies by sponsor agency"
          : "Infrastructure typologies by project phase",
      ),
      x = d3
        .scaleLinear()
        .domain([0, d3.max([...totals.values()]) || 1])
        .nice()
        .range([m.l, w - m.r]),
      y = d3
        .scaleBand()
        .domain(labels)
        .range([m.t, h - m.b])
        .padding(0.27),
      color = colors(series, mode);
    svg
      .append("g")
      .attr("transform", `translate(0,${h - m.b})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(6)
          .tickSize(-(h - m.t - m.b)),
      )
      .call((g) => g.select(".domain").remove())
      .call((g) => g.selectAll(".tick line").attr("stroke", grid))
      .call((g) =>
        g.selectAll("text").attr("fill", ink).style("font-size", "12px"),
      );
    svg
      .append("g")
      .attr("transform", `translate(${m.l},0)`)
      .call(d3.axisLeft(y).tickSize(0))
      .call((g) => g.select(".domain").remove())
      .selectAll("text")
      .attr("fill", ink)
      .style("font-size", "13px")
      .call((t) => wrap(t, 33));
    const gs = svg
      .selectAll(".stack-series")
      .data(layers)
      .join("g")
      .attr("class", "stack-series")
      .attr("fill", (l) => color(l.key));
    gs.selectAll("rect")
      .data((l) =>
        l.map((v) => ({
          v,
          key: l.key,
          label: v.data.label,
          value: v[1] - v[0],
        })),
      )
      .join("rect")
      .attr("class", "stack-segment")
      .attr("x", (d) => x(d.v[0]))
      .attr("y", (d) => y(d.label))
      .attr("width", (d) => Math.max(0, x(d.v[1]) - x(d.v[0])))
      .attr("height", y.bandwidth())
      .attr("stroke", "white")
      .attr("stroke-width", 0.6)
      .append("title")
      .text(
        (d) =>
          `${d.label}\n${d.key}: ${d.value} PIDs (${d3.format(".1%")(d.value / totals.get(d.label))} of type)`,
      );
    gs.selectAll(".segment-label")
      .data((l) =>
        l
          .map((v) => ({
            v,
            key: l.key,
            label: v.data.label,
            value: v[1] - v[0],
          }))
          .filter((d) => x(d.v[1]) - x(d.v[0]) > 39),
      )
      .join("text")
      .attr("x", (d) => (x(d.v[0]) + x(d.v[1])) / 2)
      .attr("y", (d) => y(d.label) + y.bandwidth() / 2 + 4)
      .attr("text-anchor", "middle")
      .style("fill", (d) => (d3.lab(color(d.key)).l > 64 ? ink : "white"))
      .style("font-size", "12px")
      .style("font-weight", 600)
      .text((d) => d.value);
    svg
      .selectAll(".stack-total")
      .data(labels)
      .join("text")
      .attr("class", "stack-total")
      .attr("x", (l) => x(totals.get(l)) + 7)
      .attr("y", (l) => y(l) + y.bandwidth() / 2 + 4)
      .attr("fill", ink)
      .style("font-size", "12px")
      .style("font-weight", 650)
      .text((l) => d3.format(",")(totals.get(l)));
    series.forEach((k, i) => {
      const g = svg
        .append("g")
        .attr("class", "stack-legend-item")
        .attr(
          "transform",
          `translate(${24 + (i % 4) * 340},${h - m.b + 62 + Math.floor(i / 4) * 30})`,
        );
      g.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("rx", 2)
        .attr("fill", color(k));
      g.append("text")
        .attr("x", 20)
        .attr("y", 10)
        .attr("fill", ink)
        .style("font-size", "12px")
        .text(k);
    });
    svg
      .append("text")
      .attr("x", (m.l + w - m.r) / 2)
      .attr("y", h - m.b + 35)
      .attr("text-anchor", "middle")
      .attr("fill", ink)
      .style("font-size", "12px")
      .text("Infrastructure PIDs");
  }
  function vertical(el, rows) {
    const periods = [...new Set(rows.map((r) => r.group))].sort(),
      series = [...new Set(rows.map((r) => r.label))],
      values = new Map(
        rows.map((r) => [r.group + "\u0001" + r.label, r.value]),
      ),
      data = periods.map((period) =>
        Object.fromEntries([
          ["period", period],
          ...series.map((k) => [k, values.get(period + "\u0001" + k) || 0]),
        ]),
      ),
      layers = d3.stack().keys(series)(data),
      totals = new Map(
        data.map((r) => [r.period, d3.sum(series, (k) => r[k])]),
      ),
      w = 1400,
      h = 780,
      m = { l: 75, r: 45, t: 35, b: 235 },
      svg = svgRoot(
        el,
        w,
        h,
        "Project counts by Infrastructure typology across ten reporting periods",
      ),
      x = d3
        .scaleBand()
        .domain(periods)
        .range([m.l, w - m.r])
        .padding(0.25),
      y = d3
        .scaleLinear()
        .domain([0, d3.max([...totals.values()]) || 1])
        .nice()
        .range([h - m.b, m.t]),
      color = colors(series, "type");
    svg
      .append("g")
      .attr("transform", `translate(${m.l},0)`)
      .call(
        d3
          .axisLeft(y)
          .ticks(7)
          .tickSize(-(w - m.l - m.r)),
      )
      .call((g) => g.select(".domain").remove())
      .call((g) => g.selectAll(".tick line").attr("stroke", grid))
      .selectAll("text")
      .attr("fill", ink)
      .style("font-size", "12px");
    svg
      .append("g")
      .attr("transform", `translate(0,${h - m.b})`)
      .call(
        d3
          .axisBottom(x)
          .tickSize(0)
          .tickFormat((p) => p.slice(0, 4) + "-" + p.slice(4)),
      )
      .selectAll("text")
      .attr("fill", ink)
      .style("font-size", "12px")
      .attr("dy", "1.3em");
    svg
      .selectAll(".period-stack")
      .data(layers)
      .join("g")
      .attr("class", "period-stack")
      .attr("fill", (l) => color(l.key))
      .selectAll("rect")
      .data((l) =>
        l.map((v) => ({
          v,
          key: l.key,
          period: v.data.period,
          value: v[1] - v[0],
        })),
      )
      .join("rect")
      .attr("class", "stack-segment")
      .attr("x", (d) => x(d.period))
      .attr("y", (d) => y(d.v[1]))
      .attr("height", (d) => y(d.v[0]) - y(d.v[1]))
      .attr("width", x.bandwidth())
      .attr("stroke", "white")
      .attr("stroke-width", 0.6)
      .append("title")
      .text((d) => `${d.period}\n${d.key}: ${d.value} PIDs`);
    svg
      .selectAll(".period-total")
      .data(periods)
      .join("text")
      .attr("class", "period-total")
      .attr("x", (p) => x(p) + x.bandwidth() / 2)
      .attr("y", (p) => y(totals.get(p)) - 8)
      .attr("text-anchor", "middle")
      .attr("fill", ink)
      .style("font-size", "12px")
      .style("font-weight", 650)
      .text((p) => d3.format(",")(totals.get(p)));
    window.NYCBottomLegend(svg, series, color, h - m.b + 65, w);
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -(m.t + h - m.b) / 2)
      .attr("y", 18)
      .attr("text-anchor", "middle")
      .attr("fill", ink)
      .style("font-size", "12px")
      .text("Infrastructure PIDs");
    svg
      .append("text")
      .attr("x", (m.l + w - m.r) / 2)
      .attr("y", h - 13)
      .attr("text-anchor", "middle")
      .attr("fill", ink)
      .style("font-size", "12px")
      .text("Reporting period");
  }
  return { horizontal, vertical };
})();

window.NYCAnalysisCharts = (() => {
  const ink = "#253d52",
    line = "#dfe7ee",
    palette = [
      "#244965",
      "#589fa1",
      "#589fa1",
      "#7190aa",
      "#3f6c84",
      "#8bb9b5",
      "#326b6c",
      "#9cabbc",
      "#4e8fa9",
      "#a9c9c7",
      "#536c7e",
      "#7a9c9d",
      "#355d78",
      "#b8cbd3",
      "#698491",
      "#d4dce5",
    ];
  const types = JSON.parse(
    document.getElementById("descriptive-data").textContent,
  )
    .datasets.latest.cards.find((c) => c.id === "types")
    .rows.map((r) => r.label);
  const color = d3.scaleOrdinal(types, palette),
    phaseColor = d3.scaleOrdinal(
      ["Design", "Procurement", "Construction"],
      ["#346c9c", "#27a3ab", "#547f9b"],
    );
  function base(el, w = 1400, h = 560) {
    const root = d3.select(el).html(""),
      svg = root
        .append("svg")
        .attr("viewBox", `0 0 ${w} ${h}`)
        .attr("role", "img")
        .style("font-family", '"Segoe UI",Arial,sans-serif');
    return { svg, w, h };
  }
  function wrap(sel, n = 34) {
    sel.each(function () {
      let t = d3.select(this),
        x = t.attr("x") || 0,
        ls = [],
        s = "";
      for (let word of t.text().split(/\s+/)) {
        if ((s + " " + word).length > n && s) {
          ls.push(s);
          s = word;
        } else s += (s ? " " : "") + word;
      }
      if (s) ls.push(s);
      t.text("");
      ls.forEach((s, i) =>
        t
          .append("tspan")
          .attr("x", x)
          .attr("dy", i ? "1.1em" : `${0.32 - (ls.length - 1) * 0.52}em`)
          .text(s),
      );
    });
  }
  function axis(g) {
    g.selectAll("text").attr("fill", ink).style("font-size", "12px");
    g.selectAll(".domain").attr("stroke", "#a7bac8");
    g.selectAll(".tick line").attr("stroke", line);
  }
  function legend(svg, keys, x = 1060, y = 38, step = 39, c = color) {
    keys.forEach((k, i) => {
      const g = svg
        .append("g")
        .attr("transform", `translate(${x},${y + i * step})`);
      g.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("rx", 2)
        .attr("fill", c(k));
      g.append("text")
        .attr("x", 20)
        .attr("y", 6)
        .attr("fill", ink)
        .style("font-size", "12px")
        .text(k)
        .call((s) => wrap(s, 43));
    });
  }
  function label(svg, x, y, t, rotate = false) {
    svg
      .append("text")
      .attr(
        "transform",
        rotate ? `translate(${x},${y}) rotate(-90)` : `translate(${x},${y})`,
      )
      .attr("text-anchor", "middle")
      .attr("fill", ink)
      .style("font-size", "13px")
      .text(t);
  }
  function scatter(el, c) {
    const { svg, w, h } = base(el, 1400, 780),
      m = { l: 95, r: 45, t: 35, b: 235 };
    const dollars = c.id === "spend-budget",
      x = d3
        .scaleLinear()
        .domain([0, d3.max(c.rows, (r) => r.x) || 1])
        .nice()
        .range([m.l, w - m.r]),
      y = d3
        .scaleLinear()
        .domain([0, d3.max(c.rows, (r) => r.y) || 1])
        .nice()
        .range([h - m.b, m.t]);
    svg
      .append("g")
      .attr("transform", `translate(0,${h - m.b})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(6)
          .tickFormat(
            dollars ? d3.format("$.2s") : (v) => d3.format(".0f")(v) + "%",
          ),
      )
      .call(axis);
    svg
      .append("g")
      .attr("transform", `translate(${m.l},0)`)
      .call(
        d3
          .axisLeft(y)
          .ticks(7)
          .tickFormat(dollars ? d3.format("$.2s") : d3.format(",")),
      )
      .call(axis);
    svg
      .selectAll("circle")
      .data(c.rows)
      .join("circle")
      .attr("cx", (r) => x(r.x))
      .attr("cy", (r) => y(r.y))
      .attr("r", 4)
      .attr("fill", (r) => color(r.group))
      .attr("opacity", 0.6)
      .attr("stroke", "white")
      .attr("stroke-width", 0.6)
      .append("title")
      .text(
        (r) =>
          `${r.label}\n${r.group}\n${c.axis[0]}: ${d3.format(",.2f")(r.x)}\n${c.axis[1]}: ${d3.format(",.2f")(r.y)}`,
      );
    window.NYCBottomLegend(
      svg,
      types.filter((t) => c.rows.some((r) => r.group === t)),
      color,
      h - m.b + 65,
      w,
    );
    label(svg, (m.l + w - m.r) / 2, h - m.b + 45, c.axis[0]);
    label(svg, 20, (m.t + h - m.b) / 2, c.axis[1], true);
  }
  function meanSpend(el, c) {
    const { svg, w, h } = base(
        el,
        1400,
        Math.max(400, c.rows.length * 43 + 110),
      ),
      m = { l: 320, r: 170, t: 30, b: 65 },
      x = d3
        .scaleLinear()
        .domain([0, Math.max(100, d3.max(c.rows, (r) => r.value) || 0)])
        .nice()
        .range([m.l, w - m.r]),
      y = d3
        .scaleBand()
        .domain(c.rows.map((r) => r.label))
        .range([m.t, h - m.b])
        .padding(0.28);
    svg
      .append("g")
      .attr("transform", `translate(0,${h - m.b})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(5)
          .tickFormat((v) => v + "%")
          .tickSize(-(h - m.t - m.b)),
      )
      .call(axis);
    svg
      .append("g")
      .attr("transform", `translate(${m.l},0)`)
      .call(d3.axisLeft(y).tickSize(0))
      .call(axis)
      .selectAll("text")
      .call((s) => wrap(s));
    svg
      .selectAll("rect")
      .data(c.rows.filter((r) => r.value != null))
      .join("rect")
      .attr("x", m.l)
      .attr("y", (r) => y(r.label))
      .attr("width", (r) => x(r.value) - x(0))
      .attr("height", y.bandwidth())
      .attr("fill", "#589fa1")
      .attr("rx", 3)
      .append("title")
      .text((r) => `${r.label}: ${r.value.toFixed(2)}% · ${r.n} PIDs`);
    svg
      .selectAll(".mean")
      .data(c.rows)
      .join("text")
      .attr("x", (r) => x(r.value || 0) + 8)
      .attr("y", (r) => y(r.label) + y.bandwidth() / 2 + 4)
      .attr("fill", ink)
      .style("font-size", "12px")
      .text((r) =>
        r.value == null ? "No data" : `${r.value.toFixed(1)}% · n=${r.n}`,
      );
    label(svg, (m.l + w - m.r) / 2, h - 12, "Mean reported budget spent (%)");
  }
  function heat(el, c) {
    const labels = [...new Set(c.rows.map((r) => r.label))],
      groups = [...new Set(c.rows.map((r) => r.group))],
      { svg, w, h } = base(el, 1400, labels.length * 43 + 185),
      m = { l: 320, r: 65, t: 50, b: 120 },
      x = d3
        .scaleBand()
        .domain(groups)
        .range([m.l, w - m.r])
        .padding(0.04),
      y = d3
        .scaleBand()
        .domain(labels)
        .range([m.t, h - m.b])
        .padding(0.06),
      max = Math.max(
        100,
        Math.ceil((d3.max(c.rows, (r) => r.value) || 0) / 10) * 10,
      ),
      fill = d3.scaleSequential(
        [0, max],
        d3.interpolateRgbBasis(["#edf3f6", "#acd1d1", "#277b83"]),
      );
    svg
      .append("g")
      .attr("transform", `translate(0,${m.t - 8})`)
      .call(d3.axisTop(x).tickSize(0))
      .call(axis);
    svg
      .append("g")
      .attr("transform", `translate(${m.l},0)`)
      .call(d3.axisLeft(y).tickSize(0))
      .call(axis)
      .selectAll("text")
      .call((s) => wrap(s));
    svg
      .selectAll("rect")
      .data(c.rows)
      .join("rect")
      .attr("x", (r) => x(r.group))
      .attr("y", (r) => y(r.label))
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .attr("rx", 3)
      .attr("fill", (r) => (r.value == null ? "#f0f2f5" : fill(r.value)))
      .append("title")
      .text(
        (r) =>
          `${r.label}\nConstruction: ${r.group} days\nMean budget spent: ${r.value == null ? "No data" : r.value.toFixed(1) + "%"}\nn=${r.n}`,
      );
    svg
      .selectAll(".heat-val")
      .data(c.rows)
      .join("text")
      .attr("x", (r) => x(r.group) + x.bandwidth() / 2)
      .attr("y", (r) => y(r.label) + y.bandwidth() / 2 + 4)
      .attr("text-anchor", "middle")
      .style("fill", (r) => (r.value != null && r.value > 70 ? "white" : ink))
      .style("font-size", "12px")
      .text((r) => (r.value == null ? "—" : r.value.toFixed(0) + "%"));
    const grad = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "round2-spend-grad");
    for (let i = 0; i <= 10; i++)
      grad
        .append("stop")
        .attr("offset", i * 10 + "%")
        .attr("stop-color", fill((i * max) / 10));
    svg
      .append("rect")
      .attr("x", m.l)
      .attr("y", h - 74)
      .attr("width", 340)
      .attr("height", 12)
      .attr("fill", "url(#round2-spend-grad)");
    svg
      .append("g")
      .attr("transform", `translate(0,${h - 62})`)
      .call(
        d3
          .axisBottom(
            d3
              .scaleLinear()
              .domain([0, max])
              .range([m.l, m.l + 340]),
          )
          .ticks(4)
          .tickFormat((v) => v + "%"),
      )
      .call(axis);
    label(svg, m.l + 170, h - 15, "Mean share of budget spent");
    svg
      .append("text")
      .attr("x", m.l + 390)
      .attr("y", h - 61)
      .attr("fill", ink)
      .style("font-size", "12px")
      .text("Grey / — = no eligible PIDs");
  }

  function budgetRevision(el, c) {
    const container = d3.select(el).html("");
    const control = container.append("div").attr("class", "revision-filter");
    control
      .append("label")
      .attr("for", "budget-revision-type")
      .text("Infrastructure type");
    const select = control.append("select").attr("id", "budget-revision-type");
    select
      .append("option")
      .attr("value", "all")
      .text("All assigned infrastructure types");
    [...new Set(c.histogram_samples.map((r) => r.typology))]
      .sort()
      .forEach((t) => select.append("option").attr("value", t).text(t));
    const tiles = container.append("div").attr("class", "revision-summary"),
      chart = container.append("div").attr("class", "revision-distribution");
    const bands = [
      { label: "≤ −50%", lo: -Infinity, hi: -50 },
      { label: ">−50 to <−20%", lo: -50, hi: -20 },
      { label: "−20 to −10%", lo: -20, hi: -10 },
      { label: "−10 to <0%", lo: -10, hi: 0 },
      { label: ">0 to <10%", lo: 0, hi: 10 },
      { label: "10 to <20%", lo: 10, hi: 20 },
      { label: "20 to <50%", lo: 20, hi: 50 },
      { label: "50 to <100%", lo: 50, hi: 100 },
      { label: "≥100%", lo: 100, hi: Infinity },
    ];
    function draw() {
      const chosen = select.property("value"),
        sample = c.histogram_samples.filter(
          (r) => chosen === "all" || r.typology === chosen,
        ),
        n = sample.length,
        zero = sample.filter((r) => r.value === 0).length,
        up = sample.filter((r) => r.value > 0).length,
        down = sample.filter((r) => r.value < 0).length;
      tiles.html("");
      [
        { label: "Unchanged", value: zero },
        { label: "Increased", value: up },
        { label: "Decreased", value: down },
      ].forEach((t) => {
        const tile = tiles.append("div").attr("class", "revision-metric");
        tile.append("span").text(t.label);
        tile.append("strong").text(d3.format(",")(t.value));
        tile
          .append("small")
          .text(
            n
              ? ((100 * t.value) / n).toFixed(1) +
                  "% of " +
                  d3.format(",")(n) +
                  " comparable PIDs"
              : "No comparable PIDs",
          );
      });
      chart.html("");
      chart
        .append("p")
        .attr("class", "revision-chart-intro")
        .text(
          `${d3.format(",")(up + down)} PIDs with a budget revision · exact zero changes are counted above`,
        );
      const w = 1200,
        h = 340,
        m = { l: 80, r: 30, t: 30, b: 85 },
        svg = chart
          .append("svg")
          .attr("viewBox", `0 0 ${w} ${h}`)
          .attr("role", "img")
          .attr(
            "aria-label",
            "Project counts by budget revision size, excluding unchanged budgets",
          ),
        rr = bands.map((b, i) => ({
          ...b,
          value: sample.filter(
            (r) =>
              r.value !== 0 &&
              (i === 0
                ? r.value <= -50
                : i === 1
                  ? r.value > -50 && r.value < b.hi
                  : r.value >= b.lo && r.value < b.hi),
          ).length,
        })),
        x = d3
          .scaleBand()
          .domain(rr.map((r) => r.label))
          .range([m.l, w - m.r])
          .padding(0.32),
        y = d3
          .scaleLinear()
          .domain([0, d3.max(rr, (r) => r.value) || 1])
          .nice()
          .range([h - m.b, m.t]);
      svg
        .append("g")
        .attr("transform", `translate(${m.l},0)`)
        .call(
          d3
            .axisLeft(y)
            .ticks(5)
            .tickFormat(d3.format("d"))
            .tickSize(-(w - m.l - m.r)),
        )
        .call(axis);
      svg
        .append("g")
        .attr("transform", `translate(0,${h - m.b})`)
        .call(d3.axisBottom(x).tickSize(0))
        .call(axis);
      svg
        .selectAll(".revision-bar")
        .data(rr)
        .join("rect")
        .attr("x", (r) => x(r.label))
        .attr("y", (r) => y(r.value))
        .attr("width", x.bandwidth())
        .attr("height", (r) => y(0) - y(r.value))
        .attr("rx", 4)
        .attr("fill", (_, i) => (i < 4 ? "#355d78" : "#589fa1"))
        .append("title")
        .text((r) => `${r.label}: ${r.value} PIDs`);
      svg
        .selectAll(".revision-number")
        .data(rr)
        .join("text")
        .attr("x", (r) => x(r.label) + x.bandwidth() / 2)
        .attr("y", (r) => y(r.value) - 9)
        .attr("text-anchor", "middle")
        .attr("fill", ink)
        .style("font-size", "14px")
        .style("font-weight", 600)
        .text((r) => r.value);
      label(svg, 22, (m.t + h - m.b) / 2, "PIDs with a revision", true);
      label(
        svg,
        (m.l + w - m.r) / 2,
        h - 14,
        "Budget change from the preceding report · labelled percentage bands",
      );
      const article = document.getElementById("desc-budget-change"),
        comment = article && article.querySelector(".desc-commentary");
      if (comment) {
        const pct = n ? ((100 * zero) / n).toFixed(1) : "0.0";
        comment.innerHTML =
          '<ul class="chart-findings"><li><strong>' +
          pct +
          "% of comparable budgets are unchanged.</strong> " +
          d3.format(",")(up) +
          " increase and " +
          d3.format(",")(down) +
          " decrease" +
          (chosen === "all"
            ? " across assigned infrastructure types."
            : " in this typology.") +
          "</li><li><strong>Most revisions are relatively small.</strong> " +
          sample.filter((r) => r.value !== 0 && r.value >= -10 && r.value < 10)
            .length +
          " of " +
          (up + down) +
          " revisions fall between −10% and +10%; " +
          sample.filter((r) => r.value >= 100).length +
          " increase the budget by at least 100%. Check starting amounts and scope before calling an increase an overrun.</li></ul><h3>Conclusion</h3><p>" +
          (n
            ? zero.toLocaleString() +
              " of " +
              n.toLocaleString() +
              " comparable project budgets (" +
              ((100 * zero) / n).toFixed(1) +
              "%) are unchanged between adjacent reports; " +
              up.toLocaleString() +
              " increase and " +
              down.toLocaleString() +
              " decrease. " +
              (up + down
                ? "Of the " +
                  (up + down).toLocaleString() +
                  " revisions, " +
                  sample
                    .filter(
                      (r) => r.value !== 0 && r.value >= -10 && r.value < 10,
                    )
                    .length.toLocaleString() +
                  " fall between −10% and less than +10%. "
                : "") +
              "These comparisons describe revisions between reports, rather than spending progress or stability across an entire project history."
            : "No eligible adjacent-report budget comparisons are available for this selection.") +
          "</p>";
      }
    }
    draw();
    select.on("change", draw);
  }

  function histogram(el, c, stacked = false) {
    if (stacked) return budgetRevision(el, c);
    const { svg, w, h } = base(el, 1400, stacked ? 780 : 520),
      m = { l: 85, r: stacked ? 405 : 45, t: 35, b: 85 };
    let bins = [...new Set(c.rows.map((r) => r.label))],
      keys = stacked ? [...new Set(c.rows.map((r) => r.group))] : [],
      totals = new Map(
        bins.map((b) => [
          b,
          d3.sum(
            c.rows.filter((r) => r.label === b),
            (r) => r.value,
          ),
        ]),
      ),
      x = d3
        .scaleBand()
        .domain(bins)
        .range([m.l, w - m.r])
        .padding(0.07),
      y = d3
        .scaleLinear()
        .domain([0, d3.max([...totals.values()]) || 1])
        .nice()
        .range([h - m.b, m.t]);
    svg
      .append("g")
      .attr("transform", `translate(${m.l},0)`)
      .call(
        d3
          .axisLeft(y)
          .ticks(6)
          .tickSize(-(w - m.l - m.r)),
      )
      .call(axis);
    let showEvery = stacked ? 4 : Math.max(1, Math.ceil(bins.length / 12));
    svg
      .append("g")
      .attr("transform", `translate(0,${h - m.b})`)
      .call(
        d3
          .axisBottom(x)
          .tickValues(
            bins.filter((b, i) => i % showEvery === 0 || i === bins.length - 1),
          )
          .tickFormat((b) =>
            stacked ? (b === "100" ? "≥100%" : b + "%") : d3.format(",")(+b),
          ),
      )
      .call(axis);
    if (stacked) {
      const lookup = new Map(
        c.rows.map((r) => [r.label + "|" + r.group, r.value]),
      );
      let layers = d3.stack().keys(keys)(
        bins.map((label) =>
          Object.fromEntries([
            ["label", label],
            ...keys.map((k) => [k, lookup.get(label + "|" + k) || 0]),
          ]),
        ),
      );
      svg
        .selectAll(".hist-stack")
        .data(layers)
        .join("g")
        .attr("class", "hist-stack")
        .attr("fill", (l) => color(l.key))
        .selectAll("rect")
        .data((l) =>
          l.map((v) => ({
            v,
            key: l.key,
            label: v.data.label,
            value: v[1] - v[0],
          })),
        )
        .join("rect")
        .attr("x", (r) => x(r.label))
        .attr("y", (r) => y(r.v[1]))
        .attr("height", (r) => y(r.v[0]) - y(r.v[1]))
        .attr("width", x.bandwidth())
        .append("title")
        .text(
          (r) =>
            `${r.label === "100" ? "≥100%" : r.label + " to <" + (+r.label + 5) + "%"}\n${r.key}: ${r.value} PIDs`,
        );
      legend(svg, keys);
    } else {
      svg
        .selectAll("rect")
        .data(c.rows)
        .join("rect")
        .attr("x", (r) => x(r.label))
        .attr("y", (r) => y(r.value))
        .attr("width", x.bandwidth())
        .attr("height", (r) => y(0) - y(r.value))
        .attr("fill", "#dda14e")
        .attr("stroke", "white")
        .append("title")
        .text((r) => `${r.label}–${+r.label + 200} days: ${r.value} PIDs`);
    }
    label(
      svg,
      (m.l + w - m.r) / 2,
      h - 15,
      stacked
        ? "Budget change (%) · bin lower boundary"
        : "Completed construction duration (days) · 200-day bins",
    );
    label(svg, 20, (m.t + h - m.b) / 2, "Infrastructure PIDs", true);
  }
  function columns(el, c) {
    const { svg, w, h } = base(el, 1200, 250),
      m = { l: 245, r: 150, t: 25, b: 45 },
      total = d3.sum(c.rows, (r) => r.value),
      x = d3
        .scaleLinear()
        .domain([0, total])
        .range([m.l, w - m.r]),
      y = d3
        .scaleBand()
        .domain(c.rows.map((r) => r.label))
        .range([m.t, h - m.b])
        .padding(0.48);
    svg
      .append("g")
      .attr("transform", `translate(0,${h - m.b})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(4)
          .tickSize(-(h - m.t - m.b)),
      )
      .call(axis);
    svg
      .selectAll(".completion-track")
      .data(c.rows)
      .join("rect")
      .attr("x", m.l)
      .attr("y", (r) => y(r.label))
      .attr("width", w - m.r - m.l)
      .attr("height", y.bandwidth())
      .attr("rx", 4)
      .attr("fill", "#edf3f6");
    svg
      .selectAll(".completion-bar")
      .data(c.rows)
      .join("rect")
      .attr("x", m.l)
      .attr("y", (r) => y(r.label))
      .attr("width", (r) => x(r.value) - m.l)
      .attr("height", y.bandwidth())
      .attr("rx", 4)
      .attr("fill", (_, i) => (i ? "#355d78" : "#589fa1"));
    svg
      .selectAll(".completion-label")
      .data(c.rows)
      .join("text")
      .attr("x", m.l - 18)
      .attr("y", (r) => y(r.label) + y.bandwidth() / 2 + 5)
      .attr("text-anchor", "end")
      .attr("fill", ink)
      .style("font-size", "15px")
      .text((r) => r.label);
    svg
      .selectAll(".completion-count")
      .data(c.rows)
      .join("text")
      .attr("x", w - m.r + 18)
      .attr("y", (r) => y(r.label) + y.bandwidth() / 2 + 5)
      .attr("fill", ink)
      .style("font-size", "16px")
      .style("font-weight", 600)
      .text((r) => `${r.value} · ${((100 * r.value) / total).toFixed(1)}%`);
    label(
      svg,
      (m.l + w - m.r) / 2,
      h - 4,
      "Completed PIDs with comparable actual and earlier forecast dates",
    );
  }
  function trend(el, c) {
    const { svg, w, h } = base(el, 1400, 500),
      m = { l: 85, r: 100, t: 55, b: 75 },
      rows = c.rows,
      x = d3
        .scaleBand()
        .domain(rows.map((r) => r.label))
        .range([m.l, w - m.r])
        .padding(0.28),
      y = d3
        .scaleLinear()
        .domain([0, d3.max(rows, (r) => r.n) || 1])
        .nice()
        .range([h - m.b, m.t]),
      y2 = d3
        .scaleLinear()
        .domain([0, d3.max(rows, (r) => r.value) || 1])
        .nice()
        .range([h - m.b, m.t]);
    svg
      .append("g")
      .attr("transform", `translate(${m.l},0)`)
      .call(d3.axisLeft(y).ticks(6))
      .call(axis);
    svg
      .append("g")
      .attr("transform", `translate(${w - m.r},0)`)
      .call(d3.axisRight(y2).ticks(6))
      .call(axis);
    svg
      .append("g")
      .attr("transform", `translate(0,${h - m.b})`)
      .call(
        d3.axisBottom(x).tickFormat((p) => p.slice(0, 4) + "-" + p.slice(4)),
      )
      .call(axis);
    svg
      .selectAll("rect")
      .data(rows)
      .join("rect")
      .attr("x", (r) => x(r.label))
      .attr("y", (r) => y(r.n))
      .attr("height", (r) => y(0) - y(r.n))
      .attr("width", x.bandwidth())
      .attr("fill", "#dda14e")
      .attr("opacity", 0.8);
    svg
      .selectAll(".count")
      .data(rows)
      .join("text")
      .attr("x", (r) => x(r.label) + x.bandwidth() / 2)
      .attr("y", (r) => y(r.n) - 7)
      .attr("text-anchor", "middle")
      .attr("fill", ink)
      .style("font-size", "12px")
      .text((r) => d3.format(",")(r.n));
    svg
      .append("path")
      .datum(rows)
      .attr("fill", "none")
      .attr("stroke", "#346c9c")
      .attr("stroke-width", 3)
      .attr(
        "d",
        d3
          .line()
          .x((r) => x(r.label) + x.bandwidth() / 2)
          .y((r) => y2(r.value)),
      );
    svg
      .selectAll("circle")
      .data(rows)
      .join("circle")
      .attr("cx", (r) => x(r.label) + x.bandwidth() / 2)
      .attr("cy", (r) => y2(r.value))
      .attr("r", 5)
      .attr("fill", "#346c9c")
      .append("title")
      .text(
        (r) =>
          `${r.label}: ${r.n} eligible PIDs; median ${r.value.toFixed(0)} days`,
      );
    label(svg, 22, (m.t + h - m.b) / 2, "Eligible PID count · columns", true);
    label(
      svg,
      w - 15,
      (m.t + h - m.b) / 2,
      "Median estimated duration (days) · line",
      true,
    );
    label(
      svg,
      500,
      20,
      "Columns: project count     Line: median estimated duration",
    );
  }
  const short = {
    "Parks, playgrounds and outdoor recreation": "Parks / recreation",
    "Pedestrian, bicycle and public-realm networks":
      "Pedestrian / public realm",
    "Urban forestry, habitat and natural-area restoration":
      "Forestry / natural areas",
    "Sewers and storm drainage": "Sewers / drainage",
    "Bridges and transportation tunnels": "Bridges / tunnels",
    "Streets and roadways": "Streets / roadways",
    "Marine, ferry and waterfront structures": "Marine / ferry",
    "Wastewater treatment and resource recovery": "Wastewater treatment",
    "Drinking-water distribution": "Water distribution",
    "Drinking-water supply, storage, treatment and transmission":
      "Water supply / treatment",
    "Green stormwater systems and Bluebelts": "Green stormwater",
    "Flood and shoreline protection": "Flood / shoreline",
    "Combined sewer overflow—CSO—facilities": "CSO facilities",
    "Retaining walls and slope stabilization": "Retaining walls",
    "Solid-waste, recycling and composting infrastructure": "Solid waste",
    "Needs typology review": "Needs review",
  };
  function grouped(el, c) {
    const { svg, w, h } = base(el, 1500, 700),
      m = { l: 80, r: 35, t: 60, b: 195 },
      groups = [...new Set(c.rows.map((r) => r.label))],
      series = ["Design", "Procurement", "Construction"],
      x = d3
        .scaleBand()
        .domain(groups)
        .range([m.l, w - m.r])
        .padding(0.2),
      xx = d3
        .scaleBand()
        .domain(series)
        .range([0, x.bandwidth()])
        .padding(0.08),
      y = d3
        .scaleLinear()
        .domain([0, d3.max(c.rows, (r) => r.value) || 1])
        .nice()
        .range([h - m.b, m.t]);
    svg
      .append("g")
      .attr("transform", `translate(${m.l},0)`)
      .call(
        d3
          .axisLeft(y)
          .ticks(6)
          .tickSize(-(w - m.l - m.r)),
      )
      .call(axis);
    svg
      .append("g")
      .attr("transform", `translate(0,${h - m.b})`)
      .call(d3.axisBottom(x).tickFormat((t) => short[t] || t))
      .call(axis)
      .selectAll("text")
      .attr("transform", "rotate(-40)")
      .attr("text-anchor", "end")
      .attr("dx", "-.5em")
      .attr("dy", ".6em");
    svg
      .selectAll("rect")
      .data(c.rows.filter((r) => r.value != null))
      .join("rect")
      .attr("x", (r) => x(r.label) + xx(r.group))
      .attr("y", (r) => y(r.value))
      .attr("height", (r) => y(0) - y(r.value))
      .attr("width", xx.bandwidth())
      .attr("fill", (r) => phaseColor(r.group))
      .append("title")
      .text(
        (r) => `${r.label}\n${r.group}: ${r.value.toFixed(0)} days; n=${r.n}`,
      );
    svg
      .selectAll(".phase-day-value")
      .data(c.rows.filter((r) => r.value != null))
      .join("text")
      .attr("class", "phase-day-value")
      .attr("x", (r) => x(r.label) + xx(r.group) + xx.bandwidth() / 2)
      .attr("y", (r) => y(r.value) - 5)
      .attr("text-anchor", "middle")
      .attr("fill", ink)
      .style("font-size", "9px")
      .style("font-family", "Arial,sans-serif")
      .text((r) => Math.round(r.value));
    series.forEach((k, i) => {
      const g = svg
        .append("g")
        .attr("transform", `translate(${420 + i * 190},18)`);
      g.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("rx", 2)
        .attr("fill", phaseColor(k));
      g.append("text")
        .attr("x", 20)
        .attr("y", 10)
        .attr("fill", ink)
        .style("font-size", "12px")
        .text(k);
    });
    label(
      svg,
      20,
      (m.t + h - m.b) / 2,
      "Mean completed phase duration (days)",
      true,
    );
  }
  function stackedLengths(el, c) {
    const { svg, w, h } = base(
        el,
        1400,
        Math.max(480, types.length * 43 + 105),
      ),
      m = { l: 320, r: 125, t: 70, b: 65 },
      keys = ["Design", "Procurement", "Construction"],
      groups = [...new Set(c.rows.map((r) => r.label))],
      look = new Map(c.rows.map((r) => [r.label + "|" + r.group, r.value])),
      sample = new Map(c.rows.map((r) => [r.label, r.n]));
    groups.sort(
      (a, b) =>
        d3.sum(keys, (k) => look.get(b + "|" + k) || 0) -
        d3.sum(keys, (k) => look.get(a + "|" + k) || 0),
    );
    const data = groups.map((label) =>
        Object.fromEntries([
          ["label", label],
          ...keys.map((k) => [k, look.get(label + "|" + k) || 0]),
        ]),
      ),
      layers = d3.stack().keys(keys)(data),
      max = d3.max(data, (r) => d3.sum(keys, (k) => r[k])) || 1,
      x = d3
        .scaleLinear()
        .domain([0, max])
        .nice()
        .range([m.l, w - m.r]),
      y = d3
        .scaleBand()
        .domain(groups)
        .range([m.t, h - m.b])
        .padding(0.28);
    svg
      .append("g")
      .attr("transform", `translate(0,${h - m.b})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(6)
          .tickSize(-(h - m.t - m.b)),
      )
      .call(axis);
    svg
      .append("g")
      .attr("transform", `translate(${m.l},0)`)
      .call(d3.axisLeft(y).tickSize(0))
      .call(axis)
      .selectAll("text")
      .call((s) => wrap(s));
    svg
      .selectAll(".length-stack")
      .data(layers)
      .join("g")
      .attr("class", "length-stack")
      .attr("fill", (l) => phaseColor(l.key))
      .selectAll("rect")
      .data((l) =>
        l.map((v) => ({
          v,
          key: l.key,
          label: v.data.label,
          value: v[1] - v[0],
        })),
      )
      .join("rect")
      .attr("x", (r) => x(r.v[0]))
      .attr("y", (r) => y(r.label))
      .attr("width", (r) => x(r.v[1]) - x(r.v[0]))
      .attr("height", y.bandwidth())
      .attr("stroke", "white")
      .append("title")
      .text(
        (r) =>
          `${r.label}\n${r.key}: ${r.value.toFixed(0)} mean days\nCommon sample: ${sample.get(r.label)} PIDs`,
      );
    svg
      .selectAll(".phase-segment-value")
      .data(
        layers.flatMap((l) =>
          l.map((v) => ({ v, label: v.data.label, value: v[1] - v[0] })),
        ),
      )
      .join("text")
      .attr("class", "phase-segment-value")
      .attr("x", (r) => (x(r.v[0]) + x(r.v[1])) / 2)
      .attr("y", (r) => y(r.label) + y.bandwidth() / 2 + 4)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .style("font-size", "10px")
      .style("font-weight", 600)
      .style("font-family", "Arial,sans-serif")
      .text((r) => Math.round(r.value));
    svg
      .selectAll(".length-n")
      .data(groups)
      .join("text")
      .attr("x", (t) => x(d3.sum(keys, (k) => look.get(t + "|" + k) || 0)) + 8)
      .attr("y", (t) => y(t) + y.bandwidth() / 2 + 4)
      .attr("fill", ink)
      .style("font-size", "12px")
      .text((t) =>
        sample.get(t) ? "n=" + sample.get(t) : "No complete three-phase sample",
      );
    label(
      svg,
      (m.l + w - m.r) / 2,
      h - 12,
      "Sum of mean phase lengths (days) · not elapsed project time",
    );
    keys.forEach((k, i) => {
      const g = svg
        .append("g")
        .attr("transform", `translate(${445 + i * 190},18)`);
      g.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("rx", 2)
        .attr("fill", phaseColor(k));
      g.append("text")
        .attr("x", 20)
        .attr("y", 10)
        .attr("fill", ink)
        .style("font-size", "12px")
        .text(k);
    });
  }
  return {
    scatter,
    meanSpend,
    heat,
    histogram,
    columns,
    trend,
    grouped,
    stackedLengths,
  };
})();

window.drawTypologySpendCount = function (el, c) {
  const rows = [...c.rows].sort((a, b) => b.value - a.value),
    w = 1500,
    h = rows.length * 51 + 100,
    m = { l: 325, r: 350, t: 18, b: 65 },
    svg = d3
      .select(el)
      .html("")
      .append("svg")
      .attr("viewBox", `0 0 ${w} ${h}`)
      .attr("role", "img")
      .attr(
        "aria-label",
        "Infrastructure PID counts with recorded spending for the eligible financial subset",
      ),
    x = d3
      .scaleLinear()
      .domain([0, d3.max(rows, (r) => r.value) || 1])
      .nice()
      .range([m.l, w - m.r]),
    y = d3
      .scaleBand()
      .domain(rows.map((r) => r.label))
      .range([m.t, h - m.b])
      .padding(0.32),
    cash = (v) =>
      "$" +
      (Math.abs(v) >= 1e9
        ? (v / 1e9).toFixed(2) + "bn"
        : Math.abs(v) >= 1e6
          ? (v / 1e6).toFixed(1) + "m"
          : Math.abs(v) >= 1000
            ? (v / 1000).toFixed(0) + "k"
            : d3.format(",")(v));
  svg
    .append("g")
    .attr("transform", `translate(0,${h - m.b})`)
    .call(
      d3
        .axisBottom(x)
        .ticks(5)
        .tickSize(-(h - m.t - m.b)),
    )
    .selectAll("text")
    .style("font-size", "12px");
  svg
    .selectAll(".countbar")
    .data(rows)
    .join("rect")
    .attr("x", m.l)
    .attr("y", (r) => y(r.label))
    .attr("width", (r) => x(r.value) - m.l)
    .attr("height", y.bandwidth())
    .attr("rx", 4)
    .attr("fill", "#589fa1");
  const names = svg
    .selectAll(".type-name")
    .data(rows)
    .join("text")
    .attr("x", m.l - 12)
    .attr("y", (r) => y(r.label) + y.bandwidth() / 2)
    .attr("text-anchor", "end")
    .attr("fill", "#253d52")
    .style("font-size", "13px");
  names.each(function (r) {
    const t = d3.select(this),
      words = r.label.split(/\s+/);
    let lines = [],
      line = "";
    for (const word of words) {
      if ((line + " " + word).length > 34 && line) {
        lines.push(line);
        line = word;
      } else line += (line ? " " : "") + word;
    }
    if (line) lines.push(line);
    lines.forEach((line, i) =>
      t
        .append("tspan")
        .attr("x", m.l - 12)
        .attr("dy", i ? "1.1em" : `${0.34 - (lines.length - 1) * 0.55}em`)
        .text(line),
    );
  });
  svg
    .selectAll(".count-spend")
    .data(rows)
    .join("text")
    .attr("class", "count-spend")
    .attr("x", (r) => x(r.value) + 10)
    .attr("y", (r) => y(r.label) + y.bandwidth() / 2 - 2)
    .attr("fill", "#253d52")
    .style("font-size", "13px")
    .style("font-weight", 600)
    .text(
      (r) =>
        `${r.value} (${r.spending_pids ? cash(r.recorded_spend) + " spent" : "no financial data"})`,
    );
  svg
    .selectAll(".financial-coverage")
    .data(rows)
    .join("text")
    .attr("class", "financial-coverage")
    .attr("x", (r) => x(r.value) + 10)
    .attr("y", (r) => y(r.label) + y.bandwidth() / 2 + 14)
    .attr("fill", "#637b8c")
    .style("font-size", "11px")
    .text((r) => `Spending coverage: ${r.spending_pids} of ${r.value} PIDs`);
  svg
    .append("text")
    .attr("x", (m.l + w - m.r) / 2)
    .attr("y", h - 14)
    .attr("text-anchor", "middle")
    .attr("fill", "#253d52")
    .style("font-size", "13px")
    .text(
      "Project count · brackets show recorded spend to date for eligible PIDs",
    );
};

window.drawProjectDelay = function (el, c) {
  const root = d3.select(el).html(""),
    rows = c.rows,
    w = 1250,
    h = rows.length * 49 + 85,
    m = { l: 325, r: 200, t: 15, b: 50 };
  const svg = root
      .append("svg")
      .attr("viewBox", `0 0 ${w} ${h}`)
      .attr("role", "img")
      .attr("aria-label", c.title),
    x = d3
      .scaleLinear()
      .domain([0, d3.max(rows, (r) => r.value) || 1])
      .nice()
      .range([m.l, w - m.r]),
    y = d3
      .scaleBand()
      .domain(rows.map((r) => r.label))
      .range([m.t, h - m.b])
      .padding(0.3);
  svg
    .append("g")
    .attr("transform", `translate(0,${h - m.b})`)
    .call(d3.axisBottom(x).ticks(5));
  svg
    .selectAll(".delay-bar")
    .data(rows)
    .join("rect")
    .attr("x", m.l)
    .attr("y", (r) => y(r.label))
    .attr("height", y.bandwidth())
    .attr("width", (r) => x(r.value) - x(0))
    .attr("fill", "#589fa1")
    .attr("rx", 3)
    .append("title")
    .text(
      (r) =>
        `${r.label}: ${r.value.toFixed(1)} average days; ${r.n} PIDs; ${r.later} with a later forecast`,
    );
  svg
    .selectAll(".delay-label")
    .data(rows)
    .join("text")
    .attr("x", m.l - 12)
    .attr("y", (r) => y(r.label) + y.bandwidth() / 2 + 4)
    .attr("text-anchor", "end")
    .attr("fill", "#253d52")
    .style("font-family", "Arial, sans-serif")
    .style("font-size", "12px")
    .text((r) => r.label)
    .call(window.NYCWrapLabels);
  svg
    .selectAll(".delay-value")
    .data(rows)
    .join("text")
    .attr("x", (r) => x(r.value) + 10)
    .attr("y", (r) => y(r.label) + y.bandwidth() / 2 + 4)
    .attr("fill", "#253d52")
    .style("font-family", "Arial, sans-serif")
    .style("font-size", "13px")
    .text((r) => `${r.value.toFixed(1)} days · ${r.n} PIDs`);
  svg
    .append("text")
    .attr("x", (m.l + w - m.r) / 2)
    .attr("y", h - 7)
    .attr("text-anchor", "middle")
    .attr("fill", "#536c7e")
    .style("font-family", "Arial, sans-serif")
    .style("font-size", "12px")
    .text(c.axis);
};

window.drawExpandedSchedule = function (el, c) {
  const root = d3.select(el).html(""),
    rows = c.rows,
    n = 1004,
    w = 1200,
    h = 245,
    m = { l: 245, r: 180, t: 22, b: 45 };
  const svg = root
    .append("svg")
    .attr("viewBox", `0 0 ${w} ${h}`)
    .attr("role", "img")
    .attr(
      "aria-label",
      "698 of 1,004 projects have a later forecast completion date; 306 are unchanged or earlier",
    );
  const x = d3
      .scaleLinear()
      .domain([0, n])
      .range([m.l, w - m.r]),
    y = d3
      .scaleBand()
      .domain(rows.map((r) => r.label))
      .range([m.t, h - m.b])
      .padding(0.48);
  svg
    .append("g")
    .attr("transform", `translate(0,${h - m.b})`)
    .call(
      d3
        .axisBottom(x)
        .ticks(5)
        .tickSize(-(h - m.t - m.b)),
    )
    .selectAll("text")
    .style("font-family", "Arial, sans-serif")
    .style("font-size", "12px");
  svg
    .selectAll(".forecast-bar")
    .data(rows)
    .join("rect")
    .attr("x", m.l)
    .attr("y", (r) => y(r.label))
    .attr("width", (r) => x(r.value) - x(0))
    .attr("height", y.bandwidth())
    .attr("rx", 4)
    .attr("fill", (r, i) => (i === 0 ? "#589fa1" : "#355d78"))
    .append("title")
    .text(
      (r) =>
        `${r.label}: ${r.value} projects (${((r.value / n) * 100).toFixed(1)}%)`,
    );
  svg
    .selectAll(".forecast-label")
    .data(rows)
    .join("text")
    .attr("x", m.l - 15)
    .attr("y", (r) => y(r.label) + y.bandwidth() / 2 + 5)
    .attr("text-anchor", "end")
    .attr("fill", "#253d52")
    .style("font-family", "Arial, sans-serif")
    .style("font-size", "14px")
    .text((r) => r.label);
  svg
    .selectAll(".forecast-count")
    .data(rows)
    .join("text")
    .attr("x", (r) => x(r.value) + 14)
    .attr("y", (r) => y(r.label) + y.bandwidth() / 2 + 5)
    .attr("fill", "#253d52")
    .style("font-family", "Arial, sans-serif")
    .style("font-size", "16px")
    .style("font-weight", 600)
    .text(
      (r) =>
        `${r.value.toLocaleString()} · ${((100 * r.value) / n).toFixed(1)}%`,
    );
  svg
    .append("text")
    .attr("x", (m.l + w - m.r) / 2)
    .attr("y", h - 5)
    .attr("text-anchor", "middle")
    .attr("fill", "#536c7e")
    .style("font-family", "Arial, sans-serif")
    .style("font-size", "12px")
    .text(
      "Infrastructure projects with comparable earlier and latest forecast dates · n = 1,004",
    );
  root
    .append("p")
    .attr("class", "schedule-method-change")
    .html(
      "<strong>Method change from last year:</strong> last year called the longest-duration quarter “delayed”. This chart measures whether expected completion has moved later than the first recorded forecast, so the results are not directly comparable. Separately, 97 of 314 completed projects (30.9%) finished later than their earlier forecast. Among those 97, the median gap was 182 days (range: 1–858 days); 28 exceeded a year. The first recorded forecast may already include earlier delays.",
    );
};
(() => {
  const D = JSON.parse(document.getElementById("descriptive-data").textContent),
    V = window.NYCviz;
  let current = "latest";
  const mainPhases = [
      "Pre-Design",
      "Design",
      "Procurement",
      "Construction",
      "Close-out",
    ],
    boroughs = ["Queens", "Brooklyn", "Manhattan", "Bronx", "Staten Island"];
  function exactReasonHeat(el, rows) {
    const root = d3.select(el).html("").classed("exact-reason-heat", true),
      types = [...new Set(rows.map((r) => r.label))],
      reasons = [...new Set(rows.map((r) => r.group))],
      max = d3.max(rows, (r) => r.value) || 1,
      fill = d3.scaleSequential(
        [0, max],
        d3.interpolateRgbBasis(["#f2f6f8", "#b9d9df", "#438e9e", "#1a526b"]),
      ),
      lookup = new Map(rows.map((r) => [r.label + "|" + r.group, r.value]));
    const table = root
        .append("table")
        .attr("class", "exact-reason-table")
        .attr(
          "aria-label",
          "Individual recorded delay reasons by infrastructure type",
        ),
      header = table.append("thead").append("tr");
    header.append("th").attr("scope", "col").text("Infrastructure type");
    reasons.forEach((r) => header.append("th").attr("scope", "col").text(r));
    const body = table.append("tbody");
    types.forEach((t) => {
      const tr = body.append("tr");
      tr.append("th").attr("scope", "row").text(t);
      reasons.forEach((r) => {
        const value = lookup.get(t + "|" + r) || 0;
        tr.append("td")
          .style("background-color", fill(value))
          .style("color", value > max * 0.6 ? "white" : "#173e4b")
          .text(value)
          .append("title")
          .text(t + " · " + r + ": " + value + " projects");
      });
    });
    root
      .append("p")
      .attr("class", "small")
      .text("Darker cells = more projects with this recorded reason.");
  }

  function grouped(el, rows) {
    const root = d3.select(el).html(""),
      w = 1150,
      h = 500,
      m = { l: 70, r: 25, t: 65, b: 80 };
    const svg = root
      .append("svg")
      .attr("viewBox", `0 0 ${w} ${h}`)
      .attr("role", "img");
    const groups = [...new Set(rows.map((r) => r.label))],
      series = [...new Set(rows.map((r) => r.group))],
      x = d3
        .scaleBand()
        .domain(groups)
        .range([m.l, w - m.r])
        .padding(0.18),
      sub = d3
        .scaleBand()
        .domain(series)
        .range([0, x.bandwidth()])
        .padding(0.06),
      y = d3
        .scaleLinear()
        .domain([0, d3.max(rows, (r) => r.value) || 1])
        .nice()
        .range([h - m.b, m.t]);
    const palette = [
        "#a7b6c8",
        "#346c9c",
        "#27a3ab",
        "#547f9b",
        "#176c69",
        "#315c52",
        "#aeb8c3",
      ],
      color = d3
        .scaleOrdinal()
        .domain([
          "Pre-Design",
          "Design",
          "Procurement",
          "Construction",
          "Close-out",
          "Completed",
          "Other / unknown",
        ])
        .range(palette);
    svg
      .append("g")
      .attr("transform", `translate(0,${h - m.b})`)
      .call(
        d3
          .axisBottom(x)
          .tickFormat((s) =>
            /^\d{6}$/.test(s) ? s.slice(0, 4) + "-" + s.slice(4) : s,
          ),
      )
      .selectAll("text")
      .style("font-size", "12px");
    svg
      .append("g")
      .attr("transform", `translate(${m.l},0)`)
      .call(d3.axisLeft(y).ticks(6));
    svg
      .selectAll("rect")
      .data(rows)
      .join("rect")
      .attr("x", (r) => x(r.label) + sub(r.group))
      .attr("y", (r) => y(r.value))
      .attr("width", sub.bandwidth())
      .attr("height", (r) => y(0) - y(r.value))
      .attr("fill", (r) => color(r.group))
      .append("title")
      .text((r) => `${r.label} · ${r.group}: ${r.value} PIDs`);
    svg
      .selectAll(".count")
      .data(rows)
      .join("text")
      .attr("x", (r) => x(r.label) + sub(r.group) + sub.bandwidth() / 2)
      .attr("y", (r) => y(r.value) - 4)
      .attr("text-anchor", "middle")
      .style("font-size", groups.length > 7 ? "10px" : "12px")
      .text((r) => r.value || "");
    series.forEach((s, i) => {
      let g = svg
        .append("g")
        .attr("transform", `translate(${m.l + i * 145},20)`);
      g.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", color(s));
      g.append("text")
        .attr("x", 18)
        .attr("y", 10)
        .style("font-size", "12px")
        .text(s);
    });
    svg
      .append("text")
      .attr("x", m.l)
      .attr("y", h - 15)
      .style("font-size", "12px")
      .text("");
  }
  function renderCard(root, c) {
    const article = root
      .append("article")
      .attr("class", "card predictive-card")
      .attr("id", "desc-" + c.id);
    article.append("h2").text(c.title);
    const id = "desc-chart-" + c.id;
    article.append("div").attr("id", id).attr("class", "pred-chart");
    const controls = article.append("div").attr("class", "desc-local-controls");
    let expanded = false,
      extraStates = false,
      reasonBasis = "history";
    let sorted = [...c.rows];
    if (
      c.kind === "bar" &&
      ["sponsor", "borough", "reasons", "types"].includes(c.id)
    )
      sorted.sort(
        (a, b) => b.value - a.value || d3.ascending(a.label, b.label),
      );
    const hidden = (r) =>
      c.id === "sponsor"
        ? r.value <= 5 ||
          r.label === "No schedule observation" ||
          r.label === "Unknown"
        : c.id === "borough"
          ? ["Multiple", "Unknown"].includes(r.label)
          : false;
    function draw() {
      let rows = sorted;
      if (c.id === "sponsor" || c.id === "borough")
        rows = expanded ? sorted : sorted.filter((r) => !hidden(r));
      if (c.id === "reasons")
        rows = reasonBasis === "history" ? c.rows : c.latest_rows;
      if (c.kind === "schedule-status-expanded")
        window.drawExpandedSchedule("#" + id, c);
      else if (c.kind === "finance-scatter")
        NYCAnalysisCharts.scatter("#" + id, c);
      else if (c.kind === "mean-spend")
        NYCAnalysisCharts.meanSpend("#" + id, c);
      else if (c.kind === "spend-heat") NYCAnalysisCharts.heat("#" + id, c);
      else if (c.kind === "budget-histogram")
        NYCAnalysisCharts.histogram("#" + id, c, true);
      else if (c.kind === "schedule-columns")
        NYCAnalysisCharts.columns("#" + id, c);
      else if (c.kind === "schedule-trend")
        NYCAnalysisCharts.trend("#" + id, c);
      else if (c.kind === "schedule-histogram")
        NYCAnalysisCharts.histogram("#" + id, c);
      else if (c.kind === "schedule-forecast")
        window.drawProjectDelay("#" + id, c);
      else if (c.kind === "schedule-grouped")
        NYCAnalysisCharts.grouped("#" + id, c);
      else if (c.kind === "schedule-stacked")
        NYCAnalysisCharts.stackedLengths("#" + id, c);
      else if (c.id === "types") window.drawTypologySpendCount("#" + id, c);
      else if (c.kind === "stacked-agency")
        NYCOverviewStacks.horizontal("#" + id, rows, "agency");
      else if (c.kind === "stacked-phase")
        NYCOverviewStacks.horizontal("#" + id, rows, "phase");
      else if (c.kind === "stacked-period")
        NYCOverviewStacks.vertical("#" + id, rows);
      else if (c.kind === "grouped") {
        rows = c.rows.filter(
          (r) =>
            (extraStates || mainPhases.includes(r.group)) &&
            (c.id !== "phase-borough" ||
              expanded ||
              boroughs.includes(r.label)),
        );
        if (c.id === "phase-borough") {
          const order = new Map(boroughs.map((b, i) => [b, i])),
            phases = [...mainPhases, "Completed", "Other / unknown"];
          rows.sort(
            (a, b) =>
              (order.get(a.label) ?? 99) - (order.get(b.label) ?? 99) ||
              phases.indexOf(a.group) - phases.indexOf(b.group),
          );
        }
        grouped("#" + id, rows);
      } else if (c.id === "type-reason") exactReasonHeat("#" + id, rows);
      else if (c.kind === "heat") V.heat("#" + id, rows, c.axis);
      else if (c.kind === "scatter")
        V.scatter("#" + id, rows, c.axis[0], c.axis[1]);
      else if (c.kind === "box") {
        const p = article.select("select.phase-choice").property("value");
        V.box(
          "#" + id,
          rows
            .filter((r) => r.label.endsWith(" · " + p))
            .map((r) => ({ ...r, label: r.label.split(" · ")[0] })),
        );
      } else V.bar("#" + id, rows, c.axis);
      if (c.id === "types")
        d3.select("#" + id)
          .selectAll("rect")
          .filter((r) => r.label === "Needs typology review")
          .attr("fill", "#c58a3c");
      if (c.id === "reasons") {
        let a =
          reasonBasis === "history" ? c.history_coverage : c.latest_coverage;
        article
          .select(".reason-coverage")
          .text(
            `${a.with_reason.toLocaleString()} PIDs with a recorded reason · ${a.without_reason.toLocaleString()} without one in this ${reasonBasis === "history" ? "history" : "snapshot"} view${a.no_history ? " (including " + a.no_history + " without a schedule observation)" : ""}. A PID can have several recorded reasons, so cause counts are not additive.`,
          );
      }
    }
    if (c.id === "sponsor" || c.id === "borough") {
      const n = sorted.filter(hidden).length;
      if (n)
        controls
          .append("button")
          .attr("type", "button")
          .attr("class", "desc-expand")
          .attr("aria-expanded", "false")
          .text(
            c.id === "sponsor"
              ? `+ Show ${n} smaller / unrecorded groups`
              : "+ Show multiple-borough and unknown locations",
          )
          .on("click", function () {
            expanded = !expanded;
            d3.select(this)
              .attr("aria-expanded", String(expanded))
              .text(
                expanded
                  ? "− Show fewer groups"
                  : c.id === "sponsor"
                    ? `+ Show ${n} smaller / unrecorded groups`
                    : "+ Show multiple-borough and unknown locations",
              );
            draw();
          });
    }
    if (c.id === "reasons") {
      article.append("p").attr("class", "reason-coverage small");
    }
    if (c.kind === "box") {
      const l = controls.append("label").text("Completed phase "),
        select = l
          .append("select")
          .attr("class", "phase-choice")
          .attr("aria-label", "Completed phase distribution");
      select
        .selectAll("option")
        .data(["construction", "design", "procurement"])
        .join("option")
        .attr("value", (r) => r)
        .text((r) => r[0].toUpperCase() + r.slice(1));
      select.on("change", draw);
    }
    const explanation =
      c.id === "reasons"
        ? c.insight.replace(
            /^.*?have at least one reason recorded in their available history\.\s*/,
            "",
          )
        : c.insight;
    article
      .append("div")
      .attr("class", "desc-commentary")
      .html(c.narrative || explanation);
    // Dense cross-tabs and point plots retain an accessible table; labelled count bars do not repeat it.
    if (
      [
        "heat",
        "scatter",
        "box",
        "stacked-agency",
        "stacked-phase",
        "stacked-period",
        "finance-scatter",
        "spend-heat",
        "budget-histogram",
        "schedule-trend",
        "schedule-histogram",
        "schedule-forecast",
        "schedule-grouped",
        "schedule-stacked",
      ].includes(c.kind) &&
      !["duration-distribution", "forecast-type"].includes(c.id)
    ) {
      const details = article.append("details");
      details
        .append("summary")
        .text(
          ["scatter", "finance-scatter"].includes(c.kind)
            ? "Explore the plotted projects"
            : c.kind === "box"
              ? "Exact distribution values"
              : c.id === "duration-period"
                ? "View figures behind the chart"
                : "Open the comparison table",
        );
      details
        .append("div")
        .attr("class", "table-container")
        .attr("id", "desc-table-" + c.id);
      const renamed = c.rows
        .map((r) =>
          c.id === "duration-period"
            ? {
                ...r,
                label:
                  String(r.label).slice(0, 4) + "-" + String(r.label).slice(4),
              }
            : r,
        )
        .map((r) =>
          Object.fromEntries(
            Object.entries(r)
              .filter(([k]) => k !== "source_label")
              .map(([k, v]) => [
                {
                  label: ["scatter", "finance-scatter"].includes(c.kind)
                    ? "PID"
                    : c.id === "duration-period"
                      ? "Reporting period"
                      : "Group",
                  group: "Category",
                  value:
                    c.kind === "heat"
                      ? c.axis
                      : c.id === "duration-period"
                        ? "Median estimated duration (days)"
                        : "Value",
                  n:
                    c.id === "duration-period"
                      ? "Projects included"
                      : "Eligible PIDs",
                  x: Array.isArray(c.axis) ? c.axis[0] : "X",
                  y: Array.isArray(c.axis) ? c.axis[1] : "Y",
                  low: "Minimum days",
                  high: "Maximum days",
                  q1: "25th percentile",
                  q3: "75th percentile",
                  median: "Median days",
                }[k] || k,
                v,
              ]),
          ),
        );
      V.table("#desc-table-" + c.id, renamed);
    }
    const note = article.append("details").attr("class", "pred-note");
    note.append("summary").text("Data points and calculations");
    note.append("p").text("Data points: " + c.fields + ". " + c.calculation);
    draw();
    applyChartPresentation(article.node(), c);
    if (c.id === "reasons") {
      const coverage = article.node().querySelector(".reason-coverage");
      if (coverage) note.node().appendChild(coverage);
    }
    {
      note
        .select("summary")
        .text("Data points, calculations and detailed figures");
      const standalone = article
        .node()
        .querySelector(":scope > details:not(.pred-note)");
      if (standalone) {
        const table = standalone.querySelector(".table-container");
        if (table) {
          note.append("h3").text("Detailed figures");
          note.node().appendChild(table);
        }
        standalone.remove();
      }
      const method = article.node().querySelector(".schedule-method-change");
      if (method) note.node().appendChild(method);
    }
  }
  function update() {
    const view = D.datasets[current];
    const text = `${view.n.toLocaleString()} Infrastructure PIDs · ${view.observed.toLocaleString()} with a schedule observation · ${current === "latest" ? "latest available record per PID across ten reporting periods" : current.slice(0, 4) + "-" + current.slice(4)}.`;
    document
      .querySelectorAll(".desc-view-status")
      .forEach((e) => (e.textContent = text));
    document
      .querySelectorAll(".desc-period-select")
      .forEach((e) => (e.value = current));
    const stats = document.getElementById("overview-facts");
    if (stats)
      stats.innerHTML = [
        ["Infrastructure PIDs", view.n.toLocaleString()],
        ["Recorded sponsor agencies", view.sponsor_agencies],
        ["Asset typologies", 15],
        ["Reporting periods", 10],
      ]
        .map(([t, v]) => `<div><strong>${v}</strong><span>${t}</span></div>`)
        .join("");
    for (const [id, cards] of [
      ["desc-charts", view.cards.slice(0, 10)],
      ["budget-desc-charts", view.cards.slice(10, 15)],
      ["schedule-desc-charts", view.cards.slice(15)],
    ]) {
      const root = d3.select("#" + id);
      root.html("");
      cards.forEach((c) => {
        if (c.id === "types")
          root
            .append("section")
            .attr("class", "typology-deep-dive")
            .append("h2")
            .text("Typology Deep Dive");
        renderCard(root, c);
      });
    }
  }
  function init() {
    document.querySelectorAll(".desc-period-select").forEach((e) => {
      e.innerHTML =
        '<option value="latest">All periods · latest available record per PID</option>' +
        D.periods
          .map(
            (p) =>
              `<option value="${p}">${p.slice(0, 4)}-${p.slice(4)}</option>`,
          )
          .join("");
      e.addEventListener("change", () => {
        current = e.value;
        update();
      });
    });
    update();
  }
  window.renderDescriptive = () => {};
  init();
})();
