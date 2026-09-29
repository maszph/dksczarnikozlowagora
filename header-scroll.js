/* ============================================================
   DKS Czarni Kozłowa Góra – chowany nagłówek + pływający hamburger
   ------------------------------------------------------------
   • przewijasz w dół  → cały nagłówek (logo, menu, nazwa strony)
                         wyjeżdża do góry, a w rogu pojawia się
                         okrągły przycisk-hamburger z menu
   • wracasz na samą górę strony → nagłówek płynnie wraca
   Działa tak samo na telefonie i komputerze.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- USTAWIENIA (można zmieniać) ---------- */
  var HIDE_AT = 90;              // po przewinięciu o tyle px nagłówek się chowa
  var SHOW_AT = 10;              // poniżej tylu px od góry nagłówek wraca
  var SHOW_ON_SCROLL_UP = false; // true = nagłówek wraca już przy przewijaniu w górę (jak na FB),
                                 // false = wraca dopiero na samej górze strony
  /* -------------------------------------------------- */

  var header = document.querySelector('header');
  var nav = header && header.querySelector('nav');
  if (!header || !nav) return;

  var body = document.body;
  var hidden = false;
  var lastY = window.pageYOffset || 0;
  var ticking = false;

  /* ---------- budowa pływającego menu na podstawie istniejącego <nav> ---------- */
  var currentFile = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  function makeLink(a, extraClass) {
    var link = document.createElement('a');
    var href = a.getAttribute('href');
    var label = a.textContent.replace(/\s+/g, ' ').trim();
    if (!label && a.querySelector('img')) label = 'Strona główna';
    link.href = href;
    link.textContent = label;
    if (extraClass) link.className = extraClass;
    if (href && href.toLowerCase() === currentFile) link.classList.add('is-current');
    return link;
  }

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'fm-btn';
  btn.setAttribute('aria-label', 'Otwórz menu');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'fm-panel');
  btn.innerHTML =
    '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<line class="l1" x1="4" y1="7"  x2="20" y2="7"  stroke="#ffffff" stroke-width="2.6" stroke-linecap="round"/>' +
    '<line class="l2" x1="4" y1="12" x2="20" y2="12" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round"/>' +
    '<line class="l3" x1="4" y1="17" x2="20" y2="17" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round"/>' +
    '</svg>';

  var panel = document.createElement('div');
  panel.className = 'fm-panel';
  panel.id = 'fm-panel';
  panel.setAttribute('aria-label', 'Menu główne');

  var pageName = document.querySelector('.current-page');
  if (pageName) {
    var title = document.createElement('div');
    title.className = 'fm-title';
    title.textContent = pageName.textContent.trim();
    panel.appendChild(title);
  }

  Array.prototype.forEach.call(nav.querySelectorAll(':scope > ul > li'), function (li) {
    var main = li.querySelector(':scope > a');
    if (!main) return;
    panel.appendChild(makeLink(main));
    Array.prototype.forEach.call(li.querySelectorAll('.dropdown-menu a'), function (sub) {
      panel.appendChild(makeLink(sub, 'fm-sub'));
    });
  });

  body.appendChild(btn);
  body.appendChild(panel);

  /* ---------- otwieranie / zamykanie panelu ---------- */
  function setPanel(open) {
    panel.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    setPanel(!panel.classList.contains('open'));
  });

  document.addEventListener('click', function (e) {
    if (!panel.contains(e.target) && e.target !== btn) setPanel(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setPanel(false);
  });

  /* ---------- chowanie / pokazywanie nagłówka ---------- */
  function setHidden(state) {
    if (hidden === state) return;
    hidden = state;
    header.classList.toggle('header-hidden', state);
    body.classList.toggle('header-collapsed', state);

    if (state) {
      // zwiń rozwinięte menu mobilne i dropdown w nagłówku
      var mobileList = nav.querySelector(':scope > ul');
      if (mobileList) mobileList.classList.remove('active');
      Array.prototype.forEach.call(nav.querySelectorAll('.dropdown-menu'), function (m) {
        m.style.display = '';
      });
    } else {
      setPanel(false);
    }
  }

  function update() {
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;

    if (y <= SHOW_AT) {
      setHidden(false);
    } else if (y > HIDE_AT) {
      if (!hidden && (!SHOW_ON_SCROLL_UP || y > lastY + 4)) {
        setHidden(true);
      } else if (hidden && SHOW_ON_SCROLL_UP && y < lastY - 8) {
        setHidden(false);
      }
    }

    lastY = y;
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }, { passive: true });

  window.addEventListener('load', update);
  update();
})();
