/* Adapted from DKosten/Oregon-Rivers usgs.py. Exact gauge joins, unit checks,
   pagination validation and consistent-series selection are preserved. */
export const BASE='https://api.waterdata.usgs.gov/ogcapi/v1';
export type Point={time:string,value:number,unit:string,seriesId:string,approvalStatus:string,qualifiers:unknown};
export type Station={id:string,name:string,river:string,lat:number|null,lon:number|null,flow:Point|null,temperature:Point|null,height:Point|null};
export const fields:Record<string,string>={'00060':'flow','00010':'temperature','00065':'height'};
export async function features(collection:string,params:Record<string,string>){
 let url=BASE+'/collections/'+collection+'/items?'+new URLSearchParams({f:'json',limit:'10000',...params});
 const seen=new Set<string>();const out:any[]=[];
 while(url){
  const u=new URL(url);if(u.origin!==new URL(BASE).origin||!u.pathname.startsWith('/ogcapi/v1/')||u.username||u.password)throw Error('Unexpected USGS pagination destination');
  if(seen.has(url)||seen.size>=40)throw Error('USGS pagination limit reached; partial data withheld');seen.add(url);
  const res=await fetch(url,{headers:{Accept:'application/geo+json, application/json'},signal:AbortSignal.timeout(25000),redirect:'manual',cache:'no-store'});
  if(!res.ok)throw Error('USGS HTTP '+res.status+(res.status===429?' — request quota reached; retry later':''));
  const data=await res.json() as any;if(!Array.isArray(data.features))throw Error('Invalid USGS response');out.push(...data.features);
  const next=data.links?.find((l:any)=>l.rel==='next')?.href;url=next?new URL(next,url).href:'';
 }return out;
}
export function observations(items:any[],daily=false){
 const groups=new Map<string,Map<string,Point>>();
 for(const f of items){const p=f.properties||{};const code=p.parameter_code;
  if(!/^USGS-\d{8,15}$/.test(p.monitoring_location_id)||!fields[code]||p.value==null||p.value==='')continue;
  const value=Number(p.value);const unit=p.unit_of_measure;
  if(!Number.isFinite(value))continue;
  if(code==='00060'&&(unit!=='ft^3/s'||value<0||value>1e8))continue;
  if(code==='00010'&&(!['degC','°C'].includes(unit)||value< -5||value>45))continue;
  if(code==='00065'&&(unit!=='ft'||Math.abs(value)>10000))continue;
  const raw=String(p.time||'');if(!daily&&!/(Z|[+-]\d\d:\d\d)$/.test(raw))continue;
  if(!Number.isFinite(Date.parse(raw)))continue;
  const time=daily?raw.slice(0,10):new Date(raw).toISOString();
  const seriesId=p.time_series_id||'';const key=[p.monitoring_location_id,code,seriesId].join('|');
  if(!groups.has(key))groups.set(key,new Map());groups.get(key)!.set(time,{time,value,unit,seriesId,approvalStatus:p.approval_status||'Unknown',qualifiers:p.qualifier||[]});
 }
 const selected=new Map<string,Point[]>();
 for(const [key,values] of groups){const [site,code]=key.split('|');const arr=[...values.values()].sort((a,b)=>a.time.localeCompare(b.time));const old=selected.get(site+'|'+code);
  if(!old||arr.at(-1)!.time>old.at(-1)!.time||(arr.at(-1)!.time===old.at(-1)!.time&&arr.at(-1)!.seriesId>old.at(-1)!.seriesId))selected.set(site+'|'+code,arr);
 }return selected;
}
export function normalize(items:any[],locations:any[]):Station[]{
 const obs=observations(items);return locations.filter(f=>f.properties?.state_code==='41'&&f.properties?.site_type_code==='ST').map(f=>{
  const id=f.id||f.properties.id;const p=f.properties;const coords=f.geometry?.type==='Point'?f.geometry.coordinates:[];
  return {id:String(id).replace('USGS-',''),name:p.monitoring_location_name||id,river:(p.monitoring_location_name||id).split(/\s+(?:AT|NEAR|BELOW|ABOVE|NR|BLW)\s+/i)[0],lat:Number.isFinite(coords[1])?coords[1]:null,lon:Number.isFinite(coords[0])?coords[0]:null,
  flow:obs.get(id+'|00060')?.at(-1)||null,temperature:obs.get(id+'|00010')?.at(-1)||null,height:obs.get(id+'|00065')?.at(-1)||null};
 }).filter(s=>s.flow||s.temperature||s.height);
}
let current:{at:number,data:any}|undefined;
export async function loadCurrent(){
 if(current&&Date.now()-current.at<300000)return current.data;
 const params={state_code:'41',site_type_code:'ST',agency_code:'USGS'};
 const [locations,...results]=await Promise.all([features('monitoring-locations',params),...Object.keys(fields).map(parameter_code=>features('latest-continuous',{...params,parameter_code}))]);
 // Do not retain observations older than 14 days, even in this five-minute cache.
 const cutoff=Date.now()-14*86400000;
 const stations=normalize(results.flat().filter(f=>Date.parse(f.properties?.time)>=cutoff),locations);
 const data={stations,fetchedAt:new Date().toISOString(),source:BASE};current={at:Date.now(),data};return data;
}
export async function loadHistory(site:string,code:string,days:number,end?:string,series?:string){
 if(!/^\d{8,15}$/.test(site)||!fields[code]||!Number.isInteger(days)||days<1||days>1827)throw Error('Invalid historical selection');
 if(end&&(!/^\d{4}-\d{2}-\d{2}$/.test(end)||!Number.isFinite(Date.parse(end))))throw Error('Invalid historical end date');
 if(series&&!/^[A-Za-z0-9-]{1,100}$/.test(series))throw Error('Invalid sensor series');
 const finish=end?new Date(end+'T23:59:59Z'):new Date();const start=end&&days===365&&end.endsWith('-12-31')?new Date(end.slice(0,4)+'-01-01T00:00:00Z'):new Date(finish.getTime()-days*86400000);const daily=days>7;
 const params:Record<string,string>={monitoring_location_id:'USGS-'+site,parameter_code:code,time:(daily?start.toISOString().slice(0,10):start.toISOString())+'/'+(daily?finish.toISOString().slice(0,10):finish.toISOString())};
 if(daily)params.statistic_id='00003';else if(series)params.time_series_id=series;
 const points=observations(await features(daily?'daily':'continuous',params),daily).get('USGS-'+site+'|'+code)||[];
 return {points,site,code,daily,source:BASE,start:params.time.split('/')[0],end:params.time.split('/')[1],seriesId:points[0]?.seriesId||null};
}
