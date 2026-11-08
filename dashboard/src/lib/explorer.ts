import type {Station} from './usgs';
import {fresh,methodKey} from './turbidity.ts';
export const categories=['campground','dispersed','boat','raft','paddle','river','trail','picnic','viewpoint','parking','other'] as const;
export type Category=typeof categories[number];
export const categoryLabels:Record<Category,string>={campground:'Campgrounds',dispersed:'Dispersed camping',boat:'Boating / launches',raft:'Designated raft / drift access',paddle:'Non-motorized boating',river:'River / stream recreation',trail:'Trailheads / hiking',picnic:'Picnic / day use',viewpoint:'Viewpoints / wildlife',parking:'Parking',other:'Other recreation'};
// USFS primary marker activity is authoritative. No vessel suitability is inferred.
export function recreationCategory(activity:unknown):Category{
 const a=typeof activity==='string'?activity.toLowerCase():'';
 if(a==='dispersed camping')return 'dispersed';
 if(/camping/.test(a))return 'campground';
 if(/raft|drift boat/.test(a))return 'raft';
 if(a==='boating - non-motorized'||/kayak|canoe|paddl/.test(a))return 'paddle';
 if(a==='boating - motorized'||a==='boat launch')return 'boat';
 if(a==='river and stream fishing'||a==='river access')return 'river';
 if(a==='trailhead'||a==='day hiking'||a==='backpacking')return 'trail';
 if(/picnick|day use/.test(a))return 'picnic';
 if(/viewing|birdwatching/.test(a))return 'viewpoint';
 if(a==='parking')return 'parking';
 return 'other';
}
export type ExplorerSettings={temperature:boolean;temperatureRange:[number,number];unit:'C'|'F';turbidity:boolean;turbidityRange:[number,number];method:string;categories:Category[];basemap:'civil'|'topo'|'imagery';gauges:boolean;rivers:boolean;recreation:boolean;waterQuality:boolean};
export const defaults:ExplorerSettings={temperature:false,temperatureRange:[0,30],unit:'C',turbidity:false,turbidityRange:[0,100],method:'',categories:[...categories],basemap:'civil',gauges:true,rivers:true,recreation:false,waterQuality:true};
const key='oregon-rivers:explorer:v1';
export function validateSettings(raw:any):ExplorerSettings{
 const s={...defaults,temperatureRange:[...defaults.temperatureRange],turbidityRange:[...defaults.turbidityRange],categories:[...categories]} as ExplorerSettings;
 if(!raw||typeof raw!=='object')return s;
 for(const k of ['temperature','turbidity','gauges','rivers','recreation','waterQuality'] as const)if(typeof raw[k]==='boolean')s[k]=raw[k];
 for(const [k,max] of [['temperatureRange',45],['turbidityRange',1000000]] as const){const r=raw[k];if(Array.isArray(r)&&r.length===2&&r.every(v=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=max)&&r[0]<=r[1])s[k]=[r[0],r[1]];}
 if(raw.unit==='F')s.unit='F';if(['civil','topo','imagery'].includes(raw.basemap))s.basemap=raw.basemap;
 if(typeof raw.method==='string'&&/^\d{5}\|[\w /-]{1,30}$/.test(raw.method))s.method=raw.method;
 if(Array.isArray(raw.categories))s.categories=categories.filter(c=>raw.categories.includes(c));return s;
}
export function readSettings(){try{return validateSettings(JSON.parse(localStorage.getItem(key)||'null'))}catch{return validateSettings(null)}}
export function saveSettings(s:ExplorerSettings){localStorage.setItem(key,JSON.stringify(validateSettings(s)))}
export function matchesRanges(s:Station,f:ExplorerSettings){
 if(f.temperature&&(!s.temperature||!fresh(s.temperature)||s.temperature.value<f.temperatureRange[0]||s.temperature.value>f.temperatureRange[1]))return false;
 if(f.turbidity&&(!f.method||!s.turbidity.some(p=>fresh(p)&&methodKey(p)===f.method&&p.value>=f.turbidityRange[0]&&p.value<=f.turbidityRange[1])))return false;return true;
}
export function toDisplay(c:number,unit:'C'|'F'){return unit==='F'?c*9/5+32:c}
export function toCelsius(v:number,unit:'C'|'F'){return unit==='F'?(v-32)*5/9:v}
