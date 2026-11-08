import {test,expect} from '@playwright/test';
// Real public APIs, no fixtures or replacement observations in deployment tests.
test('live data, hydrography, mouse navigation, filters, history and base paths',async({page},testInfo)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('./#page=overview&station=14305500');
 await expect(page.getByLabel('Select monitoring station')).toBeVisible({timeout:90000});
 const map=page.getByLabel('Interactive Oregon map');
 for(const [river,station] of [['Siletz River','14305500'],['Alsea River','14306500'],['McKenzie River','14162500']]){
  await page.getByLabel('Select monitoring station').selectOption(station);
  await page.getByLabel('Map river geometry').selectOption(river);
  await expect(page.locator('.river-overlay polyline').first()).toBeAttached({timeout:20000});
  await expect(page.getByLabel('Select river reach').locator('option')).not.toHaveCount(1);
  await expect(page.locator('.tiles img').first()).toBeVisible();
  await expect.poll(()=>page.locator('.tiles img').evaluateAll(images=>images.filter(i=>(i as HTMLImageElement).naturalWidth>0).length)).toBeGreaterThan(0);
  await page.screenshot({path:testInfo.outputPath(river.replaceAll(' ','-')+'.png')});
 }
 const box=(await map.boundingBox())!;await page.mouse.move(box.x+box.width*.65,box.y+box.height*.4);const z=Number(await map.getAttribute('data-zoom'));await page.mouse.wheel(0,-150);await expect.poll(async()=>Number(await map.getAttribute('data-zoom'))).toBeGreaterThan(z);
 const before=await page.locator('.river-overlay polyline').first().getAttribute('points');await page.mouse.move(box.x+box.width*.65,box.y+box.height*.4);await page.mouse.down();await page.mouse.move(box.x+box.width*.65+60,box.y+box.height*.4+20,{steps:8});await page.mouse.up();await expect(page.locator('.river-overlay polyline').first()).not.toHaveAttribute('points',before!);
 const dz=Number(await map.getAttribute('data-zoom'));await page.mouse.dblclick(box.x+box.width*.7,box.y+box.height*.4);await expect.poll(async()=>Number(await map.getAttribute('data-zoom'))).toBeGreaterThan(dz);
 await page.getByRole('button',{name:'Reset map to Oregon'}).click();await expect(map).toHaveAttribute('data-zoom','6.0000');
 await page.getByLabel('Turbidity filter',{exact:true}).selectOption('current');await expect.poll(()=>page.getByLabel('Select monitoring station').locator('option').count()).toBeGreaterThan(0);
 await page.getByLabel('Select monitoring station').selectOption('14162500');await page.getByLabel('Expand feature details').click();await expect(page.locator('.turbidity-detail')).toContainText('_FNU');await expect(page.locator('.turbidity-detail')).toContainText('63680');
 await page.getByRole('button',{name:'Show history',exact:true}).click();await expect(page.locator('.turbidity-detail .hydrograph path')).toHaveCount(1,{timeout:60000});await page.locator('.turbidity-detail').getByRole('button',{name:'7D',exact:true}).click();await expect(page.locator('.turbidity-detail .hydrograph path')).toHaveCount(1,{timeout:60000});
 await page.getByLabel('Turbidity method and unit').selectOption('63680|_FNU');await page.getByLabel('Turbidity minimum value').fill('100');await expect(page.getByLabel('Turbidity minimum value')).toHaveValue('100');await page.getByLabel('Turbidity minimum value').fill('0');
 await page.getByLabel('Turbidity filter',{exact:true}).selectOption('rising');await expect(page.getByRole('status').filter({hasText:/Checked \d+\/\d+/})).toBeVisible({timeout:90000});
 await page.getByLabel('Turbidity filter',{exact:true}).selectOption('all');await page.getByLabel('Turbidity method and unit').selectOption('');
 await page.getByRole('button',{name:'Collapse feature details'}).click();await page.getByLabel('USFS sites',{exact:true}).check();await expect.poll(()=>page.locator('.access-pin').count(),{timeout:90000}).toBeGreaterThan(0);await page.getByLabel('USFS sites',{exact:true}).uncheck();await expect(page.locator('.access-pin')).toHaveCount(0);
 await page.goto('./#page=overview&station=14372300');await expect(page.getByLabel('Select monitoring station')).toHaveValue('14372300',{timeout:90000});await page.reload();await expect(page.getByLabel('Select monitoring station')).toHaveValue('14372300',{timeout:90000});
 expect(errors).toEqual([]);
});
test('mobile layout, touch drag and pinch preserve geographic alignment',async({browser},testInfo)=>{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const page=await context.newPage();await page.goto('http://127.0.0.1:4173/Oregon-Rivers-Atlas/#page=overview&station=14305500');await expect(page.getByLabel('Select monitoring station')).toBeVisible({timeout:90000});await page.getByLabel('Map river geometry').selectOption('Siletz River');await expect(page.locator('.river-overlay polyline').first()).toBeAttached();
 const map=page.getByLabel('Interactive Oregon map');await map.scrollIntoViewIfNeeded();const b=(await map.boundingBox())!;const cdp=await context.newCDPSession(page);const x=b.x+b.width*.5,y=b.y+b.height*.4;const before=await page.locator('.river-overlay polyline').first().getAttribute('points');await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+35,y:y+25,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await expect(page.locator('.river-overlay polyline').first()).not.toHaveAttribute('points',before!);
 const z=Number(await map.getAttribute('data-zoom'));await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x-30,y,id:1},{x:x+30,y,id:2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-60,y,id:1},{x:x+60,y,id:2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await expect.poll(async()=>Number(await map.getAttribute('data-zoom'))).toBeGreaterThan(z);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();await page.screenshot({path:testInfo.outputPath('mobile.png'),fullPage:true});await context.close();
});

