/* ============================================================
   Show Me Rates — Compliance disclaimer bar
   Repo: github.com/showmerates/tools-showmerates
   File: smr-disclaimer.js  (repo root)

   INSTALL: add this ONE line inside <head> of every calculator:
     <script src="/smr-disclaimer.js" defer></script>

   Renders a static bar at the very top of the page. Static (not
   fixed) on purpose: it can never overlap a calculator's own
   header, and needs no body-padding math. Edit the text once
   here and every calculator updates.
   ============================================================ */
(function () {
  var TEXT = 'Not a government agency. Private lender. E Mortgage Capital, Inc. | NMLS# 1416824';

  var CSS = [
    '.smr-disclaimer{',
    '  box-sizing:border-box;width:100%;',
    '  background:#081A2F;color:rgba(255,255,255,.68);',
    "  font-family:'Source Sans 3','Source Sans Pro',-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;",
    '  font-size:11px;font-weight:600;letter-spacing:.2px;line-height:1.3;',
    '  text-align:center;padding:7px 14px;margin:0;',
    '}',
    '@media (max-width:480px){',
    '  .smr-disclaimer{font-size:9.5px;letter-spacing:0;padding:6px 10px;}',
    '}'
  ].join('\n');

  function init() {
    if (document.querySelector('.smr-disclaimer')) { return; }

    var style = document.createElement('style');
    style.setAttribute('data-smr', 'disclaimer');
    style.appendChild(document.createTextNode(CSS));
    document.head.appendChild(style);

    var bar = document.createElement('div');
    bar.className = 'smr-disclaimer';
    bar.setAttribute('role', 'note');
    bar.textContent = TEXT;

    if (document.body.firstChild) {
      document.body.insertBefore(bar, document.body.firstChild);
    } else {
      document.body.appendChild(bar);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
