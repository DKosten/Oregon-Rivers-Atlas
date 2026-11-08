# Selected-gauge UI refinements

The map loads the existing 81 river GeoJSON files with four concurrent requests and caches them in memory. Unselected rivers use thin muted blue lines. The selected gauge highlights only the river/GNIS pair already recorded in `dashboard/public/data/rivers/associations.json`, with a narrow light casing for imagery contrast. These existing geographic associations are not new official USGS network linkages. No datasets were changed. The Rivers layer switch and individual reach picker remain available.

The existing bottom panel contains five 48-hour observation snapshots and the existing weather component at its lower right. Smaller screens use a two-column graph grid and place weather below it. The panel scrolls within its existing mobile height limit; the existing expand control opens longer history and details.

Snapshots request only the selected station, using the existing USGS continuous-observation adapter and five-minute memory cache. Flow is displayed as CFS, stage in feet, water temperature and observed air temperature in Fahrenheit. Observed air uses USGS parameter 00020 (degrees Celsius, converted for display). Turbidity retains its original unit, parameter code and sensor identity; a sensor selector appears when needed. Histories are never combined across sensors or units. Lines break across gaps longer than two hours, and timestamps are displayed in Pacific time. Empty and failed requests are explicitly labeled.

Open-Meteo weather remains modeled near the gauge, separate from USGS air observations. The existing current-weather feed does not supply precipitation probability or forecast history; its precipitation amount is not represented as a probability. An absent air observation history is never filled with weather forecasts or modeled temperatures.

No dependencies, paid services, routes or deployment settings were added. GitHub Pages continues using the repository base path and existing hash navigation. Production must remain unchanged until this pull request is approved.

Validation includes existing unit/browser tests, snapshot bounds/unit/sensor/gap checks, Siletz/Alsea/McKenzie selection, all-river persistence across basemaps and clearing selection, five snapshot cards, and desktop/mobile map-area comparisons against production. Actions retains responsive screenshots in the `browser-validation` artifact.
