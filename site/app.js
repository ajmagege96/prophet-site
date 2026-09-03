/* ── Mobile menu toggle ───────────────────────────────── */
(function () {
  var btn = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-menu-panel]');
  if (!btn || !panel) return;

  btn.addEventListener('click', function () {
    var open = panel.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
})();

/* ── Carousel ─────────────────────────────────────────── */
(function () {
  var track = document.querySelector('[data-carousel-track]');
  if (!track) return;

  var cards = Array.prototype.slice.call(track.querySelectorAll('[data-card]'));
  var promptInput = document.querySelector('[data-prompt-input]');
  var takesContainer = document.querySelector('[data-takes-list]');
  var activeIndex = -1;

  /* Mock takes keyed by card slug */
  var TAKES = {
    'btc-100k': [
      { stance: 'YES', claim: 'On-chain accumulation hasn\'t slowed — whales are still loading', ago: '2h ago' },
      { stance: 'NO',  claim: 'Macro headwinds are underpriced here', ago: '5h ago' }
    ],
    'fed-rate-cut': [
      { stance: 'NO', claim: 'Labor market still too strong for a cut', ago: '1h ago' }
    ],
    'sp500-6000': [
      { stance: 'YES', claim: 'Breadth is improving — not just mega-caps anymore', ago: '3h ago' }
    ]
  };

  function cardGap() {
    if (cards.length < 2) return 12;
    return cards[1].offsetLeft - cards[0].offsetLeft - cards[0].offsetWidth;
  }

  function setActiveCard(index) {
    if (index === activeIndex) return;
    activeIndex = index;
    for (var i = 0; i < cards.length; i++) {
      if (i === index) cards[i].classList.add('carousel__card--active');
      else cards[i].classList.remove('carousel__card--active');
    }
    startTypewriter(cards[index].dataset.prompt || '');
    renderTakes(cards[index].dataset.slug || '');
  }

  /* Scroll‑based active tracking (debounced) */
  var scrollTimer;
  track.addEventListener('scroll', function () {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function () {
      var step = cards[0].offsetWidth + cardGap();
      var idx = Math.round(track.scrollLeft / step);
      idx = Math.max(0, Math.min(idx, cards.length - 1));
      setActiveCard(idx);
    }, 80);
  });

  function scrollToCard(index) {
    var step = cards[0].offsetWidth + cardGap();
    track.scrollTo({ left: step * index, behavior: 'smooth' });
  }

  /* Arrow‑key navigation */
  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowRight' && activeIndex < cards.length - 1) {
      scrollToCard(activeIndex + 1);
    } else if (e.key === 'ArrowLeft' && activeIndex > 0) {
      scrollToCard(activeIndex - 1);
    }
  });

  /* ── Typewriter ───────────────────────────────────────── */
  var twTimer = null;
  var cursorInterval = null;

  function clearTypewriter() {
    clearTimeout(twTimer);
    clearInterval(cursorInterval);
    twTimer = null;
    cursorInterval = null;
  }

  function startTypewriter(text) {
    clearTypewriter();
    if (!promptInput) return;
    if (promptInput.value.length > 0) return;

    var i = 0;
    promptInput.placeholder = '\u258C';

    function tick() {
      i++;
      if (i <= text.length) {
        promptInput.placeholder = text.substring(0, i) + '\u258C';
        twTimer = setTimeout(tick, 30);
      } else {
        var show = true;
        cursorInterval = setInterval(function () {
          show = !show;
          promptInput.placeholder = text + (show ? '\u258C' : '');
        }, 530);
      }
    }
    twTimer = setTimeout(tick, 30);
  }

  if (promptInput) {
    promptInput.addEventListener('input', function () {
      clearTypewriter();
      if (promptInput.value.length === 0) {
        startTypewriter(cards[activeIndex].dataset.prompt || '');
      } else {
        promptInput.placeholder = '';
      }
    });
  }

  /* ── Takes renderer ───────────────────────────────────── */
  function renderTakes(slug) {
    if (!takesContainer) return;
    var takes = TAKES[slug] || [];
    if (takes.length === 0) {
      takesContainer.innerHTML = '<div class="takes__empty">[COPY]</div>';
      return;
    }
    var html = '';
    for (var i = 0; i < takes.length; i++) {
      var t = takes[i];
      html += '<div class="takes__item">' +
        '<span class="takes__stance takes__stance--' + t.stance.toLowerCase() + '">' + t.stance + '</span>' +
        '<span class="takes__claim">' + t.claim + '</span>' +
        '<span class="takes__ago">' + t.ago + '</span>' +
        '</div>';
    }
    takesContainer.innerHTML = html;
  }

  /* Init first card */
  if (cards.length > 0) setActiveCard(0);
})();

/* ── Walkthrough ──────────────────────────────────────── */
(function () {
  var overlay = document.querySelector('[data-walkthrough]');
  if (!overlay) return;

  var steps = Array.prototype.slice.call(overlay.querySelectorAll('[data-walkthrough-step]'));
  var current = 0;

  function show() {
    current = 0;
    overlay.hidden = false;
    for (var i = 0; i < steps.length; i++) steps[i].hidden = (i !== 0);
  }

  function hide() {
    overlay.hidden = true;
    try { localStorage.setItem('prophet_walkthrough_done', '1'); } catch (e) {}
  }

  overlay.addEventListener('click', function (e) {
    if (e.target.hasAttribute('data-walkthrough-next')) {
      current++;
      for (var i = 0; i < steps.length; i++) steps[i].hidden = (i !== current);
    } else if (e.target.hasAttribute('data-walkthrough-done')) {
      hide();
    } else if (e.target.hasAttribute('data-walkthrough-close')) {
      hide();
    }
  });

  var helpBtn = document.querySelector('[data-walkthrough-open]');
  if (helpBtn) helpBtn.addEventListener('click', show);

  try {
    if (!localStorage.getItem('prophet_walkthrough_done')) show();
  } catch (e) {
    show();
  }
})();
