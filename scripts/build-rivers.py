#!/usr/bin/env python3
"""Build reviewed river subsets from OWRD's detailed USGS NHD layer. No runtime Python.
Uses stable GNIS/permanent/reach identifiers; never joins gauges by name alone.
Run from repository root. Download cache is temporary and excluded from git.
"""
import json,urllib.request,urllib.parse,subprocess,concurrent.futures,pathlib,datetime,time
SOURCE='https://gis.wrd.state.or.us/server/rest/services/hydro/Hydro_NHD_Lakes_and_Streams_WGS84/MapServer/5'
OUT=pathlib.Path('dashboard/public/data/rivers'); OUT.mkdir(parents=True,exist_ok=True)
CACHE=pathlib.Path('/tmp/atlas-hydro-cache'); CACHE.mkdir(exist_ok=True)
RIVERS=['Siletz River','Alsea River','Yaquina River','Yachats River','McKenzie River','North Santiam River','South Santiam River','Metolius River','Deschutes River','Hood River','Rogue River']
def query(params):
 url=SOURCE+'/query?'+urllib.parse.urlencode({'f':'json',**params})
 for attempt in range(3):
  p=subprocess.run(['curl','--fail','--silent','--show-error','--max-time','45',url],capture_output=True)
  if p.returncode==0:
   d=json.loads(p.stdout)
   if 'error' not in d:return d
  if attempt==2:raise RuntimeError('OWRD query failed: '+str(params))
def build(name):
 slug=name.lower().replace(' ','-'); cached=CACHE/(slug+'.json')
 if cached.exists():return json.loads(cached.read_text())
 ids=sorted(query({'where':"GNIS_Name='"+name.replace("'","''")+"'",'returnIdsOnly':'true'}).get('objectIds',[]))
 features=[]
 for i in range(0,len(ids),150):
  d=query({'objectIds':','.join(map(str,ids[i:i+150])),'outFields':'Permanent_Identifier,GNIS_ID,GNIS_Name,ReachCode,FlowDir,LengthKM,FType,FCode','returnGeometry':'true','outSR':'4326','maxAllowableOffset':'.00003','geometryPrecision':'5'})
  if d.get('exceededTransferLimit'):raise RuntimeError('Partial geometry refused')
  for f in d.get('features',[]):
   a=f['attributes'];paths=f.get('geometry',{}).get('paths',[])
   paths=[[[round(p[0],5),round(p[1],5)] for p in line] for line in paths if len(line)>1]
   if not paths:raise RuntimeError('Missing geometry')
   # Oregon service also includes border watersheds. Preserve connected cross-border reaches.
   features.append({'type':'Feature','id':a['Permanent_Identifier'],'properties':{'name':a['GNIS_Name'],'gnisId':a['GNIS_ID'],'reachCode':a['ReachCode'],'permanentId':a['Permanent_Identifier'],'flowDirection':a['FlowDir'],'lengthKm':a['LengthKM'],'featureType':a['FType'],'featureCode':a['FCode']},'geometry':{'type':'MultiLineString','coordinates':paths}})
 if len(features)!=len(ids):raise RuntimeError(f'{name}: missing features {len(features)}/{len(ids)}')
 d={'type':'FeatureCollection','name':name,'source':SOURCE,'retrieved':datetime.date.today().isoformat(),'simplificationDegrees':.00003,'features':features};cached.write_text(json.dumps(d,separators=(',',':')))
 print(name,len(features),flush=True);return d
if __name__=='__main__':
 manifest=[]
 RIVERS=sorted(set(RIVERS)|{s['candidateRiver'] for s in json.loads((OUT/'station-inventory.json').read_text())['stations'] if s['candidateRiver']})
 missing=[]
 with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
  for name,d in zip(RIVERS,pool.map(build,RIVERS)):
   if not d['features']:
    missing.append(name);continue
   slug=name.lower().replace(' ','-');raw=json.dumps(d,separators=(',',':'));(OUT/(slug+'.geojson')).write_text(raw)
   pts=[p for f in d['features'] for line in f['geometry']['coordinates'] for p in line]
   manifest.append({'name':name,'file':slug+'.geojson','gnisIds':sorted(set(f['properties']['gnisId'] for f in d['features'])),'reaches':len(d['features']),'bytes':len(raw.encode()),'bbox':[min(p[0] for p in pts),min(p[1] for p in pts),max(p[0] for p in pts),max(p[1] for p in pts)]})
 (OUT/'index.json').write_text(json.dumps({'source':SOURCE,'unavailable':missing,'rivers':manifest},indent=2)+'\n')
 print('TOTAL',len(manifest),sum(x['bytes'] for x in manifest),flush=True)
