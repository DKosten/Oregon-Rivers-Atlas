import {useEffect,useRef,useState} from 'react';
import {zoomAt,pan,type View} from '../lib/map-view';
export function useMapNavigation(){
 const ref=useRef<HTMLDivElement>(null),[size,setSize]=useState([800,500]);
 const [view,setView]=useState<View>({center:[-120.55,44.15],zoom:6});const current=useRef(view),dimensions=useRef(size),animation=useRef(0);
 const pointers=useRef(new Map<number,number[]>()),moved=useRef(false);
 const update=(v:View)=>{current.current=v;setView(v)};dimensions.current=size;
 useEffect(()=>{const r=new ResizeObserver(e=>setSize([e[0].contentRect.width,e[0].contentRect.height]));if(ref.current)r.observe(ref.current);return()=>{r.disconnect();cancelAnimationFrame(animation.current)}},[]);
 useEffect(()=>{const el=ref.current;if(!el)return;const wheel=(e:WheelEvent)=>{if((e.target as HTMLElement).closest('button,a,select,input,label'))return;e.preventDefault();cancelAnimationFrame(animation.current);const r=el.getBoundingClientRect();const d=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?r.height:1);update(zoomAt(current.current,current.current.zoom-Math.max(-160,Math.min(160,d))*(e.ctrlKey?.008:.003),[e.clientX-r.left,e.clientY-r.top],dimensions.current))};el.addEventListener('wheel',wheel,{passive:false});return()=>el.removeEventListener('wheel',wheel)},[]);
 const zoom=(delta:number,point=dimensions.current.map(v=>v/2))=>{cancelAnimationFrame(animation.current);const start=current.current,end=Math.min(16,Math.max(6,start.zoom+delta)),at=performance.now();const frame=(t:number)=>{const n=matchMedia('(prefers-reduced-motion: reduce)').matches?1:Math.min(1,(t-at)/160);update(zoomAt(start,start.zoom+(end-start.zoom)*(1-(1-n)**3),point,dimensions.current));if(n<1)animation.current=requestAnimationFrame(frame)};animation.current=requestAnimationFrame(frame)};
 const point=(e:React.PointerEvent<HTMLDivElement>)=>{const r=e.currentTarget.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top]};
 const isControl=(target:EventTarget)=>{const el=target instanceof Element?target:null;return !!el?.closest('a,select,input,label,button:not(.map-pin):not(.turbidity-pin):not(.access-pin)')};
 const stop=(e:React.PointerEvent<HTMLDivElement>)=>{pointers.current.delete(e.pointerId);if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId)};
 const events={
  onPointerDown:(e:React.PointerEvent<HTMLDivElement>)=>{if(e.button!==0||isControl(e.target))return;if(e.pointerType==='mouse')e.preventDefault();cancelAnimationFrame(animation.current);if(!pointers.current.size)moved.current=false;pointers.current.set(e.pointerId,point(e))},
  onPointerMove:(e:React.PointerEvent<HTMLDivElement>)=>{if(!pointers.current.has(e.pointerId))return;const before=[...pointers.current.values()];const old=pointers.current.get(e.pointerId)!;const p=point(e);if(!moved.current&&before.length===1&&Math.hypot(p[0]-old[0],p[1]-old[1])<3)return;moved.current=true;if(!e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.setPointerCapture(e.pointerId);pointers.current.set(e.pointerId,p);const after=[...pointers.current.values()];if(before.length===2){const mid=(a:number[][])=>[(a[0][0]+a[1][0])/2,(a[0][1]+a[1][1])/2],dist=(a:number[][])=>Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);const a=mid(before),b=mid(after);let v=current.current;if(dist(before)>2&&dist(after)>2)v=zoomAt(v,v.zoom+Math.log2(dist(after)/dist(before)),a,dimensions.current);update(pan(v,b[0]-a[0],b[1]-a[1]))}else update(pan(current.current,p[0]-old[0],p[1]-old[1]))},
  onPointerUp:stop,onPointerCancel:stop,onLostPointerCapture:(e:React.PointerEvent<HTMLDivElement>)=>{if(e.target===e.currentTarget)pointers.current.delete(e.pointerId)},
  onDragStart:(e:React.DragEvent<HTMLDivElement>)=>e.preventDefault(),
  onClickCapture:(e:React.MouseEvent)=>{if(moved.current){e.stopPropagation();moved.current=false}},
  onDoubleClick:(e:React.MouseEvent<HTMLDivElement>)=>{if((e.target as HTMLElement).closest('button,a,select,input,label'))return;e.preventDefault();const r=e.currentTarget.getBoundingClientRect();zoom(1,[e.clientX-r.left,e.clientY-r.top])}
 };
 return {ref,size,view,events,zoom,setView:(v:View)=>{cancelAnimationFrame(animation.current);update(v)},reset:()=>{cancelAnimationFrame(animation.current);update({center:[-120.55,44.15],zoom:6})}};
}
