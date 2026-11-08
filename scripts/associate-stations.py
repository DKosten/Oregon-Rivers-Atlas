#!/usr/bin/env python3
"""Conservative, reproducible name + distance associations, not inferred flow transfer.
250 m maximum accommodates USGS coordinate precision; expose distance and all failures.
No association is used to assign one gauge's values to another reach.
"""
import json,math,pathlib
ROOT=pathlib.Path('dashboard/public/data/rivers'); index=json.loads((ROOT/'index.json').read_text());inventory=json.loads((ROOT/'station-inventory.json').read_text());out={};rivers={r['name']:r for r in index['rivers']}
def distance(p,a,b):
 scale=111195;cos=math.cos(math.radians(p[1]));x,y=p[0]*scale*cos,p[1]*scale;ax,ay=a[0]*scale*cos,a[1]*scale;bx,by=b[0]*scale*cos,b[1]*scale
 dx,dy=bx-ax,by-ay;t=max(0,min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy))) if dx or dy else 0
 return math.hypot(x-ax-t*dx,y-ay-t*dy)
loaded={}
for s in inventory['stations']:
 name=s['candidateRiver'];p=s['coordinates']
 if name not in rivers or None in p:s['association']='not inferred';continue
 if name not in loaded:loaded[name]=json.loads((ROOT/rivers[name]['file']).read_text())
 nearest=None;minimum=float('inf')
 for f in loaded[name]['features']:
  dist=min(distance(p,a,b) for line in f['geometry']['coordinates'] for a,b in zip(line,line[1:]))
  if dist<minimum:minimum=dist;nearest=f
 s['nearestCandidateMeters']=round(minimum,1)
 if minimum>250:s['association']='unmatched: candidate river more than 250 m away';continue
 a=nearest['properties'];s['association']='name and spatial proximity';s['reachId']=nearest['id']
 a.setdefault('stationIds',[]).append(s['stationId'])
 out[s['stationId']]={'river':name,'gnisId':a['gnisId'],'reachCode':a['reachCode'],'permanentId':nearest['id'],'distanceMeters':round(minimum,1),'method':'normalized station waterbody name and nearest NHD segment within 250 m','review':'geographic association, not an official USGS network linkage'}
for name,d in loaded.items():
 raw=json.dumps(d,separators=(',',':'));(ROOT/rivers[name]['file']).write_text(raw);rivers[name]['bytes']=len(raw.encode())
(ROOT/'index.json').write_text(json.dumps(index,indent=2)+'\n');(ROOT/'associations.json').write_text(json.dumps(out,indent=2)+'\n');(ROOT/'station-inventory.json').write_text(json.dumps(inventory,indent=2)+'\n')
print('Associated',len(out),'of',len(inventory['stations']),'sites; named-river candidates',sum(bool(s['candidateRiver']) for s in inventory['stations']))
for id in ['14305500','14306500','14162500']:print(id,out.get(id))
