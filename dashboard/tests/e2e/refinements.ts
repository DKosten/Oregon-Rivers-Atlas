import {expect,type Page,type Browser,type TestInfo} from '@playwright/test';
// Real public feeds. Production remains unchanged while this PR is reviewed.
export async function checkRefinements(page:Page,browser:Browser,info:TestInfo){
 const overlay=page.locator('.river-overlay');await expect(overlay).toHaveAttribute('data-rivers-loaded','81',{timeout:60000});
 const paths=page.locator('.all-rivers>path');const count=await paths.count();expect(count).toBeGreaterThanOrEqual(81);
 await expect(page.locator('.observation-card')).toHaveCount(5);
 for(const i of [0,1,2,3])await expect(page.locator('.observation-card').nth(i).locator('svg path')).toHaveCount(1,{timeout:60000});
 await expect(page.locator('.observation-card').nth(3)).toContainText('63680');await expect(page.locator('.observation-card').nth(3)).toContainText('_FNU');
 await expect.poll(async()=>await page.locator('.observation-card').nth(4).locator('svg').count()>0||(await page.locator('.observation-card').nth(4).innerText()).includes('No observation history available'),{timeout:60000}).toBeTruthy();console.log('SNAPSHOTS',await page.locator('.observation-grid').innerText());
 for(const map of ['imagery','topo','civil']){await page.getByLabel('Basemap').selectOption(map);await expect(page.locator('.selected-river')).toHaveAttribute('data-river','McKenzie River');await expect(paths).toHaveCount(count)}
 await expect(page.getByLabel('Weather at selected gauge')).toHaveCount(1);await expect(page.getByLabel('Weather at selected gauge')).not.toContainText('Loading weather',{timeout:45000});
 const weather=(await page.locator('.station-weather').boundingBox())!,grid=(await page.locator('.observation-grid').boundingBox())!;expect(weather.x).toBeGreaterThan(grid.x+grid.width-1);
 const baseline=await browser.newPage({viewport:{width:1440,height:1050}});await baseline.goto('https://dkosten.github.io/Oregon-Rivers-Atlas/#page=overview&station=14162500');await expect(baseline.getByLabel('Select monitoring station')).toBeVisible({timeout:90000});
 for(const viewport of [{width:1440,height:1050},{width:1366,height:900},{width:390,height:844}]){
  await page.setViewportSize(viewport);await baseline.setViewportSize(viewport);if(viewport.width<760){await page.getByLabel('Toggle filters').click();await baseline.getByLabel('Toggle filters').click()}
  const old=(await baseline.getByLabel('Interactive Oregon map').boundingBox())!,current=(await page.getByLabel('Interactive Oregon map').boundingBox())!;
  const ratio=current.width*current.height/(old.width*old.height);console.log('MAP_AREA',JSON.stringify({viewport,baseline:old,current,ratio}));expect(ratio).toBeGreaterThanOrEqual(.85);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();
  await page.screenshot({path:info.outputPath(`refinements-${viewport.width}.png`),fullPage:true});
 }
 await baseline.close();await page.setViewportSize({width:1440,height:1050});await page.getByLabel('Toggle filters').click();
}

