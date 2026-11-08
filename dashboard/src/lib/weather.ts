// Ported from the original server.py weather adapter; modeled weather is not a gauge observation.
export function precipitationType(code:unknown){
 if([0,1,2,3,45,48].includes(Number(code)))return 'None';
 if([51,53,55,61,63,65].includes(Number(code)))return 'Rain / drizzle';
 if([56,57,66,67].includes(Number(code)))return 'Freezing rain';
 if([71,73,75,77].includes(Number(code)))return 'Snow';
 if([80,81,82].includes(Number(code)))return 'Rain showers';
 if([85,86].includes(Number(code)))return 'Snow showers';
 if([95,96,99].includes(Number(code)))return 'Thunderstorm / possible hail';
 return 'Unknown';
}
export function normalizeWeather(item:any){
 const c=item.current||{};
 const number=(key:string,min:number,max:number)=>typeof c[key]==='number'&&Number.isFinite(c[key])&&c[key]>=min&&c[key]<=max?c[key]:null;
 const raw=typeof c.time==='string'?c.time:'';
 const time=raw?raw+(/(Z|[+-]\d{2}:\d{2})$/.test(raw)?'':'Z'):'';
 const u=item.current_units||{};
 return {weatherCode:number('weather_code',0,99),air:u.temperature_2m==='°C'?number('temperature_2m',-80,65):null,cloud:u.cloud_cover==='%'?number('cloud_cover',0,100):null,wind:u.wind_speed_10m==='mp/h'?number('wind_speed_10m',0,250):null,windDirection:u.wind_direction_10m==='°'?number('wind_direction_10m',0,360):null,precipMm:u.precipitation==='mm'?number('precipitation',0,10000):null,precip:c.weather_code==null?'Unknown':precipitationType(c.weather_code),time:Number.isFinite(Date.parse(time))?time:null};
}
export function weatherURL(lat:number,lon:number){
 if(!Number.isFinite(lat)||!Number.isFinite(lon)||lat<41.5||lat>46.5||lon< -125||lon> -116.2)throw Error('Weather coordinates outside Oregon coverage');
 return 'https://api.open-meteo.com/v1/forecast?'+new URLSearchParams({latitude:String(lat),longitude:String(lon),current:'temperature_2m,cloud_cover,wind_speed_10m,wind_direction_10m,weather_code,precipitation',wind_speed_unit:'mph',temperature_unit:'celsius',timezone:'GMT',forecast_days:'1'});
}
const cache=new Map<string,{at:number,data:ReturnType<typeof normalizeWeather>}>();
export async function loadWeather(lat:number,lon:number){const url=weatherURL(lat,lon),cached=cache.get(url);if(cached&&Date.now()-cached.at<600000)return cached.data;
 const r=await fetch(url,{signal:AbortSignal.timeout(25000),cache:'no-store'});if(!r.ok)throw Error('Weather provider HTTP '+r.status);
 const raw=await r.json();if(!raw.current)throw Error('Weather observations unavailable');const data=normalizeWeather(raw);cache.set(url,{at:Date.now(),data});if(cache.size>40)cache.delete(cache.keys().next().value!);return data;
}
