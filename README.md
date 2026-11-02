# Oregon Rivers Atlas

Oregon river monitoring and fishing-planning dashboard. GitHub is the authoritative source for this static React application.

Features: live USGS flow, gauge height and water temperature; historical charts and comparisons; interactive USGS basemap and gauge selection; documented USFS recreation sites; Open-Meteo weather; browser-local personal thresholds.

No journal, account, backend, paid service, or stored observation database. River-line overlays are deferred. Personal suitability indicators are not legal or safety guidance. Weather is modeled; missing observations remain unavailable.

## Development

Use Node 24. In `dashboard`, run `npm ci`, `npm test`, `npm run build`, or `npm run dev`.

Open branches and pull requests for changes. Successful main updates deploy through `.github/workflows/pages.yml` after GitHub Pages is configured for Actions. See [migration and validation notes](MIGRATION.md). Deployment acceptance is still in progress.
