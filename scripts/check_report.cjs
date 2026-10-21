const {chromium}=require('C:/Users/localadm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 const page=await browser.newPage({viewport:{width:1440,height:1000},acceptDownloads:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(require('url').pathToFileURL(require('path').resolve(__dirname,'../v10MCPModelCategorisation-AllPeriods.html')).href);
 for(const [label,count] of [['all',3618],['Public Building',1197],['Infrastructure',2148],['Review',273]]){
  await page.locator('#domain').selectOption(label);
  const text=await page.locator('#resultCount').innerText();
  if(!text.startsWith(count.toLocaleString('en-US')+' unique PIDs'))throw Error(text);
  console.log(label+': verified '+count);
 }
 await page.locator('#domain').selectOption('all');await page.locator('#search').fill('Zerega');
 if(!await page.locator('#projectTableBody').innerText().then(t=>t.includes('Zerega')))throw Error('Search failed');
 await page.locator('#projectTableBody details').first().locator('summary').click();
 const pending=page.waitForEvent('download');await page.locator('#download').click();console.log('Download:',(await pending).suggestedFilename());
 await page.locator('#search').fill('');await page.locator('#next').click();
 if(!await page.locator('#pageLabel').innerText().then(t=>t.startsWith('Page 2 ')))throw Error('Pagination failed');
 await page.locator('#prev').click();await page.screenshot({path:'review-notes/v10-report-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'review-notes/v10-report-mobile.png',fullPage:true});
 await browser.close();if(errors.length)throw Error(errors.join('; '));console.log('Search, pagination, CSV and script checks passed');
})().catch(e=>{console.error(e);process.exit(1)});
