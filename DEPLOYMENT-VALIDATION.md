# Deployment validation — November 2, 2026

Live dashboard: https://dkosten.github.io/Oregon-Rivers-Atlas/

Deployed commit: `892a561b67dc4455ea4067c3230b22fbcbf9bcd1`. Actions run 41533945181 completed successfully, including tests, build, and Pages deployment.

## Verified

- Clean public repository starts with a new root commit; no original private history imported. Both initial commits use GitHub noreply author/committer addresses. Source was screened for personal email addresses, credential patterns, and private keys before upload.
- Browser requests from the actual Pages origin load USGS observations, Open-Meteo weather, USGS tiles, and five USFS recreation sites. No backend or CORS proxy is involved.
- Historical charts for 24h, 7d, 30d, 90d and one year render; annual Siletz daily series returned 362 observations in the first deployment check. Seasonal history and Siletz/Alsea comparison rendered. Hash analytics links survive refresh.
- Map zoom and station centering work. Yachats selection reports no station instead of displaying another river's measurements.
- Test thresholds saved and survived reload in the test browser. A fresh browser session shows no configured thresholds; settings are device-local.
- Automated tests cover API errors/timeouts, missing/zero values, units, joins, sensor separation, invalid preferences, storage errors, historical calendar boundaries and safe access URLs. Mobile-width preview testing passed before deployment; a physical-phone test has not been performed.
- Journal UI and backend storage are excluded. River-line geometry is deferred at the owner's request.
- Main branch protection was created: pull requests and the GitHub Actions `build` check are required, administrator bypass is disabled, and force pushes/deletion are not allowed. A second-person approval is not required because the sole owner cannot approve their own PR. Owner review before merging remains a procedural requirement; the workflow does not identify whether a human approved.

## Limitations and operations

Background alerts are inactive. Recreation coverage is incomplete and does not establish launch rights or safety. Weather is modeled. Provider outages/rate limits remain possible. Future camping, imagery, whitewater and boat-access datasets are not implemented.

The workflow deploys main after a successful build using the github-pages environment. No paid service or billing activation was introduced. The original private repository and existing ChatGPT Site remain unchanged, including any stored journal records.

Rollback: revert the faulty change through a pull request, pass the required build, and merge to redeploy. Do not force-push. Do not retire Sites without separate owner approval.

This report supersedes pre-publication status statements in MIGRATION.md and README.md.
