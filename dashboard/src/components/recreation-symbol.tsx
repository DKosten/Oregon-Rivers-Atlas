import {Tent,TentTree,Ship,LifeBuoy,Sailboat,Waves,Footprints,Utensils,Binoculars,SquareParking,MapPin} from 'lucide-react';
import type {Category} from '../lib/explorer';
const icons={campground:Tent,dispersed:TentTree,boat:Ship,raft:LifeBuoy,paddle:Sailboat,river:Waves,trail:Footprints,picnic:Utensils,viewpoint:Binoculars,parking:SquareParking,other:MapPin};
export default function RecreationSymbol({category}:{category:Category}){const Icon=icons[category];return <Icon size={16} strokeWidth={1.7}/>}
