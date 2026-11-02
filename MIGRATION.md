# Oregon Rivers: GitHub Pages migration

Status: clean public repository preparation; deployment validation pending. The existing ChatGPT Site and its stored data are unchanged.

## Source comparison and preservation

Reviewed GitHub main `6baf47371c9767dd39ab51c9613e452bb38585f8` and the deployed Sites version 1 source `34cb38f9251face1a980fcece77f2f77c50427ae`.
The 18 original GitHub source files were checked against GitHub blob hashes. They remain unchanged in the original private repository. This new repository contains the adapted dashboard and no original commit history.

| Feature | Original GitHub application | Deployed Sites application | Migrated dashboard |
| --- | --- | --- | --- |
| Runtime | Python standard-library server, static JS/CSS | React/Vinext, Worker, D1, R2 | React/Vite static build; no runtime server |
| USGS | Python adapter; current flow/temperature and short temperature history | TypeScript adapter; flow, temperature, height and longer history | Reuses Sites adapter in browser, retaining gauge/unit/series validation |
| Weather | Open-Meteo Python adapter and map overlays | Preserved legacy source, absent from main interface | Adapter ported; selected-gauge weather panel, clearly labeled modeled |
| Map | Generalized SVG and experimental layers | USGS tiles, NHD geometry, USFS recreation points | Reuses Sites map; official links, partial-layer errors, preference marker colors |
| Historical analytics | Limited recent temperature history | 24h/7d/30d/90d/year, daily means, seasonal and multi-gauge comparisons | Preserved; leap-year calendar boundaries corrected |
| Preferences | Limited browser settings | Authenticated database thresholds | Validated browser-local thresholds and section labels |
| Journal/photos | None | Database and object storage | Completely excluded from new application |
| Alerts | No operational background service | Inactive information screen | Explicitly inactive; no scheduler configured |

An unpublished local map fix was reviewed and incorporated: dragging the map must not capture marker/control clicks. The original Sites checkout was not changed.
The river matcher was corrected so “Lobster Creek near Alsea” does not represent the Alsea River. River summary cards prefer fresh flow observations.
Experimental species screening, legacy weather overlays, and sample-mode demonstrations remain in the original source, not in the deployed Sites baseline or migrated UI. Weather functionality is presented in the selected-gauge panel instead of the old SVG overlays.

## Architecture and development

`dashboard/src/App.tsx` retains the Sites interface. `components/` contains map, hydrograph, and weather UI. `lib/` contains USGS, geography, weather, condition analysis, and local preference adapters.

For development (in a development environment, not required on the user's computer):

```sh
cd dashboard
npm ci
npm test
npm run build
npm run dev
```

Node 24 is used by CI. Dependencies are pinned in `package-lock.json`. GitHub Pages publishes **only `dashboard/dist`**, never the legacy Python application or source tree.
Project base path is `/Oregon-Rivers-Atlas/`; navigation uses hashes such as `#page=analytics&station=14305500`, so direct links and refreshes do not require server rewrites.
Future work should start from GitHub branches, pass checks, and be merged through reviewed pull requests. Do not edit a separate Sites copy and expect automatic synchronization.

## Storage and data accuracy

- Only preferences are persisted, under `oregon-rivers:preferences:v1` in localStorage. They are browser/device-specific. Clearing browser data may remove them. They do not establish legality or safety.
- No journal, photo upload, sign-in, D1, R2, Worker, Python API, API credentials, or service worker is used by the static build.
- Current measurements have a five-minute memory cache; observations older than 14 days are excluded. History is requested with `cache: no-store` and held only in page memory. No measurements are committed or stored in a historical database.
- Missing/invalid readings remain unavailable. Timestamps, units and source qualifiers are retained. Different sensor series and stations are not combined.
- Open-Meteo current conditions are modeled, not an on-site observation or USGS water measurement.
- Existing Sites journal records/photos were not accessed, migrated, or deleted. Their presence has not been inventoried. Inventory any records before a separately approved retirement of Sites.

## Validation and limitations

Local `npm test` and TypeScript/production build pass. Tests cover units, zero/missing values, exact joins, sensor separation, stale thresholds, 24-hour tolerance, median, safe pagination, invalid preferences, storage failures, weather validation, leap-year ranges, API errors and timeouts.

Browser preview verified live USGS observations, weather, basemap tiles, annual and seasonal charts, mobile-width layout and navigation, and preference save/reload. Direct browser requests—not a local backend—supply those data.
Live adapter checks returned observations for all five selectable periods and five-year seasonal history at Siletz station 14305500. These checks do not prove every station/period has data.

HTTP tests with `Origin: https://dkosten.github.io` returned successful responses and acceptable CORS headers for USGS monitoring locations/latest/continuous/daily, Open-Meteo, NHD, USFS, and USGS tiles. USFS echoed that origin; the others returned `*`.
**Actual GitHub Pages-origin browser testing remains pending initial publication approval.** Header checks and preview-origin tests are not a substitute for that final test.

River-line geometry is deferred at the owner’s request after provider timeouts. The map retains USGS tiles, monitoring stations, and a small documented selection of USFS recreation sites. These sites do not certify launch rights or open facilities.
No inferred legal river sections, automatic fishing-open decisions, comprehensive campground/dispersed-camping dataset, whitewater classification, or background notifications are claimed. Those planning additions require separately verified datasets and development.

## Deployment

The owner authorized a clean public repository and deployment testing. The original private repository and Sites deployment remain unchanged. New GitHub web commits use the verified noreply identity; original commit history is not imported.

Enable Pages with source **GitHub Actions**. The workflow checks PRs and deploys main after successful tests/build. Branch protections must be configured separately: workflow conditions do not enforce human review. For a sole owner, required external approval can block their own PRs; document the actual configured rules after setup.

Target URL: `https://dkosten.github.io/Oregon-Rivers-Atlas/`. Actual deployment-origin testing is pending; do not treat preview checks as launch acceptance.

## Free-service constraints and rollback

GitHub Pages is static hosting with service limits, not unlimited infrastructure. Standard hosted Actions runners are free for public repositories; this workflow uses no paid/larger runners. Public traffic can exhaust provider quotas. Open-Meteo's free API is non-commercial, rate-limited (10,000 daily calls), and has no uptime guarantee. No payment or billing activation is configured. USGS and GIS providers may throttle or fail; the application reports errors rather than buying capacity or substituting data.

Keep a known-good commit for each release. Roll back by reverting the faulty application change through a reviewed PR and redeploying main. Do not force-push. Disable the deployment workflow if publication must pause. Before initial launch, the unchanged Sites deployment is the operational fallback.

References: [GitHub custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits), [Open-Meteo terms](https://open-meteo.com/en/terms), [USGS API](https://api.waterdata.usgs.gov/docs/ogcapi/).
