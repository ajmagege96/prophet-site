/* ── Mobile menu toggle ───────────────────────────────── */
(function () {
  var btn = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-menu-panel]');
  if (!btn || !panel) return;

  btn.addEventListener('click', function () {
    var open = panel.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });

  /* Close the panel when the window grows past the breakpoint, so resizing
     from mobile to desktop never leaves the menu stuck open. */
  var wide = window.matchMedia('(min-width: 768px)');
  var onChange = function (e) {
    if (e.matches) { panel.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
  };
  if (wide.addEventListener) wide.addEventListener('change', onChange);
  else wide.addListener(onChange);
})();

/* ── Preview fill ─────────────────────────────────────── */
/* Any element with data-mock whose text is still an unfilled {{variable}}
   shows the mock value so the page previews from disk. */
(function () {
  var els = document.querySelectorAll('[data-mock]');
  for (var i = 0; i < els.length; i++) {
    if ((/^\{\{/).test(els[i].textContent.trim())) {
      els[i].textContent = els[i].getAttribute('data-mock');
      var mc = els[i].getAttribute('data-mock-class');
      if (mc) { els[i].className = els[i].className.replace(/stats__num--\{\{[^}]*\}\}/, '').trim() + ' ' + mc; }
    }
  }
})();

/* ── Contract address copy button ─────────────────────── */
/* Shows a truncated address (shorter on mobile); click copies the full
   value and the pill reads "copied" for a moment. */
(function () {
  var btns = document.querySelectorAll('[data-ca-copy]');
  for (var i = 0; i < btns.length; i++) {
    (function (btn) {
      var ca = btn.getAttribute('data-ca') || '';
      var text = btn.querySelector('[data-ca-text]');
      /* Sample address for preview while {{contract_address}} is unfilled */
      if (!ca || (/^\{\{/).test(ca)) ca = '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr';
      var locked = false;
      function short() {
        var n = window.matchMedia('(max-width: 767px)').matches ? 4 : 6;
        return ca.slice(0, n) + '\u2026' + ca.slice(-n);
      }
      function render() { if (!locked) text.textContent = short(); }
      render();
      window.addEventListener('resize', render);
      btn.addEventListener('click', function () {
        var done = function () {
          locked = true;
          text.textContent = 'copied';
          btn.classList.add('site-header__ca--copied');
          setTimeout(function () {
            locked = false;
            render();
            btn.classList.remove('site-header__ca--copied');
          }, 1400);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(ca).then(done, done);
        } else { done(); }
      });
    })(btns[i]);
  }
})();

/* ── Carousel ─────────────────────────────────────────── */
(function () {
  var track = document.querySelector('[data-carousel-track]');
  if (!track) return;

  var cards = Array.prototype.slice.call(track.querySelectorAll('[data-card]'));
  var promptInput = document.querySelector('[data-prompt-input]');
  var takesContainer = document.querySelector('[data-takes-list]');
  var thesisBox = document.querySelector('[data-thesis-box]');
  var thesisText = document.querySelector('[data-thesis-text]');
  var thesisState = document.querySelector('[data-thesis-state]');
  var thesisStance = document.querySelector('[data-thesis-stance]');
  var voteWrap = document.querySelector('[data-vote-wrap]');
  var votePop = document.querySelector('[data-vote-pop]');
  var voteOpen = document.querySelector('[data-vote-open]');
  var thesisLabel = document.querySelector('[data-thesis-label]');
  var thesisList = document.querySelector('[data-thesis-contributors]');
  var votes = {}; /* slug -> 'yes' | 'no' (mock, in-memory) */
  var prevBtn = document.querySelector('[data-carousel-prev]');
  var nextBtn = document.querySelector('[data-carousel-next]');
  var activeIndex = -1;

  function isDesktop() { return window.matchMedia('(min-width: 768px)').matches; }
  function visibleCards() {
    return cards.filter(function (c) { return !c.classList.contains('is-hidden'); });
  }

  /* Mock takes keyed by card slug */
  var TAKES = {
    'btc-100k': [
      { user: 'marrow',   xp: 14, stance: 'YES', claim: 'On-chain accumulation hasn\'t slowed — whales are still loading', ago: '2h ago' },
      { user: 'quietfox', xp: 6,  stance: 'NO',  claim: 'Macro headwinds are underpriced here', ago: '5h ago' },
      { user: 'tessellate', xp: 11, stance: 'YES', claim: 'ETF inflows have been net positive for 9 straight weeks', ago: '7h ago' },
      { user: 'bram_o',   xp: 2,  stance: 'NO',  claim: 'Funding rates are stretched; a flush comes before six figures', ago: '9h ago' },
      { user: 'lunaire',  xp: 8,  stance: 'YES', claim: 'Miner selling has dried up post-halving', ago: '12h ago' },
      { user: 'kesh',     xp: 5,  stance: 'YES', claim: 'Dollar weakness is doing half the work here', ago: '1d ago' },
      { user: 'oddlot',   xp: 3,  stance: 'NO',  claim: 'Options skew says the market is already leaning too hard on this', ago: '1d ago' }
    ],
    'fed-rate-cut': [
      { user: 'delta_k', xp: 9, stance: 'NO', claim: 'Labor market still too strong for a cut', ago: '1h ago' }
    ],
    'sp500-6000': [
      { user: 'ines', xp: 3, stance: 'YES', claim: 'Breadth is improving — not just mega-caps anymore', ago: '3h ago' }
    ],
    'sec-exchange': [
      { user: 'halden', xp: 4, stance: 'NO',  claim: 'The comment period closing quietly isn\'t the same as staff sign-off', ago: '40m ago' },
      { user: 'ines',   xp: 2, stance: 'YES', claim: 'Two commissioners have already said the custody model is fine', ago: '2h ago' },
      { user: 'oddlot', xp: 1, stance: 'YES', claim: 'Timing risk is real but the question doesn\'t ask about timing', ago: '6h ago' }
    ],
    'mstr-btc': [
      { user: 'quietfox', xp: 5, stance: 'YES', claim: 'Latest 8-K shows the ATM program still has room', ago: '3h ago' },
      { user: 'bram_o',   xp: 2, stance: 'NO',  claim: 'Premium to NAV has compressed; issuing here is less attractive', ago: '8h ago' }
    ]
  };

  function cardGap() {
    var v = visibleCards();
    if (v.length < 2) return 12;
    return v[1].offsetLeft - v[0].offsetLeft - v[0].offsetWidth;
  }
  function cardStep() { var v = visibleCards(); return v.length ? v[0].offsetWidth + cardGap() : 0; }

  function setActiveCard(index) {
    if (index === activeIndex) return;
    activeIndex = index;
    for (var i = 0; i < cards.length; i++) {
      if (i === index) cards[i].classList.add('carousel__card--active');
      else cards[i].classList.remove('carousel__card--active');
    }
    startTypewriter(index);
    renderThesis(cards[index]);
    renderTakes(cards[index].dataset.slug || '');
  }

  function select(index) {
    if (index < 0 || index >= cards.length) return;
    setActiveCard(index);
  }

  /* Leftmost visible card, in current DOM order */
  function firstVisibleIndex() {
    var v = visibleCards();
    if (!v.length) return -1;
    if (!isDesktop()) {
      var step = cardStep();
      var k = step ? Math.round(track.scrollLeft / step) : 0;
      k = Math.max(0, Math.min(k, v.length - 1));
      return cards.indexOf(v[k]);
    }
    return cards.indexOf(v[0]);
  }

  /* Desktop paging: the deck rotates, so left and right go on forever.
     Right: slide the track one card left, then move the first visible card
     (and any hidden ones ahead of it) to the end and snap back.
     Left: move the last visible card to the front, snap the track one card
     left, then slide it back to 0. Mobile keeps native swipe. */
  var sliding = false;
  function nodesToRotate(dir) {
    var out = [];
    var list = Array.prototype.slice.call(track.querySelectorAll('[data-card]'));
    if (dir > 0) {
      for (var i = 0; i < list.length; i++) {
        out.push(list[i]);
        if (!list[i].classList.contains('is-hidden')) break;
      }
    } else {
      for (var k = list.length - 1; k >= 0; k--) {
        out.unshift(list[k]);
        if (!list[k].classList.contains('is-hidden')) break;
      }
    }
    return out;
  }
  function page(dir, target) {
    if (sliding) return;
    var step = cardStep();
    if (!step || visibleCards().length < 2) return;
    if (!isDesktop()) {
      track.scrollTo({ left: Math.round(track.scrollLeft / step + dir) * step, behavior: 'smooth' });
      return;
    }
    sliding = true;
    var nodes = nodesToRotate(dir);
    if (dir > 0) {
      track.classList.add('carousel__track--sliding');
      track.style.transform = 'translateX(' + (-step) + 'px)';
      setTimeout(function () {
        track.classList.remove('carousel__track--sliding');
        for (var i = 0; i < nodes.length; i++) track.appendChild(nodes[i]);
        track.style.transform = '';
        sliding = false;
        setActiveCard(target ? cards.indexOf(target) : firstVisibleIndex());
      }, 310);
    } else {
      track.classList.remove('carousel__track--sliding');
      var first = track.querySelector('[data-card]');
      for (var k = 0; k < nodes.length; k++) track.insertBefore(nodes[k], first);
      track.style.transform = 'translateX(' + (-step) + 'px)';
      void track.offsetWidth; /* commit the jump before animating */
      track.classList.add('carousel__track--sliding');
      track.style.transform = 'translateX(0)';
      setTimeout(function () {
        track.classList.remove('carousel__track--sliding');
        track.style.transform = '';
        sliding = false;
        setActiveCard(target ? cards.indexOf(target) : firstVisibleIndex());
      }, 310);
    }
  }

  /* Keyboard: move the selection to the neighbouring card (wrapping), and
     only rotate the deck when that card is off-screen. */
  function stepSelection(dir) {
    if (sliding) return;
    var v = Array.prototype.slice.call(track.querySelectorAll('[data-card]'))
      .filter(function (c) { return !c.classList.contains('is-hidden'); });
    if (v.length < 2 || activeIndex < 0) return;
    var pos = v.indexOf(cards[activeIndex]);
    var next = (pos + dir + v.length) % v.length;
    var target = v[next];
    if (!isDesktop()) {
      setActiveCard(cards.indexOf(target));
      track.scrollTo({ left: target.offsetLeft - track.offsetLeft, behavior: 'smooth' });
      return;
    }
    var step = cardStep();
    var perView = step ? Math.max(1, Math.round(track.clientWidth / step)) : 1;
    if (next < perView) setActiveCard(cards.indexOf(target));
    else page(dir > 0 ? 1 : -1, target);
  }

  var scrollTimer;
  track.addEventListener('scroll', function () {
    if (isDesktop()) return;
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function () {
      var idx = firstVisibleIndex();
      if (idx >= 0) setActiveCard(idx);
    }, 80);
  });

  for (var c = 0; c < cards.length; c++) {
    (function (i) {
      cards[i].addEventListener('click', function () { select(i); });
    })(c);
  }

  if (prevBtn) prevBtn.addEventListener('click', function () { page(-1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { page(1); });

  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); stepSelection(1); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); stepSelection(-1); }
  });

  /* ── Filter tags ──────────────────────────────────────── */
  /* One tag active at a time; clicking the active tag clears the filter. */
  var filterBar = document.querySelector('[data-filters]');
  var activeFilter = null;
  function applyFilter(state) {
    activeFilter = state;
    if (filterBar) {
      var tags = filterBar.querySelectorAll('[data-filter]');
      for (var i = 0; i < tags.length; i++) {
        tags[i].classList.toggle('filters__tag--on', tags[i].dataset.filter === state);
      }
    }
    for (var k = 0; k < cards.length; k++) {
      cards[k].classList.toggle('is-hidden', !!state && cards[k].dataset.state !== state);
    }
    track.scrollTo({ left: 0 });
    var v = visibleCards();
    if (v.length) setActiveCard(cards.indexOf(v[0]));
  }
  if (filterBar) {
    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-filter]');
      if (!btn) return;
      applyFilter(btn.dataset.filter === activeFilter ? null : btn.dataset.filter);
    });
  }

  /* ── Typewriter ───────────────────────────────────────── */
  /* Types the selected market's question as placeholder, holds, erases,
     then moves on to the next market's question, looping through all of
     them. Restarts from the selected card whenever the carousel moves. */
  var TYPE_MS = 30, ERASE_MS = 15, HOLD_MS = 2200, PAUSE_MS = 400, BLINK_MS = 530;
  var CURSOR = '▌';
  var twTimer = null;

  function clearTypewriter() {
    clearTimeout(twTimer);
    twTimer = null;
  }

  function questionOf(index) {
    var q = cards[index].querySelector('.carousel__question');
    return q ? q.textContent.trim() : '';
  }

  function startTypewriter(startIndex) {
    clearTypewriter();
    if (!promptInput) return;
    if (promptInput.value.length > 0) return;

    var idx = startIndex;
    var text = questionOf(idx);
    var i = 0;
    var held = 0;
    var show = true;
    promptInput.placeholder = CURSOR;

    function typeStep() {
      i++;
      promptInput.placeholder = text.substring(0, i) + CURSOR;
      if (i < text.length) twTimer = setTimeout(typeStep, TYPE_MS);
      else { held = 0; twTimer = setTimeout(blinkStep, BLINK_MS); }
    }
    function blinkStep() {
      show = !show;
      held += BLINK_MS;
      promptInput.placeholder = text + (show ? CURSOR : '');
      if (held < HOLD_MS) twTimer = setTimeout(blinkStep, BLINK_MS);
      else { show = true; twTimer = setTimeout(eraseStep, ERASE_MS); }
    }
    function eraseStep() {
      i--;
      promptInput.placeholder = text.substring(0, i) + CURSOR;
      if (i > 0) twTimer = setTimeout(eraseStep, ERASE_MS);
      else {
        do { idx = (idx + 1) % cards.length; }
        while (cards[idx].classList.contains('is-hidden') && idx !== startIndex);
        text = questionOf(idx);
        twTimer = setTimeout(typeStep, PAUSE_MS);
      }
    }
    twTimer = setTimeout(typeStep, TYPE_MS);
  }

  if (promptInput) {
    promptInput.addEventListener('input', function () {
      clearTypewriter();
      if (promptInput.value.length === 0) {
        startTypewriter(activeIndex);
      } else {
        promptInput.placeholder = '';
      }
    });
  }

  /* ── Thesis block (called / vote-open markets) ────────── */
  function renderThesis(card) {
    if (!thesisBox) return;
    var text = card.dataset.thesis || '';
    var state = card.dataset.state || 'none';
    if (!text || state === 'none') { thesisBox.hidden = true; return; }
    thesisBox.hidden = false;
    thesisLabel.textContent = state === 'vote' ? 'Thesis draft' : 'Thesis';
    var stance = (card.dataset.stance || '').toLowerCase();
    thesisStance.textContent = stance ? stance.toUpperCase() : '';
    thesisStance.className = 'thesis__stance heading' + (stance ? ' thesis__stance--' + stance : '');
    thesisText.textContent = text;
    var badge = card.querySelector('.carousel__state');
    thesisState.innerHTML = badge ? badge.innerHTML : '';
    thesisState.className = 'thesis__state' + (state === 'vote' ? ' thesis__state--vote' : '');

    var contrib = [];
    try { contrib = JSON.parse(card.dataset.contributors || '[]'); } catch (e) {}
    var html = '';
    for (var i = 0; i < contrib.length; i++) {
      html += '<li class="thesis__row">' +
        '<span class="thesis__user">' + contrib[i].user + '</span>' +
        '<span class="thesis__claim">' + contrib[i].claim + '</span>' +
        '<span class="thesis__xp">+' + contrib[i].xp + ' XP</span>' +
        '</li>';
    }
    thesisList.innerHTML = html;

    voteWrap.hidden = state !== 'vote';
    votePop.hidden = true;
    if (state === 'vote') {
      var chosen = votes[card.dataset.slug];
      voteOpen.innerHTML = chosen ? 'Voted <span class="tally tally--' + chosen + '">' + chosen.toUpperCase() + '</span>' : 'Vote';
      var btns = votePop.querySelectorAll('[data-vote]');
      for (var k = 0; k < btns.length; k++) {
        btns[k].classList.toggle('vote-btn--chosen', btns[k].dataset.vote === chosen);
      }
    }
  }
  if (voteWrap) {
    voteOpen.addEventListener('click', function () { votePop.hidden = !votePop.hidden; });
    votePop.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-vote]');
      if (!btn || activeIndex < 0) return;
      votes[cards[activeIndex].dataset.slug] = btn.dataset.vote;
      renderThesis(cards[activeIndex]);
    });
    document.addEventListener('click', function (e) {
      if (!voteWrap.contains(e.target)) votePop.hidden = true;
    });
  }

  /* ── Takes renderer ───────────────────────────────────── */
  /* Empty-state line: {{empty_no_takes}} on the container; while the server
     hasn't filled it, fall back to the approved mock copy. */
  var EMPTY_MOCK = 'Nobody\'s taken this one yet. The first contributor earns the most credit. What do you think?';
  function emptyLine() {
    var v = takesContainer.getAttribute('data-empty-none') || '';
    return (/^\{\{/).test(v) || !v ? EMPTY_MOCK : v;
  }

  function renderTakes(slug) {
    if (!takesContainer) return;
    var takes = TAKES[slug] || [];
    if (takes.length === 0) {
      takesContainer.innerHTML = '<div class="takes__empty">' + emptyLine() + '</div>';
      return;
    }
    var html = '';
    for (var i = 0; i < takes.length; i++) {
      var t = takes[i];
      html += '<div class="takes__item">' +
        '<div class="takes__main">' +
          '<div class="takes__head">' +
            '<span class="takes__user">' + t.user + '</span>' +
            '<span class="takes__stance takes__stance--' + t.stance.toLowerCase() + '">' + t.stance + '</span>' +
          '</div>' +
          '<p class="takes__claim">' + t.claim + '</p>' +
        '</div>' +
        '<div class="takes__side">' +
          '<span class="takes__ago">' + t.ago + '</span>' +
          '<span class="takes__xp">+' + t.xp + ' XP</span>' +
        '</div>' +
        '</div>';
    }
    takesContainer.innerHTML = html;
  }

  /* Init first card */
  if (cards.length > 0) setActiveCard(0);
})();

