import {Cloud,Sun,Wind,CloudRain,Thermometer} from 'lucide-react';
import {useEffect,useState} from 'react';
import type {Station} from '../lib/usgs';
import {loadWeather} from '../lib/weather';
export default function Weather({station,refreshKey}:{station:Station,refreshKey:string}){
 const [data,setData]=useState<Awaited<ReturnType<typeof loadWeather>>|null>(null),[error,setError]=useState('');
 useEffect(()=>{let gone=false;setData(null);setError('');if(station.lat==null||station.lon==null){setError('Gauge coordinates unavailable');return;}loadWeather(station.lat,station.lon).then(d=>{if(!gone)setData(d)}).catch(e=>{if(!gone)setError(e.message)});return()=>{gone=true}},[station.id,station.lat,station.lon,refreshKey]);
 const v=(n:number|null|undefined,unit:string)=>n==null?'Unavailable':`${n.toLocaleString()} ${unit}`;
 const Icon=data?.weatherCode!=null&&data.weatherCode<=1?Sun:data?.weatherCode!=null&&data.weatherCode>=51?CloudRain:Cloud;
 return <div className="compact-weather" aria-label="Weather at selected gauge"><small>Weather · modeled</small>{error?<span role="status">Weather unavailable: {error}</span>:!data?<span>Loading weather…</span>:<><span><Icon size={16}/>{data.weatherCode===0?'Clear':data.weatherCode===1?'Mainly clear':data.weatherCode===2?'Partly cloudy':data.weatherCode===3?'Overcast':data.weatherCode===45||data.weatherCode===48?'Fog':data.precip}</span><span><Thermometer size={15}/>{v(data.air,'°C')}</span><span><Wind size={16}/>{v(data.wind,'mph')}{data.windDirection==null?'':` · ${data.windDirection}°`}</span><span><CloudRain size={16}/>{v(data.precipMm,'mm')}</span><details><summary>Weather details</summary><p>Cloud cover: {v(data.cloud,'%')}. Precipitation probability is unavailable in the current-condition feed. Rain amount is not probability.</p><p>Model time: {data.time?new Date(data.time).toLocaleString('en-US',{timeZone:'America/Los_Angeles',timeZoneName:'short'}):'Unavailable'}{data.time&&Date.now()-Date.parse(data.time)>7200000?' · stale':''}. Modeled near the gauge, not an on-site measurement.</p><a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo · CC BY 4.0 ↗</a></details></>}</div>;
}
