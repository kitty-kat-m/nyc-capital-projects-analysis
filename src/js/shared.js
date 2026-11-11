function normalizeSearch(v) {
  return String(v ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
function searchMatches(p, q) {
  const raw = String(q).trim();
  if (!raw) return true;
  const id = raw.match(/^(?:pid\s*[:#-]?\s*)?(\d+)$/i);
  if (id) return String(p.pid) === id[1];
  const text = normalizeSearch(JSON.stringify(p));
  return normalizeSearch(raw)
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => text.includes(w));
}

const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
window.NYCWrapLabels = function (selection) {
  selection.each(function () {
    const t = d3.select(this),
      x = t.attr("x"),
      words = t.text().split(/\s+/),
      lines = [];
    let line = "";
    for (const word of words) {
      if ((line + " " + word).length > 34 && line) {
        lines.push(line);
        line = word;
      } else line += (line ? " " : "") + word;
    }
    if (line) lines.push(line);
    t.text("");
    lines.forEach((v, i) =>
      t
        .append("tspan")
        .attr("x", x)
        .attr("dy", i ? "1.1em" : `${-(lines.length - 1) * 0.52}em`)
        .text(v),
    );
  });
};
window.NYCBottomLegend = function (svg, series, color, y, w) {
  series.forEach((k, i) => {
    const g = svg
      .append("g")
      .attr("class", "bottom-chart-legend")
      .attr(
        "transform",
        `translate(${30 + ((i % 3) * (w - 60)) / 3},${y + Math.floor(i / 3) * 32})`,
      );
    g.append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("rx", 2)
      .attr("fill", color(k));
    g.append("text")
      .attr("x", 20)
      .attr("y", 8)
      .attr("fill", "#253d52")
      .style("font-family", "Arial,sans-serif")
      .style("font-size", "12px")
      .text(k)
      .call(window.NYCWrapLabels);
  });
};
