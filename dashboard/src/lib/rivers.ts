export type Reach={type:'Feature',id:string,properties:{name:string,gnisId:string,reachCode:string,permanentId:string,stationIds?:string[]},geometry:{type:'MultiLineString',coordinates:number[][][]}};
export type RiverEntry={name:string,file:string,gnisIds:string[],reaches:number,bytes:number,bbox:number[]};
const cache=new Map<string,Promise<{features:Reach[]}>>();
export const riverBase=import.meta.env.BASE_URL+'data/rivers/';
export async function riverInventory():Promise<{rivers:RiverEntry[]}>{const r=await fetch(riverBase+'index.json');if(!r.ok)throw Error('River inventory HTTP '+r.status);return r.json()}
export function loadRiver(entry:RiverEntry){if(!/^[a-z0-9-]+\.geojson$/.test(entry.file))throw Error('Invalid river file');if(!cache.has(entry.file)){cache.set(entry.file,fetch(riverBase+entry.file,{signal:AbortSignal.timeout(15000)}).then(async r=>{if(!r.ok)throw Error('River geometry HTTP '+r.status);const d=await r.json();if(d.type!=='FeatureCollection'||!Array.isArray(d.features))throw Error('Invalid river geometry');return d}).catch(e=>{cache.delete(entry.file);throw e}))}return cache.get(entry.file)!}
