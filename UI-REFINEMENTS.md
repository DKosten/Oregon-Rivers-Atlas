# Selected-gauge UI refinements

The map loads the existing 81 river GeoJSON files with four concurrent requests and caches them in memory. Unselected rivers use thin muted blue lines. The selected gauge highlights only the river/GNIS pair already recorded in `dashboard/public/data/rivers/associations.json`, with a narrow light casing for imagery contrast. These existing geographic associations are not new official USGS network linkages. No datasets were changed. The Rivers layer switch and individual reach picker remain available.

The existing bottom panel contains five 48-hour observation snapshots and the existing weather component at its lower right. Smaller screens use a two-column graph grid and place weather below it. The panel scrolls within its existing mobile height limit; the existing expand control opens longer history and details.

Snapshots request only the selected station, using the existing USGS continuous-observation adapter and five-minute memory cache. Flow is displayed as CFS, stage in feet, water temperature and observed air temperature in Fahrenheit. Observed air uses USGS parameter 00020 (degrees Celsius, converted for display). Turbidity retains its original unit, parameter code and sensor identity; a sensor selector appears when needed. Histories are never combined across sensors or units. Lines break across gaps longer than two hours, and timestamps are displayed in Pacific time. Empty and failed requests are explicitly labeled.

Open-Meteo weather remains modeled near the gauge, separate from USGS air observations. The existing current-weather feed does not supply precipitation probability or forecast history; its precipitation amount is not represented as a probability. An absent air observation history is never filled with weather forecasts or modeled temperatures.

No dependencies, paid services, routes or deployment settings were added. GitHub Pages continues using the repository base path and existing hash navigation. Production must remain unchanged until this pull request is approved.

Validation includes existing unit/browser tests, snapshot bounds/unit/sensor/gap checks, Siletz/Alsea/McKenzie selection, all-river persistence across basemaps and clearing selection, five snapshot cards, and desktop/mobile map-area comparisons against production. Actions retains responsive screenshots in the `browser-validation` artifact.

## Review evidence

Live Chromium validation passed on 2026-11-08 for Siletz, Alsea and McKenzie selection, all 81 river files, river highlighting across basemaps, desktop wheel/drag/double-click, mobile drag/pinch, existing filters, weather, and historical turbidity controls. McKenzie returned observed flow, stage, water temperature and turbidity histories; no USGS air-temperature history was available and the explicit unavailable message was shown. Current readings are retained independently when a historical request fails.

Map area compared with unchanged production at the same viewport and selected station:

| Viewport | Baseline map height | Updated map height | Area retained |
| --- | ---: | ---: | ---: |
| 1440 × 1050 | 814 px | 735.5 px | 90.4% |
| 1366 × 900 | 664 px | 585.5 px | 88.2% |
| 390 × 844 | 499.5 px | 435.48 px | 87.2% |

Map widths were unchanged. This verifies the 15% limit at these tested sizes, not every possible viewport. Browser evidence contains `refinements-1440.png`, `refinements-1366.png`, `refinements-390.png` and the existing mobile/touch screenshots.

The first expanded test suite exceeded USGS's anonymous request quota (HTTP 429). The final checks reuse the existing live browser session and resize a single production-baseline page, reducing repeated requests without substituting observations. Snapshot history concurrency is limited to two; normal provider quotas still apply and are explicitly reported in the interface.
