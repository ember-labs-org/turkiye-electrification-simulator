# Türkiye Electrification Simulator — Ember Labs

Ember Labs copy of [elektrifikasyon.org](https://www.elektrifikasyon.org) by Bahadır Gümüş:
four bilingual (TR/EN) interactive pages on how far Türkiye's final energy consumption can be electrified.

- **Site:** `docs/` — published with GitHub Pages from `/docs` at
  <https://ember-labs-org.github.io/turkiye-electrification-simulator/>
- **Source of truth:** the private upstream repository `bsgumus/elektrifikasyon`. `docs/` here is a
  generated mirror (the four pages verbatim, plus the Ember Labs `config.js` and `assets/style.css`),
  pushed by the upstream `tools/publish_labs.sh` whenever the site changes. Edit upstream, not here.
- **Model and API:** all calculations run in a Cloudflare Worker that stays in the upstream repository
  and on its author's Cloudflare account; this repository holds no model code or coefficients.
  The pages call it at the `API_URL` set in `docs/config.js`.
