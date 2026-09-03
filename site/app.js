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

/* ── Contract address copy button ─────────────────────── */
/* Shows first 6 … last 6 of {{contract_address}}; click copies the full
   address and the pill reads "copied" for a moment. */
(function () {
  var btns = document.querySelectorAll('[data-ca-copy]');
  for (var i = 0; i < btns.length; i++) {
    (function (btn) {
      var ca = btn.getAttribute('data-ca') || '';
      var text = btn.querySelector('[data-ca-text]');
      /* Sample address for preview while {{contract_address}} is unfilled */
      if (!ca || (/^\{\{/).test(ca)) ca = '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr';
      text.textContent = ca.slice(0, 6) + '\u2026' + ca.slice(-6);
      btn.addEventListener('click', function () {
        var done = function () {
          var was = text.textContent;
          text.textContent = 'copied';
          btn.classList.add('site-header__ca--copied');
          setTimeout(function () {
            text.textContent = was;
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
      voteOpen.textContent = chosen ? 'Voted ' + chosen.toUpperCase() : 'Vote';
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
