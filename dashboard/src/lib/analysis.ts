import type {Point,Station} from './usgs';
export type Preference={min:number|null,max:number|null,temp:number|null,section?:string,activity?:string};
export function condition(s:Station,p?:Preference){
 if(!p||[p.min,p.max,p.temp].every(x=>x==null))return {label:'Not configured',tone:'neutral'};
 if((p.min!=null||p.max!=null)&&(!s.flow||Date.now()-Date.parse(s.flow.time)>7200000))return {label:'Flow unavailable / stale',tone:'neutral'};
 if(p.temp!=null&&(!s.temperature||Date.now()-Date.parse(s.temperature.time)>7200000))return {label:'Temperature unavailable / stale',tone:'neutral'};
 if((p.min!=null&&s.flow!.value<p.min)||(p.max!=null&&s.flow!.value>p.max)||(p.temp!=null&&s.temperature!.value>p.temp))return {label:'Outside your range',tone:'bad'};
 if(p.min!=null&&p.max!=null&&p.max>p.min&&s.flow&&(s.flow.value-p.min<.1*(p.max-p.min)||p.max-s.flow.value<.1*(p.max-p.min)))return {label:'Near your limit',tone:'warn'};
 return {label:'Within your range',tone:'good'};
}
export function delta24(points:Point[],latest?:Point|null){if(!latest)return null;const target=Date.parse(latest.time)-86400000;const point=points.reduce<Point|null>((best,p)=>!best||Math.abs(Date.parse(p.time)-target)<Math.abs(Date.parse(best.time)-target)?p:best,null);if(!point||Math.abs(Date.parse(point.time)-target)>3600000)return null;return {value:latest.value-point.value,from:point.time,to:latest.time,percent:point.value===0?null:(latest.value-point.value)/point.value*100};}
export function statistics(points:Point[]){if(!points.length)return null;const v=points.map(p=>p.value).sort((a,b)=>a-b);return {min:v[0],max:v.at(-1)!,median:v.length%2?v[(v.length-1)/2]:(v[v.length/2-1]+v[v.length/2])/2,count:v.length};}
