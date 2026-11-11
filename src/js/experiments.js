(() => {
  const R = JSON.parse(
    document.getElementById("additional-prediction-data").textContent,
  );
  const colors = ["#315c7c", "#247d83", "#8ba6b5"];
  let drawn = false;
  function bars(key) {
    const d = R[key],
      root = d3.select("#extra-chart-" + key),
      names = Object.keys(d.test),
      w = 1000,
      h = 90 + names.length * 64,
      m = { l: 245, r: 255, t: 20, b: 35 };
    const total = d.test[names[0]].events,
      x = d3
        .scaleLinear()
        .domain([0, total])
        .range([m.l, w - m.r]),
      y = d3
        .scaleBand()
        .domain(names)
        .range([m.t, h - m.b])
        .padding(0.3);
    const svg = root
      .append("svg")
      .attr("viewBox", "0 0 " + w + " " + h)
      .attr("role", "img")
      .attr("aria-label", "Actual positive outcomes found by each review list");
    names.forEach((name, i) => {
      const z = d.test[name],
        color =
          name === d.selected || name === "With earlier reasons"
            ? "#247d83"
            : name === "Simple rule"
              ? "#8ba6b5"
              : "#315c7c";
      svg
        .append("rect")
        .attr("x", m.l)
        .attr("y", y(name))
        .attr("width", x(total) - m.l)
        .attr("height", y.bandwidth())
        .attr("rx", 4)
        .attr("fill", "#edf3f5");
      svg
        .append("rect")
        .attr("x", m.l)
        .attr("y", y(name))
        .attr("width", x(z.tp) - m.l)
        .attr("height", y.bandwidth())
        .attr("rx", 4)
        .attr("fill", color);
      svg
        .append("text")
        .attr("x", m.l - 15)
        .attr("y", y(name) + y.bandwidth() / 2 + 5)
        .attr("text-anchor", "end")
        .text(name + (name === d.selected ? " *" : ""));
      svg
        .append("text")
        .attr("x", w - m.r + 15)
        .attr("y", y(name) + y.bandwidth() / 2 + 5)
        .attr("font-weight", 600)
        .text(
          z.tp +
            " of " +
            total +
            " found · " +
            (100 * z.recall).toFixed(1) +
            "%",
        );
    });
    svg
      .append("text")
      .attr("x", m.l)
      .attr("y", h - 5)
      .style("font-size", "13px")
      .text(
        "Same review capacity: " +
          d.test[names[0]].flagged +
          (key === "budget" ? " budget records" : " projects") +
          (d.selected ? " · * selected on earlier validation" : ""),
      );
    const mobile = root.append("div").attr("class", "extra-mobile");
    names.forEach((name, i) => {
      const z = d.test[name];
      mobile
        .append("p")
        .html(
          "<strong>" +
            name +
            (name === d.selected ? " (selected)" : "") +
            "</strong><br>" +
            z.tp +
            " of " +
            total +
            " found (" +
            (z.recall * 100).toFixed(1) +
            "%)",
        );
      mobile
        .append("div")
        .attr("class", "extra-track")
        .append("span")
        .style("width", z.recall * 100 + "%")
        .style("background", colors[i % 3]);
    });
  }
  function duration() {
    const d = R.duration,
      root = d3.select("#extra-chart-duration"),
      data = [
        {
          name: "Phase-only benchmark",
          value: d.reference.mean_absolute_error_days,
        },
        { name: "Quantile model", value: d.quantile.mean_absolute_error_days },
      ];
    const w = 1000,
      h = 240,
      m = { l: 245, r: 160, t: 25, b: 45 },
      x = d3
        .scaleLinear()
        .domain([0, d3.max(data, (z) => z.value) * 1.2])
        .range([m.l, w - m.r]),
      y = d3
        .scaleBand()
        .domain(data.map((z) => z.name))
        .range([m.t, h - m.b])
        .padding(0.45);
    const svg = root
      .append("svg")
      .attr("viewBox", "0 0 " + w + " " + h)
      .attr("role", "img")
      .attr(
        "aria-label",
        "Mean absolute duration prediction error: benchmark " +
          Math.round(data[0].value) +
          " days; quantile model " +
          Math.round(data[1].value) +
          " days. Lower is better.",
      );
    data.forEach((z, i) => {
      svg
        .append("rect")
        .attr("x", m.l)
        .attr("y", y(z.name))
        .attr("width", x(z.value) - m.l)
        .attr("height", y.bandwidth())
        .attr("rx", 4)
        .attr("fill", colors[i]);
      svg
        .append("text")
        .attr("x", m.l - 15)
        .attr("y", y(z.name) + y.bandwidth() / 2 + 5)
        .attr("text-anchor", "end")
        .text(z.name);
      svg
        .append("text")
        .attr("x", x(z.value) + 14)
        .attr("y", y(z.name) + y.bandwidth() / 2 + 5)
        .attr("font-weight", 600)
        .text(Math.round(z.value) + " days");
    });
    svg
      .append("text")
      .attr("x", m.l)
      .attr("y", h - 8)
      .style("font-size", "13px")
      .text(
        "Mean absolute prediction error in days · lower is better · " +
          d.test_n +
          " completed phases",
      );
    const mobile = root.append("div").attr("class", "extra-mobile");
    data.forEach((z) =>
      mobile
        .append("p")
        .html(
          "<strong>" +
            z.name +
            "</strong><br>Mean prediction error: " +
            Math.round(z.value) +
            " days",
        ),
    );
  }
  function draw() {
    if (drawn) return;
    drawn = true;
    for (const k of ["substantial", "budget", "phase", "reasons"]) bars(k);
    duration();
  }
  window.renderPredictive = draw;
  document.querySelectorAll("[data-extra-download]").forEach((button) =>
    button.addEventListener("click", () => {
      if (button.dataset.extraDownload === "audit") {
        const url = URL.createObjectURL(
            new Blob([JSON.stringify(R, null, 2)], {
              type: "application/json",
            }),
          ),
          a = document.createElement("a");
        a.href = url;
        a.download = "Infrastructure-Predictive-Results-Audit.json";
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        return;
      }
      const key = button.dataset.extraDownload,
        rr = R[key].rows,
        keys = [...new Set(rr.flatMap(Object.keys))],
        quote = (v) => '"' + String(v ?? "").replaceAll('"', '""') + '"';
      const csv =
          "\uFEFF" +
          [keys, ...rr.map((r) => keys.map((k) => r[k]))]
            .map((row) => row.map(quote).join(","))
            .join("\r\n"),
        url = URL.createObjectURL(
          new Blob([csv], { type: "text/csv;charset=utf-8" }),
        ),
        a = document.createElement("a");
      a.href = url;
      a.download = "Infrastructure-" + key + "-historical-assessment.csv";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }),
  );
})();
