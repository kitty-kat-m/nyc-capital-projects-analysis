// Aggregate historical coverage only. No legacy project records are embedded here.
const historicalCoverage = [{"period": "201309", "count": 268}, {"period": "201401", "count": 239}, {"period": "201405", "count": 232}, {"period": "201502", "count": 225}, {"period": "201508", "count": 219}, {"period": "201601", "count": 209}, {"period": "201606", "count": 221}, {"period": "201611", "count": 231}, {"period": "201704", "count": 252}, {"period": "201709", "count": 273}, {"period": "201803", "count": 368}, {"period": "201808", "count": 333}, {"period": "201901", "count": 365}, {"period": "201905", "count": 368}, {"period": "201909", "count": 394}, {"period": "202001", "count": 230}, {"period": "202005", "count": 227}, {"period": "202010", "count": 229}, {"period": "202103", "count": 136}, {"period": "202107", "count": 480}, {"period": "202112", "count": 451}, {"period": "202204", "count": 434}, {"period": "202209", "count": 436}, {"period": "202301", "count": 410}];
window.renderHistorical = function () {
  const host = d3.select("#historical-coverage-chart");
  host.selectAll("*").remove();
  const width = 1220, height = 340;
  const margin = {top: 25, right: 20, bottom: 72, left: 48};
  const svg = host.append("svg").attr("viewBox", `0 0 ${width} ${height}`).attr("role", "img").attr("aria-label", "Recorded historical projects in each of 24 reports, September 2013 to January 2023");
  const x = d3.scaleBand().domain(historicalCoverage.map(d => d.period)).range([margin.left, width-margin.right]).padding(0.22);
  const y = d3.scaleLinear().domain([0, 500]).range([height-margin.bottom, margin.top]);
  svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y).ticks(5).tickSize(-(width-margin.left-margin.right))).call(g => g.select(".domain").remove()).call(g => g.selectAll(".tick line").attr("stroke", "#e3edef"));
  svg.selectAll(".historical-bar").data(historicalCoverage).join("rect").attr("class", "historical-bar").attr("x", d => x(d.period)).attr("y", d => y(d.count)).attr("width", x.bandwidth()).attr("height", d => y(0)-y(d.count)).attr("fill", "#237c83").attr("rx", 3).append("title").text(d => `${d.period.slice(0,4)}-${d.period.slice(4)}: ${d.count} legacy projects`);
  svg.append("g").attr("transform", `translate(0,${y(0)})`).call(d3.axisBottom(x).tickFormat(d => d.slice(0,4)+"-"+d.slice(4))).call(g => g.selectAll("text").attr("transform", "rotate(-45)").attr("text-anchor", "end").attr("dx", "-.4em").attr("dy", ".4em"));
  svg.selectAll(".historical-count").data(historicalCoverage).join("text").attr("class", "historical-count").attr("x", d => x(d.period)+x.bandwidth()/2).attr("y", d => y(d.count)-7).attr("text-anchor", "middle").attr("font-size", 12).text(d => d.count);
  svg.selectAll("text").attr("font-family", "Segoe UI, Arial, sans-serif").attr("fill", "#25485c");
};
