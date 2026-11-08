import {useEffect,useState} from 'react';
import {loadHistory,type Station,type Point} from '../lib/usgs';
import {seriesKey} from '../lib/turbidity';
import {snapshotPoints,fahrenheit} from '../lib/snapshots';
import {ObservationSparkline} from './hydrograph';
type Result={points:Point[];start:number;end:number;error?:string};
const labels=['Streamflow','Gauge stage','Water temperature','Turbidity','Air temperature · observed'];
const stamp=(t:string)=>new Date(t).toLocaleString('en-US',{timeZone:'America/Los_Angeles',timeZoneName:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
export default function ObservationSnapshots({station,refreshKey}:{station:Station;refreshKey:string}){
 const [sensor,setSensor]=useState(''),[results,setResults]=useState<Record<string,Result>>({});
 const turbidity=station.turbidity.find(p=>seriesKey(p)===sensor)||station.turbidity[0];
 const signature=[station.flow?.seriesId,station.height?.seriesId,station.temperature?.seriesId,turbidity&&seriesKey(turbidity)].join('|');
 useEffect(()=>{let gone=false;setResults({});const specs=[['00060',station.flow],['00065',station.height],['00010',station.temperature],[turbidity?.parameterCode,turbidity],['00020',null]] as const;
 specs.forEach(async([code,current],i)=>{const end=Date.now(),start=end-48*3600000;let result:Result={points:[],start,end};try{if(code){const h=await loadHistory(station.id,code,2,undefined,current?.seriesId);result={points:snapshotPoints(h.points,Date.parse(h.start),Date.parse(h.end),current?.unit,current?.seriesId),start:Date.parse(h.start),end:Date.parse(h.end)};if(i===2||i===4)result.points=result.points.map(fahrenheit)}}catch{result.error='Observation history unavailable · request failed'}if(!gone)setResults(r=>({...r,[i]:result}))});return()=>{gone=true}},[station.id,signature,refreshKey]);
 return <div className="observation-grid" aria-label="48-hour observed conditions">{labels.map((label,i)=>{const r=results[i],last=r?.points.at(-1),unit=i===0?'CFS':last?.unit||['CFS','ft','°F',turbidity?.unit||'','°F'][i];return <section className="observation-card" key={label}><div className="snapshot-label">{label}</div><div className="snapshot-value">{last?<><b>{last.value.toLocaleString('en-US',{maximumFractionDigits:2})}</b> {unit}</>:<span>— {unit}</span>}</div>{r?.points.length?<ObservationSparkline points={r.points} start={r.start} end={r.end} unit={unit}/>:<div className="snapshot-empty">{!r?'Loading observations…':r.error||'No observation history available'}</div>}<small title={last?`${stamp(last.time)} · ${last.approvalStatus} · USGS ${station.id}`:undefined}>{last?stamp(last.time):'USGS observations only'}</small>{i===3&&turbidity&&<small className="sensor-note" title={`Sensor ${turbidity.seriesId}`}>Parameter {turbidity.parameterCode} · {turbidity.unit}</small>}{i===3&&station.turbidity.length>1&&<select aria-label="Snapshot turbidity sensor" value={seriesKey(turbidity)} onChange={e=>setSensor(e.target.value)}>{station.turbidity.map(p=><option key={seriesKey(p)} value={seriesKey(p)}>{p.parameterCode} · {p.unit} · {p.seriesId}</option>)}</select>}</section>})}</div>;
}
