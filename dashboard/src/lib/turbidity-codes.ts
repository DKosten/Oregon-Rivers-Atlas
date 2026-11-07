// USGS parameter-codes collection, verified 2026-11-07. Preserve raw units; do not convert between methods.
export const TURBIDITY_CODES:Record<string,{name:string,description:string,units:string[]}>= {
  "63680": {
    "name": "Turbidity, Form Neph",
    "description": "Turbidity, water, unfiltered, monochrome near infra-red LED light, 780-900 nm, detection angle 90 +-2.5 degrees, formazin nephelometric units (FNU)",
    "units": [
      "FNU",
      "_FNU"
    ]
  },
  "00076": {
    "name": "Turbidity",
    "description": "Turbidity, water, unfiltered, nephelometric turbidity units",
    "units": [
      "NTU",
      "_NTU"
    ]
  },
  "63675": {
    "name": "Turbidity, Nephelom",
    "description": "Turbidity, water, unfiltered, broad band light source (400-680 nm), detection angle 90 +-30 degrees to incident light, nephelometric turbidity units (NTU)",
    "units": [
      "NTU",
      "_NTU"
    ]
  },
  "63676": {
    "name": "Turbidity, NephRatio",
    "description": "Turbidity, water, unfiltered, broad band light source (400-680 nm), detectors at multiple angles including 90 +-30 degrees, ratiometric correction, NTRU",
    "units": [
      "NTRU",
      "_NTRU"
    ]
  },
  "63681": {
    "name": "Turbidity, FormRatio",
    "description": "Turbidity, water, unfiltered, monochrome near infra-red LED light, 780-900 nm, detectors at multiple angles including 90 +-2.5 degrees, ratiometric correction, FNRU",
    "units": [
      "FNRU",
      "_FNRU"
    ]
  },
  "63682": {
    "name": "Turbidity,FormBksctr",
    "description": "Turbidity, water, unfiltered, monochrome near infra-red LED light source, 780-900 nm, detection angle 0-45 degrees to incident light (backscatter), FBU",
    "units": [
      "FBU",
      "_FBU"
    ]
  },
  "63683": {
    "name": "Turbidity,FormAttenu",
    "description": "Turbidity, water, unfiltered, monochrome near infra-red LED light source, 780-900 nm, detection angle 180 degrees to incident light (attenuation), FAU",
    "units": [
      "FAU",
      "_FAU"
    ]
  },
  "63684": {
    "name": "Turbidity, FormMulti",
    "description": "Turbidity, water, unfiltered, monochrome near infra-red LED light source, 780-900 nm, multiple beam, detectors at multiple angles including 90 degrees, FNMU",
    "units": [
      "FNMU",
      "_FNMU"
    ]
  }
};
