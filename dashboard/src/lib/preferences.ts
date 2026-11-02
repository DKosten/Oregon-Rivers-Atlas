import type {Preference} from './analysis';
const KEY='oregon-rivers:preferences:v1';
export function validatePreferences(input:unknown):Record<string,Preference>{
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Invalid saved preferences');
 const result:Record<string,Preference>={};
 for(const [id,raw] of Object.entries(input)){
  if(!/^\d{8,15}$/.test(id)||!raw||typeof raw!=='object')throw Error('Invalid station preference');
  const p=raw as Preference;
  for(const field of ['min','max','temp'] as const){const n=p[field];if(n!==null&&(typeof n!=='number'||!Number.isFinite(n)||n<0))throw Error('Thresholds must be nonnegative numbers or blank');}
  if(p.min!=null&&p.max!=null&&p.min>p.max)throw Error('Minimum flow cannot exceed maximum flow');
  if(p.temp!=null&&p.temp>45)throw Error('Temperature ceiling must be at most 45 °C');
  if(p.section!=null&&typeof p.section!=='string')throw Error('Invalid section label');
  if(p.activity!=null&&!['Fishing','Rafting','Wading'].includes(p.activity))throw Error('Invalid activity');
  result[id]={min:p.min,max:p.max,temp:p.temp,section:(p.section||'').slice(0,240),activity:p.activity||'Fishing'};
 }
 return result;
}
export function readPreferences(){try{const raw=localStorage.getItem(KEY);return raw?validatePreferences(JSON.parse(raw)):{};}catch{throw Error('Saved preferences could not be read. Check browser storage settings; no thresholds were applied.');}}
export function writePreferences(input:unknown){const valid=validatePreferences(input);try{localStorage.setItem(KEY,JSON.stringify(valid));}catch{throw Error('Browser storage is unavailable or full. Preferences were not saved.');}return valid;}
