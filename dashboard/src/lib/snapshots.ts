import type {Point} from './usgs';
export function snapshotPoints(points:Point[],start:number,end:number,unit?:string,series?:string){return points.filter(p=>Number.isFinite(p.value)&&Date.parse(p.time)>=start&&Date.parse(p.time)<=end&&(!unit||p.unit===unit)&&(!series||p.seriesId===series)).sort((a,b)=>Date.parse(a.time)-Date.parse(b.time));}
export const fahrenheit=(p:Point):Point=>({...p,value:p.value*9/5+32,unit:'°F'});
export function sparkPath(points:Point[],start:number,end:number){
 if(!points.length)return {d:'',x:(_:number)=>0,y:(_:number)=>0};const values=points.map(p=>p.value),lo=Math.min(...values),hi=Math.max(...values),pad=Math.max((hi-lo)*.12,.1),min=lo-pad,max=hi+pad;
 const x=(t:number)=>3+(t-start)/(end-start||1)*234,y=(v:number)=>36-(v-min)/(max-min)*32;let last=0;
 const d=points.map((p,i)=>{const t=Date.parse(p.time),command=i===0||t-last>7200000?'M':'L';last=t;return `${command}${x(t)},${y(p.value)}`}).join(' ');return {d,x,y};
}
