const ACCESS='https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_RecreationOpportunities_01/MapServer/0/query';
async function query(base:string,params:Record<string,string>){const rows:any[]=[];for(let page=0;page<12;page++){const q=new URLSearchParams({f:'json',outSR:'4326',returnGeometry:'true',geometry:'-124.7,42,-116.4,46.3',geometryType:'esriGeometryEnvelope',inSR:'4326',spatialRel:'esriSpatialRelIntersects',resultRecordCount:'2000',resultOffset:String(page*2000),...params});const r=await fetch(base+'?'+q,{signal:AbortSignal.timeout(60000)});if(!r.ok)throw Error('Map provider HTTP '+r.status);const d=await r.json() as any;if(d.error)throw Error(d.error.message);if(!Array.isArray(d.features))throw Error('Invalid geographic data');rows.push(...d.features);if(!d.exceededTransferLimit)return rows;}throw Error('Geographic result exceeds limit; incomplete layer withheld');}

let cache:{at:number,data:any}|undefined;
async function fetchGeography(){
 let access:any[]=[];let error='';
 try{const rows=await query(ACCESS,{where:"recareaname IN ('Lower Bridge Campground','Allingham Campground','McKenzie Bridge Campground','Metolius River','Camp Sherman Campground','North Santiam River','Hood River')",outFields:'recareaname,recareaurl,openstatus,markeractivity'});
 access=rows.filter(f=>Number.isFinite(f.geometry?.x)&&Number.isFinite(f.geometry?.y)).map(f=>{let url='https://www.fs.usda.gov/visit/maps';try{const u=new URL(f.attributes.recareaurl);if(u.protocol==='https:'&&u.hostname.endsWith('.fs.usda.gov'))url=u.href}catch{}return {...f,url}});
 }catch(e){error='Recreation layer: '+(e instanceof Error?e.message:'Unavailable')}
 const data={access,error,source:{access:ACCESS},fetchedAt:new Date().toISOString()};cache={at:Date.now(),data};return data;
}

let inFlight:Promise<any>|undefined;
export async function loadGeography(){
 if(cache&&Date.now()-cache.at<(cache.data.error?30000:3600000))return cache.data;
 if(inFlight)return inFlight;
 inFlight=fetchGeography();
 try{return await inFlight;}finally{inFlight=undefined;}
}
