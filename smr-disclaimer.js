/* ============================================================
   Show Me Rates - Tools site shared script
   Repo: github.com/showmerates/tools-showmerates
   File: smr-disclaimer.js  (repo root)

   Loaded by every calculator via:
     <script src="/smr-disclaimer.js" defer></script>

   Does two jobs:

   PART 1 - COMPLIANCE DISCLAIMER
     Pins the disclaimer bar to the top, shifts the page's fixed
     header down so nothing is covered, hides .breadcrumb, and
     rebuilds top spacing (the breadcrumb's 92px padding was the
     only thing clearing the fixed header on calculator pages;
     index.html has no breadcrumb and its hero carries its own).

   PART 2 - AD ATTRIBUTION
     Reads the smr_attr cookie set on .showmerates.com by the
     main site, so a visitor who lands on showmerates.com and
     converts on a calculator keeps their click ID. Also captures
     click IDs if someone lands directly on a calculator.
     Injects msclkid / gclid / utm_* into outgoing lead payloads
     (Shape CRM). For Shape it also appends a readable attribution
     block to notes_sidebar so LOs can see the source on the lead.

   NOTE: filename says "disclaimer" but it now carries both. Kept
   as-is so the 10 calculator <script> tags don't need changing.
   ============================================================ */
(function () {

  /* ==========================================================
     PART 1 - COMPLIANCE DISCLAIMER
     ========================================================== */
  var TEXT = 'Not a government agency. Private lender. E Mortgage Capital, Inc. | NMLS# 1416824';

  var CSS = [
    '.smr-disclaimer{',
    '  position:fixed;top:0;left:0;right:0;width:100%;',
    '  z-index:2147483000;',
    '  box-sizing:border-box;',
    '  background:#081A2F;color:rgba(255,255,255,.68);',
    "  font-family:'Source Sans 3','Source Sans Pro',-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;",
    '  font-size:11px;font-weight:600;letter-spacing:.2px;line-height:1.3;',
    '  text-align:center;padding:7px 14px;margin:0;',
    '}',
    '@media (max-width:480px){',
    '  .smr-disclaimer{font-size:9.5px;letter-spacing:0;padding:6px 10px;}',
    '}',
    '.breadcrumb{display:none !important;}'
  ].join('\n');

  var bar, origBodyPad = null;

  function measureAndShiftHeader(h) {
    var headerH = 0;
    var els = document.body.getElementsByTagName('*');

    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el === bar) { continue; }

      var cs = window.getComputedStyle(el);
      if (cs.position !== 'fixed') { continue; }

      var isOurs = el.getAttribute('data-smr-shifted') === '1';
      var top = parseFloat(cs.top);

      if (isOurs) {
        el.style.top = h + 'px';
        if (el.offsetHeight > headerH) { headerH = el.offsetHeight; }
        continue;
      }

      if (isNaN(top) || top > 1) { continue; }
      if (el.offsetWidth < window.innerWidth * 0.6) { continue; }
      if (el.offsetHeight > window.innerHeight * 0.5) { continue; }

      el.style.top = h + 'px';
      el.setAttribute('data-smr-shifted', '1');
      if (el.offsetHeight > headerH) { headerH = el.offsetHeight; }
    }
    return headerH;
  }

  function applyLayout() {
    if (!bar) { return; }

    var h = bar.offsetHeight || 28;
    var headerH = measureAndShiftHeader(h);
    var hadBreadcrumb = !!document.querySelector('.breadcrumb');

    if (origBodyPad === null) {
      origBodyPad = parseFloat(window.getComputedStyle(document.body).paddingTop) || 0;
    }

    document.body.style.paddingTop =
      (origBodyPad + h + (hadBreadcrumb ? headerH : 0)) + 'px';
  }

  function initDisclaimer() {
    if (document.querySelector('.smr-disclaimer')) { return; }

    var style = document.createElement('style');
    style.setAttribute('data-smr', 'disclaimer');
    style.appendChild(document.createTextNode(CSS));
    document.head.appendChild(style);

    bar = document.createElement('div');
    bar.className = 'smr-disclaimer';
    bar.setAttribute('role', 'note');
    bar.textContent = TEXT;

    if (document.body.firstChild) {
      document.body.insertBefore(bar, document.body.firstChild);
    } else {
      document.body.appendChild(bar);
    }

    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(applyLayout);
    } else {
      applyLayout();
    }
    setTimeout(applyLayout, 250);
    window.addEventListener('load', applyLayout);
    window.addEventListener('resize', applyLayout);
  }


  /* ==========================================================
     PART 2 - AD ATTRIBUTION
     ========================================================== */
  var COOKIE = 'smr_attr';
  var DOMAIN = '.showmerates.com';
  var DAYS   = 90;

  var TARGETS = [
    'secure-api.setshape.com',
    'script.google.com/macros',
    'hooks.zapier.com'
  ];

  var KEYS = [
    'msclkid', 'gclid', 'gbraid', 'wbraid',
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'
  ];

  var attr = {};

  function readCookie(name) {
    var m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return m ? decodeURIComponent(m[2]) : '';
  }
  function writeCookie(name, val) {
    document.cookie = name + '=' + encodeURIComponent(val) +
      ';path=/;domain=' + DOMAIN +
      ';max-age=' + (DAYS * 24 * 60 * 60) + ';SameSite=Lax';
  }

  function initAttribution() {
    var raw = readCookie(COOKIE);
    if (raw) {
      try { attr = JSON.parse(raw) || {}; } catch (e) { attr = {}; }
    }

    var params = {};
    try {
      var qs = new URLSearchParams(window.location.search);
      for (var i = 0; i < KEYS.length; i++) {
        var v = qs.get(KEYS[i]);
        if (v) { params[KEYS[i]] = v; }
      }
    } catch (e) { /* older browser */ }

    var hasNewClick = params.msclkid || params.gclid || params.gbraid || params.wbraid;

    if (hasNewClick || (Object.keys(params).length && !Object.keys(attr).length)) {
      attr = params;
      attr.landingPage = window.location.href;
      attr.referrer = document.referrer || '';
      attr.capturedAt = new Date().toISOString();
      writeCookie(COOKIE, JSON.stringify(attr));
    }

    window.SMR_ATTRIBUTION = attr;
  }

  function networkLabel() {
    if (attr.msclkid) { return 'Bing (Microsoft Ads)'; }
    if (attr.gclid || attr.gbraid || attr.wbraid) { return 'Google Ads'; }
    var s = String(attr.utm_source || '').toLowerCase();
    if (s) { return s; }
    var r = String(attr.referrer || '').toLowerCase();
    if (/bing\.com/.test(r))  { return 'Bing (organic)'; }
    if (/google\./.test(r))   { return 'Google (organic)'; }
    if (/linkedin/.test(r))   { return 'LinkedIn'; }
    if (/facebook|instagram/.test(r)) { return 'Facebook'; }
    if (r) { return 'Referral'; }
    return 'Direct/Other';
  }

  function attributionNote() {
    var lines = ['', '=== ATTRIBUTION ===', 'Ad Network: ' + networkLabel()];
    if (attr.msclkid)      { lines.push('msclkid: ' + attr.msclkid); }
    if (attr.gclid)        { lines.push('gclid: ' + attr.gclid); }
    if (attr.utm_source)   { lines.push('utm_source: ' + attr.utm_source); }
    if (attr.utm_campaign) { lines.push('utm_campaign: ' + attr.utm_campaign); }
    if (attr.landingPage)  { lines.push('Landing: ' + attr.landingPage); }
    if (attr.referrer)     { lines.push('Referrer: ' + attr.referrer); }
    return lines.join('\n');
  }

  function isTarget(url) {
    if (!url) { return false; }
    var u = String(url).toLowerCase();
    for (var i = 0; i < TARGETS.length; i++) {
      if (u.indexOf(TARGETS[i]) !== -1) { return true; }
    }
    return false;
  }

  function isShape(url) {
    return String(url || '').toLowerCase().indexOf('setshape.com') !== -1;
  }

  function mergeInto(obj, url) {
    for (var k in attr) {
      if (Object.prototype.hasOwnProperty.call(attr, k)) {
        if (obj[k] === undefined || obj[k] === '' || obj[k] === null) {
          obj[k] = attr[k];
        }
      }
    }
    obj.adNetwork = obj.adNetwork || networkLabel();

    // Shape: also append a readable block so LOs see it on the lead
    if (isShape(url)) {
      obj.notes_sidebar = (obj.notes_sidebar || '') + attributionNote();
    }
    return obj;
  }

  function injectBody(body, url) {
    if (typeof body === 'string') {
      try {
        var o = JSON.parse(body);
        if (o && typeof o === 'object') { return JSON.stringify(mergeInto(o, url)); }
      } catch (e) {
        try {
          var sp = new URLSearchParams(body);
          for (var k in attr) {
            if (Object.prototype.hasOwnProperty.call(attr, k) && !sp.get(k)) {
              sp.append(k, attr[k]);
            }
          }
          return sp.toString();
        } catch (e2) { return body; }
      }
      return body;
    }

    if (typeof FormData !== 'undefined' && body instanceof FormData) {
      for (var f in attr) {
        if (Object.prototype.hasOwnProperty.call(attr, f) && !body.get(f)) {
          body.append(f, attr[f]);
        }
      }
      return body;
    }

    if (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) {
      for (var p in attr) {
        if (Object.prototype.hasOwnProperty.call(attr, p) && !body.get(p)) {
          body.append(p, attr[p]);
        }
      }
      return body;
    }

    return body;
  }

  function patchTransports() {
    if (window.fetch && !window.__smrFetchPatched) {
      var origFetch = window.fetch;
      window.fetch = function (input, init) {
        try {
          var url = (typeof input === 'string') ? input : (input && input.url) || '';
          if (isTarget(url) && init && init.body) {
            init.body = injectBody(init.body, url);
          }
        } catch (e) { /* never block the request */ }
        return origFetch.apply(this, arguments);
      };
      window.__smrFetchPatched = true;
    }

    if (window.XMLHttpRequest && !window.__smrXhrPatched) {
      var origOpen = XMLHttpRequest.prototype.open;
      var origSend = XMLHttpRequest.prototype.send;

      XMLHttpRequest.prototype.open = function (method, url) {
        this.__smrURL = url;
        return origOpen.apply(this, arguments);
      };

      XMLHttpRequest.prototype.send = function (body) {
        try {
          if (isTarget(this.__smrURL) && body) {
            body = injectBody(body, this.__smrURL);
          }
        } catch (e) { /* never block */ }
        return origSend.call(this, body);
      };
      window.__smrXhrPatched = true;
    }
  }

  // attribution must be ready before any form can submit
  initAttribution();
  patchTransports();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDisclaimer);
  } else {
    initDisclaimer();
  }
})();
