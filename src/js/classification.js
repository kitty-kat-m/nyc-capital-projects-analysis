const projects = JSON.parse(document.getElementById("projectData").textContent);
let page = 0,
  filtered = [],
  pageSize = 30;
function history(p) {
  return [
    "agency_project_name",
    "fms_project_name",
    "agency_project_description",
    "ten_year_plan_category",
  ]
    .map(
      (k) =>
        "<h4>" +
        esc(k.replaceAll("_", " ")) +
        "</h4>" +
        ((p.history?.[k] || [])
          .map(
            (x) =>
              "<p>" +
              esc(x.text) +
              "<br><small>Periods: " +
              x.periods.map(esc).join(", ") +
              "</small></p>",
          )
          .join("") || "<p>Not reported</p>"),
    )
    .join("");
}
function render() {
  const q = document.getElementById("search").value.trim().toLowerCase(),
    domain = document.getElementById("domain").value;
  filtered = projects.filter(
    (p, i) =>
      (domain === "all" || p.final_classification === domain) &&
      (!q || searchMatches(p, q)),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  page = Math.max(0, Math.min(page, pages - 1));
  document.getElementById("resultCount").textContent =
    filtered.length.toLocaleString("en-US") +
    " unique PIDs match · " +
    filtered.filter((p) => p.final_classification === "Public Building")
      .length +
    " Public Building · " +
    filtered.filter((p) => p.final_classification === "Infrastructure").length +
    " Infrastructure · " +
    filtered.filter((p) => p.final_classification === "Review").length +
    " Review";
  document.getElementById("pageLabel").textContent =
    "Page " + (page + 1) + " of " + pages;
  document.getElementById("prev").disabled = page === 0;
  document.getElementById("next").disabled = page >= pages - 1;
  document.getElementById("projectTableBody").innerHTML = filtered
    .slice(page * pageSize, (page + 1) * pageSize)
    .map((p) => {
      const badge =
        p.final_classification === "Public Building"
          ? "badge-pb"
          : p.final_classification === "Infrastructure"
            ? "badge-infra"
            : "badge-review";
      const row = (name, value) =>
        "<div><strong>" +
        esc(name) +
        ":</strong> " +
        esc(value === "" || value == null ? "Not available" : value) +
        "</div>";
      return (
        "<tr><td><strong>PID " +
        esc(p.pid) +
        '</strong><br><span class="badge ' +
        badge +
        '">' +
        esc(p.final_classification) +
        "</span></td><td><strong>" +
        esc(p.agency_project_name || "Title not reported") +
        "</strong>" +
        row("Sponsor", p.sponsor_agencies) +
        row("Managing", p.managing_agencies) +
        row("Phase", p.current_phase) +
        "<details><summary>Latest scope and funding identifiers</summary>" +
        row("Description", p.project_description) +
        row("FMS name", p.fms_project_name) +
        row("Plan category", p.ten_year_plan_category) +
        row("FMS IDs", p.linked_fms_ids_json) +
        "</details></td><td>" +
        row("Latest reporting period", p.reporting_period) +
        row("First observed", p.first_observed_period) +
        row("Observed periods", p.observed_period_count) +
        row("Project evidence as of", p.project_as_of_date) +
        "</td><td>" +
        esc(p.classification_reason) +
        '<p class="small">' +
        esc(p.classification_basis) +
        "</p></td><td><details><summary>Full text evidence across history</summary>" +
        history(p) +
        "</details></td></tr>"
      );
    })
    .join("");
}
for (const id of ["search", "domain"])
  document
    .getElementById(id)
    .addEventListener(id === "search" ? "input" : "change", () => {
      if (id === "search") document.getElementById("domain").value = "all";
      page = 0;
      render();
    });
document.getElementById("prev").onclick = () => {
  page--;
  render();
};
document.getElementById("next").onclick = () => {
  page++;
  render();
};
document.getElementById("download").onclick = () => {
  const keys = Object.keys(projects[0]);
  const quote = (v) => '"' + String(v ?? "").replaceAll('"', '""') + '"';
  const csv =
    "\uFEFF" +
    keys.join(",") +
    "\r\n" +
    filtered
      .map((p) =>
        keys
          .map((k) =>
            quote(typeof p[k] === "object" ? JSON.stringify(p[k]) : p[k]),
          )
          .join(","),
      )
      .join("\r\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "nyc-project-classifications.csv";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
render();

document.getElementById("search-clear").onclick = () => {
  document.getElementById("search").value = "";
  document.getElementById("domain").value = "all";
  page = 0;
  render();
};
