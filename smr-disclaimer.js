/* ============================================================
   Show Me Rates - Compliance disclaimer bar
   Repo: github.com/showmerates/tools-showmerates
   File: smr-disclaimer.js  (repo root)

   INSTALL: one line inside <head> of every calculator:
     <script src="/smr-disclaimer.js" defer></script>

   What it does:
   1. Pins the compliance disclaimer to the top of the viewport.
   2. Finds the page's fixed header and shifts it down so the
      disclaimer is never covered.
   3. Hides the breadcrumb bar (.breadcrumb).
   4. Rebuilds the top spacing. IMPORTANT: on the calculator
      pages the breadcrumb's 92px top padding was the only thing
      clearing the fixed header - no page sets body padding-top.
      So when we hide it we add (disclaimer + header) height to
      the body instead. index.html has no breadcrumb (its hero
      carries 120px of its own padding), so it only gets the
      disclaimer height.

   All measurements are live, so mobile header heights (60px)
   and a two-line disclaimer both self-correct on resize.
   ============================================================ */
(function () {
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
    /* breadcrumb removed sitewide */
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

      // already shifted by us - keep in sync and record height
      if (isOurs) {
        el.style.top = h + 'px';
        if (el.offsetHeight > headerH) { headerH = el.offsetHeight; }
        continue;
      }

      if (isNaN(top) || top > 1) { continue; }

      // full-width top bars only - skip modals, badges, popups
      if (el.offsetWidth < window.innerWidth * 0.6) { continue; }
      if (el.offsetHeight > window.innerHeight * 0.5) { continue; }

      el.style.top = h + 'px';
      el.setAttribute('data-smr-shifted', '1');
      if (el.offsetHeight > headerH) { headerH = el.offsetHeight; }
    }
    return headerH;
  }

  function apply() {
    if (!bar) { return; }

    var h = bar.offsetHeight || 28;
    var headerH = measureAndShiftHeader(h);

    // did this page have a breadcrumb providing the header clearance?
    var hadBreadcrumb = !!document.querySelector('.breadcrumb');

    if (origBodyPad === null) {
      origBodyPad = parseFloat(window.getComputedStyle(document.body).paddingTop) || 0;
    }

    var pad = origBodyPad + h + (hadBreadcrumb ? headerH : 0);
    document.body.style.paddingTop = pad + 'px';
  }

  function init() {
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
      window.requestAnimationFrame(apply);
    } else {
      apply();
    }
    setTimeout(apply, 250);
    window.addEventListener('load', apply);
    window.addEventListener('resize', apply);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
