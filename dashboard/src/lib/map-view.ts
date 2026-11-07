export type View={center:number[],zoom:number};
export const world=(lon:number,lat:number,z:number)=>{const n=256*2**z,a=Math.max(-85.0511,Math.min(85.0511,lat))*Math.PI/180;return [(lon+180)/360*n,(1-Math.log(Math.tan(a)+1/Math.cos(a))/Math.PI)/2*n]};
export const inverse=(x:number,y:number,z:number)=>{const n=256*2**z;return [x/n*360-180,Math.atan(Math.sinh(Math.PI*(1-2*y/n)))*180/Math.PI]};
export function zoomAt(view:View,z:number,point:number[],size:number[]):View{
 z=Math.min(16,Math.max(6,z));const c=world(...view.center as [number,number],view.zoom),offset=point.map((p,i)=>p-size[i]/2),scale=2**(z-view.zoom);
 return {zoom:z,center:inverse((c[0]+offset[0])*scale-offset[0],(c[1]+offset[1])*scale-offset[1],z)};
}
export function pan(view:View,dx:number,dy:number):View{const c=world(...view.center as [number,number],view.zoom);return {...view,center:inverse(c[0]-dx,c[1]-dy,view.zoom)}}
