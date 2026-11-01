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

/* ── Walkthrough modals ───────────────────────────────── */
/* One shell, two instances. Onboarding ([data-onboarding]) opens once per device
   (localStorage) on a first visit. How it works ([data-hiw]) opens from any
   [data-hiw-open] link, every time. Slides: Next / Back / Get Started, dots,
   swipe, arrow keys. Closes on the X, Escape, or the backdrop. Body scroll locked. */
function walkthrough(root, opts) {
  if (!root) return null;
  var KEY = opts.key || null;
  var slides = root.querySelectorAll('[data-onboarding-slide]');
  var dots = root.querySelectorAll('[data-onboarding-dot]');
  var next = root.querySelector('[data-onboarding-next]');
  var back = root.querySelector('[data-onboarding-back]');
  var panel = root.querySelector('[data-onboarding-panel]');
  var closeBtn = root.querySelector('.onb__close');
  var at = 0, lastFocus = null, sx = null;

  function show(i) {
    at = Math.max(0, Math.min(i, slides.length - 1));
    for (var k = 0; k < slides.length; k++) {
      slides[k].hidden = k !== at;
      var v = slides[k].querySelector('video');
      if (v) { if (k === at) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else { v.pause(); } }
      if (dots[k]) dots[k].classList.toggle('onb__dot--on', k === at);
    }
    back.classList.toggle('is-off', at === 0);
    next.textContent = at === slides.length - 1 ? 'Get Started' : 'Next';
  }
  function open() {
    lastFocus = document.activeElement;
    root.hidden = false;
    document.documentElement.classList.add('onb-lock');
    var menu = document.querySelector('[data-menu-panel]'), mb = document.querySelector('[data-menu-toggle]');
    if (menu) menu.classList.remove('open');
    if (mb) mb.setAttribute('aria-expanded', 'false');
    show(0);
    if (closeBtn) closeBtn.focus();
  }
  function close() {
    root.hidden = true;
    document.documentElement.classList.remove('onb-lock');
    for (var k = 0; k < slides.length; k++) { var v = slides[k].querySelector('video'); if (v) v.pause(); }
    if (KEY) { try { localStorage.setItem(KEY, '1'); } catch (e) {} }
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  root.addEventListener('click', function (e) {
    if (e.target.closest('[data-onboarding-close]')) { close(); return; }
    if (e.target.closest('[data-onboarding-next]')) { if (at === slides.length - 1) close(); else show(at + 1); return; }
    if (e.target.closest('[data-onboarding-back]')) { show(at - 1); return; }
    var d = e.target.closest('[data-onboarding-dot]');
    if (d) show(parseInt(d.dataset.onboardingDot, 10));
  });
  document.addEventListener('keydown', function (e) {
    if (root.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); show(at + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); show(at - 1); }
  }, true);
  panel.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  panel.addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 40) show(at + (dx < 0 ? 1 : -1));
  });
  var openers = opts.openers ? document.querySelectorAll(opts.openers) : [];
  for (var i = 0; i < openers.length; i++) {
    openers[i].addEventListener('click', function (e) { e.preventDefault(); open(); });
  }
  if (KEY) {
    var seen = false;
    try { seen = localStorage.getItem(KEY) === '1'; } catch (e) {}
    if (!seen) open();
  }
  return { open: open, close: close, show: show };
}
window.prophetOnboarding = walkthrough(document.querySelector('[data-onboarding]'), { key: 'prophet.onboarded', openers: '[data-onboarding-open]' });
window.prophetHowItWorks = walkthrough(document.querySelector('[data-hiw]'), { openers: '[data-hiw-open]' });

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
  var thesisBox = document.querySelector('[data-thesis-box]');
  var thesisText = document.querySelector('[data-thesis-text]');
  var thesisLabel = document.querySelector('[data-thesis-label]');
  var thesisOutcome = document.querySelector('[data-thesis-outcome]');
  var thesisRevised = document.querySelector('[data-thesis-revised]'), thesisSplit = document.querySelector('[data-thesis-split]'), adWrap = document.querySelector('[data-ad]');
  var taps = {};   /* call -> 'agree' | 'disagree' (mock, in-memory; the server keeps the real side) */
  function tapKey(card) { return card.dataset.slug + ':' + (card.dataset.side || ''); }   /* a change of side is a new call, so an earlier tap does not carry over */
  var VOID_LINE = 'Market closed by Polymarket before resolution.';
  function labelHTML(key) { return key === 'buy_yes' ? '<span class="lbl lbl--yes">Buy YES</span>' : key === 'buy_no' ? '<span class="lbl lbl--no">Buy NO</span>' : key === 'hold' ? '<span class="lbl lbl--hold">Hold</span>' : ''; }
  function cardLabel(card) { var l = card.dataset.label; if (l && l !== 'none') return l; var st = (card.dataset.side || '').toLowerCase(); return (card.dataset.state !== 'none' && st) ? 'buy_' + st : 'none'; }
  var prevBtn = document.querySelector('[data-carousel-prev]');
  var nextBtn = document.querySelector('[data-carousel-next]');
  var activeIndex = -1;

  function isDesktop() { return window.matchMedia('(min-width: 768px)').matches; }
  function visibleCards() {
    return cards.filter(function (c) { return !c.classList.contains('is-hidden'); });
  }

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
    renderThesis(cards[index]);
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
    if (document.querySelector('[data-modal]:not([hidden]), [data-onboarding]:not([hidden]), [data-hiw]:not([hidden])')) return;   /* an open modal owns the keys */
    /* Tab cycles the two tabs: All → History → …; Shift+Tab goes back */
    if (e.key === 'Tab') {
      e.preventDefault();
      var order = ['called', 'resolved'];
      var at = order.indexOf(activeFilter);
      applyFilter(order[(at + (e.shiftKey ? -1 : 1) + order.length) % order.length]);
      return;
    }
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
      cards[k].classList.toggle('is-hidden', state ? cards[k].dataset.state !== state : cards[k].dataset.state === 'resolved');
    }
    track.scrollTo({ left: 0 });
    var v = visibleCards();
    var empty = document.querySelector('[data-deck-empty]');
    if (empty) empty.hidden = v.length > 0;
    if (thesisBox) thesisBox.hidden = v.length === 0;
    if (v.length) setActiveCard(cards.indexOf(v[0]));
  }
  if (filterBar) {
    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-filter]');
      if (!btn) return;
      applyFilter(btn.dataset.filter);   /* two tabs, one always on */
    });
  }

  /* ── Card faces ── painted once: the conviction stars beside the call (hidden only when show_conviction is "false") */
  var deckRoot = track.closest('[data-carousel]');
  var showConviction = !deckRoot || deckRoot.getAttribute('data-show-conviction') !== 'false';
  function paintFace(card) {
    var cv = card.querySelector('[data-conviction-row]');
    if (!cv) return;
    var c = parseInt(card.dataset.conviction || '0', 10) || 0;
    cv.hidden = !(showConviction && c > 0);
    cv.className = 'carousel__conv carousel__conv--' + ((card.dataset.side || 'yes').toLowerCase());   /* stars in the call's colour */
    if (!cv.hidden) { var h = ''; for (var s = 1; s <= 5; s++) h += '<span class="carousel__star' + (s <= c ? ' carousel__star--on' : '') + '">' + STAR_SVG + '</span>'; cv.innerHTML = h; }
  }

  /* ── Thesis block (live / resolved markets) ── */
  var STAR_SVG = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z"/></svg>';
  for (var pf = 0; pf < cards.length; pf++) paintFace(cards[pf]);
  function renderThesis(card) {
    if (!thesisBox) return;
    var state = card.dataset.state || 'called';
    var history = state === 'resolved';
    thesisBox.hidden = false;
    thesisLabel.textContent = 'Thesis';
    /* the purple marker by state: called / revised / changed → the time line; pending → "Pending"; resolved → "Resolved {ago}" */
    var kind = card.dataset.callKind || '', cs0 = card.dataset.callState || '', tl = '';
    if (kind === 'pending' || (history && cs0 === 'closed')) tl = 'Pending';
    else if (kind === 'resolved' || history) tl = (cs0 === 'void') ? '' : 'Resolved' + (card.dataset.resolvedAgo ? ' ' + card.dataset.resolvedAgo : '');
    else tl = card.dataset.timeLine || '';
    if (thesisRevised) thesisRevised.textContent = tl ? tl.charAt(0).toUpperCase() + tl.slice(1) : '';
    thesisText.textContent = card.dataset.thesis || '';
    /* History: how it played out */
    if (thesisOutcome) {
      var cs = card.dataset.callState || '', rs = (card.dataset.resolvedSide || '').toLowerCase();
      thesisOutcome.hidden = !history;
      if (history) {
        if (cs === 'void') thesisOutcome.hidden = true;   /* the void line sits under Resolution */
        else if (cs === 'closed' || card.dataset.outcome === 'pending' || card.dataset.outcome === 'awaiting') thesisOutcome.hidden = true;   /* pending: the marker says Pending; nothing top right */
        else thesisOutcome.innerHTML = 'Resolved <span class="tally tally--' + rs + '">' + rs.toUpperCase() + '</span> · ' + (card.dataset.outcome === 'right' ? '<span class="lbl lbl--yes">right</span>' : '<span class="lbl lbl--no">wrong</span>');   /* no time here: the purple marker already reads Resolved {ago} */
      }
    }
    /* Resolution section: the server's plain-fact line for every state, plus his outcome note on a resolved call */
    var factEl = document.querySelector('[data-thesis-fact]'), noteEl = document.querySelector('[data-thesis-note]');
    if (factEl && noteEl) {
      var cs1 = card.dataset.callState || '';
      var fact = card.dataset.resolutionText || '';
      if ((/^\{\{/).test(fact)) fact = '';
      if (!fact && history && cs1 === 'void') fact = VOID_LINE;
      if (history && cs1 === 'resolved') fact = '';   /* resolved: only his resolution copy; the marker already carries Resolved {ago} */
      var note = (history && cs1 === 'resolved') ? (card.dataset.outcomeNote || '') : '';
      if ((/^\{\{/).test(note)) note = '';
      factEl.textContent = fact; factEl.hidden = !fact;
      noteEl.textContent = note; noteEl.hidden = !note;
      hasMore = !!(fact || note);
    }
    /* the drop-down starts closed on every card; the chevron shows only when there is something under it */
    setMore(false);
    paintAgree(card);
  }
  /* ── Thesis box drop-down: one chevron in the header shows or hides Resolution under the thesis ── */
  var hasMore = false;
  function setMore(open) {
    var more = document.querySelector('[data-tsec-more]'), head = document.querySelector('[data-tsec-toggle]');
    if (!more || !head) return;
    open = open && hasMore;
    more.hidden = !open; head.setAttribute('aria-expanded', open ? 'true' : 'false');
    thesisBox.classList.toggle('thesis--more', open); thesisBox.classList.toggle('thesis--nomore', !hasMore);
  }
  if (thesisBox) thesisBox.addEventListener('click', function (e) {
    var head = e.target.closest('[data-tsec-toggle]'); if (!head || !hasMore) return;
    setMore(head.getAttribute('aria-expanded') !== 'true');
  });
  /* ── Agree / Disagree ── */
  function paintAgree(card) {
    if (!adWrap) return;
    var live = (card.dataset.state || '') === 'called';
    adWrap.hidden = !live; if (thesisSplit) thesisSplit.hidden = true;
    if (!live) return;
    var slug = tapKey(card), side = taps.hasOwnProperty(slug) ? taps[slug] : (card.dataset.userSide || '');
    var closed = card.dataset.marketClosed === 'true';
    var btns = adWrap.querySelectorAll('[data-ad-btn]');
    for (var i = 0; i < btns.length; i++) { btns[i].classList.toggle('ad__btn--on', btns[i].dataset.adBtn === side); btns[i].classList.toggle('ad__btn--off', !!side && btns[i].dataset.adBtn !== side); btns[i].disabled = closed; }
    var cl = adWrap.querySelector('[data-ad-closed]'); if (cl) cl.hidden = !closed;
    var n = parseInt(card.dataset.tapCount || '0', 10) || 0, pct = card.dataset.agreePct || '';
    if (thesisSplit) {
      if (n >= 3 && pct) { thesisSplit.textContent = pct + '% agree · ' + n + ' tap' + (n === 1 ? '' : 's'); thesisSplit.hidden = false; }
      else if (side) { thesisSplit.textContent = 'You ' + side; thesisSplit.hidden = false; }
    }
  }
  if (adWrap) {
    adWrap.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ad-btn]'); if (!b || activeIndex < 0 || b.disabled) return;
      var card = cards[activeIndex];
      var signedIn = (thesisBox.getAttribute('data-signed-in') || '');
      if (signedIn === 'false') { document.dispatchEvent(new CustomEvent('prophet:signin', { detail: { then: 'agree', slug: card.dataset.slug } })); return; }
      var slug = tapKey(card), prev = taps.hasOwnProperty(slug) ? taps[slug] : (card.dataset.userSide || '');
      if (prev) { openAlready(prev); return; }   /* a tap is final: either button now says so */
      taps[slug] = b.dataset.adBtn;   /* the split is the server's figure and does not move on a tap */
      paintAgree(card);
      confirmTap(card, b.dataset.adBtn);   /* the Tap Confirmed modal */
    });
  }


  /* ── Tap Confirmed modal ── */
  var tapModal = document.querySelector('[data-tap-modal]');
  var COPY = {
    agree: "You're calling him {verdict}. {label} at {price}. Let's see if you're both right.",
    disagree: "You're calling him {verdict}. {label} at {price}, you say that's {verdict}.",
    scoring: "Scored when the market resolves. Right or wrong, it's on your record and you'll earn XP."
  };
  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  /* {label} → Buy YES / Buy NO in its colour; {verdict} → right (green) / wrong (red); {price} → the odds at the call */
  function fillLine(line, card, side) {
    var st = (card.dataset.side || 'yes').toLowerCase();
    var at = card.dataset.calledPct || '';
    var label = '<span class="lbl lbl--' + st + ' tc__word">Buy ' + st.toUpperCase() + '</span>';
    var verdict = side === 'agree' ? 'right' : 'wrong';   /* plain, not coloured */
    return esc(line).replace(/\{label\}/g, label).replace(/\{verdict\}/g, verdict).replace(/\{price\}/g, esc(at.replace('%', '')));
  }
  function confirmTap(card, side) {
    if (!tapModal) return;
    var chip = q(tapModal, '[data-tc-chip]');
    chip.textContent = side === 'agree' ? 'Agree' : 'Disagree';
    chip.className = 'ad__btn tc__chip ad__btn--' + side + ' ad__btn--on';
    q(tapModal, '[data-tc-confirm]').innerHTML = fillLine(val(tapModal, side === 'agree' ? 'confirm-agree' : 'confirm-disagree', COPY[side]), card, side);
    q(tapModal, '[data-tc-scoring]').textContent = val(tapModal, 'scoring-line', COPY.scoring);
    var v = visibleCards(), last = v.length && v[v.length - 1] === card;
    q(tapModal, '[data-tc-next]').textContent = last ? 'Back to top' : 'Next call';
    openModal(tapModal);
  }
  if (tapModal) {
    q(tapModal, '[data-tc-next]').addEventListener('click', function () {
      closeModal(tapModal);
      var v = visibleCards(); if (!v.length || activeIndex < 0) return;
      var at = v.indexOf(cards[activeIndex]);
      var nxt = v[(at + 1) % v.length];
      select(cards.indexOf(nxt));
    });
    /* swipe down to dismiss (phones) */
    var panel = q(tapModal, '[data-tap-panel]'), y0 = null;
    panel.addEventListener('touchstart', function (e) { y0 = e.touches[0].clientY; panel.classList.add('is-dragging'); }, { passive: true });
    panel.addEventListener('touchmove', function (e) { if (y0 === null) return; var dy = e.touches[0].clientY - y0; if (dy > 0) panel.style.transform = 'translateY(' + dy + 'px)'; }, { passive: true });
    panel.addEventListener('touchend', function (e) {
      var dy = e.changedTouches[0].clientY - (y0 || 0); y0 = null; panel.classList.remove('is-dragging'); panel.style.transform = '';
      if (dy > 80) closeModal(tapModal);
    });
  }
  /* After sign-in the server lands the tap and shows the confirmation: window.prophetTap.land(slug, 'agree' | 'disagree') */
  window.prophetTap = { land: function (slug, side) { for (var i = 0; i < cards.length; i++) if (cards[i].dataset.slug === slug) { taps[tapKey(cards[i])] = side; paintAgree(cards[i]); confirmTap(cards[i], side); return; } } };

  /* ── Modals: Vote, Take sent ──────────────────────────── */
  /* Shared: close on X, Escape or the backdrop; body scroll locked while open. */
  function anyModalOpen() { return !!document.querySelector('[data-modal]:not([hidden]), [data-onboarding]:not([hidden]), [data-hiw]:not([hidden])'); }
  function openModal(m) { m.hidden = false; document.documentElement.classList.add('onb-lock'); var c = m.querySelector('.mdl__close'); if (c) c.focus(); }
  function closeModal(m) { m.hidden = true; if (!anyModalOpen()) document.documentElement.classList.remove('onb-lock'); }
  var modals = document.querySelectorAll('[data-modal]');
  for (var mi = 0; mi < modals.length; mi++) {
    (function (m) { m.addEventListener('click', function (e) { if (e.target.closest('[data-modal-close]')) closeModal(m); }); })(modals[mi]);
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var open = document.querySelector('[data-modal]:not([hidden])');
    if (open) { e.preventDefault(); closeModal(open); }
  }, true);

  /* A data-* value that is still an unfilled {{variable}} falls back to the mock. */
  function val(el, key, fallback) { var v = el ? (el.getAttribute('data-' + key) || '') : ''; return (!v || (/^\{\{/).test(v)) ? fallback : v; }
  function num(s) { return parseInt(String(s).replace(/[^0-9]/g, ''), 10) || 0; }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function q(root, sel) { return root.querySelector(sel); }

  /* ── Prompt bar notices ── */
  function notice(name) { return document.querySelector('[data-notice="' + name + '"]'); }
  window.prophetNotices = { open: function (name) { openNotice(name); } };
  /* Log out: the real link is {{logout_url}}; while it is unfilled, the click fires prophet:logout and shows the notice */
  var logouts = document.querySelectorAll('[data-logout]');
  for (var li = 0; li < logouts.length; li++) {
    logouts[li].addEventListener('click', function (e) {
      if ((/^\{\{/).test(this.getAttribute('href') || '')) {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('prophet:logout'));
        var menu = document.querySelector('[data-menu-panel]'); if (menu) menu.classList.remove('open');
        openNotice('logged-out');
      }
    });
  }
  /* Already tapped: "You agreed already." / "You disagreed already." (config strings on the notice root) */
  function openAlready(side) {
    var n = notice('already'); if (!n) return;
    q(n, '[data-already-line]').textContent = side === 'agree' ? val(n, 'already-agree', 'You agreed already.') : val(n, 'already-disagree', 'You disagreed already.');
    openModal(n);
  }
  function openNotice(name) {
    var n = notice(name); if (!n) return;
    openModal(n);
  }

  applyFilter('called');   /* Calls by default; History is the other tab */
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
      panel.classList.toggle('is-filtered', !!active);
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

/* ── Circuit board around the thesis block ────────────── */
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
  var bar = document.querySelector('[data-thesis-box]');   /* the board now sits around the thesis block, where the buttons live */
  if (!canvas || !bar || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');

  var GREEN  = '16, 240, 95';
  var BEAT   = 2600;   /* ms between flashes */
  var SPEED  = 200;    /* px/s, the roadmap's own speed */
  var STREAK = 160;    /* px, the roadmap streak length */
  var DRAIN  = 300;    /* ms for a pad to fade once the light has passed */
  var PADSZ  = 6;
  var PEAK   = 0.50;   /* the roadmap peaks at 0.9; this is dimmer */
  var MAX_LEN = 950;   /* long enough to climb to the cards; short enough that
                          no more than two are ever travelling at once */
  var CLEAR = 20, CARD_CLEAR = 8, MIN_LEG = 48;
  /* The channel between the carousel's arrow and its cards is only about
     30px wide. A climb has to zigzag inside it without going past the arrow,
     so its sideways steps are allowed to be shorter than a normal leg. */
  var MIN_JOG = 20;
  var MAX_LEG = 420;   /* no single straight run longer than this: a long route
                          has to be made of several legs, not one missile */

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
      if (el.closest && el.closest('[data-onboarding]')) return;
      seen.push(el);
      var r = visibleRect(el);
      /* The cards sit right against the side channels, so their clearance is
         what sets the channel's width. Tighter here buys climbing room; every
         other block keeps the full margin. */
      var pad = el.classList && el.classList.contains('carousel__card') ? CARD_CLEAR : CLEAR;
      if (r && r.r > r.l && r.b > r.t) out.push(grow(r, pad));
    }
    var blocks = document.querySelectorAll('.feed, .thesis, .carousel__card, .carousel__arrow, .filters, .below, .site-header, .site-footer');
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

  /* ══ Route planner ══════════════════════════════════════
     Owns route shape and variety, and nothing else. The rest of the board
     just asks it for a route and draws it.

       P1  No doubling back. Each axis moves one way only: a route picks one
           horizontal direction and one vertical direction and never reverses
           either. Doubling back is impossible by construction, not by check.
       P2  Length is chosen first, from weighted classes, so runs are not all
           long. Short and mid runs are the common case.
       P3  Five families of shape, so routes are not all the same gesture.
       P4  Never the same side of the bar three times running, and left and
           right are equally weighted.
       P5  Nothing goes past the carousel's arrows.
     ═══════════════════════════════════════════════════════ */

  var recent = [];                                    /* sides of recent routes */

  function pickWeighted(items) {
    var total = 0, i;
    for (i = 0; i < items.length; i++) total += items[i].w;
    var roll = Math.random() * total;
    for (i = 0; i < items.length; i++) { roll -= items[i].w; if (roll <= 0) return items[i]; }
    return items[items.length - 1];
  }

  function pickSide() {
    var opts = [{ k: 'left', w: 0.34 }, { k: 'right', w: 0.34 }, { k: 'down', w: 0.32 }];
    if (recent.length >= 2 && recent[0] === recent[1]) {
      opts = opts.filter(function (o) { return o.k !== recent[0]; });
    }
    return pickWeighted(opts).k;
  }

  function remember(side) {
    recent.unshift(side);
    if (recent.length > 3) recent.pop();
  }

  function finish(pts, side) {
    if (pts.length < 2) return null;
    var segs = [], len = 0;
    for (var p = 0; p < pts.length - 1; p++) {
      var L = Math.abs(pts[p + 1].x - pts[p].x) + Math.abs(pts[p + 1].y - pts[p].y);
      if (L < 1) continue;
      segs.push({ a: pts[p], b: pts[p + 1], from: len, len: L });
      len += L;
    }
    if (!segs.length || len < 80) return null;
    remember(side);
    return { pts: pts, segs: segs, len: len, pad: pts[pts.length - 1] };
  }

  /* A walker that can only ever move in its two chosen directions (P1). */
  function walker(x, y, hDir, vDir, list) {
    var pts = [{ x: x, y: y }];
    return {
      x: function () { return x; },
      y: function () { return y; },
      go: function (axis, want) {                     /* 'h' or 'v' */
        want = Math.min(want, MAX_LEG);
        var dx = axis === 'h' ? hDir : 0, dy = axis === 'v' ? vDir : 0;
        var got = march(x, y, dx, dy, want, list);
        if (got < MIN_JOG) return 0;
        x += dx * got; y += dy * got;
        pts.push({ x: x, y: y });
        return got;
      },
      pts: function () { return pts; }
    };
  }

  /* A blocked leg used to end the route outright, so a run that hit the floor
     or the margin stopped with most of its length unspent — that, not the
     weighting, is why long routes were rare. Now a blocked axis falls back to
     the other one and keeps going; the resulting straight run is capped so it
     never reads as one endless line. */
  var STRAIGHT_CAP = 560;
  function wander(w, ax, budget, used, hcap, vcap, maxLegs) {
    var legs = 1, straight = 0, last = null, got, want;
    while (used < budget - MIN_LEG && legs < maxLegs) {
      want = Math.min(budget - used, rnd(70, ax === 'h' ? hcap : vcap));
      if (ax === last) want = Math.min(want, STRAIGHT_CAP - straight);
      got = want > MIN_JOG ? w.go(ax, want) : 0;
      if (!got) {
        ax = ax === 'h' ? 'v' : 'h';
        want = Math.min(budget - used, ax === 'h' ? hcap : vcap);
        if (ax === last) want = Math.min(want, STRAIGHT_CAP - straight);
        got = want > MIN_JOG ? w.go(ax, want) : 0;
        if (!got) break;
      }
      straight = ax === last ? straight + got : got;
      last = ax;
      used += got; legs++;
      ax = ax === 'h' ? 'v' : 'h';
    }
    return used;
  }

  function makeRoute() {
    var side = pickSide();
    var barW = barBox.r - barBox.l, barH = barBox.b - barBox.t;

    /* P2: length first, then a shape that fits it. Weighted so short and mid
       runs are the common case and a tall climb is rare. */
    var size = pickWeighted([
      { k: 'short', w: 0.28, span: [90, 190] },
      { k: 'mid',   w: 0.28, span: [200, 380] },
      { k: 'long',  w: 0.26, span: [400, 600] },
      { k: 'tall',  w: 0.18, span: [620, 880] }
    ]);
    var budget = rnd(size.span[0], size.span[1]);
    /* The side channels are only ~32px wide, so a long budget spent there
       gets truncated. The band under the bar is the full width, so that is
       where the long classes mostly go. */
    if (budget > 420 && Math.random() < 0.35) side = 'down';
    var w, got, used = 0;

    if (side === 'down') {
      /* The band under the bar is open all the way across. Use its whole
         width and depth rather than dropping straight down every time. */
      var sx = barBox.l + barW * rnd(0.06, 0.94);
      /* Head toward whichever side of the band has the room the budget needs. */
      var hd = Math.random() < 0.5 ? -1 : 1;
      if (budget > 420) hd = (sx - leftX) > (rightX - sx) ? -1 : 1;
      w = walker(sx, barBox.b, hd, 1, rects);
      got = w.go('v', Math.min(rnd(40, 130), budget));
      if (!got) return null;
      used = got;
      w = walker(w.x(), w.y(), hd, 1, offBar);
      wander(w, 'h', budget, used, 400, 200, 9);
      var d = w.pts(); d.unshift({ x: sx, y: barBox.b });
      return finish(d, side);
    }

    /* Side exits. Up and down are both used: the band below the bar is as
       open as the margin above it. */
    var hDir = side === 'left' ? -1 : 1;
    var goingUp = Math.random() < 0.58;
    var vDir = goingUp ? -1 : 1;
    var startX = side === 'left' ? barBox.l : barBox.r;
    var startY = barBox.t + barH * rnd(0.14, 0.86);
    w = walker(startX, startY, hDir, vDir, rects);

    var lane = side === 'left' ? rnd(leftX + 6, colLeft - 8) : rnd(colRight + 8, rightX - 6);
    var toLane = Math.abs(lane - startX);

    /* Only a tall climb needs the channel by the cards. Everything else turns
       at a point spread across the open margin, so runs do not all hug the
       same line. */
    var fam = pickWeighted(
      budget < 200 ? [{ k: 'stub', w: 1 }]
    : budget < 370 ? [{ k: 'elbow', w: 0.5 }, { k: 'runner', w: 0.5 }]
    : budget < 580 ? [{ k: 'elbow', w: 0.34 }, { k: 'runner', w: 0.33 }, { k: 'terrace', w: 0.33 }]
                   : [{ k: 'riser', w: 0.7 }, { k: 'terrace', w: 0.3 }]
    ).k;

    if (fam === 'stub' || fam === 'elbow' || fam === 'runner') {
      /* Alternating legs, always in the two chosen directions, until the
         length is used up. Long runs become staircases across the open
         margin rather than stopping short. */
      /* Turn point anywhere across the open block, independent of how long
         the route wants to be. Long routes then wander that block in several
         legs instead of running straight out to the margin. */
      var reach = fam === 'runner' ? rnd(toLane * 0.55, toLane)
                : fam === 'stub'   ? rnd(50, Math.min(150, toLane))
                                   : rnd(60, toLane * 0.85);
      got = w.go('h', Math.min(reach, budget * 0.8));
      if (!got) return null;
      used = got;
      wander(w, 'v', budget, used, 210, 320, 9);
      return finish(w.pts(), side);
    }

    /* terrace and riser climb the channel in steps, every step the same way
       horizontally so the route never comes back on itself */
    got = w.go('h', toLane);
    if (!got) return null;
    used = got;
    var steps = fam === 'terrace' ? 2 : 3;
    for (var s = 0; s < steps && used < budget - MIN_LEG; s++) {
      got = w.go('v', Math.min(rnd(100, 180), budget - used));
      if (!got) break;
      used += got;
      if (used >= budget - MIN_LEG) break;
      got = w.go('h', rnd(MIN_JOG, 28));
      if (!got) break;
      used += got;
    }
    if (used < budget - MIN_LEG) w.go('v', budget - used);
    return finish(w.pts(), side);
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
    colLeft  = cr ? cr.l + 52 : (hb ? hb.l : 0);   /* arrow width plus its gap */
    colRight = cr ? cr.r - 52 : (hb ? hb.r : 0);
    /* Stay off the page corners: the lane sits just outside the cards, not
       out at the viewport edge. */
    /* Hard limit: nothing goes past the carousel's outer edge, where the
       arrows are. */
    leftX   = cr ? cr.l : (hb ? hb.l : 0);
    rightX  = cr ? cr.r : (hb ? hb.r : 1e9);
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
    /* the frame swells and the selected card flashes with it, at every width; a trace leaves only on the wide board */
    bar.classList.add('thesis--pulse');
    var card = document.querySelector('[data-card].carousel__card--active');
    if (card) card.classList.add('carousel__card--pulse');
    setTimeout(function () { bar.classList.remove('thesis--pulse'); if (card) card.classList.remove('carousel__card--pulse'); }, 1000);
    if (!drawing) return;
    var route = null;
    for (var i = 0; i < 40 && !route; i++) route = makeRoute();
    if (!route) return;
    runs.push({ t: route, start: performance.now() });
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

  var drawing = false;
  function startUp() {
    stop();
    drawing = wide.matches && !reduced.matches;
    beatTimer = setInterval(beat, BEAT);   /* only the timer fires beats */
    if (!drawing) { canvas.style.width = '0px'; canvas.style.height = '0px'; return; }
    measure();
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

/* ── Midterms page ────────────────────────────────────── */
/* 74 races, one locked call each. Reads the race list and the calls (two JSON blobs the server fills; midterms-mock.js
   while they are unfilled), joins them on market_id + leg_id and computes every stat on the page. */
(function () {
  var root = document.querySelector('[data-midterms]');
  if (!root) return;
  var nav = document.querySelectorAll('[data-nav="midterms"]');
  for (var ni = 0; ni < nav.length; ni++) nav[ni].classList.add('active');

  function blob(sel, key) {
    var el = root.querySelector(sel), raw = el ? el.textContent.trim() : '';
    if (raw && !(/^\{\{/).test(raw)) { try { return JSON.parse(raw); } catch (e) {} }
    var m = window.PROPHET_MIDTERMS_MOCK; return m ? m[key] : [];
  }
  var list = blob('[data-midterms-races]', 'races'), calls = blob('[data-midterms-calls]', 'calls');
  var byKey = {};
  for (var ci = 0; ci < calls.length; ci++) byKey[calls[ci].market_id + '|' + calls[ci].leg_id] = calls[ci];
  var races = [];
  for (var ri = 0; ri < list.length; ri++) {
    var r = list[ri], c = byKey[r.market_id + '|' + r.leg_id];
    if (!c) continue;
    races.push({ id: r.market_id, group: r.group, kind: r.kind || 'race', state: r.state || '', race: r.race, leg: r.leg, party: r.party,
      ru: r.runner_up, ruParty: r.runner_up_party, layer: r.layer, featured: !!r.featured,
      side: c.side, stars: +c.stars || 0, thesis: c.thesis || '', settle: c.settlement_line || '', atCall: +c.price_at_call,
      price: +c.live_price, status: c.state || 'live', reason: c.pending_reason || '', outcome: c.outcome || '',
      outcomeLine: c.outcome_line || '', agree: +c.taps_agree || 0, disagree: +c.taps_disagree || 0, userSide: c.user_side || '' });
  }
  var MULTI = { AK: 1, CA: 1, ID: 1, MI: 1, RI: 1 };   /* multi-candidate races: a NO reads "Not" + the called candidate */
  var PARTY_WORD = { D: 'Democratic', R: 'Republican', I: 'Independent' };
  var VOID_LINE = "Polymarket closed this market without a result. His calls and every tap on them don't count.";
  var STAR = (root.querySelector('[data-mt-star]') || {}).innerHTML || '';
  var signedIn = root.getAttribute('data-signed-in') || '';
  var taps = {};   /* market_id -> side, mock and in-memory; the server keeps the real one */

  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function other(p) { return p === 'D' ? 'R' : 'D'; }
  /* His pick, never a double negative */
  function pick(r) {
    if (r.side === 'yes') return { text: r.leg, party: r.kind === 'bop' ? '' : r.party };
    if (r.kind === 'bop') return { text: 'Not a ' + PARTY_WORD[r.party] + ' sweep', party: '' };
    if (r.kind === 'control') { var o = other(r.party); return { text: o === 'D' ? 'Democrats' : 'Republicans', party: o }; }
    if (MULTI[r.state]) return { text: 'Not ' + r.leg, party: '' };
    return { text: r.ru, party: r.ruParty };
  }
  function mapParty(r) { return r.side === 'yes' ? r.party : r.ruParty; }   /* a NO colours the seat by the runner-up's party */
  function sidePrice(p, r) { return r.side === 'yes' ? p : 100 - p; }   /* prices read for his side */
  function locked(r) { return r.status !== 'live'; }
  function tagHTML(r) {
    if (r.status === 'pending') return '<span class="prow__outcome prow__outcome--pending">' + (r.reason === 'disputed' ? 'Pending · disputed' : 'Pending') + '</span>';
    if (r.status === 'resolved') return '<span class="prow__outcome prow__outcome--' + r.outcome + '">' + (r.outcome === 'right' ? 'Right' : 'Wrong') + '</span>';
    if (r.status === 'void') return '<span class="prow__outcome prow__outcome--void">Void</span>';
    return '';
  }
  function chip(p) { return p ? '<span class="mt-chip mt-chip--' + p.toLowerCase() + '">' + p + '</span>' : ''; }
  function pickHTML(r) { var k = pick(r); return '<span class="mt-pick__name">' + esc(k.text) + '</span>' + chip(k.party); }
  function starsHTML(r) { var h = ''; for (var s = 1; s <= 5; s++) h += '<span class="carousel__star' + (s <= r.stars ? ' carousel__star--on' : '') + '">' + STAR + '</span>'; return '<span class="mt-stars" title="' + r.stars + ' of 5">' + h + '</span>'; }
  function side(r) { return taps.hasOwnProperty(r.id) ? taps[r.id] : r.userSide; }
  function tally(r, short) {
    var n = r.agree + r.disagree;
    if (n >= 3) return Math.round(r.agree * 100 / n) + '% agree · ' + n + ' tap' + (n === 1 ? '' : 's');
    var s = side(r); return s ? 'You ' + s : (short ? '' : '');
  }
  function priceNow(r) {
    if (r.status === 'resolved') return sidePrice(r.price, r) + '% settled';
    if (r.status === 'void') return sidePrice(r.price, r) + '% last';
    return sidePrice(r.price, r) + '% now';
  }

  /* ── stats (headline and per group) ── */
  function stats(set) {
    var called = 0, resolved = 0, right = 0;
    for (var i = 0; i < set.length; i++) {
      if (set[i].side) called++;
      if (set[i].status === 'resolved') { resolved++; if (set[i].outcome === 'right') right++; }
    }
    var dash = '—';
    return [['Called', called], ['Resolved', resolved ? resolved : dash], ['Right', resolved ? right : dash],
            ['Hit rate', resolved ? Math.round(right * 100 / resolved) + '%' : dash]];
  }
  function statsHTML(set) {
    return stats(set).map(function (s) { return '<div class="mt-stat"><span class="mt-stat__label">' + s[0] + '</span><span class="mt-stat__value">' + s[1] + '</span></div>'; }).join('');
  }

  /* ── maps: one tile per state; seats in play take the party of his pick, the rest stay neutral ── */
  var TILES = { AK:[0,0], ME:[11,0], WI:[6,1], VT:[10,1], NH:[11,1], WA:[0,2], ID:[1,2], MT:[2,2], ND:[3,2], MN:[4,2], IL:[5,2], MI:[6,2], NY:[9,2], MA:[10,2],
    OR:[0,3], NV:[1,3], WY:[2,3], SD:[3,3], IA:[4,3], IN:[5,3], OH:[6,3], PA:[7,3], NJ:[8,3], CT:[9,3], RI:[10,3],
    CA:[0,4], UT:[1,4], CO:[2,4], NE:[3,4], MO:[4,4], KY:[5,4], WV:[6,4], VA:[7,4], MD:[8,4], DE:[9,4],
    AZ:[1,5], NM:[2,5], KS:[3,5], AR:[4,5], TN:[5,5], NC:[6,5], SC:[7,5], DC:[8,5], OK:[3,6], LA:[4,6], MS:[5,6], AL:[6,6], GA:[7,6], HI:[0,7], TX:[3,7], FL:[8,7] };
  function mapSVG(group) {
    var seats = {}; races.forEach(function (r) { if (r.group === group && r.state) seats[r.state] = r; });
    var T = 30, G = 3, out = '';
    for (var st in TILES) {
      var x = TILES[st][0] * (T + G), y = TILES[st][1] * (T + G), r = seats[st];
      var cls = r ? 'mt-tile mt-tile--' + (r.status === 'void' ? 'void' : mapParty(r).toLowerCase()) : 'mt-tile mt-tile--off';
      out += '<g class="' + cls + '"' + (r ? ' data-mt-open="' + r.id + '"' : '') + '><title>' + (r ? esc(r.race + ': ' + pick(r).text) : st) + '</title>' +
        '<rect x="' + x + '" y="' + y + '" width="' + T + '" height="' + T + '" rx="2"/>' +
        '<text x="' + (x + T / 2) + '" y="' + (y + T / 2 + 4) + '" text-anchor="middle">' + st + '</text>';
      if (r && r.status === 'resolved') {
        var ok = r.outcome === 'right';
        out += '<rect class="mt-mark__bg" x="' + (x + T - 12) + '" y="' + (y + 1) + '" width="11" height="11"/>' +
          '<text class="mt-mark mt-mark--' + r.outcome + '" x="' + (x + T - 6.5) + '" y="' + (y + 10) + '" text-anchor="middle">' + (ok ? '✓' : '✗') + '</text>';
      }
      out += '</g>';
    }
    return '<svg class="mt-map__svg" viewBox="0 0 ' + (12 * (T + G) - G) + ' ' + (8 * (T + G) - G) + '" role="img" aria-label="' + group + ' map">' + out + '</svg>';
  }

  /* ── market card and market row ── */
  var CHEV = '<svg class="tsec__chev" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>';
  function btnHTML(r, k, label) {
    var s = side(r);
    return '<button class="ad__btn ad__btn--' + k + (s === k ? ' ad__btn--on' : '') + (s && s !== k ? ' ad__btn--off' : '') + '" data-mt-tap="' + k + '"' + (locked(r) ? ' disabled' : '') + '>' + label + '</button>';
  }
  function adHTML(r) {
    var t = tally(r);
    return '<div class="ad mt-ad"><div class="ad__row">' + btnHTML(r, 'agree', 'Agree') + btnHTML(r, 'disagree', 'Disagree') + '</div>' +
      (t ? '<span class="thesis__split">' + t + '</span>' : '') +
      (r.status === 'pending' ? '<span class="ad__closed">Taps closed. Resolution next.</span>' : '') + '</div>';
  }
  function bodyHTML(r) {
    var line = r.status === 'resolved' ? r.outcomeLine : r.status === 'void' ? VOID_LINE : r.settle;
    var lineCls = r.status === 'resolved' ? 'thesis__note' : 'thesis__fact';
    return '<p class="thesis__text">' + esc(r.thesis) + '</p>' + (line ? '<p class="' + lineCls + '">' + esc(line) + '</p>' : '');
  }
  /* full: the pane's card, body always shown; otherwise the body opens in place (phone) */
  function cardHTML(r, opts) {
    opts = opts || {};
    var open = !!opts.full || !!opts.open;
    return '<article class="mt-card outline' + (opts.full ? ' mt-card--full' : '') + (opts.sel ? ' mt-card--sel' : '') + (open ? ' mt-card--open' : '') + '" data-mt-card="' + r.id + '">' +
      '<div class="mt-card__top" data-mt-pickr><span class="mt-card__race">' + esc(r.race) + '</span>' + tagHTML(r) + (opts.full ? '' : CHEV) + '</div>' +
      '<div class="mt-pick" data-mt-pickr>' + pickHTML(r) + '</div>' +
      '<div class="mt-card__meta" data-mt-pickr>' + starsHTML(r) + '<span class="mt-price">' + sidePrice(r.atCall, r) + '% at call · ' + priceNow(r) + '</span></div>' +
      (open ? '<div class="mt-card__body">' + bodyHTML(r) + '</div>' : '') +
      adHTML(r) + '</article>';
  }
  function rowHTML(r, opts) {
    var t = tally(r, true);
    var n = r.agree + r.disagree, short = n >= 3 ? Math.round(r.agree * 100 / n) + '% · ' + n + ' taps' : (t || '');
    return '<div class="mt-row' + (opts.sel ? ' mt-row--open' : '') + '" data-mt-row="' + r.id + '">' +
      '<span class="mt-row__race" data-mt-pickr>' + esc(r.group === 'balance' ? r.race : stateName(r)) + '</span>' +
      '<span class="mt-row__pick" data-mt-pickr>' + pickHTML(r) + '</span>' + starsHTML(r) +
      '<span class="mt-row__price" data-mt-pickr>' + sidePrice(r.price, r) + '%</span>' +
      '<span class="mt-row__tag" data-mt-pickr>' + tagHTML(r) + '</span>' +
      '<span class="mt-row__ad">' + btnHTML(r, 'agree', 'Agree') + btnHTML(r, 'disagree', 'Disagree') + '</span>' +
      '<span class="mt-row__tally" data-mt-pickr>' + short + '</span></div>' +
      (opts.open ? '<div class="mt-inplace">' + bodyHTML(r) + (r.status === 'pending' ? '<p class="ad__closed">Taps closed. Resolution next.</p>' : '') + '</div>' : '');
  }
  function stateName(r) { return r.race.replace(/ (Senate|Governor)$/, ''); }

  /* ── the market set, the view and the selection ── */
  var SAFE_KEY = 'prophet.midterms.safe.', VIEW_KEY = 'prophet.midterms.view';
  var set = 'top', view = 'cards', selId = '', openIds = {};
  try { view = localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'cards'; } catch (e) {}
  function ordered(g) {
    if (g === 'top') { var f = races.filter(function (r) { return r.featured; }); return { all: f, lead: f, safe: [] }; }
    var all = races.filter(function (r) { return r.group === g; });
    var fe = all.filter(function (r) { return r.featured; });
    var c = all.filter(function (r) { return !r.featured && r.layer !== 'safe'; }).sort(function (a, b) { return Math.abs(a.price - 50) - Math.abs(b.price - 50); });
    var s = all.filter(function (r) { return !r.featured && r.layer === 'safe'; });
    return { all: all, lead: fe.concat(c), safe: s };
  }
  function safeOpen(g) { try { return localStorage.getItem(SAFE_KEY + g) === '1'; } catch (e) { return false; } }
  function isDesk() { return window.matchMedia('(min-width: 1024px)').matches; }
  function visible() { var o = ordered(set); return o.lead.concat(safeOpen(set) ? o.safe : []); }
  function renderMarkets() {
    var o = ordered(set), box = root.querySelector('[data-mt-markets]'), desk = isDesk(), so = safeOpen(set);
    var vis = visible();
    if (desk && (!selId || vis.indexOf(find(selId)) < 0)) selId = vis.length ? vis[0].id : '';
    root.querySelector('[data-mt-stats="group"]').innerHTML = statsHTML(o.all);
    var item = function (r) {
      return view === 'cards' ? cardHTML(r, { sel: desk && r.id === selId, open: !desk && openIds[r.id] })
                              : rowHTML(r, { sel: desk ? r.id === selId : !!openIds[r.id], open: !desk && openIds[r.id] });
    };
    var h = '<div class="mt-markets__' + view + '">' + o.lead.map(item).join('') + '</div>';
    if (o.safe.length) {
      h += '<button class="mt-safe" data-mt-safe aria-expanded="' + so + '">' + o.safe.length + ' safe ' + (set === 'governors' ? 'races' : 'seats') + CHEV + '</button>';
      if (so) h += '<div class="mt-markets__' + view + '">' + o.safe.map(item).join('') + '</div>';
    }
    box.innerHTML = h;
    var sel = root.querySelector('[data-mt-set]'); if (sel.value !== set) sel.value = set;
    var vb = root.querySelectorAll('[data-mt-view]');
    for (var i = 0; i < vb.length; i++) { var on = vb[i].getAttribute('data-mt-view') === view; vb[i].classList.toggle('filters__tag--on', on); vb[i].setAttribute('aria-pressed', on ? 'true' : 'false'); }
    root.querySelector('[data-mt-list]').setAttribute('data-view', view);
    renderPane();
  }
  function renderPane() {
    var pane = root.querySelector('[data-mt-pane]'), r = isDesk() && selId ? find(selId) : null;
    pane.hidden = !r; root.querySelector('[data-mt-list]').classList.toggle('mt-list--pane', !!r);
    pane.innerHTML = r ? cardHTML(r, { full: true }) : '';
  }
  function find(id) { for (var i = 0; i < races.length; i++) if (races[i].id === id) return races[i]; }
  function renderSide() {
    root.querySelector('[data-mt-stats="all"]').innerHTML = statsHTML(races);
    var maps = root.querySelectorAll('[data-mt-map]');
    for (var i = 0; i < maps.length; i++) maps[i].querySelector('[data-mt-map-svg]').innerHTML = mapSVG(maps[i].getAttribute('data-mt-map'));
    var five = races.filter(function (r) { return r.stars === 5; }), fr = five.filter(function (r) { return r.status === 'resolved'; }), fright = fr.filter(function (r) { return r.outcome === 'right'; });
    root.querySelector('[data-mt-five]').innerHTML = '<span class="mt-five__n">' + five.length + '</span> five-star calls' + (fr.length ? ' · <span class="mt-five__n">' + fright.length + '</span> right' : '');
  }
  function renderAll() { renderSide(); renderMarkets(); }
  function refreshRace() { renderMarkets(); }   /* a tap repaints the markets and the pane */
  function selectRace(id, scroll) {
    if (isDesk()) selId = id; else openIds[id] = !openIds[id];
    renderMarkets();
    if (scroll) { var el = root.querySelector('[data-mt-card="' + id + '"], [data-mt-row="' + id + '"]'); if (el && el.scrollIntoView) el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
  }

  /* ── interactions ── */
  root.addEventListener('change', function (e) {
    if (e.target.matches('[data-mt-set]')) { set = e.target.value; openIds = {}; selId = ''; renderMarkets(); }
  });
  root.addEventListener('click', function (e) {
    var t;
    if ((t = e.target.closest('[data-mt-map-tab]'))) {
      var m = t.getAttribute('data-mt-map-tab'); root.setAttribute('data-mt-mapshow', m);
      var mt = root.querySelectorAll('[data-mt-map-tab]'); for (var i = 0; i < mt.length; i++) mt[i].classList.toggle('filters__tag--on', mt[i] === t);
      return;
    }
    if ((t = e.target.closest('[data-mt-view]'))) { view = t.getAttribute('data-mt-view'); try { localStorage.setItem(VIEW_KEY, view); } catch (x) {} renderMarkets(); return; }
    if ((t = e.target.closest('[data-mt-safe]'))) { try { localStorage.setItem(SAFE_KEY + set, safeOpen(set) ? '0' : '1'); } catch (x) {} renderMarkets(); return; }
    if ((t = e.target.closest('[data-mt-tap]'))) { onTap(t); return; }
    if ((t = e.target.closest('[data-mt-open]'))) {   /* a map tile opens its race in its group */
      var r0 = find(t.getAttribute('data-mt-open')); set = r0.group; openIds = {};
      if (r0.layer === 'safe') { try { localStorage.setItem(SAFE_KEY + set, '1'); } catch (x) {} }
      selectRace(r0.id, true); return;
    }
    if ((t = e.target.closest('[data-mt-pickr]'))) {
      if (t.closest('[data-mt-pane]')) return;
      var host = t.closest('[data-mt-card], [data-mt-row]'); if (!host) return;
      selectRace(host.getAttribute('data-mt-card') || host.getAttribute('data-mt-row'), false); return;
    }
  });
  var lastDesk = isDesk();
  window.addEventListener('resize', function () { if (isDesk() !== lastDesk) { lastDesk = isDesk(); renderMarkets(); } });

  /* ── Agree / Disagree: one tap per call, final; the "already" notice; locked once pending; signed out → sign-in ── */
  var tapModal = document.querySelector('[data-tap-modal]'), already = document.querySelector('[data-notice="already"]');
  function val(el, key, fb) { var v = el ? (el.getAttribute('data-' + key) || '') : ''; return (!v || (/^\{\{/).test(v)) ? fb : v; }
  function openM(m) { if (!m) return; m.hidden = false; document.documentElement.classList.add('onb-lock'); var c = m.querySelector('.mdl__close'); if (c) c.focus(); }
  function closeM(m) { if (!m) return; m.hidden = true; if (!document.querySelector('[data-modal]:not([hidden]), [data-onboarding]:not([hidden]), [data-hiw]:not([hidden])')) document.documentElement.classList.remove('onb-lock'); }
  [tapModal, already].forEach(function (m) { if (m) m.addEventListener('click', function (e) { if (e.target.closest('[data-modal-close]')) closeM(m); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { var o = document.querySelector('[data-modal]:not([hidden])'); if (o) { e.preventDefault(); closeM(o); } } }, true);
  var COPY = { agree: "You're calling him {verdict}. {label} at {price}. Let's see if you're both right.",
               disagree: "You're calling him {verdict}. {label} at {price}, you say that's {verdict}.",
               scoring: "Scored when the market resolves. Right or wrong, it's on your record and you'll earn XP." };
  var lastTapped = '';
  function onTap(b) {
    var host = b.closest('[data-mt-card], [data-mt-row]'), r = find(host.getAttribute('data-mt-card') || host.getAttribute('data-mt-row')), k = b.getAttribute('data-mt-tap');
    if (!r || locked(r)) return;
    if (signedIn === 'false') { document.dispatchEvent(new CustomEvent('prophet:signin', { detail: { then: 'agree', slug: r.id } })); return; }
    var prev = side(r);
    if (prev) { if (already) { already.querySelector('[data-already-line]').textContent = prev === 'agree' ? val(already, 'already-agree', 'You agreed already.') : val(already, 'already-disagree', 'You disagreed already.'); openM(already); } return; }
    taps[r.id] = k; refreshRace(); confirm(r, k);
  }
  function confirm(r, k) {
    if (!tapModal) return; lastTapped = r.id;
    var chipEl = tapModal.querySelector('[data-tc-chip]');
    chipEl.textContent = k === 'agree' ? 'Agree' : 'Disagree'; chipEl.className = 'ad__btn tc__chip ad__btn--' + k + ' ad__btn--on';
    var label = '<span class="tc__word">' + esc(pick(r).text) + '</span>';
    tapModal.querySelector('[data-tc-confirm]').innerHTML = esc(val(tapModal, k === 'agree' ? 'confirm-agree' : 'confirm-disagree', COPY[k]))
      .replace(/\{label\}/g, label).replace(/\{verdict\}/g, k === 'agree' ? 'right' : 'wrong').replace(/\{price\}/g, String(sidePrice(r.atCall, r)));
    tapModal.querySelector('[data-tc-scoring]').textContent = val(tapModal, 'scoring-line', COPY.scoring);
    var nx = nextRace(r); tapModal.querySelector('[data-tc-next]').textContent = nx ? 'Next call' : 'Back to top';
    openM(tapModal);
  }
  function nextRace(r) {   /* the next open call in what the viewer is looking at */
    var seq = visible();
    for (var i = seq.indexOf(r) + 1; i < seq.length; i++) if (!locked(seq[i])) return seq[i];
    return null;
  }
  if (tapModal) tapModal.querySelector('[data-tc-next]').addEventListener('click', function () {
    closeM(tapModal); var r = find(lastTapped); if (!r) return; var nx = nextRace(r);
    if (!nx) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (!isDesk()) openIds = {};
    selectRace(nx.id, true);
  });
  window.prophetMidterms = { races: races, land: function (id, k) { var r = find(id); if (r && !side(r) && !locked(r)) { taps[id] = k; refreshRace(); confirm(r, k); } } };

  root.setAttribute('data-mt-mapshow', 'senate');
  renderAll();
})();
