# GIS and water-quality update

## Architecture and scope
The authoritative source is this repository. React 19 / Vite / TypeScript, native SVG charts, and the existing custom Web Mercator tile map remain in place. No backend, database, runtime Python, paid API, new dashboard page, or trip-planning workflow is added. Python scripts are optional maintainers' offline dataset preparation tools, not deployment requirements.

The pre-change application had no river vector geometry. Its ten named river collections were Siletz, Alsea, Yaquina, Yachats, McKenzie, North/South Santiam, Metolius, Deschutes, and Hood; the statewide station browser additionally discovers rivers dynamically. `dashboard/public/data/rivers/station-inventory.json` inventories the public locations returned during this review, including non-river stations and unmatched names. It contains no measurements or user data. The manifest lists every included river and any name with no returned geometry. Newly added live gauges do not automatically expand the static geometry inventory.

## Hydrography provenance
Source: Oregon Water Resources Department's **Streams – Detailed**, USGS NHD:
https://gis.wrd.state.or.us/server/rest/services/hydro/Hydro_NHD_Lakes_and_Streams_WGS84/MapServer/5

The national NHD service timed out during extraction. OWRD's authoritative NHD distribution responded successfully. This is legacy high-resolution NHD, **not newly surveyed 3DHP**. USGS has retired NHD maintenance; 3DHP is its successor and should be considered for future dataset refreshes:
https://www.usgs.gov/national-hydrography/access-national-hydrography-products

Extraction preserves named linework, GNIS identifiers, permanent feature identifiers, reach codes, feature codes, and flow direction. Each river loads on demand; the whole Oregon network is never downloaded by the browser. ArcGIS generalization tolerance is 0.00003 degrees (roughly 2–3.4 m here), with five decimal coordinate precision (roughly one metre). No invented connections across unnamed gaps. Rivers spanning the border retain the portion available in OWRD's service; full out-of-state courses are not promised. Duplicate geographic names may include multiple GNIS identifiers, visible at reach selection.

Gauge association requires a normalized waterbody name **and** distance of at most 250 m from that named NHD geometry. The association file records exact distance and IDs. These are application geographic associations, not certified USGS network links. Ambiguous/unmatched dam, lake, creek, and non-river labels remain unassigned. Gauge readings are never propagated to other reaches. Reach IDs are suitable keys for future classifications; no American Whitewater classifications have been implemented.

Rebuild from repository root: `python scripts/build-rivers.py`, then `python scripts/associate-stations.py`. Review inventory additions, unmatched entries, and basemap alignment before committing. Clear `/tmp/atlas-hydro-cache` to force new source downloads. Do not commit download caches.

## Turbidity
Parameter definitions verified against USGS's current `parameter-codes` collection on 2026-11-07, for example:
https://api.waterdata.usgs.gov/ogcapi/v1/collections/parameter-codes/items/63680?f=json

Supported: 63680 (FNU), 00076 and 63675 (NTU, distinct methods), 63676 (NTRU), 63681 (FNRU), 63682 (FBU), 63683 (FAU), 63684 (FNMU). Full definitions are in `turbidity-codes.ts`. USGS continuous responses may prefix units with `_`; raw unit strings are preserved. No NTU↔FNU conversion or cross-method numeric comparison. Numeric filters require an exact parameter/unit pair; chart data additionally require the exact sensor series.

Current means observed within two hours. Older readings (up to the existing 14-day cutoff) remain explicitly stale in station detail and are excluded from current/trend filters. Turbidity-only stations and non-stream locations are included, with exact USGS location-ID joins. No flow requirement. No fallback estimates.

Trends compare each sensor's latest reading to its reading one hour earlier, with ±15-minute tolerance. Stable means change within max(5% of prior value, 0.1 reported unit); otherwise rising/falling. This is a documented descriptive choice, not an official USGS classification or safety criterion. Missing, stale, incompatible, or failed series have unknown trends and are excluded. Trend requests happen only when a trend filter is selected, at most three concurrent requests, with a five-minute bounded memory cache. Selected-station 24-hour/7-day graphs are on demand. No observation files are committed or saved to browser storage.

Partial turbidity API failures are reported while existing flow/temperature/height remain usable. HTTP failures, quota responses, and timeouts produce unavailable data. No proxy or secrets are used.

## Map controls
Preserves custom projection and tile source. Wheel and trackpad scroll provide incremental pointer-centered zoom; Ctrl-wheel/pinch gesture is supported. Left drag pans, double-click and compact +/- buttons animate zoom, two touch pointers pinch around their midpoint, and one touch drags. Reset Oregon and center-selected controls remain. All vectors and markers share the same fractional-zoom projection. Turbidity diamonds, river linework, and USFS recreation sites are independently toggleable; no permanent labels on turbidity markers. A river selector loads and fits one named river; reach selection exposes its authoritative IDs and associated gauges.

## Hosting, providers, and validation
`/Oregon-Rivers-Atlas/` and hash routes are preserved. Relative Vite-base URLs load GeoJSON from the same origin; no external hydrography request is required at runtime. USGS Water Data responses advertise `Access-Control-Allow-Origin: *`; browser tests exercise actual live requests. USGS topographic tiles, USFS recreation service, and Open-Meteo remain existing providers with attribution. Free public API quotas/outages still apply; avoid repeatedly refreshing or switching trend filters. API keys are not introduced.

The existing GitHub Actions build now runs unit tests, a production build, and Chromium desktop/mobile tests against live APIs before a main-branch deployment. Browser evidence is retained as a 7-day Actions artifact, not committed. Tests include Siletz/Alsea/McKenzie linework and associations, tiles, mouse controls, touch drag/pinch, turbidity units/history/filtering, USFS toggles, and direct hash refresh. Physical trackpad/phone testing is not implied by emulation. The local cloud preview is unavailable in this session; CI and the final public deployment supply browser verification.

Existing weather, flow/height/temperature, historical analytics, preferences, recreation layer, and sources remain. Alerts remain inactive as before. No paid dependencies or additional hosting are introduced; Playwright is a development-only browser test dependency.

Rollback: revert the merged feature PR via another PR; the unchanged main-branch Pages workflow republishes the prior application. The production URL remains https://dkosten.github.io/Oregon-Rivers-Atlas/.
