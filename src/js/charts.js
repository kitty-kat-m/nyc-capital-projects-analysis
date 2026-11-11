window.NYCviz = (() => {
  const teal = "#35877f",
    navy = "#315c72",
    gold = "#c69551",
    fmt = (v) =>
      v == null
        ? "—"
        : typeof v === "number"
          ? d3.format(",.2~f")(v)
          : String(v);
  function wrap(sel) {
    sel.each(function () {
      const t = d3.select(this),
        words = t.text().split(/\s+/),
        lines = [];
      let line = "";
      for (const w of words) {
        if ((line + " " + w).length > 34 && line) {
          lines.push(line);
          line = w;
        } else line += (line ? " " : "") + w;
      }
      if (line) lines.push(line);
      const x = t.attr("x") || -9;
      t.text("");
      lines.forEach((l, i) =>
        t
          .append("tspan")
          .attr("x", x)
          .attr(
            "dy",
            i === 0 ? `${-(lines.length - 1) * 0.55 + 0.32}em` : "1.1em",
          )
          .text(l),
      );
    });
  }
  function table(el, rows, cols) {
    const root = d3.select(el);
    root.html("");
    if (!rows.length) {
      root.append("p").text("No eligible observations.");
      return;
    }
    cols = cols || Object.keys(rows[0]);
    let order = 1;
    const t = root.append("table");
    const body = t.append("tbody");
    const draw = (r) => {
      body.selectAll("tr").remove();
      body
        .selectAll("tr")
        .data(r)
        .join("tr")
        .selectAll("td")
        .data((d) => cols.map((k) => d[k]))
        .join("td")
        .text(fmt);
    };
    t.append("thead")
      .append("tr")
      .selectAll("th")
      .data(cols)
      .join("th")
      .attr("scope", "col")
      .attr("tabindex", 0)
      .text((d) => d + " ↕")
      .on("click", (_, k) => {
        order *= -1;
        draw([...rows].sort((a, b) => order * d3.ascending(a[k], b[k])));
      })
      .on("keydown", function (e) {
        if (e.key === "Enter") this.click();
      });
    draw(rows);
  }
  function base(el, h = 350, left = 70) {
    const root = d3.select(el);
    root.html("");
    const w = 1100;
    const svg = root
      .append("svg")
      .attr("viewBox", `0 0 ${w} ${h}`)
      .attr("role", "img");
    return { svg, w, h, left, right: 70, top: 35, bottom: 55 };
  }
  function tip(s, selection, fn) {
    selection.append("title").text(fn);
  }
  function bar(el, rows, axis = "Projects", percent = false) {
    let b = base(el, Math.max(200, rows.length * 46 + 95), 285),
      { svg, w, h, left, right, top, bottom } = b;
    let lo = Math.min(0, d3.min(rows, (d) => d.value) || 0),
      hi = percent ? 1 : Math.max(0, d3.max(rows, (d) => d.value) || 0);
    if (lo === 0 && hi === 0) hi = 1;
    const x = d3
        .scaleLinear()
        .domain([lo, hi])
        .nice()
        .range([left, w - right]),
      y = d3
        .scaleBand()
        .domain(rows.map((d) => d.label))
        .range([top, h - bottom])
        .padding(0.28);
    svg
      .append("g")
      .attr("transform", `translate(0,${h - bottom})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(5)
          .tickFormat(percent ? d3.format(".0%") : d3.format("~s")),
      );
    svg
      .append("g")
      .attr("transform", `translate(${left},0)`)
      .call(d3.axisLeft(y).tickSize(0))
      .selectAll("text")
      .style("font-size", "11px")
      .call(wrap);
    const rect = svg
      .selectAll("rect")
      .data(rows.filter((d) => d.value != null))
      .join("rect")
      .attr("x", (d) => x(Math.min(0, d.value)))
      .attr("y", (d) => y(d.label))
      .attr("width", (d) => Math.abs(x(d.value) - x(0)))
      .attr("height", y.bandwidth())
      .attr("fill", (d) => (d.value < 0 ? "#71899e" : teal))
      .attr("rx", 3);
    tip(
      svg,
      rect,
      (d) => d.label + ": " + fmt(d.value) + (d.n != null ? " · n=" + d.n : ""),
    );
    svg
      .selectAll(".value")
      .data(rows)
      .join("text")
      .attr("x", (d) => x(d.value ?? 0) + 6)
      .attr("y", (d) => y(d.label) + y.bandwidth() / 2 + 4)
      .style("font-size", "12px")
      .text((d) =>
        d.value == null
          ? "No data"
          : percent
            ? d3.format(".1%")(d.value)
            : fmt(d.value),
      );
    svg
      .append("text")
      .attr("x", (left + w - right) / 2)
      .attr("y", h - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text(axis);
  }
  function heat(el, rows, unit = "Projects") {
    const ys = [...new Set(rows.map((d) => d.label))],
      xs = [...new Set(rows.map((d) => d.group))];
    const { svg, w, h, left, right, top, bottom } = base(
      el,
      Math.max(250, ys.length * 48 + 170),
      285,
    );
    const x = d3
        .scaleBand()
        .domain(xs)
        .range([left, w - right])
        .padding(0.035),
      y = d3
        .scaleBand()
        .domain(ys)
        .range([top, h - bottom - 65])
        .padding(0.06);
    const vals = rows.filter((d) => d.value != null).map((d) => d.value);
    const max = d3.max(vals) || 1,
      min = Math.min(0, d3.min(vals) || 0);
    let color =
      min < 0
        ? d3.scaleDiverging(
            [-Math.max(max, -min), 0, Math.max(max, -min)],
            d3.interpolateBrBG,
          )
        : d3.scaleSequential(
            [0, max],
            d3.interpolateRgbBasis([
              "#f2f6f8",
              "#b9d9df",
              "#438e9e",
              "#1a526b",
            ]),
          );
    svg
      .append("g")
      .attr("transform", `translate(${left},0)`)
      .call(d3.axisLeft(y).tickSize(0))
      .selectAll("text")
      .style("font-size", "10px")
      .call(wrap);
    svg
      .append("g")
      .attr("transform", `translate(0,${h - bottom - 65})`)
      .call(d3.axisBottom(x).tickSize(0))
      .selectAll("text")
      .attr("transform", "rotate(-30)")
      .style("text-anchor", "end")
      .style("font-size", "10px");
    const r = svg
      .selectAll("rect")
      .data(rows)
      .join("rect")
      .attr("x", (d) => x(d.group))
      .attr("y", (d) => y(d.label))
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .attr("fill", (d) => (d.value == null ? "#eef1f2" : color(d.value)));
    tip(
      svg,
      r,
      (d) =>
        `${d.label} · ${d.group}: ${fmt(d.value)} ${unit}${d.n != null ? " · n=" + d.n : ""}`,
    );
    if (xs.length <= 12)
      svg
        .selectAll(".cellval")
        .data(rows)
        .join("text")
        .attr("x", (d) => x(d.group) + x.bandwidth() / 2)
        .attr("y", (d) => y(d.label) + y.bandwidth() / 2 + 4)
        .attr("text-anchor", "middle")
        .style("font-size", "10px")
        .style("fill", (d) =>
          d.value != null && d.value > max * 0.6 ? "white" : "#173e4b",
        )
        .text((d) => (d.value == null ? "—" : d3.format(",.0f")(d.value)));
    svg
      .append("text")
      .attr("x", left)
      .attr("y", h - 6)
      .style("font-size", "11px")
      .text(`${unit} · darker = higher; grey = no eligible observations`);
  }
  function scatter(
    el,
    rows,
    xlabel,
    ylabel,
    { diagonal = false, percent = false } = {},
  ) {
    let { svg, w, h, left, right, top, bottom } = base(el, 420, 85);
    const ex = d3.extent(rows, (d) => d.x),
      ey = d3.extent(rows, (d) => d.y);
    let x = d3
        .scaleLinear()
        .domain(
          percent ? [0, 1] : [Math.min(0, ex[0] || 0), Math.max(1, ex[1] || 0)],
        )
        .nice()
        .range([left, w - right]),
      y = d3
        .scaleLinear()
        .domain(
          percent ? [0, 1] : [Math.min(0, ey[0] || 0), Math.max(1, ey[1] || 0)],
        )
        .nice()
        .range([h - bottom, top]);
    const f = percent ? d3.format(".0%") : d3.format("~s");
    svg
      .append("g")
      .attr("transform", `translate(0,${h - bottom})`)
      .call(d3.axisBottom(x).ticks(7).tickFormat(f));
    svg
      .append("g")
      .attr("transform", `translate(${left},0)`)
      .call(d3.axisLeft(y).ticks(6).tickFormat(f));
    if (diagonal)
      svg
        .append("line")
        .attr("x1", x(0))
        .attr("y1", y(0))
        .attr("x2", x(1))
        .attr("y2", y(1))
        .attr("stroke", "#9cadb5")
        .attr("stroke-dasharray", "5 4");
    let col = d3.scaleOrdinal(d3.schemeTableau10);
    const circles = svg
      .selectAll("circle")
      .data(rows)
      .join("circle")
      .attr("cx", (d) => x(d.x))
      .attr("cy", (d) => y(d.y))
      .attr("r", (d) => (d.n ? Math.max(5, Math.sqrt(d.n) * 1.2) : 4))
      .attr("fill", (d) => col(d.group || "All"))
      .attr("opacity", 0.55)
      .attr("stroke", "white");
    tip(
      svg,
      circles,
      (d) =>
        `${d.label || ""} · ${d.group || ""}\n${xlabel}: ${fmt(d.x)}\n${ylabel}: ${fmt(d.y)}${d.n ? "\nn=" + d.n : ""}`,
    );
    svg
      .append("text")
      .attr("x", (left + w - right) / 2)
      .attr("y", h - 8)
      .attr("text-anchor", "middle")
      .text(xlabel);
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -(top + h - bottom) / 2)
      .attr("y", 18)
      .attr("text-anchor", "middle")
      .text(ylabel);
  }
  function box(el, rows) {
    let { svg, w, h, left, right, top, bottom } = base(
      el,
      Math.max(250, rows.length * 42 + 90),
      310,
    );
    const x = d3
        .scaleLinear()
        .domain([0, Math.max(1, d3.max(rows, (d) => d.high) || 1)])
        .nice()
        .range([left, w - right]),
      y = d3
        .scaleBand()
        .domain(rows.map((d) => d.label))
        .range([top, h - bottom])
        .padding(0.25);
    svg
      .append("g")
      .attr("transform", `translate(0,${h - bottom})`)
      .call(d3.axisBottom(x).ticks(6));
    svg
      .append("g")
      .attr("transform", `translate(${left},0)`)
      .call(d3.axisLeft(y).tickSize(0))
      .selectAll("text")
      .style("font-size", "10px");
    let g = svg.selectAll(".boxrow").data(rows).join("g");
    g.append("line")
      .attr("x1", (d) => x(d.low))
      .attr("x2", (d) => x(d.high))
      .attr("y1", (d) => y(d.label) + y.bandwidth() / 2)
      .attr("y2", (d) => y(d.label) + y.bandwidth() / 2)
      .attr("stroke", navy);
    g.append("rect")
      .attr("x", (d) => x(d.q1))
      .attr("width", (d) => Math.max(1, x(d.q3) - x(d.q1)))
      .attr("y", (d) => y(d.label))
      .attr("height", y.bandwidth())
      .attr("fill", "#aad2cb");
    g.append("line")
      .attr("x1", (d) => x(d.median))
      .attr("x2", (d) => x(d.median))
      .attr("y1", (d) => y(d.label))
      .attr("y2", (d) => y(d.label) + y.bandwidth())
      .attr("stroke", navy)
      .attr("stroke-width", 2);
    tip(
      svg,
      g,
      (d) =>
        `${d.label}: n=${d.n}; median=${fmt(d.median)}; Q1=${fmt(d.q1)}; Q3=${fmt(d.q3)}; min=${fmt(d.low)}; max=${fmt(d.high)}`,
    );
    svg
      .append("text")
      .attr("x", left)
      .attr("y", h - 8)
      .text(
        "Days · box = middle 50%; line = median; whiskers = observed minimum/maximum",
      );
  }
  return { table, bar, heat, scatter, box, fmt };
})();
