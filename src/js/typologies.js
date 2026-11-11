const typologies = JSON.parse(
  document.getElementById("typologyData").textContent,
);
let tyPage = 0,
  tyFiltered = [];
function renderTypologies() {
  const q = document.getElementById("ty-search").value.trim().toLowerCase(),
    f = document.getElementById("ty-filter").value;
  tyFiltered = typologies.filter(
    (p) =>
      (f === "all" ||
        (f === "review"
          ? !p.proposed_typology
          : f === "conflicts"
            ? p.reference_flags.some((x) => x.kind !== "agency")
            : f === "reference"
              ? p.reference_flags.some((x) => x.kind === "agency")
              : p.proposed_typology === f)) &&
      (!q ||
        searchMatches(p, q) ||
        p.reference_flags.some((x) => x.message.toLowerCase().includes(q))),
  );
  const pages = Math.max(1, Math.ceil(tyFiltered.length / 30));
  tyPage = Math.max(0, Math.min(tyPage, pages - 1));
  document.getElementById("ty-count").textContent =
    tyFiltered.length.toLocaleString() +
    " Infrastructure PIDs match · " +
    typologies.filter((p) => p.proposed_typology).length.toLocaleString() +
    " assigned · " +
    typologies.filter((p) => !p.proposed_typology).length +
    " need typology review · " +
    typologies.filter((p) => p.reference_flags.some((x) => x.kind !== "agency"))
      .length +
    " evidence / decision conflicts to check";
  document.getElementById("ty-page").textContent =
    "Page " + (tyPage + 1) + " of " + pages;
  document.getElementById("ty-prev").disabled = tyPage === 0;
  document.getElementById("ty-next").disabled = tyPage >= pages - 1;
  document.getElementById("ty-body").innerHTML = tyFiltered
    .slice(tyPage * 30, (tyPage + 1) * 30)
    .map(
      (p) =>
        "<tr><td><strong>PID " +
        esc(p.pid) +
        "</strong><br>" +
        esc(p.title) +
        '<p class="small">Latest period: ' +
        esc(p.latest_period) +
        " · Sponsor: " +
        esc(p.sponsors) +
        "</p></td><td>" +
        (p.proposed_typology
          ? esc(p.proposed_typology)
          : '<span class="ty-review">Needs review</span>') +
        '<p class="small"><strong>Confidence:</strong> ' +
        esc(p.decision_confidence || "Not separately rated") +
        "</p>" +
        (p.secondary_tags.length
          ? '<p class="small">Secondary scope: ' +
            p.secondary_tags.map(esc).join("; ") +
            "</p>"
          : "") +
        (p.reference_flags.length
          ? '<p><span class="audit-tag ' +
            (p.reference_flags.some((x) => x.kind !== "agency")
              ? "audit-conflict"
              : "audit-context") +
            '">' +
            esc(p.reference_status) +
            "</span></p>"
          : "") +
        "</td><td><p>" +
        esc(p.description || "No project description recorded") +
        "</p><p><strong>Managing agency:</strong> " +
        esc(p.managing_agencies || "Not recorded") +
        "</p></td><td><p>" +
        esc(p.reason) +
        "</p>" +
        (p.reference_flags.length
          ? '<div class="audit-note"><strong>Reference check</strong>' +
            p.reference_flags
              .map((x) => "<p>" + esc(x.message) + "</p>")
              .join("") +
            "</div>"
          : "") +
        (p.review_note && p.review_note.reason !== p.reason
          ? "<details><summary>Additional recorded review note</summary><p>" +
            esc(p.review_note.reason) +
            "</p></details>"
          : "") +
        (!p.proposed_typology
          ? "<p><strong>Possible categories:</strong> " +
            (p.candidates.length
              ? p.candidates.map(esc).join("; ")
              : "Not established from the recorded scope") +
            "</p>"
          : "") +
        "<details><summary>All available project descriptions (" +
        p.descriptions.length +
        ")</summary>" +
        p.descriptions
          .map(
            (x) =>
              "<h4>" +
              esc(x.label) +
              "</h4><p>" +
              esc(x.text) +
              '</p><p class="small">Reported in: ' +
              x.periods.map(esc).join(", ") +
              "</p>",
          )
          .join("") +
        "</details>" +
        (p.external_sources.length
          ? "<details><summary>External sources</summary>" +
            p.external_sources
              .map(
                (x) =>
                  '<p><a href="' +
                  esc(x.url) +
                  '" target="_blank" rel="noopener">' +
                  esc(x.title || x.url) +
                  "</a></p>",
              )
              .join("") +
            "</details>"
          : "") +
        "</td></tr>",
    )
    .join("");
}
for (const id of ["ty-search", "ty-filter"])
  document
    .getElementById(id)
    .addEventListener(id === "ty-search" ? "input" : "change", () => {
      if (id === "ty-search")
        document.getElementById("ty-filter").value = "all";
      tyPage = 0;
      renderTypologies();
    });
document.getElementById("ty-prev").onclick = () => {
  tyPage--;
  renderTypologies();
};
document.getElementById("ty-next").onclick = () => {
  tyPage++;
  renderTypologies();
};
document.getElementById("ty-download").onclick = () => {
  const keys = [
    "pid",
    "title",
    "latest_period",
    "proposed_typology",
    "review_status",
    "candidates",
    "reason",
    "evidence",
    "descriptions",
    "description",
    "managing_agencies",
    "secondary_tags",
    "secondary_typologies",
    "decision_confidence",
    "review_date",
    "review_basis",
    "previous_typology_review",
    "feedback_reference",
    "web_search_review",
    "external_sources",
  ];
  const quote = (v) => '"' + String(v ?? "").replaceAll('"', '""') + '"';
  const csv =
    "\uFEFF" +
    keys.join(",") +
    "\r\n" +
    tyFiltered
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
  a.download = "infrastructure-typology-decisions.csv";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

document.getElementById("ty-search-clear").onclick = () => {
  document.getElementById("ty-search").value = "";
  document.getElementById("ty-filter").value = "all";
  tyPage = 0;
  renderTypologies();
};
(() => {
  function sync() {
    const rows = JSON.parse(
        document.getElementById("typologyData").textContent,
      ),
      counts = new Map();
    for (const p of rows) {
      const key = p.proposed_typology || "review";
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    for (const b of document.querySelectorAll(".typology-count")) {
      const n = b.querySelector("strong");
      if (n)
        n.textContent = (counts.get(b.dataset.filter) || 0).toLocaleString();
    }
    const unresolved = counts.get("review") || 0,
      e = document.getElementById("typology-current-counts");
    if (e)
      e.textContent =
        rows.length.toLocaleString() +
        " Infrastructure PIDs: " +
        (rows.length - unresolved).toLocaleString() +
        " assigned typologies · " +
        unresolved +
        " need review.";
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", sync);
  else sync();
})();
