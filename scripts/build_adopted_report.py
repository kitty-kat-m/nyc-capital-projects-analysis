"""Build the adopted classification report from the preserved team portfolio."""
from pathlib import Path
import collections
import csv
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'classification/reference/Our-All-Periods-Classification-Portfolio (2).html'
OUTPUT = ROOT / 'v10MCPModelCategorisation-AllPeriods.html'
source = SOURCE.read_text(encoding='utf-8-sig')
data = json.loads(re.search(r'<script id="data" type="application/json">(.*?)</script>', source, re.S).group(1))
assert len(data) == len({p['pid'] for p in data}) == 3618
counts = collections.Counter(p['final_classification'] for p in data)
assert counts == {'Public Building': 1197, 'Infrastructure': 2148, 'Review': 273}
old = (ROOT / 'v9MCPModelCategorisation-AllPeriods.html').read_text(encoding='utf-8')
style = re.search(r'<style>(.*?)</style>', old, re.S).group(1)
body = '''
<main class="container">
<header><h1>NYC Capital Projects — Adopted PID Classification</h1>
<p style="color:white;font-size:19px">May 2023–May 2026 · Evidence across ten reporting periods</p>
<p>One project-level decision per PID, based on pooled historical evidence and the other team's saved decisions.</p>
<div class="meta-bar"><span>Version 10 · Updated October 20, 2026</span><span>Reference report prepared October 16, 2026</span><span>3,618 eligible PIDs</span><span>Approach: adopted decisions with historical evidence</span></div></header>
<div class="stats-grid">
<div class="stat-card"><div class="stat-label">Eligible unique PIDs</div><div class="stat-value">3,618</div><div class="stat-desc">After agency exclusions; includes Review</div></div>
<div class="stat-card pb-card"><div class="stat-label">Public Buildings</div><div class="stat-value">1,197</div><div class="stat-desc">33.1% of eligible PIDs</div></div>
<div class="stat-card infra-card"><div class="stat-label">Infrastructure</div><div class="stat-value">2,148</div><div class="stat-desc">59.4% of eligible PIDs</div></div>
<div class="stat-card review-card"><div class="stat-label">Review</div><div class="stat-value">273</div><div class="stat-desc">7.5% of eligible PIDs; unresolved</div></div></div>
<div class="summary-box"><strong>Reading the counts</strong><p>Each eligible PID appears once. The three classifications are mutually exclusive and sum to 3,618. There are 3,345 accepted Public Building or Infrastructure decisions. Review remains in the inventory and is omitted from analyses restricted to accepted classifications. Summary cards show the full portfolio; the table reports the current filter counts.</p></div>
<section class="card"><h2>Our adopted approach</h2><p>We adopt the other team's supplied project-level classifications, saved decision reasons and pooled-history evidence. This report presents those existing decisions; it does not rerun the former keyword scoring model or independently revalidate every decision.</p>
<ol><li><strong>Build the project inventory.</strong> The supplied portfolio draws on project detail and schedule history across ten reporting periods, with budget history and fiscal-year spending supporting measures. A PID represents a schedule project; repeated reports and funding links do not create additional projects.</li>
<li><strong>Apply history-wide eligibility.</strong> The supplied approach excludes BOE/DOE, CUNY, NYCHA and H+H/HHC sponsorship anywhere in the selected history. Managing agency is used only when sponsor information is absent throughout that history. Eligible HPD and EDC projects remain in scope; property involvement alone is not an exclusion.</li>
<li><strong>Read scope across history.</strong> Agency Project Name, FMS Name, Project Description and 10-Year Plan Category provide historical evidence. Recorded project-specific resolutions form part of the decision basis.</li>
<li><strong>Classify the physical work.</strong> Building assets and systems serving their indoor use are Public Building. Outdoor, transport, site and utility assets are Infrastructure, following the saved scope decision. Parks sponsorship alone does not determine the result: resolved building and outdoor projects follow their recorded decisions.</li>
<li><strong>Retain uncertainty.</strong> Unresolved cases remain Review. No accepted Mixed category is used. Financial or schedule-data quality does not automatically overturn an accepted asset classification.</li>
<li><strong>Use one label per PID.</strong> The adopted label uses pooled history. Displayed project details and measures are the latest available observation for that PID, which may predate May 2026. Historical evidence is expandable. These labels must not be interpreted as decisions known independently in each earlier reporting period.</li></ol>
<p><strong>Classification detail:</strong> This reference supplies top-level labels and reasons. Earlier automatic Tier 2 typologies, Tier 3 tags and point scores are not carried into this adopted classification.</p></section>
<section class="card"><h2>Portfolio scope and source coverage</h2><p>The supplied report describes 3,668 source PIDs less 50 agency exclusions, leaving 3,618 eligible PIDs. It reports 26,786 project-period observations in its companion table; this HTML embeds only the 3,618 unique-PID summaries and their historical text evidence.</p>
<table><thead><tr><th>Source dataset</th><th>Role</th><th>Rows reported in supplied export</th></tr></thead><tbody>
<tr><td>Project detail · fb86-vt7u</td><td>Scope, agencies, funding links and milestones</td><td>56,525</td></tr>
<tr><td>Schedule history · 95tx-snak</td><td>Schedule changes, completion evidence and additional PIDs</td><td>22,464</td></tr>
<tr><td>Budget and spending history · qj5n-h5qp</td><td>Funding history</td><td>53,495</td></tr>
<tr><td>Budget and spending by fiscal year · gyhf-rsr3</td><td>Fiscal-year financial breakdowns</td><td>288,446</td></tr></tbody></table>
<p style="margin-top:12px">The source report states 420,930 retrieved source records. These counts and eligibility rules describe its saved export; the raw four-source combination and excluded-PID register are not available in this report for independent reproduction. No fresh upstream retrieval was performed for this update.</p></section>
<section class="card"><h2>Project portfolio</h2><p>Search the project details, saved reasons and historical text. Expand a project to inspect its evidence and measures. Dates describe reported milestones; blank values mean unavailable, conflicting or inapplicable.</p>
<div class="controls"><input id="search" type="search" aria-label="Search portfolio" placeholder="Search PID, project, agency or evidence"><select id="domain" aria-label="Classification"><option value="all">All classifications</option><option>Public Building</option><option>Infrastructure</option><option>Review</option></select><button id="download">Download filtered CSV</button></div>
<p id="resultCount" aria-live="polite"></p><div class="pager"><button id="prev">Previous</button><span id="pageLabel"></span><button id="next">Next</button></div>
<div class="table-container"><table><thead><tr><th>PID / classification</th><th>Latest project and agencies</th><th>Reporting coverage</th><th>Saved decision reason</th><th>Historical evidence</th><th>Latest measures and quality</th></tr></thead><tbody id="projectTableBody"></tbody></table></div></section>
<section class="card"><h2>How to read the analysis measures</h2><ul>
<li><strong>Phase duration:</strong> Actual phase end minus actual phase start, in days.</li>
<li><strong>Budget growth:</strong> Change from the first observed attributable budget, which may differ from the original approved budget.</li>
<li><strong>Budget spent:</strong> Spend to date divided by current budget, expressed as a percentage. This measures expenditure rather than physical completion.</li>
<li><strong>Forecast slippage:</strong> Active forecast completion minus the first observed forecast.</li>
<li><strong>Completion delay:</strong> Reported actual completion minus a verified pre-completion forecast baseline.</li>
<li><strong>Shared funding:</strong> A budget may fund several PIDs and a PID may link to several budgets. Shared funding is not assigned in full to each PID. Keep attribution flags visible and do not sum budgets or spending across reporting periods.</li></ul>
<p>Measures and quality flags are reproduced from the supplied summary. Their transformation code and full source inputs are still required to independently verify the calculations. The unique-PID summary cannot reproduce the full period-by-period analysis. Historical pooled labels also require care in prediction to avoid using later information as an earlier predictor.</p></section>
<section class="card"><h2>Version and reproducibility</h2><p>Version 10 replaces v9's period-specific, point-based domain decisions with the supplied fixed PID decisions. The original v9 remains available as a historical milestone. All 3,618 adopted labels and saved reasons are reproduced without alteration.</p>
<p><a href="classification/reference/Our-All-Periods-Classification-Portfolio%20(2).html">Preserved decision reference</a> · <a href="classification/reference/adopted-pid-decisions-v10.csv">Adopted decisions CSV</a> · <a href="classification/reference/adopted-report-v10-provenance.json">Version 10 provenance</a> · <a href="v9MCPModelCategorisation-AllPeriods.html">Original v9 report</a></p>
<p>The table, filters, historical evidence and CSV export work offline. Companion links require this folder structure. The reference's project-period CSV, complete measure definitions, source exports and combination audit remain to be recovered.</p></section>
</main>
'''
js = r'''
const projects=JSON.parse(document.getElementById('projectData').textContent);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=v=>v===''||v==null?'Not available':Number(v).toLocaleString('en-US',{maximumFractionDigits:2});
const money=v=>v===''||v==null?'Not available':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number(v));
const searchText=projects.map(p=>JSON.stringify(p).toLowerCase());
let page=0,filtered=[],pageSize=30;
function history(p){return ['agency_project_name','fms_project_name','agency_project_description','ten_year_plan_category'].map(k=>'<h4>'+esc(k.replaceAll('_',' '))+'</h4>'+((p.history?.[k]||[]).map(x=>'<p>'+esc(x.text)+'<br><small>Periods: '+x.periods.map(esc).join(', ')+'</small></p>').join('')||'<p>Not reported</p>')).join('');}
function render(){
 const q=document.getElementById('search').value.toLowerCase(),domain=document.getElementById('domain').value;
 filtered=projects.filter((p,i)=>(domain==='all'||p.final_classification===domain)&&(!q||searchText[i].includes(q)));
 const pages=Math.max(1,Math.ceil(filtered.length/pageSize));page=Math.max(0,Math.min(page,pages-1));
 document.getElementById('resultCount').textContent=filtered.length.toLocaleString('en-US')+' unique PIDs match · '+filtered.filter(p=>p.final_classification==='Public Building').length+' Public Building · '+filtered.filter(p=>p.final_classification==='Infrastructure').length+' Infrastructure · '+filtered.filter(p=>p.final_classification==='Review').length+' Review';
 document.getElementById('pageLabel').textContent='Page '+(page+1)+' of '+pages;
 document.getElementById('prev').disabled=page===0;document.getElementById('next').disabled=page>=pages-1;
 document.getElementById('projectTableBody').innerHTML=filtered.slice(page*pageSize,(page+1)*pageSize).map(p=>{
 const badge=p.final_classification==='Public Building'?'badge-pb':p.final_classification==='Infrastructure'?'badge-infra':'badge-review';
 const row=(name,value)=>'<div><strong>'+esc(name)+':</strong> '+esc(value===''||value==null?'Not available':value)+'</div>';
 return '<tr><td><strong>PID '+esc(p.pid)+'</strong><br><span class="badge '+badge+'">'+esc(p.final_classification)+'</span></td><td><strong>'+esc(p.agency_project_name||'Title not reported')+'</strong>'+row('Sponsor',p.sponsor_agencies)+row('Managing',p.managing_agencies)+row('Phase',p.current_phase)+'<details><summary>Latest scope and funding identifiers</summary>'+row('Description',p.project_description)+row('FMS name',p.fms_project_name)+row('Plan category',p.ten_year_plan_category)+row('FMS IDs',p.linked_fms_ids_json)+'</details></td><td>'+row('Latest reporting period',p.reporting_period)+row('First observed',p.first_observed_period)+row('Observed periods',p.observed_period_count)+row('Project evidence as of',p.project_as_of_date)+'</td><td>'+esc(p.classification_reason)+'<p class="small">'+esc(p.classification_basis)+'</p></td><td><details><summary>Full text evidence across history</summary>'+history(p)+'</details></td><td>'+row('Financial attribution',p.financial_attribution_status)+row('Budget',money(p.project_total_budget))+row('Spend to date',money(p.project_spend_to_date))+row('Budget spent %',fmt(p.budget_spent_percent))+'<details><summary>Durations, changes and quality flags</summary>'+[['Design duration (days)','design_duration_days'],['Procurement duration (days)','procurement_duration_days'],['Construction duration (days)','construction_duration_days'],['Budget growth %','budget_growth_percent'],['Forecast slippage (days)','forecast_slippage_days'],['Completion delay (days)','completion_delay_days'],['Actual completion','actual_completion_date'],['Actual completion carried forward','actual_completion_carried_forward'],['Quality flags','data_quality_flags_json'],['History quality flags','history_data_quality_flags_json']].map(([name,key])=>row(name,p[key])).join('')+'</details></td></tr>';
 }).join('');
}
for(const id of ['search','domain'])document.getElementById(id).addEventListener(id==='search'?'input':'change',()=>{page=0;render()});
document.getElementById('prev').onclick=()=>{page--;render()};document.getElementById('next').onclick=()=>{page++;render()};
document.getElementById('download').onclick=()=>{const keys=Object.keys(projects[0]);const quote=v=>'"'+String(v??'').replaceAll('"','""')+'"';const csv='\uFEFF'+keys.join(',')+'\r\n'+filtered.map(p=>keys.map(k=>quote(typeof p[k]==='object'?JSON.stringify(p[k]):p[k])).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='nyc-adopted-pid-classifications-v10.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
render();
'''
extra = 'section>table th{position:static}.controls,.pager{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin:16px 0}.controls input,.controls select,button{font:inherit;padding:10px;border:1px solid #cbd5e1;border-radius:6px;background:white}.controls input{flex:1;min-width:220px}button,summary{cursor:pointer}td{min-width:180px}td details{max-width:360px}td p{margin:8px 0}.small{font-size:12px;color:#64748b}section p{margin-bottom:12px}@media print{.controls,.pager{display:none}.table-container{max-height:none}}'
payload=json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
OUTPUT.write_text('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>NYC Capital Projects — Adopted PID Classification v10</title><style>'+style+extra+'</style></head><body>'+body+'<script id="projectData" type="application/json">'+payload+'</script><script>'+js+'</script></body></html>',encoding='utf-8')
with (SOURCE.parent/'adopted-pid-decisions-v10.csv').open('w',encoding='utf-8-sig',newline='') as f:
    keys=['pid','final_classification','classification_status','classification_reason','classification_basis','reporting_period','agency_project_name','sponsor_agencies','managing_agencies']
    w=csv.DictWriter(f,fieldnames=keys,extrasaction='ignore');w.writeheader();w.writerows(data)
provenance={'version':10,'updated':'2026-10-20','reference':str(SOURCE.relative_to(ROOT)),'reference_sha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'approach':'Adopt supplied pooled-history PID decisions without rerunning scoring','counts':dict(counts),'independently_validated':False,'source_retrieval':'No new retrieval','generator':'scripts/build_adopted_report.py'}
(SOURCE.parent/'adopted-report-v10-provenance.json').write_text(json.dumps(provenance,indent=2),encoding='utf-8')
print(f'Built {OUTPUT.name}: {len(data)} unique PIDs; {dict(counts)}')