test('Explorer settings, compatible ranges, basemaps, source icons and navigation',async({page},testInfo)=>{
 await page.goto('./#page=overview&station=14162500');await expect(page.getByLabel('Select monitoring station')).toBeVisible({timeout:90000});
 const map=page.getByLabel('Interactive Oregon map');
 // These fetches execute in a real browser origin and verify readable CORS responses.
 for(const url of ['https://tile.openstreetmap.org/6/10/23.png','https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/6/23/10','https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/6/23/10']){
  expect(await page.evaluate(async u=>{const r=await fetch(u);return r.ok&&r.type==='cors'},url)).toBeTruthy();
 }
 const z=await map.getAttribute('data-zoom');for(const mode of ['topo','imagery','civil']){await page.getByLabel('Basemap',{exact:true}).selectOption(mode);await expect(map).toHaveAttribute('data-zoom',z!);await expect.poll(()=>page.locator('.tiles img').evaluateAll(imgs=>imgs.filter(i=>(i as HTMLImageElement).naturalWidth>0).length)).toBeGreaterThan(0);}
 await page.getByLabel('Filter water temperature',{exact:true}).check();await page.getByLabel('Water temperature minimum value').fill('10');await page.getByLabel('Water temperature maximum value').fill('20');
 await page.getByLabel('Temperature unit',{exact:true}).selectOption('F');await expect(page.getByLabel('Water temperature minimum value')).toHaveValue('50');await expect(page.getByLabel('Water temperature maximum value')).toHaveValue('68');
 let calls=0;page.on('request',r=>{if(r.url().includes('api.waterdata.usgs.gov'))calls++});await page.waitForTimeout(1500);calls=0;await page.getByLabel('Maximum water temperature',{exact:true}).focus();await page.keyboard.press('ArrowLeft');await page.waitForTimeout(300);expect(calls).toBe(0);
 await page.reload();await expect(page.getByLabel('Filter water temperature',{exact:true})).toBeChecked();await expect(page.getByLabel('Temperature unit')).toHaveValue('F');await page.getByRole('button',{name:/Reset filters/}).click();
 await page.getByLabel('USFS sites',{exact:true}).check();await expect.poll(()=>page.locator('.access-pin').count(),{timeout:90000}).toBeGreaterThan(0);await page.getByRole('button',{name:'Hide all',exact:true}).click();await expect(page.locator('.access-pin')).toHaveCount(0);await page.getByRole('button',{name:'Show all',exact:true}).click();await expect.poll(()=>page.locator('.access-pin').count()).toBeGreaterThan(0);
 await page.getByLabel('Map river geometry').selectOption('McKenzie River');await expect(page.locator('.river-overlay polyline').first()).toBeAttached();await page.screenshot({path:testInfo.outputPath('explorer-desktop.png'),fullPage:true});
 await page.getByRole('button',{name:'Historical analytics',exact:true}).click();await expect(page.getByLabel('Analysis station')).toHaveValue('14162500');await page.getByRole('button',{name:'River overview',exact:true}).click();await expect(map).toBeVisible();
});
