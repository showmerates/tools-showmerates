/* ============================================================
   Show Me Rates - Compliance disclaimer bar
   Repo: github.com/showmerates/tools-showmerates
   File: smr-disclaimer.js  (repo root)

   INSTALL: add this ONE line inside <head> of every calculator:
     <script src="/smr-disclaimer.js" defer></script>

   Pins a disclaimer bar to the top of the viewport, then
   automatically detects any fixed header sitting at top:0 and
   shifts it down so nothing overlaps. Also bumps body padding
   so page content clears both. No per-page tweaks needed.
   Edit TEXT once here and every calculator updates.
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
    '}'
  ].join('\n');

  var bar, origBodyPad = null;

  function shiftFixedHeaders(h) {
    var els = document.body.getElementsByTagName('*');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el === bar) { continue; }

      var cs = window.getComputedStyle(el);
      if (cs.position !== 'fixed') { continue; }

      // only elements pinned to the very top
      var top = parseFloat(cs.top);
      if (isNaN(top) || top > 1) {
        // already shifted by us? keep it in sync
        if (el.getAttribute('data-smr-shifted') === '1') { el.style.top = h + 'px'; }
        continue;
      }

      // only full-width bars (headers) - skip modals, badges, popups
      if (el.offsetWidth < window.innerWidth * 0.6) { continue; }
      if (el.offsetHeight > window.innerHeight * 0.5) { continue; }

      el.style.top = h + 'px';
      el.setAttribute('data-smr-shifted', '1');
    }
  }

  function apply() {
    if (!bar) { return; }
    var h = bar.offsetHeight || 28;

    if (origBodyPad === null) {
      origBodyPad = parseFloat(window.getComputedStyle(document.body).paddingTop) || 0;
    }
    document.body.style.paddingTop = (origBodyPad + h) + 'px';

    shiftFixedHeaders(h);
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

    // run after layout settles, then again after fonts/images load
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
