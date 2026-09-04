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

/* ── Circuit board behind the prompt bar ──────────────── */
/* Desktop only (1024px+), home page only, decorative.
 * The rules this must satisfy are written down in BOARD-SPEC.md.
 *
 * Two structural choices keep it honest:
 *   - The beat is a plain setInterval that pushes exactly one run. There is
 *     no condition in it to fall through, so it cannot fire twice or skip.
 *   - A fresh route is generated on every flash, so nothing repeats.
 */
(function () {
  var canvas = document.querySelector('[data-board]');
  var bar = document.querySelector('.prompt-bar');
  if (!canvas || !bar || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');

  var GREEN  = '16, 240, 95';
  var BEAT   = 3000;   /* ms between flashes */
  var SPEED  = 200;    /* px/s, the roadmap's own speed */
  var STREAK = 160;    /* px, the roadmap streak length */
  var DRAIN  = 300;    /* ms for a pad to fade once the light has passed */
  var PADSZ  = 6;
  var PEAK   = 0.50;   /* the roadmap peaks at 0.9; this is dimmer */
  var MAX_LEN = 950;   /* long enough to climb to the cards; short enough that
                          no more than two are ever travelling at once */
  var CLEAR = 20, MIN_LEG = 48;

  var wide    = window.matchMedia('(min-width: 1024px)');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  var runs = [], rects = [], offBar = [], origin = { x: 0, y: 0 };
  var barBox = null, ceiling = 0, floorY = 0, leftX = 0, rightX = 0, headroom = 0;
  var colLeft = 0, colRight = 0;   /* the cards' edges: a climb lane sits outside these */
  var beatTimer = null, raf = null;

  function docRect(el) {
    var r = el.getBoundingClientRect();
    return { l: r.left + scrollX, t: r.top + scrollY, r: r.right + scrollX, b: r.bottom + scrollY };
  }
  function grow(r, n) { return { l: r.l - n, t: r.t - n, r: r.r + n, b: r.b + n }; }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  /* An element inside a scrolling box still reports its full rect when
     scrolled out of sight, so clip to every clipping ancestor. */
  function visibleRect(el) {
    var r = docRect(el), p = el.parentElement;
    while (p && p !== document.body) {
      var cs = getComputedStyle(p);
      if (/hidden|auto|scroll/.test(cs.overflow + cs.overflowX + cs.overflowY)) {
        var q = docRect(p);
        r = { l: Math.max(r.l, q.l), t: Math.max(r.t, q.t), r: Math.min(r.r, q.r), b: Math.min(r.b, q.b) };
        if (r.r <= r.l || r.b <= r.t) return null;
      }
      p = p.parentElement;
    }
    return r;
  }

  /* Whole content regions, not individual words, so a trace never threads
     between two lines of a list. */
  function obstacles() {
    var out = [], seen = [], i, k;
    function add(el) {
      if (!el || el === bar || bar.contains(el) || el.contains(bar) || seen.indexOf(el) >= 0) return;
      if (el.closest && el.closest('[data-walkthrough]')) return;
      seen.push(el);
      var r = visibleRect(el);
      if (r && r.r > r.l && r.b > r.t) out.push(grow(r, CLEAR));
    }
    var blocks = document.querySelectorAll('.feed, .takes, .thesis, .carousel__card, .carousel__arrow, .filters, .below, .site-header, .site-footer');
    for (i = 0; i < blocks.length; i++) add(blocks[i]);
    var all = document.body.querySelectorAll('*');
    for (i = 0; i < all.length; i++) {
      if (all[i] === canvas) continue;
      for (k = 0; k < all[i].childNodes.length; k++) {
        var n = all[i].childNodes[k];
        if (n.nodeType === 3 && n.nodeValue.trim()) { add(all[i]); break; }
      }
    }
    return out;
  }

  function hits(x1, y1, x2, y2, list) {
    var lx = Math.min(x1, x2), hx = Math.max(x1, x2);
    var ly = Math.min(y1, y2), hy = Math.max(y1, y2);
    for (var i = 0; i < list.length; i++) {
      var r = list[i];
      if (hx >= r.l && lx <= r.r && hy >= r.t && ly <= r.b) return true;
    }
    return false;
  }

  /* March one axis-aligned leg. Stops at the hero on all four sides, at the
     top of the cards, or before any content. Returns how far it got. */
  function march(x, y, dx, dy, want, list) {
    var step = 4, gone = 0;
    while (gone < want) {
      var nx = x + dx * (gone + step), ny = y + dy * (gone + step);
      if (ny < ceiling || ny > floorY || nx < leftX || nx > rightX) break;
      if (hits(x + dx * gone, y + dy * gone, nx, ny, list)) break;
      gone += step;
    }
    return gone;
  }

  /* One fresh route. Returns null if it could not be laid down.
     Two shapes: a short run off the bottom edge, or a climb that leaves a
     side edge, reaches the margin, then zigzags up in a column. */
  var recent = [];                                    /* last few sides used */

  function pickSide() {
    var opts = ['left', 'right', 'down'];
    /* Never the same side three times running: that is what made it look
       like five in a row down one margin. */
    if (recent.length >= 2 && recent[0] === recent[1]) {
      opts = opts.filter(function (s) { return s !== recent[0]; });
    }
    var w = { left: 0.36, right: 0.36, down: 0.28 }, total = 0, i;
    for (i = 0; i < opts.length; i++) total += w[opts[i]];
    var roll = Math.random() * total;
    for (i = 0; i < opts.length; i++) { roll -= w[opts[i]]; if (roll <= 0) break; }
    return opts[Math.min(i, opts.length - 1)];
  }

  function remember(side) {
    recent.unshift(side);
    if (recent.length > 3) recent.pop();
  }

  function finish(pts) {
    if (pts.length < 2) return null;
    var segs = [], len = 0;
    for (var p = 0; p < pts.length - 1; p++) {
      var L = Math.abs(pts[p + 1].x - pts[p].x) + Math.abs(pts[p + 1].y - pts[p].y);
      if (L < 1) continue;
      segs.push({ a: pts[p], b: pts[p + 1], from: len, len: L });
      len += L;
    }
    if (!segs.length || len < 90) return null;
    return { pts: pts, segs: segs, len: len, pad: pts[pts.length - 1] };
  }

  function makeRoute() {
    var w = barBox.r - barBox.l, h = barBox.b - barBox.t;
    var side = pickSide();
    var pts, x, y, got;

    if (side === 'down') {                            /* short run off the bottom */
      x = barBox.l + w * rnd(0.10, 0.90); y = barBox.b;
      pts = [{ x: x, y: y }];
      got = march(x, y, 0, 1, rnd(46, 120), rects);
      if (got < MIN_LEG) return null;
      y += got; pts.push({ x: x, y: y });
      var dir = Math.random() < 0.5 ? -1 : 1;
      got = march(x, y, dir, 0, rnd(70, 240), offBar);
      if (got >= MIN_LEG) { x += dir * got; pts.push({ x: x, y: y }); }
      if (Math.random() < 0.45) {
        got = march(x, y, 0, 1, rnd(50, 120), offBar);
        if (got >= MIN_LEG) { y += got; pts.push({ x: x, y: y }); }
      }
      var r1 = finish(pts);
      if (r1) remember(side);
      return r1;
    }

    /* A climb. Reach a column in the margin, clear of the cards but well
       inside the page, then zigzag up it. */
    var out = side === 'left' ? -1 : 1;
    var lane = side === 'left'
      ? rnd(colLeft - 46, colLeft - 8)                /* just inside the arrow */
      : rnd(colRight + 8, colRight + 46);
    x = side === 'left' ? barBox.l : barBox.r;
    y = barBox.t + h * rnd(0.34, 0.66);
    pts = [{ x: x, y: y }];

    got = march(x, y, out, 0, Math.abs(lane - x), rects);
    if (got < MIN_LEG) return null;
    x += out * got; y = y; pts.push({ x: x, y: y });

    /* zigzag: up a chunk, jog sideways, up again. Every vertical leg goes
       up, so the route can never work its way back toward the bar. */
    var target = headroom * rnd(0.26, 1.02);
    var climbed = 0, jog = Math.random() < 0.5 ? -1 : 1, steps = 0, detours = 0;
    while (climbed < target && steps < 9) {
      var wantUp = Math.min(rnd(90, 210), target - climbed);
      if (wantUp < MIN_LEG) break;
      got = march(x, y, 0, -1, wantUp, offBar);

      if (got < MIN_LEG) {                            /* something in the way */
        if (detours >= 2) break;
        var away = march(x, y, out, 0, rnd(56, 96), offBar);   /* step outward */
        if (away < MIN_LEG) break;
        x += out * away; pts.push({ x: x, y: y });
        detours++; steps++;
        continue;                                     /* and try climbing again */
      }

      y -= got; climbed += got; pts.push({ x: x, y: y });
      steps++;
      if (climbed >= target - MIN_LEG) break;
      var wantJog = rnd(MIN_LEG, 92);
      got = march(x, y, jog, 0, wantJog, offBar);
      if (got < MIN_LEG) { jog = -jog; got = march(x, y, jog, 0, wantJog, offBar); }
      if (got < MIN_LEG) break;
      x += jog * got; pts.push({ x: x, y: y });
      jog = -jog;                                     /* zigzag, not a drift */
      steps++;
    }
    var r2 = finish(pts);
    if (r2) remember(side);
    return r2;
  }

  function measure() {
    barBox = docRect(bar);
    var hero = bar.closest('.hero');
    var hb = hero ? grow(docRect(hero), -CLEAR) : null;
    var cards = document.querySelector('.carousel');
    ceiling = cards ? docRect(cards).t : (hb ? hb.t : 0);   /* never above the cards */
    floorY  = hb ? hb.b : barBox.b + 400;
    /* The lane sits just inside the carousel's own outer edge, which is where
       its arrows are. Cards and arrows are separate obstacles, so a route can
       use the gutter between them and step around an arrow. */
    var cr = cards ? docRect(cards) : null;
    colLeft  = cr ? cr.l + 40 : (hb ? hb.l : 0);
    colRight = cr ? cr.r - 40 : (hb ? hb.r : 0);
    /* Stay off the page corners: the lane sits just outside the cards, not
       out at the viewport edge. */
    leftX   = Math.max(hb ? hb.l : 0, colLeft - 96);   /* room to step around an arrow */
    rightX  = Math.min(hb ? hb.r : 1e9, colRight + 96);
    headroom = Math.max(120, barBox.t - ceiling);

    rects = obstacles();
    offBar = rects.concat([grow(barBox, 18)]);   /* nothing runs along the frame */

    var box = { l: leftX - 12, t: ceiling - 12, r: rightX + 12, b: floorY + 12 };
    canvas.style.left = box.l + 'px';
    canvas.style.top = box.t + 'px';
    canvas.style.width = (box.r - box.l) + 'px';
    canvas.style.height = (box.b - box.t) + 'px';
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round((box.r - box.l) * dpr);
    canvas.height = Math.round((box.b - box.t) * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    origin = { x: box.l, y: box.t };
  }

  /* ── the beat: one tick, one flash, one run ── */
  function beat() {
    var route = null;
    for (var i = 0; i < 40 && !route; i++) route = makeRoute();
    if (!route) return;
    runs.push({ t: route, start: performance.now() });
    bar.classList.add('prompt-bar--pulse');
    setTimeout(function () { bar.classList.remove('prompt-bar--pulse'); }, 900);
  }

  function profile(r, d) {                              /* transparent → green → transparent */
    var u = (r - d) / STREAK;
    return (u <= 0 || u >= 1) ? 0 : Math.sin(Math.PI * u);
  }

  function padLevel(r, len) {
    var lands = len - PADSZ / 2 + PADSZ * 0.1;          /* leading edge ~10% in */
    var leaves = len + PADSZ * 0.1 + STREAK;            /* trailing edge ~10% past */
    if (r < lands) return 0;
    if (r <= leaves) return Math.min(1, (r - lands) / (SPEED * 0.15));
    var v = 1 - (r - leaves) / (SPEED * DRAIN / 1000);
    return v > 0 ? v : 0;
  }

  function draw(now) {
    raf = requestAnimationFrame(draw);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (var n = runs.length - 1; n >= 0; n--) {
      var t = runs[n].t;
      var r = (now - runs[n].start) / 1000 * SPEED;
      if (r > t.len + STREAK + SPEED * DRAIN / 1000 + 10) { runs.splice(n, 1); continue; }

      for (var s = 0; s < t.segs.length; s++) {
        var sg = t.segs[s];
        if (sg.from + sg.len < r - STREAK || sg.from > r) continue;
        var g = ctx.createLinearGradient(sg.a.x - origin.x, sg.a.y - origin.y,
                                         sg.b.x - origin.x, sg.b.y - origin.y);
        var gGlow = ctx.createLinearGradient(sg.a.x - origin.x, sg.a.y - origin.y,
                                             sg.b.x - origin.x, sg.b.y - origin.y);
        var any = false;
        for (var k = 0; k <= 8; k++) {
          var lv = profile(r, sg.from + sg.len * (k / 8));
          if (lv > 0.01) any = true;
          g.addColorStop(k / 8, 'rgba(' + GREEN + ',' + (PEAK * lv).toFixed(3) + ')');
          gGlow.addColorStop(k / 8, 'rgba(' + GREEN + ',' + (PEAK * lv * 0.16).toFixed(3) + ')');
        }
        if (!any) continue;
        /* Glow as a wide faint stroke under a thin bright one. A canvas
           shadowBlur here costs several ms a frame and was the lag. */
        ctx.beginPath();
        ctx.moveTo(sg.a.x - origin.x, sg.a.y - origin.y);
        ctx.lineTo(sg.b.x - origin.x, sg.b.y - origin.y);
        ctx.strokeStyle = gGlow;
        ctx.lineWidth = 9;
        ctx.stroke();
        ctx.strokeStyle = g;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      var lit = padLevel(r, t.len);
      if (lit > 0.01) {
        var e = lit * lit * (3 - 2 * lit);
        var px = t.pad.x - origin.x - PADSZ / 2, py = t.pad.y - origin.y - PADSZ / 2;
        ctx.fillStyle = 'rgba(' + GREEN + ',' + (PEAK * e * 0.18).toFixed(3) + ')';
        ctx.fillRect(px - 4, py - 4, PADSZ + 8, PADSZ + 8);
        ctx.fillStyle = 'rgba(' + GREEN + ',' + (PEAK * e).toFixed(3) + ')';
        ctx.fillRect(px, py, PADSZ, PADSZ);
        ctx.strokeStyle = 'rgba(' + GREEN + ',' + (PEAK * 0.9 * e).toFixed(3) + ')';
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 0.5, py + 0.5, PADSZ - 1, PADSZ - 1);
      }
    }
    ctx.restore();
  }

  function stop() {
    if (beatTimer) { clearInterval(beatTimer); beatTimer = null; }
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    runs = [];
  }

  function startUp() {
    stop();
    if (!wide.matches || reduced.matches) { canvas.style.width = '0px'; canvas.style.height = '0px'; return; }
    measure();
    beatTimer = setInterval(beat, BEAT);   /* only the timer fires beats */
    raf = requestAnimationFrame(draw);
  }

  var settle;
  function later() { clearTimeout(settle); settle = setTimeout(startUp, 150); }

  window.addEventListener('resize', later);
  window.addEventListener('load', later);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(later);
  if (wide.addEventListener) wide.addEventListener('change', later);
  if (reduced.addEventListener) reduced.addEventListener('change', later);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else later();
  });

  window.prophetBoard = {
    route: makeRoute,
    live: function () { return runs.length; },
    set: function (o) {
      if (o && o.beat) BEAT = o.beat;
      if (o && o.speed) SPEED = o.speed;
      if (o && o.peak) PEAK = o.peak;
      if (o && o.maxLen) MAX_LEN = o.maxLen;
      later();
      return { beat: BEAT, speed: SPEED, peak: PEAK, maxLen: MAX_LEN };
    }
  };

  later();
})();
