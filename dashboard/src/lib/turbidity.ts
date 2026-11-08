import type {Point} from './usgs';
export const fresh=(p:Point,now=Date.now())=>now-Date.parse(p.time)<=7200000&&Date.parse(p.time)<=now+300000;
export const seriesKey=(p:Point)=>[p.parameterCode,p.unit,p.seriesId].join('|');
export const methodKey=(p:Point)=>[p.parameterCode,p.unit].join('|');
export type Trend='rising'|'falling'|'stable'|'unknown';
// Compare the same sensor against its reading one hour earlier (±15 min).
// Stable is a descriptive ±5% band (0.1 unit minimum), not a safety threshold.
export function trend(points:Point[],current:Point,now=Date.now()):Trend{
 if(!fresh(current,now))return 'unknown';const target=Date.parse(current.time)-3600000;
 const candidates=points.filter(p=>seriesKey(p)===seriesKey(current)&&Math.abs(Date.parse(p.time)-target)<=900000);
 const before=candidates.sort((a,b)=>Math.abs(Date.parse(a.time)-target)-Math.abs(Date.parse(b.time)-target))[0];
 if(!before)return 'unknown';const delta=current.value-before.value,band=Math.max(.1,Math.abs(before.value)*.05);return Math.abs(delta)<=band?'stable':delta>0?'rising':'falling';
}
export function matchesTurbidity(points:Point[],filter:string,method:string,min:string,max:string,trends:Record<string,Trend>,station:string){
 if(filter==='all'&&!method)return true;
 return points.some(p=>fresh(p)&&(!method||methodKey(p)===method)&&(min===''||p.value>=Number(min))&&(max===''||p.value<=Number(max))&&(['all','current'].includes(filter)||trends[station+'|'+seriesKey(p)]===filter));
}
