# nonlinearsystemics.com (redirect)

Nonlinear Systemics is now part of ISRD (Interdisciplinary Systems R&D). This repo only redirects visitors to
**https://isrd.com**: `index.html` (and `404.html` for any other path) sends each old address, such as
`/#research/complex_diseases/energy-envelopes`, to the matching page on isrd.com, and anything unknown to the home page.

The original site is kept on branch `archive/nonlinear-site-2026-10` (tag `nonlinear-site-final`).

The existing GitHub Pages workflow still runs `npm ci` and `npm run build`; `build.mjs` now just copies the redirect
files into `dist/`. To retire this repo later, remove the domain in Settings > Pages.