/* ── Roadmap timeline light ───────────────────────────── */
/* A long streak travels the line continuously. Dots sit over the line, so
   the streak is never visible inside one; instead a dot fills when the
   streak's leading edge is ~10% into it and drains when the trailing edge
   is ~10% past it. Horizontal on desktop, vertical on mobile. */
(function () {
  var wrap = document.querySelector('[data-timeline]');
  if (!wrap) return;
  var light = wrap.querySelector('[data-timeline-light]');
  var dots = Array.prototype.slice.call(wrap.querySelectorAll('[data-timeline-dot]'));
  var track = wrap.querySelector('.timeline__track');
  if (!light || !dots.length || !track) return;

  var SPEED = 200;  /* px per second */
  var start = null;

  function frame(now) {
    if (start === null) start = now;
    var horiz = track.offsetWidth > track.offsetHeight;
    var len = horiz ? track.offsetWidth : track.offsetHeight;
    var streak = horiz ? light.offsetWidth : light.offsetHeight;
    var total = len + streak;
    var trailing = ((now - start) / 1000 * SPEED) % total - streak;
    var leading = trailing + streak;
    light.style.transform = horiz ? 'translateX(' + trailing + 'px)' : 'translateY(' + trailing + 'px)';

    var tb = track.getBoundingClientRect();
    for (var i = 0; i < dots.length; i++) {
      var r = dots[i].getBoundingClientRect();
      var d0 = horiz ? r.left - tb.left : r.top - tb.top;
      var size = horiz ? r.width : r.height;
      var d1 = d0 + size;
      var full = leading >= d0 + size * 0.1 && trailing <= d1 + size * 0.1;
      dots[i].classList.toggle('timeline__dot--full', full);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

/* ── List panels: filter tags, row dropdowns, vote popups ── */
(function () {
  var panel = document.querySelector('[data-panel]');
  if (!panel) return;

  /* Filter tags: one on at a time shows only that group; click again to show all */
  var tagBar = panel.querySelector('[data-filters]');
  var groups = panel.querySelectorAll('[data-group]');
  var active = null;
  if (tagBar) {
    tagBar.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-filter]');
      if (!btn) return;
      active = btn.dataset.filter === active ? null : btn.dataset.filter;
      var tags = tagBar.querySelectorAll('[data-filter]');
      for (var i = 0; i < tags.length; i++) tags[i].classList.toggle('filters__tag--on', tags[i].dataset.filter === active);
      for (var g = 0; g < groups.length; g++) groups[g].classList.toggle('is-hidden', !!active && groups[g].dataset.group !== active);
    });
  }

  /* Empty state per group: {{empty_*}} on the section; fallback copy while unfilled */
  for (var g2 = 0; g2 < groups.length; g2++) {
    var list = groups[g2].querySelector('.pgroup__list');
    var empty = groups[g2].querySelector('[data-empty]');
    if (!list || !empty) continue;
    if (!list.querySelector('[data-row]')) {
      var txt = groups[g2].getAttribute('data-empty-text') || '';
      empty.textContent = (/^\{\{/).test(txt) || !txt ? groups[g2].getAttribute('data-empty-fallback') : txt;
      empty.hidden = false;
      list.hidden = true;
    }
  }

  /* Click a row to open its contributions; clicks inside the dropdown or vote don't toggle */
  var rows = panel.querySelectorAll('[data-row]');
  for (var r = 0; r < rows.length; r++) {
    rows[r].addEventListener('click', function (e) {
      if (e.target.closest('[data-drop]') || e.target.closest('[data-vote-wrap]')) return;
      var drop = this.querySelector('[data-drop]');
      if (!drop) return;
      drop.hidden = !drop.hidden;
      this.classList.toggle('prow--open', !drop.hidden);
    });
  }

  /* Vote popups per row (mock, in-memory) */
  var wraps = panel.querySelectorAll('[data-vote-wrap]');
  for (var w = 0; w < wraps.length; w++) {
    (function (wrap) {
      var open = wrap.querySelector('[data-vote-open]');
      var pop = wrap.querySelector('[data-vote-pop]');
      open.addEventListener('click', function () { pop.hidden = !pop.hidden; });
      pop.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-vote]');
        if (!btn) return;
        var btns = pop.querySelectorAll('[data-vote]');
        for (var k = 0; k < btns.length; k++) btns[k].classList.toggle('vote-btn--chosen', btns[k] === btn);
        open.innerHTML = 'Voted <span class="tally tally--' + btn.dataset.vote + '">' + btn.dataset.vote.toUpperCase() + '</span>';
        pop.hidden = true;
      });
    })(wraps[w]);
  }
  document.addEventListener('click', function (e) {
    for (var i = 0; i < wraps.length; i++) {
      if (!wraps[i].contains(e.target)) wraps[i].querySelector('[data-vote-pop]').hidden = true;
    }
  });
})();

