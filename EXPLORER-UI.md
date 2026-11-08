# Map-first Explorer

Branch: `feat/map-first-explorer`. Production is unchanged until owner approval and merge.

## Design and preserved behavior

The overview is a full-height map workspace with a collapsible 280px filter panel. Mobile uses a filter drawer and a compact bottom feature panel. Gauges, recreation sites and river reaches share one details panel. Expanding a gauge reveals existing turbidity and flow graphs; historical analytics, preferences, alerts status and source pages remain accessible.

Existing 81 river subsets and 187 geographic station associations are unchanged. URL hashes, personal threshold storage, observation timestamps, original turbidity units, current-only freshness checks and on-demand historical requests are retained. No journal, planning workflow, paid service or server is added.

## Filtering and recreation

Temperature is stored in Celsius; changing display units does not alter its physical range. Range handles use native keyboard/touch inputs plus precise numeric fields. Missing/stale values are excluded only when the corresponding condition is enabled. Turbidity requires an exact parameter code and original unit; FNU/NTU and separate methods are never converted or combined. Sliders filter loaded observations without new requests. Trend selection retains existing on-demand one-hour sensor comparisons.

Explorer layer settings, ranges, units and recreation categories use the separate `oregon-rivers:explorer:v1` local-storage key. These settings are device-specific; storage failures are reported. Search, flow availability and trend selection reset on reload. Global Reset filters does not reset map position or personal station preferences.

USFS `markeractivity` determines one primary symbol per record, never the site's name. Source values verified include Campground Camping, Dispersed Camping, Boating - Motorized, Boating - Non-Motorized, River and Stream Fishing, Trailhead, Day Hiking, Picnicking and Viewing Scenery. General boating does not certify a launch or vessel suitability. No raft/drift records are inferred; that category remains empty unless an explicit matching source activity is provided. Unknown activities remain Other. Viewport grid clustering is used below zoom 10, then individual sites. Amenities and detailed restrictions are not supplied by the current feed and are explicitly described as unavailable, with the official site link.

## Basemaps and provider limits

- Civil: OpenStreetMap standard raster tiles, `https://tile.openstreetmap.org/{z}/{x}/{y}.png`. Visible © OpenStreetMap contributors attribution links to the copyright page. Browser default caching and Referer are retained. Only visible tiles are requested: no prefetch, offline downloader or cache bypass. Service is best-effort and can restrict excessive use. Policy: https://operations.osmfoundation.org/policies/tiles/ .
- Topo: existing USGSTopo tile service.
- Imagery: USGSImageryOnly from The National Map. This is archived orthoimagery, not live satellite coverage. Metadata currently describes CONUS NAIP 2017–2021, with local acquisition dates varying. No resolution or recency beyond the provider metadata is promised. https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer .
- USGS map terms: https://www.usgs.gov/faqs/what-are-terms-uselicensing-map-services-and-data-national-map . Free public-domain services; no availability guarantee.

Basemap changes preserve view and selections; all sources use the same Web Mercator coordinates. Existing static asset paths remain relative to the Vite GitHub Pages base.

## Weather and limits

The existing Open-Meteo current-condition adapter is retained and presented inline with SVG condition/temperature/wind/rain icons. Rain remains millimeters, not probability. The current feed does not return precipitation probability; this is explicit in details. Optional hourly/7-day forecasts are not implemented in this change. Attribution and modeled timestamp remain available in Weather details.

## Validation

Local `npm test` and `npm run build` pass. Automated browser tests run through the existing free public-repository GitHub Actions workflow, covering live USGS, weather, source geometry for Siletz/Alsea/McKenzie, mouse/ touch gestures, temperature unit conversion, range persistence, category toggles, browser CORS reads of all three tile sources, basemap switching without view resets, hash navigation and screenshots. See the PR check for final results; do not infer browser success from this document alone. Physical-device and trackpad hardware testing are not performed.

The feature branch does not deploy. Only an approved merge to main invokes the existing Pages deployment. Roll back by reverting the feature merge through a reviewed PR; no observation database or migrations exist.
