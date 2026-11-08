import {test,expect} from '@playwright/test';
// Real public feeds. Production remains unchanged while this PR is reviewed.
test('persistent rivers, selected associations, observation snapshots and map area',async({page,browser},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().includes('api.waterdata.usgs.gov')&&r.status()>=400)console.log('USGS_RESPONSE',r.status(),r.url())});page.on('requestfailed',r=>console.log('REQUEST_FAILED',r.failure()?.errorText,r.url()));
 await page.goto('./#page=overview&station=14305500');
 await expect(page.getByLabel('Select monitoring station')).toBeVisible({timeout:90000});
 const overlay=page.locator('.river-overlay');await expect(overlay).toHaveAttribute('data-rivers-loaded','81',{timeout:60000});
 const paths=page.locator('.all-rivers>path');const count=await paths.count();expect(count).toBeGreaterThanOrEqual(81);
 for(const [id,name] of [['14305500','Siletz River'],['14306500','Alsea River'],['14162500','McKenzie River']]){
  await page.getByLabel('Select monitoring station').selectOption(id);
  await expect(page.locator('.selected-river')).toHaveAttribute('data-river',name);
  await expect(paths).toHaveCount(count);await expect(page.locator('.observation-card')).toHaveCount(5);
  await expect(page.locator('.observation-card').first().locator('svg path')).toHaveCount(1,{timeout:60000}).catch(async e=>{console.log('SNAPSHOT_STATE',id,await page.locator('.observation-grid').innerText());throw e});
 }
 await expect(page.locator('.observation-card').nth(3)).toContainText('63680');await expect(page.locator('.observation-card').nth(3)).toContainText('_FNU');
 await expect(page.locator('.observation-card').nth(4)).not.toContainText('Loading observations',{timeout:60000});
 for(const map of ['imagery','topo','civil']){await page.getByLabel('Basemap').selectOption(map);await expect(page.locator('.selected-river')).toHaveAttribute('data-river','McKenzie River');await expect(paths).toHaveCount(count)}
 await expect(page.getByLabel('Weather at selected gauge')).toHaveCount(1);await expect(page.getByLabel('Weather at selected gauge')).not.toContainText('Loading weather',{timeout:45000});
 const weather=(await page.locator('.station-weather').boundingBox())!,grid=(await page.locator('.observation-grid').boundingBox())!;expect(weather.x).toBeGreaterThan(grid.x+grid.width-1);
 const baseline=await browser.newPage();
 for(const viewport of [{width:1440,height:1050},{width:1366,height:900},{width:390,height:844}]){
  await page.setViewportSize(viewport);await baseline.setViewportSize(viewport);await baseline.goto('https://dkosten.github.io/Oregon-Rivers-Atlas/#page=overview&station=14162500');
  await expect(baseline.getByLabel('Select monitoring station')).toBeVisible({timeout:90000});
  const old=(await baseline.getByLabel('Interactive Oregon map').boundingBox())!,current=(await page.getByLabel('Interactive Oregon map').boundingBox())!;
  const ratio=current.width*current.height/(old.width*old.height);console.log('MAP_AREA',JSON.stringify({viewport,baseline:old,current,ratio}));expect(ratio).toBeGreaterThanOrEqual(.85);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();
  await page.screenshot({path:info.outputPath(`refinements-${viewport.width}.png`),fullPage:true});
 }
 await baseline.close();await page.getByLabel('Close selected feature').click();await expect(page.locator('.selected-river')).toHaveCount(0);await expect(paths).toHaveCount(count);expect(errors).toEqual([]);
});