/* ── Record: time range tabs (visual; the server filters the bars) ── */
(function () {
  var bar = document.querySelector('[data-range]');
  if (!bar) return;
  bar.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-range-opt]');
    if (!btn) return;
    var tabs = bar.querySelectorAll('[data-range-opt]');
    for (var i = 0; i < tabs.length; i++) tabs[i].classList.toggle('range__tab--on', tabs[i] === btn);
  });
})();

/* ── $PROPHET price chart ─────────────────────────────── */
/* Draws {{token.chart_series}} (JSON array, oldest first) as a filled green
   area with an x-axis of relative times and the live price tagged on the
   y-axis beside the last point. Redraws on resize. */
(function () {
  var box = document.querySelector('[data-token-chart]');
  if (!box) return;
  var raw = box.getAttribute('data-series') || '';
  if (!raw || (/^\{\{/).test(raw)) raw = box.getAttribute('data-mock-series') || '[]';
  var s = [];
  try { s = JSON.parse(raw); } catch (e) {}
  if (s.length < 2) return;
  var price = box.getAttribute('data-price') || '';
  if (!price || (/^\{\{/).test(price)) price = box.getAttribute('data-mock-price') || '';
  /* Axis labels come from the server per range ({{token.chart_ticks}}, JSON array);
     for a 1D range these are clock times, for longer ranges dates. */
  var ticksRaw = box.getAttribute('data-ticks') || '';
  if (!ticksRaw || (/^\{\{/).test(ticksRaw)) ticksRaw = box.getAttribute('data-mock-ticks') || '[]';
  var TICKS = [];
  try { TICKS = JSON.parse(ticksRaw); } catch (e) {}
  if (!TICKS.length) TICKS = [''];

  function draw() {
    var W = box.clientWidth || 600, H = box.clientHeight || 190;
    var RP = 69, BP = 18, TP = 6;              /* room for the price tag and the x-axis */
    var lo = Math.min.apply(null, s), hi = Math.max.apply(null, s);
    if (hi === lo) hi = lo + 1;
    var pad = (hi - lo) * 0.12; lo -= pad; hi += pad;
    function x(i) { return (W - RP) * (i / (s.length - 1)); }
    function y(v) { return TP + (H - BP - TP) * (1 - (v - lo) / (hi - lo)); }
    var d = s.map(function (v, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1); }).join(' ');
    var base = H - BP;
    var area = d + ' L' + x(s.length - 1).toFixed(1) + ' ' + base + ' L0 ' + base + ' Z';
    var lx = x(s.length - 1), ly = y(s[s.length - 1]);

    var ticks = '';
    for (var t = 0; t < TICKS.length; t++) {
      var tx = (W - RP) * (t / (TICKS.length - 1));
      var anchor = t === 0 ? 'start' : (t === TICKS.length - 1 ? 'end' : 'middle');
      ticks += '<text class="tchart__axis" x="' + tx.toFixed(1) + '" y="' + (H - 4) + '" text-anchor="' + anchor + '">' + TICKS[t] + '</text>';
    }

    box.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '">' +
      '<defs><linearGradient id="pfade" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="rgba(16,240,95,0.18)"/><stop offset="100%" stop-color="rgba(16,240,95,0)"/>' +
      '</linearGradient></defs>' +
      '<path class="tchart__fill" d="' + area + '"/>' +
      '<line class="tchart__guide" x1="0" x2="' + (W - RP + 2) + '" y1="' + ly.toFixed(1) + '" y2="' + ly.toFixed(1) + '"/>' +
      '<path class="tchart__line" d="' + d + '"/>' +
      '<circle class="tchart__last" cx="' + lx.toFixed(1) + '" cy="' + ly.toFixed(1) + '" r="3.5"/>' +
      '<rect class="tchart__tagbox" x="' + (W - RP + 11) + '" y="' + (ly - 9).toFixed(1) + '" width="' + (RP - 13) + '" height="18" rx="3"/>' +
      '<text class="tchart__tag" x="' + (W - RP + 11 + (RP - 13) / 2) + '" y="' + (ly + 3.5).toFixed(1) + '" text-anchor="middle">' + price + '</text>' +
      ticks + '</svg>';
  }
  draw();
  var t2;
  window.addEventListener('resize', function () { clearTimeout(t2); t2 = setTimeout(draw, 120); });
})();

/* ── $PROPHET: Price / MCap toggle ────────────────────── */
(function () {
  var seg = document.querySelector('[data-mode]');
  if (!seg) return;
  seg.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-mode-opt]');
    if (!btn) return;
    var opts = seg.querySelectorAll('[data-mode-opt]');
    for (var i = 0; i < opts.length; i++) opts[i].classList.toggle('seg__opt--on', opts[i] === btn);
  });
})();

/* ── Circuit board around the prompt bar ──────────────── */
/* Desktop only (1024px+). Traces leave the bar's frame at 90 degrees,
   run straight, turn at right angles, and end in a small square pad.
   No diagonals, no curves, no trace touches another. Everything stays
   inside a ~250px band around the bar and fades to nothing at its edge.
   A trace that would cross text or a card is cut short before it.
   Light travels a trace from the bar to its pad, the pad fills, then
   drains — the same fill/drain language as the roadmap timeline. */
(function () {
  var canvas = document.querySelector('[data-board]');
  var bar = document.querySelector('.prompt-bar');
  if (!canvas || !bar || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');

  var GREEN = '16, 240, 95';
  var BAND    = 900;   /* far enough to climb the margins to the header */
  var REST    = 0;     /* invisible until a pulse runs over it */
  var PAD     = 6;     /* square pad, px */
  var SPEED   = 200;   /* px per second, as the roadmap streak */
  var STREAK  = 160;   /* as .timeline__light height */
  var FILL_MS = 400;   /* pad fill/drain, as the timeline dot */
  var FRAME   = 1000 / 60;   /* 60fps: at 200px/s, 30fps reads as steps */
  var CLEAR   = 20;    /* keep this far off any content, pad included */

  var IDLE_GAP = 3000, TYPING_GAP = 3000;   /* one steady beat, typing included */
  var MAX_LIVE = 1;    /* exactly one run on screen at a time */
  var MAX_LEN  = 430;  /* (430 + 160) / 200 = 2.95s, so it lands before the next beat */
  var IDLE_LEVEL = 0.72, TYPING_LEVEL = 0.85, SEND_LEVEL = 1;
  var PEAK = 0.62;     /* the roadmap streak peaks at 0.9; this is the same, dimmer */

  var wide    = window.matchMedia('(min-width: 1024px)');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  var traces = [], pulses = [], origin = { x: 0, y: 0 }, barBox = null, heroBox = null;
  var raf = null, lastFrame = 0, nextBeat = 0, typingUntil = 0, lastStart = null;

  function docRect(el) {
    var r = el.getBoundingClientRect();
    return { l: r.left + scrollX, t: r.top + scrollY, r: r.right + scrollX, b: r.bottom + scrollY };
  }
  function grow(r, n) { return { l: r.l - n, t: r.t - n, r: r.r + n, b: r.b + n }; }

  /* An element inside a scrolling box still reports its full rect even when
     it is scrolled out of sight. Clip to every clipping ancestor so only the
     part actually on screen counts as an obstacle. */
  function visibleRect(el) {
    var r = docRect(el), p = el.parentElement;
    while (p && p !== document.body) {
      var ov = getComputedStyle(p).overflow + getComputedStyle(p).overflowY + getComputedStyle(p).overflowX;
      if (/hidden|auto|scroll/.test(ov)) {
        var pr = docRect(p);
        r = { l: Math.max(r.l, pr.l), t: Math.max(r.t, pr.t), r: Math.min(r.r, pr.r), b: Math.min(r.b, pr.b) };
        if (r.r <= r.l || r.b <= r.t) return null;
      }
      p = p.parentElement;
    }
    return r;
  }

  /* Whole content regions are blocked, not just the text inside them, so a
     trace never threads between two lines of a list. Small text elements are
     added as well, to catch anything sitting on its own. */
  var BLOCKS = '.feed, .takes, .thesis, .carousel, .filters, .below, .site-header, .site-footer, .panel, .pgroup';

  function obstacles(band) {
    var out = [], i, j, seen = [];
    function push(el) {
      if (!el || el === bar || bar.contains(el) || el.contains(bar)) return;
      if (el.closest && el.closest('[data-walkthrough]')) return;
      if (seen.indexOf(el) >= 0) return;
      seen.push(el);
      var r = visibleRect(el);
      if (!r) return;
      if (r.r <= r.l || r.b <= r.t) return;
      if (r.r < band.l || r.l > band.r || r.b < band.t || r.t > band.b) return;
      out.push(grow(r, CLEAR));
    }
    var blocks = document.querySelectorAll(BLOCKS);
    for (i = 0; i < blocks.length; i++) push(blocks[i]);

    var all = document.body.querySelectorAll('*');
    for (i = 0; i < all.length; i++) {
      var el = all[i];
      if (el === canvas) continue;
      for (j = 0; j < el.childNodes.length; j++) {
        var n = el.childNodes[j];
        if (n.nodeType === 3 && n.nodeValue.trim()) { push(el); break; }
      }
    }
    return out;
  }

  /* How far a point sits outside the bar, used for the band fade */
  function outset(x, y) {
    var dx = Math.max(barBox.l - x, 0, x - barBox.r);
    var dy = Math.max(barBox.t - y, 0, y - barBox.b);
    return Math.max(dx, dy);
  }

  function hits(x1, y1, x2, y2, rects) {
    var lo = { x: Math.min(x1, x2), y: Math.min(y1, y2) };
    var hi = { x: Math.max(x1, x2), y: Math.max(y1, y2) };
    for (var i = 0; i < rects.length; i++) {
      var r = rects[i];
      if (hi.x >= r.l && lo.x <= r.r && hi.y >= r.t && lo.y <= r.b) return r;
    }
    return null;
  }

  /* Walk one axis-aligned run, stopping at the band edge or before content.
     Returns how far it got. */
  function runLength(x, y, dx, dy, want, rects) {
    var step = 4, gone = 0;
    while (gone < want) {
      var nx = x + dx * (gone + step), ny = y + dy * (gone + step);
      if (outset(nx, ny) > BAND) break;
      if (heroBox && (ny < heroBox.t || ny > heroBox.b || nx < heroBox.l || nx > heroBox.r)) break;
      if (hits(x + dx * gone, y + dy * gone, nx, ny, rects)) break;
      gone += step;
    }
    return gone;
  }

  /* Keep traces apart so they never read as a connected web */
  function tooClose(pts, others, gap) {
    for (var i = 0; i < pts.length - 1; i++) {
      for (var o = 0; o < others.length; o++) {
        var q = others[o].pts;
        for (var k = 0; k < q.length - 1; k++) {
          var ax = Math.min(pts[i].x, pts[i + 1].x) - gap, bx = Math.max(pts[i].x, pts[i + 1].x) + gap;
          var ay = Math.min(pts[i].y, pts[i + 1].y) - gap, by = Math.max(pts[i].y, pts[i + 1].y) + gap;
          var cx = Math.min(q[k].x, q[k + 1].x), dx2 = Math.max(q[k].x, q[k + 1].x);
          var cy = Math.min(q[k].y, q[k + 1].y), dy2 = Math.max(q[k].y, q[k + 1].y);
          if (bx >= cx && ax <= dx2 && by >= cy && ay <= dy2) return true;
        }
      }
    }
    return false;
  }

  function buildOnce() {
    var out = [];
    barBox = docRect(bar);
    var hero = bar.closest('.hero');
    heroBox = hero ? grow(docRect(hero), -CLEAR) : null;   /* the board lives in the hero only */
    var cards = document.querySelector('.carousel');       /* and never above the cards */
    if (cards && heroBox) heroBox.t = Math.max(heroBox.t, docRect(cards).t);
    var band = grow(barBox, BAND + 20);   /* origin is set by place(), not here */
    var rects = obstacles(band);
    /* After a trace has left the frame it must stay off it: without this a
       run can turn early and travel along the bar's own edge. */
    var away = rects.concat([grow(barBox, 18)]);

    /* exit points on the bar's frame, each leaving at 90 degrees */
    var starts = [], w = barBox.r - barBox.l, h = barBox.b - barBox.t, i;
    function rnd(a, b) { return a + Math.random() * (b - a); }
    /* How much room there is between the bar and the top of the cards, so
       climbs can be anything from a short rise to the full height. */
    var headroom = heroBox ? Math.max(80, barBox.t - heroBox.t - CLEAR) : 400;

    var across = 15;
    for (i = 0; i < across; i++) {
      var fx = barBox.l + w * (0.09 + 0.82 * (i + 0.5) / across);   /* never off a corner */
      starts.push({ x: fx, y: barBox.b, dx: 0, dy: 1, reach: rnd(34, 120) });
    }
    /* Side runs head out to the page gutter first, then climb: the gutters
       beside the content column are empty, so traces can travel the margins
       all the way up to the header. */
    for (i = 0; i < 9; i++) {
      var fy = barBox.t + h * (0.34 + 0.32 * (i + 0.5) / 9);          /* middle of the edge only */
      starts.push({ x: barBox.l, y: fy, dx: -1, dy: 0, reach: rnd(200, 370), up: i % 2 === 0, climb: headroom * rnd(0.22, 1) });
      starts.push({ x: barBox.r, y: fy, dx: 1, dy: 0, reach: rnd(200, 370), up: i % 2 === 1, climb: headroom * rnd(0.22, 1) });
    }
    /* shuffle, so the order traces are laid down (and so which ones survive
       the spacing check) differs on every build */
    for (i = starts.length - 1; i > 0; i--) {
      var sw = Math.floor(Math.random() * (i + 1)), tmp = starts[i];
      starts[i] = starts[sw]; starts[sw] = tmp;
    }

    for (i = 0; i < starts.length; i++) {
      var s = starts[i], pts = [{ x: s.x, y: s.y }];
      var x = s.x, y = s.y, dx = s.dx, dy = s.dy, ok = true, run = 0;
      /* Mostly three legs, sometimes two, occasionally four. Every leg is
         still 48px minimum, so extra legs read as corners, not wiggle. */
      var legs = 2 + (Math.random() < 0.6 ? 1 : 0) + (Math.random() < 0.28 ? 1 : 0);
      for (var leg = 0; leg < legs; leg++) {
        var want = leg === 0 ? s.reach : (s.climb && leg === 1 ? s.climb : rnd(55, 245));
        want = Math.min(want, MAX_LEN - run);         /* stay inside one beat */
        if (want < 48) break;
        var got = runLength(x, y, dx, dy, want, leg === 0 ? rects : away);
        /* 44px minimum: a shorter run would land as a stub turn right before
           the pad, which is the fidgety look. Ending here instead is cleaner. */
        if (got < 48) { if (leg === 0) ok = false; break; }
        x += dx * got; y += dy * got; run += got;
        pts.push({ x: x, y: y });
        if (leg < legs - 1) {                        /* right-angle turn only */
          var turn = Math.random() < 0.5 ? 1 : -1;
          if (leg === 0 && s.up !== undefined) turn = s.up ? -1 : 1;   /* send half the side runs upward */
          var ndx = dy * turn, ndy = -dx * turn;
          dx = ndx; dy = ndy;
        }
      }
      if (!ok || pts.length < 2) continue;
      if (tooClose(pts, out, 5)) continue;

      var len = 0, segs = [];
      for (var p = 0; p < pts.length - 1; p++) {
        var L = Math.abs(pts[p + 1].x - pts[p].x) + Math.abs(pts[p + 1].y - pts[p].y);
        segs.push({ a: pts[p], b: pts[p + 1], from: len, len: L });
        len += L;
      }
      out.push({ pts: pts, segs: segs, len: len, pad: pts[pts.length - 1], lit: 0 });
    }
    return out;
  }

  /* The spacing check and the random shuffle mean some layouts come out
     sparse. Try a few and keep the fullest. */
  function build() {
    var best = [];
    for (var a = 0; a < 8; a++) {
      var got = buildOnce();
      if (got.length > best.length) best = got;
      if (best.length >= 9) break;
    }
    traces = best;
  }

  function drawBox() {
    var band = grow(barBox, BAND + 20);
    if (heroBox) {
      band = { l: Math.max(band.l, heroBox.l - 4), t: Math.max(band.t, heroBox.t - 4),
               r: Math.min(band.r, heroBox.r + 4), b: Math.min(band.b, heroBox.b + 4) };
    }
    return band;
  }

  function place() {
    var band = drawBox();
    canvas.style.left = band.l + 'px';
    canvas.style.top = band.t + 'px';
    canvas.style.width = (band.r - band.l) + 'px';
    canvas.style.height = (band.b - band.t) + 'px';
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor((band.r - band.l) * dpr);
    canvas.height = Math.floor((band.b - band.t) * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    origin = { x: band.l, y: band.t };
  }

  /* No distance fade. Fading by distance dimmed the far end of a long run,
     so it looked like it petered out instead of landing on its pad. Every
     trace now reads at full strength and ends on a square. */
  function fade() { return 1; }
  function level(r, d) {
    var u = (r - d) / STREAK;
    return (u <= 0 || u >= 1) ? 0 : Math.sin(Math.PI * u);
  }
  function smooth(v) { return v * v * (3 - 2 * v); }

  function firePulse(strength, all) {
    if (!traces.length) return false;
    var picks = [];
    if (all) { for (var i = 0; i < traces.length; i++) picks.push(i); }
    else {
      if (pulses.length >= MAX_LIVE) return false;   /* let the board breathe */
      var live = [], z;
      for (z = 0; z < pulses.length; z++) live.push(pulses[z].i);
      var free = [];
      for (z = 0; z < traces.length; z++) if (live.indexOf(z) < 0) free.push(z);
      if (!free.length) return false;
      free.sort(function (a, b) { return (traces[a].used || 0) - (traces[b].used || 0); });
      /* Drop anything starting near the last one: two runs leaving the same
         side one after the other read as a chase and pull the eye. */
      var apart = free;
      if (lastStart) {
        apart = free.filter(function (k) {
          var p0 = traces[k].pts[0];
          return Math.abs(p0.x - lastStart.x) + Math.abs(p0.y - lastStart.y) > 260;
        });
        if (!apart.length) apart = free;
      }
      var pool = apart.slice(0, Math.max(1, Math.ceil(apart.length / 2)));   /* least recently used half */
      var pick = pool[Math.floor(Math.random() * pool.length)];
      traces[pick].used = performance.now();
      lastStart = traces[pick].pts[0];
      picks.push(pick);                               /* one at a time */
    }
    for (var p = 0; p < picks.length; p++) {
      pulses.push({ i: picks[p], start: performance.now(), level: strength });
    }
    /* The flash and the trace are one event: the bar beats, and something
       leaves it. Same beat whether or not you are typing. */
    bar.classList.add('prompt-bar--pulse');
    setTimeout(function () { bar.classList.remove('prompt-bar--pulse'); }, 900);
  }

  function strokeSeg(a, b, alpha, wideLine) {
    if (alpha <= 0.004) return;
    ctx.beginPath();
    ctx.moveTo(a.x - origin.x, a.y - origin.y);
    ctx.lineTo(b.x - origin.x, b.y - origin.y);
    ctx.strokeStyle = 'rgba(' + GREEN + ',' + alpha.toFixed(3) + ')';
    ctx.lineWidth = wideLine || 1;
    ctx.stroke();
  }

  function drawPad(t, lit) {
    var f = fade(t.pad.x, t.pad.y);
    if (f <= 0 || (lit <= 0.02 && REST <= 0)) return;
    var x = t.pad.x - origin.x - PAD / 2, y = t.pad.y - origin.y - PAD / 2;
    ctx.save();
    if (lit > 0.02) {
      ctx.shadowColor = 'rgba(' + GREEN + ', 0.5)';
      ctx.shadowBlur = 10;
      ctx.fillStyle = 'rgba(' + GREEN + ',' + (PEAK * lit * f).toFixed(3) + ')';
      ctx.fillRect(x, y, PAD, PAD);
    }
    ctx.strokeStyle = 'rgba(' + GREEN + ',' + ((REST + PEAK * 0.8 * lit) * f).toFixed(3) + ')';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, PAD - 1, PAD - 1);
    ctx.restore();
  }

  function paint(now, dt) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var i, s, t;

    /* Nothing is drawn at rest: a trace only exists while light is on it. */
    if (REST > 0) {
      for (i = 0; i < traces.length; i++) {
        t = traces[i];
        for (s = 0; s < t.segs.length; s++) {
          strokeSeg(t.segs[s].a, t.segs[s].b, REST * fade(t.segs[s].a.x, t.segs[s].a.y));
        }
      }
    }

    /* The streak: one stroke per segment with a gradient along it, so the
       light reads as continuous instead of stepped, plus a real blur for
       the roadmap's 0 0 10px glow. */
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (var p = pulses.length - 1; p >= 0; p--) {
      var pulse = pulses[p];
      t = traces[pulse.i];
      if (!t) { pulses.splice(p, 1); continue; }
      var r = (now - pulse.start) / 1000 * SPEED;
      if (r - STREAK > t.len + PAD) { pulses.splice(p, 1); continue; }

      for (s = 0; s < t.segs.length; s++) {
        var sg = t.segs[s];
        if (sg.from + sg.len < r - STREAK || sg.from > r) continue;
        var g = ctx.createLinearGradient(sg.a.x - origin.x, sg.a.y - origin.y,
                                         sg.b.x - origin.x, sg.b.y - origin.y);
        var any = false, STOPS = 10;
        for (var q = 0; q <= STOPS; q++) {
          var tt = q / STOPS;
          var lv = level(r, sg.from + sg.len * tt);
          var f = lv * pulse.level * fade(sg.a.x + (sg.b.x - sg.a.x) * tt,
                                          sg.a.y + (sg.b.y - sg.a.y) * tt);
          if (f > 0.01) any = true;
          g.addColorStop(tt, 'rgba(' + GREEN + ',' + (PEAK * f).toFixed(3) + ')');
        }
        if (!any) continue;
        ctx.shadowColor = 'rgba(' + GREEN + ', 0.5)';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = g;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(sg.a.x - origin.x, sg.a.y - origin.y);
        ctx.lineTo(sg.b.x - origin.x, sg.b.y - origin.y);
        ctx.stroke();
      }
    }
    ctx.restore();

    /* pads fill as the light arrives, then drain */
    var step = dt / FILL_MS;
    for (i = 0; i < traces.length; i++) {
      t = traces[i];
      var target = 0;
      for (p = 0; p < pulses.length; p++) {
        if (pulses[p].i !== i) continue;
        var pr = (now - pulses[p].start) / 1000 * SPEED;
        if (pr >= t.len - PAD / 2 + PAD * 0.1 && pr - STREAK <= t.len + PAD * 0.1) {
          if (pulses[p].level > target) target = pulses[p].level;
        }
      }
      if (t.lit < target) t.lit = Math.min(target, t.lit + step);
      else if (t.lit > target) t.lit = Math.max(target, t.lit - step);
      drawPad(t, smooth(t.lit));
    }
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    var dt = now - lastFrame;
    if (dt < FRAME) return;
    lastFrame = now;
    /* The bar can shift after first paint (fonts, images, late layout).
       Re-measure each frame and rebuild if it has actually moved. */
    var live = docRect(bar);
    if (Math.abs(live.t - barBox.t) > 2 || Math.abs(live.l - barBox.l) > 2 ||
        Math.abs(live.r - barBox.r) > 2 || Math.abs(live.b - barBox.b) > 2) {
      barBox = live; place(); build(); pulses = [];
      return;
    }
    /* A metronome on a fixed grid. It is never reset by a restart, a
       rebuild or a resize, which is what made the flashing irregular. */
    if (!nextBeat) nextBeat = now + IDLE_GAP;
    if (now >= nextBeat) {
      firePulse(IDLE_LEVEL, false);
      nextBeat += IDLE_GAP;
      if (nextBeat <= now) nextBeat = now + IDLE_GAP;   /* after a hidden tab */
    }
    paint(now, dt);
  }

  function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }
  function start() {
    if (raf || !wide.matches) return;
    lastFrame = 0;
    raf = requestAnimationFrame(frame);
  }
  function refresh() {
    stop();
    if (!wide.matches) { canvas.style.width = '0px'; canvas.style.height = '0px'; return; }
    barBox = docRect(bar);
    place();
    build();
    if (reduced.matches) { paint(performance.now(), 0); return; }   /* static board */
    start();
  }

  var input = document.querySelector('[data-prompt-input]');
  if (input) input.addEventListener('input', function () { typingUntil = performance.now() + 2500; });
  var send = document.querySelector('[data-prompt-send]');
  if (send) send.addEventListener('click', function () { firePulse(SEND_LEVEL, true); });

  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(refresh, 200); });
  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
  if (wide.addEventListener) wide.addEventListener('change', refresh); else wide.addListener(refresh);
  if (reduced.addEventListener) reduced.addEventListener('change', refresh);

  window.prophetBoard = {
    pulse: function (s) { firePulse(s || SEND_LEVEL, false); },
    all: function () { firePulse(SEND_LEVEL, true); },
    rest: function (v) { REST = v; return REST; },
    tune: function (o) {
      if (!o) return { speed: SPEED, streak: STREAK, gap: IDLE_GAP, live: MAX_LIVE, rest: REST };
      if (o.speed) SPEED = o.speed;
      if (o.streak) STREAK = o.streak;
      if (o.gap) IDLE_GAP = o.gap;
      if (o.live) MAX_LIVE = o.live;
      if (o.rest !== undefined) REST = o.rest;
      return { speed: SPEED, streak: STREAK, gap: IDLE_GAP, live: MAX_LIVE, rest: REST };
    },
    traces: function () { return traces.length; },
    live: function () { return pulses.length; }
  };

  /* The bar moves as web fonts load and the layout settles, so rebuild on
     every event that can shift it rather than trusting the first measurement. */
  var settle;
  function later() { clearTimeout(settle); settle = setTimeout(refresh, 120); }
  window.addEventListener('load', later);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(later);
  if (window.ResizeObserver) {
    /* Only the bar's own wrapper. Observing document.body meant resizing our
       canvas re-triggered a rebuild, in a loop. */
    var ro = new ResizeObserver(later);
    if (bar.parentElement) ro.observe(bar.parentElement);
  }
  later();
})();
