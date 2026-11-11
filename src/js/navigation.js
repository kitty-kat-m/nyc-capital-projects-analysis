const sections = [
  "classification",
  "typologies",
  "overview",
  "pid-budget",
  "schedule",
  "predictive",
  "definitions",
];
function selectTab(name) {
  if (name === "budget") name = "pid-budget";
  if (!sections.includes(name)) name = "overview";
  for (const x of sections) {
    document.getElementById("panel-" + x).hidden = x !== name;
    document
      .getElementById("tab-" + x)
      .setAttribute("aria-selected", String(x === name));
    document.getElementById("tab-" + x).tabIndex = x === name ? 0 : -1;
  }
  if (name === "overview" && window.renderDescriptive)
    window.renderDescriptive();
  if (name === "predictive" && window.renderPredictive)
    window.renderPredictive();
  location.hash = name;
}
for (const name of sections) {
  const button = document.getElementById("tab-" + name);
  button.onclick = () => selectTab(name);
  button.onkeydown = (e) => {
    if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
      e.preventDefault();
      let i = sections.indexOf(name);
      i =
        e.key === "Home"
          ? 0
          : e.key === "End"
            ? sections.length - 1
            : (i + (e.key === "ArrowRight" ? 1 : sections.length - 1)) %
              sections.length;
      selectTab(sections[i]);
      document.getElementById("tab-" + sections[i]).focus();
    }
  };
}

for (const b of document.querySelectorAll(".typology-count"))
  b.onclick = () => {
    document.getElementById("ty-filter").value = b.dataset.filter;
    document.getElementById("ty-search").value = "";
    tyPage = 0;
    renderTypologies();
    document
      .getElementById("ty-count")
      .scrollIntoView({ behavior: "smooth", block: "center" });
  };
renderTypologies();
let initialTab = location.hash.slice(1);
if (initialTab === "analysis") initialTab = "overview";
if (initialTab === "budget") initialTab = "pid-budget";
selectTab(sections.includes(initialTab) ? initialTab : "classification");

document.addEventListener("click", function (e) {
  var b = e.target.closest("[data-kx-tab]");
  if (!b) return;
  e.preventDefault();
  selectTab(b.getAttribute("data-kx-tab"));
  var t = document.getElementById(b.getAttribute("data-kx-target"));
  if (t)
    setTimeout(function () {
      t.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
});
document.querySelectorAll("table").forEach((t) => {
  if (!t.closest(".table-container")) {
    const wrap = document.createElement("div");
    wrap.className = "table-container";
    t.parentNode.insertBefore(wrap, t);
    wrap.appendChild(t);
  }
});
