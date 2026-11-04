// Ember Labs · Türkiye Electrification Simulator — site configuration (branding and API).
// Model coefficients are NOT here; they live only in worker/src/model-data.js (served by the Worker).
// Ember Labs overlay (ember-labs-branding skill): together with labs/style.css this is the ONLY file that differs from the
// elektrifikasyon.org site. tools/publish_labs.sh copies it to docs/config.js in the Labs repository
// (ember-labs-org/turkiye-electrification-simulator), which holds only the docs/ site (see labs/NOTES.md).
window.ELX = {
  // The Labs site calls the SAME Worker as elektrifikasyon.org (it stays on Bahadır's Cloudflare account;
  // the Worker serves only /api/*). The Labs origin https://ember-labs-org.github.io is in the Worker's
  // default ALLOWED_ORIGINS (worker/src/index.js, wrangler.toml); any other origin is answered with 403.
  API_URL: 'https://elektrifikasyon.bahadirsgumus.workers.dev',
  // Ember Labs tools are embedded in the Labs site, which already shows the tool's name,
  // the maker credit and the Labs disclaimer (ember-labs-branding, rule 7). So nothing here.
  BRAND: { name: '', url: '' },
  FOOTER: { tr: '', en: '' },
  CREDIT: { tr: '', en: '' },
  DISCLAIMER: { tr: '', en: '' },
};
document.addEventListener('DOMContentLoaded', () => {
  const b = document.getElementById('elxBrand'); if (b) b.textContent = ELX.BRAND.name;
  document.querySelectorAll('[data-i18n="footCredit"],[data-i18n="footDisclaimer"]').forEach(el => {
    new MutationObserver(() => { el.hidden = !el.textContent.trim(); }).observe(el, { childList: true, characterData: true, subtree: true });
    el.hidden = !el.textContent.trim();
  });
});

// ---------------------------------------------------------------------------------------
// Ember Labs event tracking (Umami: cookieless, no personal data). Labs-only, like the rest
// of this file, so elektrifikasyon.org is unaffected and the shared pages are untouched.
// Same Umami website as the other Labs tools; every event carries tool: 'turkiye-simulator'.
// Only the live Labs address is counted (data-domains), so local previews are ignored.
//
// Events (all also carry page and lang):
//   slider_set        {control, value}  a share bar released, moved with the keyboard, or reset
//                                       by double-click. control = sector id on the main page
//                                       (bar-<id>), heat_pump_share / heat_pump_whole_sector on
//                                       Households, ev_share on Cars. value = percent shown.
//   reset_clicked     {}                the page's Reset button
//   language_changed  {to}              TR / EN switch
//   page_tab_clicked  {to}              the page tabs (each page also counts as a page view)
//   outbound_link_clicked {domain}      any link that leaves the site
// ---------------------------------------------------------------------------------------
(function () {
  var TOOL = 'turkiye-simulator';
  var UMAMI_ID = '6190ccfa-b0f2-4ed2-8b40-3faf365e9485';

  var s = document.createElement('script');
  s.defer = true;
  s.src = 'https://cloud.umami.is/script.js';
  s.setAttribute('data-website-id', UMAMI_ID);
  s.setAttribute('data-domains', 'ember-labs-org.github.io');
  s.setAttribute('data-performance', 'true');
  document.head.appendChild(s);

  var PAGES = { 'index.html': 'simulator', '': 'simulator', 'hane.html': 'households',
                'otomobil.html': 'cars', 'ornek-hesaplama.html': 'rate_fallacy' };
  function pageOf(href) {
    var f = (href || '').split('?')[0].split('#')[0].split('/').pop();
    return PAGES[f] || f || 'simulator';
  }
  var PAGE = pageOf(location.pathname);
  var SLIDER_NAMES = { households: { bar: 'heat_pump_share', bar2: 'heat_pump_whole_sector' },
                       cars: { bar: 'ev_share' } };

  function lang() {
    try { return localStorage.getItem('elx-lang') === 'en' ? 'en' : 'tr'; } catch (e) { return undefined; }
  }
  function track(name, data) {
    try {
      if (!window.umami || typeof window.umami.track !== 'function') return;
      var payload = { tool: TOOL, page: PAGE, lang: lang() };
      if (data) Object.keys(data).forEach(function (k) {
        if (data[k] !== undefined && data[k] !== null && data[k] !== '') payload[k] = data[k];
      });
      window.umami.track(name, payload);
    } catch (e) { /* never let tracking break the tool */ }
  }
  window.labsTrack = track;

  function controlName(bar) {
    var names = SLIDER_NAMES[PAGE] || {};
    return names[bar.id] || bar.id.replace(/^bar-/, '');
  }
  // Read the value the page shows once it has updated (aria-valuenow), then report it.
  var pending = {};
  function reportSlider(bar, delay) {
    clearTimeout(pending[bar.id]);
    pending[bar.id] = setTimeout(function () {
      var v = Number(bar.getAttribute('aria-valuenow'));
      track('slider_set', { control: controlName(bar), value: isFinite(v) ? v : undefined });
    }, delay);
  }
  function sliderFrom(t) { return t && t.closest ? t.closest('[role="slider"]') : null; }

  document.addEventListener('pointerup', function (e) {
    var bar = sliderFrom(e.target); if (bar) reportSlider(bar, 60);
  }, true);
  document.addEventListener('dblclick', function (e) {
    var bar = sliderFrom(e.target); if (bar) reportSlider(bar, 60);
  }, true);
  document.addEventListener('keyup', function (e) {
    // Arrow keys move a bar in small steps: wait until the person stops, then report once.
    if (!/^Arrow/.test(e.key)) return;
    var bar = sliderFrom(e.target); if (bar) reportSlider(bar, 800);
  }, true);

  document.addEventListener('click', function (e) {
    var t = e.target; if (!t || !t.closest) return;
    if (t.closest('#resetAll')) return track('reset_clicked');
    if (t.closest('#langTr')) return track('language_changed', { to: 'tr' });
    if (t.closest('#langEn')) return track('language_changed', { to: 'en' });
    var a = t.closest('a[href]'); if (!a) return;
    var href = a.getAttribute('href') || '';
    if (a.closest('.sitenav')) return track('page_tab_clicked', { to: pageOf(href) });
    if (/^https?:/i.test(href)) {
      var domain; try { domain = new URL(href).hostname.replace(/^www\./, ''); } catch (err) { domain = undefined; }
      track('outbound_link_clicked', { domain: domain });
    }
  }, true);
})();
