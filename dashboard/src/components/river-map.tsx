'use client';
import {useEffect,useRef,useState} from 'react';
import {condition,type Preference} from '../lib/analysis';
import {loadGeography} from '../lib/geography';
import {Plus,Minus,LocateFixed,Layers} from 'lucide-react';
import type {Station} from '../lib/usgs';
const world=(lon:number,lat:number,z:number)=>{const n=256*2**z;const a=lat*Math.PI/180;return [(lon+180)/360*n,(1-Math.log(Math.tan(a)+1/Math.cos(a))/Math.PI)/2*n]};
const inverse=(x:number,y:number,z:number)=>{const n=256*2**z;return [x/n*360-180,Math.atan(Math.sinh(Math.PI*(1-2*y/n)))*180/Math.PI]};
export default function RiverMap({stations,selected,onSelect,preferences}:{preferences:Record<string,Preference>,stations:Station[],selected?:Station,onSelect:(id:string)=>void}){
 const ref=useRef<HTMLDivElement>(null);const [size,setSize]=useState([800,500]);const [center,setCenter]=useState([-122.25,44.4]);const [zoom,setZoom]=useState(7);const [tileError,setTileError]=useState(false);const [access,setAccess]=useState<any[]>([]);const [layer,setLayer]=useState(false);const [message,setMessage]=useState('');const drag=useRef<any>(null);
 useEffect(()=>{const r=new ResizeObserver(e=>setSize([e[0].contentRect.width,e[0].contentRect.height]));if(ref.current)r.observe(ref.current);return()=>r.disconnect()},[]);
 useEffect(()=>{let gone=false;if(!layer){setAccess([]);setMessage('');return;}setMessage('Loading federal map layers…');loadGeography().then((d:any)=>{if(!gone){setAccess(d.access||[]);setMessage(d.error||'USFS recreation sites · verify access with the land manager')}}).catch(()=>!gone&&setMessage('Geographic layers unavailable'));return()=>{gone=true}},[layer]);
 const c=world(center[0],center[1],zoom),left=c[0]-size[0]/2,top=c[1]-size[1]/2;const tiles=[];
 for(let x=Math.floor(left/256);x<=Math.floor((left+size[0])/256);x++)for(let y=Math.floor(top/256);y<=Math.floor((top+size[1])/256);y++)tiles.push({x,y});
 const pos=(lon:number,lat:number)=>{const a=world(lon,lat,zoom);return[a[0]-left,a[1]-top]};
 return <div className="map" ref={ref} aria-label="Interactive USGS topographic map" onPointerDown={e=>{if((e.target as HTMLElement).closest('button,a,polyline'))return;drag.current={x:e.clientX,y:e.clientY,c};e.currentTarget.setPointerCapture(e.pointerId)}} onPointerMove={e=>{if(!drag.current)return;const d=drag.current;setCenter(inverse(d.c[0]-(e.clientX-d.x),d.c[1]-(e.clientY-d.y),zoom))}} onPointerUp={()=>drag.current=null} onPointerCancel={()=>drag.current=null}>
 <div className="tiles">{tiles.map(t=><img alt="" draggable={false} key={`${zoom}-${t.x}-${t.y}`} src={`https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/${zoom}/${t.y}/${t.x}`} style={{left:t.x*256-left,top:t.y*256-top}} onError={()=>setTileError(true)}/>)}</div>
 {stations.filter(s=>s.lat!=null&&s.lon!=null).map(s=>{const p=pos(s.lon!,s.lat!);if(p[0]<-30||p[0]>size[0]+30||p[1]<-30||p[1]>size[1]+30)return null;return <button key={s.id} className={'map-pin '+condition(s,preferences[s.id]).tone+' '+(selected?.id===s.id?'selected':'')} style={{left:p[0],top:p[1]}} onClick={()=>onSelect(s.id)} title={`${s.name}\n${s.flow?s.flow.value.toLocaleString()+' CFS':'Flow unavailable'}\n${s.temperature?s.temperature.value+' °C':'Temperature unavailable'}`} aria-label={`Select ${s.name}`}><span/>{selected?.id===s.id&&<b>{s.flow?s.flow.value.toLocaleString()+' CFS':'No flow'}</b>}</button>})}
 {access.map((f,i)=>{const p=pos(f.geometry.x,f.geometry.y);return <a className="access-pin" title={`${f.attributes.recareaname||'USFS recreation site'} — ${f.attributes.openstatus||'status unknown'}; check official access status`} key={i} style={{left:p[0],top:p[1]}} href={f.url||'https://www.fs.usda.gov/visit/maps'} target="_blank" rel="noreferrer">△</a>})}
 <div className="map-caption"><span className="live-dot"/> OREGON FIELD MAP <small>{stations.length} filtered gauges</small></div>
 <div className="map-controls"><button title="Zoom in" aria-label="Zoom in" onClick={()=>setZoom(Math.min(14,zoom+1))}><Plus size={17}/></button><button title="Zoom out" aria-label="Zoom out" onClick={()=>setZoom(Math.max(6,zoom-1))}><Minus size={17}/></button><button title="Center selected station" aria-label="Center selected station" onClick={()=>{setCenter(selected?.lon!=null&&selected?.lat!=null?[selected.lon,selected.lat]:[-122.25,44.4]);setZoom(selected?10:7)}}><LocateFixed size={17}/></button></div>
 <button className={'map-layers '+(layer?'active':'')} onClick={()=>setLayer(!layer)}><Layers size={15}/> USFS recreation sites</button>
 <div className="map-credit"><a href="https://www.usgs.gov/programs/national-geospatial-program/national-map" target="_blank" rel="noreferrer">USGS · The National Map</a> · drag to pan</div>
 {(message||tileError)&&<div className="map-message">{tileError?'Some basemap tiles unavailable. Station positions remain georeferenced.':message}</div>}
 </div>
}
