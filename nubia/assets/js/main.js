/* NUBIA | Executive Mind Literacy — site behaviour
 * - EN/AR switching with LTR/RTL
 * - Config-driven placeholders (nothing invented)
 * - Leadership Blind-Spot Profile (runs entirely in the browser)
 * - Registration form (posts to a configured endpoint only)
 */
(function () {
  'use strict';

  var CFG = window.NUBIA_CONFIG || {};
  var AR = window.NUBIA_AR || {};

  /* ---------- English dynamic strings (Arabic in i18n-ar.js → dyn) ---------- */
  var EN_DYN = {
    'tbc': 'To be confirmed',
    'tba': 'To be added',
    'seats': '{n} of {max} places remaining',
    'seatsNone': 'All places have been filled.',
    'deadlineAuto': '{date}',
    'paymentAfter': 'Payment details are sent with your confirmation.',
    'err.required': 'Please complete this field.',
    'err.email': 'Please enter a valid email address.',
    'err.consent': 'Please confirm you have read the privacy notice.',
    'err.summary': 'Please review the highlighted fields.',
    'sending': 'Sending…',
    'sendFail': 'We could not send your request. Please try again or contact us directly.',
    'notOpen': 'Online registration is not yet open. To reserve your place, please contact us directly using the contact details in this section. Your details have not been sent or stored.',
    'mailto': 'Email your registration request',
    'mailSubject': 'Registration request – Executive Mind Literacy Workshop',
    'payBtn': 'Continue to secure payment – US$50',
    'payHeading': 'Payment',

    'q.introTitle': 'Before you begin',
    'q.intro': 'Think about the past few months of your working life. For each statement, choose how often it reflects your experience. There are no right or wrong answers — the more candid you are with yourself, the more useful your reflection will be.',
    'q.introPoints': ['10 statements · about 3 minutes', 'Your answers stay in your browser and are not sent anywhere', 'A self-reflection experience — not a diagnosis or assessment'],
    'q.start': 'Begin',
    'q.progress': 'Statement {n} of {total}',
    'q.back': 'Back',
    'q.next': 'Next',
    'q.finish': 'See my reflection',
    'q.prompt': 'How often does this reflect your experience?',
    'q.scale': ['Rarely', 'Occasionally', 'Sometimes', 'Often', 'Very often'],
    'q.items': [
      'When I receive incomplete information, I quickly settle on an explanation and move forward with it.',
      'My first impression of a person or situation tends to stay with me, even when new information emerges.',
      'I tend to look for information that confirms what I already believe about a situation.',
      'I assume others see a situation the same way I do, without checking.',
      'Under time pressure, I make decisions faster than I would like, to relieve the pressure.',
      'Frustration, disappointment or anxiety affects how I respond in meetings or conversations.',
      'After a difficult conversation, I realise my reaction was stronger than the situation required.',
      'I approach new challenges with methods that worked for me in the past, without questioning whether they still fit.',
      'When someone challenges my usual way of doing things, my first instinct is to defend it.',
      'I move on to the next decision without reviewing how I reached the last important one.'
    ],
    'r.title': 'Your Reflection',
    'r.intro': 'Based on your responses, here is how the three areas compare. Longer bars indicate statements you recognised more often in your own experience.',
    'r.levels': ['Less pronounced', 'Moderate', 'More pronounced'],
    'r.priority': 'A possible area to explore further',
    'r.balanced': 'Your responses were closely balanced between “{a}” and “{b}”. We have highlighted “{a}”, but both may be worth exploring.',
    'r.low': 'Overall, you recognised these patterns relatively rarely — which is worth noticing in itself. The area below is where your responses were most pronounced.',
    'r.questions': 'Questions to carry with you',
    'r.workshop': 'The five-day workshop focuses on one potential thinking pattern like this, connects it to a real leadership situation, and ends with your personalised 30-day Leadership Improvement Plan.',
    'r.cta': 'Explore the 5-Day Workshop',
    'r.retake': 'Retake the reflection',
    'r.disclaimer': 'This reflection is based only on your own responses to ten statements. It is not a psychological diagnosis, a scientific assessment, or an evaluation of your leadership ability. Your answers have not been stored or sent anywhere.',
    'areas': {
      'A': {
        'insight': 'Your responses suggest that early explanations may sometimes settle quickly and remain in place. Leaders often need to act on incomplete information; the opportunity is to notice when an interpretation has quietly become a conclusion.',
        'prompts': ['What am I assuming here that I have not checked?', 'What else could explain what I am seeing?', 'Whose view of this situation have I not yet heard?']
      },
      'B': {
        'insight': 'Your responses suggest that pressure and emotion may at times shape the pace or tone of your decisions. Emotions carry useful information; the opportunity is to notice them early enough to choose how they inform your response.',
        'prompts': ['What am I feeling right now, and how might it be shaping my view?', 'Does this decision need to be made now, or does it only feel urgent?', 'How would I respond if I were advising a colleague in this situation?']
      },
      'C': {
        'insight': 'Your responses suggest that familiar methods and routines may sometimes guide your judgement without being re-examined. Experience is valuable; the opportunity is to check whether what worked before still fits the situation in front of you.',
        'prompts': ['What is different about this situation compared with the last time?', 'If I were new to this role, how might I approach it?', 'What would I learn by listening to the challenge rather than defending against it?']
      }
    }
  };

  /* Question → area mapping (4 / 3 / 3). Higher score = pattern recognised more often. */
  var ITEM_AREAS = ['A', 'A', 'A', 'A', 'B', 'B', 'B', 'C', 'C', 'C'];
  var AREA_ORDER = ['A', 'B', 'C'];

  var lang = 'en';
  var EN = {};       // captured from the HTML on load
  var EN_ATTR = {};

  /* ---------- helpers ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function dyn(key) { var d = lang === 'ar' ? (AR.dyn || {}) : EN_DYN; return d[key] !== undefined ? d[key] : EN_DYN[key]; }
  function t(key) { return lang === 'ar' && AR[key] !== undefined ? AR[key] : EN[key]; }
  function fmt(s, vars) { return String(s).replace(/\{(\w+)\}/g, function (_, k) { return vars[k] !== undefined ? vars[k] : ''; }); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pick(obj) { if (!obj) return null; if (typeof obj === 'string') return obj; return obj[lang] || obj.en || null; }
  function store(k, v) { try { if (v === undefined) return window.localStorage.getItem(k); window.localStorage.setItem(k, v); } catch (e) { return null; } }
  var isPreview = /^(localhost|127\.0\.0\.1|)$/.test(location.hostname) || location.protocol === 'file:' || /[?&]preview\b/.test(location.search);
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- i18n ---------- */
  function captureEnglish() {
    $$('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (EN[k] === undefined) EN[k] = el.innerHTML.trim();
    });
    $$('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var p = pair.split(':'); var attr = p[0].trim(), k = p[1].trim();
        if (EN_ATTR[k] === undefined) EN_ATTR[k] = el.getAttribute(attr);
      });
    });
  }

  function applyLanguage(next, opts) {
    lang = next === 'ar' ? 'ar' : 'en';
    var html = document.documentElement;
    html.lang = lang;
    html.dir = lang === 'ar' ? 'rtl' : 'ltr';

    $$('[data-i18n]').forEach(function (el) {
      var v = t(el.getAttribute('data-i18n'));
      if (v !== undefined) el.innerHTML = v;
    });
    $$('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var p = pair.split(':'); var attr = p[0].trim(), k = p[1].trim();
        var v = lang === 'ar' && AR[k] !== undefined ? AR[k] : EN_ATTR[k];
        if (v != null) el.setAttribute(attr, v);
      });
    });
    $$('.lang-switch button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang)); });

    document.title = lang === 'ar'
      ? 'NUBIA | الثقافة الذهنية للقيادات التنفيذية — ورشة تنفيذية لمدة خمسة أيام'
      : 'NUBIA | Executive Mind Literacy — Five-Day Executive Workshop';

    renderConfig();
    clearErrors();
    quiz.rerender();

    if (!opts || !opts.initial) {
      store('nubia-lang', lang);
      try {
        var u = new URL(location.href); u.searchParams.set('lang', lang);
        history.replaceState(null, '', u.toString());
      } catch (e) { /* ignore */ }
    }
  }

  /* ---------- config-driven content ---------- */
  function placeholder(kind) {
    return '<span class="ph">' + esc(dyn(kind || 'tbc')) + '</span>';
  }

  function deadlineDate() {
    var s = CFG.workshop && CFG.workshop.startDate;
    if (!s) return null;
    var d = new Date(s);
    if (isNaN(d)) return null;
    var hours = (CFG.registration && CFG.registration.closeHoursBefore) || 48;
    return new Date(d.getTime() - hours * 3600 * 1000);
  }

  function formatDate(d) {
    try {
      return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-u-nu-latn' : 'en-GB', { dateStyle: 'full', timeStyle: 'short' }).format(d);
    } catch (e) { return d.toString(); }
  }

  function cfgHTML(key) {
    var c = CFG, v;
    switch (key) {
      case 'dates':
        v = pick(c.workshop && c.workshop.datesText); return v ? esc(v) : placeholder('tbc');
      case 'delivery':
        v = pick(c.workshop && c.workshop.deliveryText); return v ? esc(v) : placeholder('tbc');
      case 'deadline':
        var d = deadlineDate(); return d ? esc(formatDate(d)) : placeholder('tbc');
      case 'phone':
        v = c.contact && c.contact.phone;
        return v ? '<a dir="ltr" href="tel:' + esc(v.replace(/[^\d+]/g, '')) + '">' + esc(v) + '</a>' : placeholder('tba');
      case 'email':
        v = c.contact && c.contact.email;
        return v ? '<a dir="ltr" href="mailto:' + esc(v) + '">' + esc(v) + '</a>' : placeholder('tba');
      case 'payment':
        v = pick(c.payment && c.payment.instructions);
        if (v) return esc(v);
        if (c.payment && c.payment.url) return esc(dyn('paymentAfter'));
        return placeholder('tbc');
      case 'provider':
        v = c.privacy && c.privacy.providerName; return v ? esc(v) : placeholder('tbc');
      case 'retention':
        v = pick(c.privacy && c.privacy.retention); return v ? esc(v) : placeholder('tbc');
    }
    return placeholder('tbc');
  }

  function registrationState() {
    var r = CFG.registration || {};
    if (!r.enforceLimits) return { open: true, enforced: false };
    var d = deadlineDate();
    var full = typeof r.seatsRemaining === 'number' && r.seatsRemaining <= 0;
    var past = d ? Date.now() > d.getTime() : false;
    return { open: !full && !past, enforced: true, full: full };
  }

  function renderConfig() {
    $$('[data-cfg]').forEach(function (el) { el.innerHTML = cfgHTML(el.getAttribute('data-cfg')); });

    var r = CFG.registration || {};
    var state = registrationState();
    var max = r.maxParticipants || 12;

    $('#regRule').hidden = !state.enforced;

    var seats = $('#seatsLine');
    if (state.enforced && typeof r.seatsRemaining === 'number') {
      seats.hidden = false;
      seats.textContent = r.seatsRemaining > 0 ? fmt(dyn('seats'), { n: r.seatsRemaining, max: max }) : dyn('seatsNone');
    } else { seats.hidden = true; }

    var form = $('#regForm');
    var closed = $('#formClosed');
    if (!state.open) {
      closed.hidden = false; form.hidden = true;
    } else { closed.hidden = true; if ($('#formSuccess').hidden) form.hidden = false; }

    $('#formSetupNote').hidden = !(isPreview && !r.formEndpoint);
    $('#privacySetupNote').hidden = !isPreview;
  }

  /* ---------- header / nav ---------- */
  function initNav() {
    var header = $('#siteHeader');
    var toggle = $('#navToggle');
    var nav = $('#mainNav');
    function onScroll() { header.classList.toggle('scrolled', window.scrollY > 24); }
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('nav-open', open);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { toggle.setAttribute('aria-expanded', 'false'); document.body.classList.remove('nav-open'); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
        toggle.setAttribute('aria-expanded', 'false'); document.body.classList.remove('nav-open'); toggle.focus();
      }
    });

    // Active link highlight
    if ('IntersectionObserver' in window) {
      var links = $$('.main-nav a');
      var map = {}; links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && map[en.target.id]) {
            links.forEach(function (a) { a.removeAttribute('aria-current'); });
            map[en.target.id].setAttribute('aria-current', 'true');
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
    }

    $$('.lang-switch button').forEach(function (b) {
      b.addEventListener('click', function () { applyLanguage(b.getAttribute('data-lang')); });
    });
  }

  function initReveal() {
    var els = $$('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    document.documentElement.classList.add('js-reveal');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- dialogs ---------- */
  var lastFocus = null;
  function openDialog(d) {
    lastFocus = document.activeElement;
    if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
    document.body.classList.add('modal-open');
  }
  function closeDialog(d) {
    if (typeof d.close === 'function') d.close(); else d.removeAttribute('open');
  }
  function initDialogs() {
    $$('dialog').forEach(function (d) {
      d.addEventListener('close', function () {
        document.body.classList.remove('modal-open');
        if (lastFocus && lastFocus.focus) lastFocus.focus();
      });
      d.addEventListener('click', function (e) { if (e.target === d) closeDialog(d); }); // backdrop
      $$('[data-close-dialog]', d).forEach(function (b) { b.addEventListener('click', function () { closeDialog(d); }); });
    });
    $$('[data-open-privacy]').forEach(function (b) { b.addEventListener('click', function () { openDialog($('#privacyDialog')); }); });
    $$('[data-open-reflection]').forEach(function (b) {
      b.addEventListener('click', function () { quiz.reset(); openDialog($('#reflectionDialog')); quiz.focus(); });
    });
  }

  /* ---------- Leadership Blind-Spot Profile ---------- */
  var quiz = (function () {
    var root = null;
    var step = -1;           // -1 intro, 0..9 questions, 10 result
    var answers = [];

    function total() { return ITEM_AREAS.length; }

    function scores() {
      var sums = { A: 0, B: 0, C: 0 }, counts = { A: 0, B: 0, C: 0 };
      answers.forEach(function (v, i) { var a = ITEM_AREAS[i]; sums[a] += v; counts[a] += 1; });
      var out = {};
      AREA_ORDER.forEach(function (a) { out[a] = counts[a] ? sums[a] / counts[a] : 0; });
      return out;
    }

    function renderIntro() {
      var pts = dyn('q.introPoints').map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('');
      root.innerHTML =
        '<div class="q-intro">' +
          '<h3>' + esc(dyn('q.introTitle')) + '</h3>' +
          '<p>' + esc(dyn('q.intro')) + '</p>' +
          '<ul class="ticks ticks-dark">' + pts + '</ul>' +
          '<div class="q-actions"><span></span><button type="button" class="btn btn-gold" data-q="start">' + esc(dyn('q.start')) + '</button></div>' +
        '</div>';
    }

    function renderQuestion() {
      var n = step + 1, items = dyn('q.items'), scale = dyn('q.scale');
      var current = answers[step];
      var opts = scale.map(function (label, i) {
        var val = i + 1, id = 'q' + step + 'o' + val;
        return '<label class="q-opt" for="' + id + '">' +
          '<input type="radio" id="' + id + '" name="q' + step + '" value="' + val + '"' + (current === val ? ' checked' : '') + '>' +
          '<span class="q-dot" aria-hidden="true"></span><span class="q-label">' + esc(label) + '</span></label>';
      }).join('');
      var pct = Math.round((step / total()) * 100);
      root.innerHTML =
        '<div class="q-step">' +
          '<div class="q-progress"><span class="q-count">' + esc(fmt(dyn('q.progress'), { n: n, total: total() })) + '</span>' +
          '<div class="q-bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + total() + '" aria-valuenow="' + step + '"><span style="width:' + pct + '%"></span></div></div>' +
          '<fieldset class="q-fieldset"><legend><span class="q-statement">' + esc(items[step]) + '</span><span class="q-prompt">' + esc(dyn('q.prompt')) + '</span></legend>' +
          '<div class="q-opts">' + opts + '</div></fieldset>' +
          '<div class="q-actions">' +
            '<button type="button" class="btn btn-ghost" data-q="back">' + esc(dyn('q.back')) + '</button>' +
            '<button type="button" class="btn btn-gold" data-q="next"' + (current ? '' : ' disabled') + '>' +
              esc(step === total() - 1 ? dyn('q.finish') : dyn('q.next')) + '</button>' +
          '</div>' +
        '</div>';
    }

    function level(avg) { var l = dyn('r.levels'); return avg < 2.5 ? l[0] : avg < 3.5 ? l[1] : l[2]; }
    function areaName(a) { return t('area.' + a); }

    function renderResult() {
      var s = scores();
      var ranked = AREA_ORDER.slice().sort(function (x, y) { return s[y] - s[x] || AREA_ORDER.indexOf(x) - AREA_ORDER.indexOf(y); });
      var top = ranked[0], second = ranked[1];
      var info = dyn('areas')[top];
      var maxAvg = s[top];

      var bars = AREA_ORDER.map(function (a) {
        var pct = Math.round(((s[a] - 1) / 4) * 100);
        return '<li class="r-bar' + (a === top ? ' is-top' : '') + '">' +
          '<div class="r-bar-head"><span>' + areaName(a) + '</span><span class="r-level">' + esc(level(s[a])) + '</span></div>' +
          '<div class="r-track"><span style="width:' + Math.max(pct, 3) + '%"></span></div></li>';
      }).join('');

      var notes = '';
      if (maxAvg < 2.5) notes += '<p class="r-note">' + esc(dyn('r.low')) + '</p>';
      if (s[top] - s[second] < 0.25) notes += '<p class="r-note">' + esc(fmt(dyn('r.balanced'), { a: areaName(top), b: areaName(second) })) + '</p>';

      var prompts = info.prompts.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('');

      root.innerHTML =
        '<div class="q-result">' +
          '<h3 class="r-title" tabindex="-1">' + esc(dyn('r.title')) + '</h3>' +
          '<p>' + esc(dyn('r.intro')) + '</p>' +
          '<ul class="r-bars">' + bars + '</ul>' +
          notes +
          '<div class="r-priority">' +
            '<p class="r-kicker">' + esc(dyn('r.priority')) + '</p>' +
            '<h4>' + areaName(top) + '</h4>' +
            '<p>' + esc(info.insight) + '</p>' +
            '<p class="r-qtitle">' + esc(dyn('r.questions')) + '</p>' +
            '<ul class="r-prompts">' + prompts + '</ul>' +
          '</div>' +
          '<p class="r-workshop">' + esc(dyn('r.workshop')) + '</p>' +
          '<div class="q-actions">' +
            '<button type="button" class="btn btn-ghost" data-q="retake">' + esc(dyn('r.retake')) + '</button>' +
            '<button type="button" class="btn btn-gold" data-q="workshop">' + esc(dyn('r.cta')) + '</button>' +
          '</div>' +
          '<p class="fineprint fineprint-dark">' + esc(dyn('r.disclaimer')) + '</p>' +
        '</div>';
    }

    function render() {
      if (!root) return;
      if (step < 0) renderIntro();
      else if (step < total()) renderQuestion();
      else renderResult();
    }

    function focusFirst() {
      var el = root.querySelector('.r-title, input[type=radio]:checked, input[type=radio], [data-q=start]');
      if (el) el.focus({ preventScroll: true });
      var body = root.closest('.modal-body'); if (body) body.scrollTop = 0;
    }

    function init() {
      root = $('#quizRoot');
      root.addEventListener('change', function (e) {
        if (e.target.matches('input[type=radio]')) {
          answers[step] = Number(e.target.value);
          var next = root.querySelector('[data-q=next]'); if (next) next.disabled = false;
        }
      });
      root.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && e.target.matches('input[type=radio]') && answers[step]) { e.preventDefault(); go(1); }
      });
      root.addEventListener('click', function (e) {
        var b = e.target.closest('[data-q]'); if (!b) return;
        var a = b.getAttribute('data-q');
        if (a === 'start') go(1);
        else if (a === 'next') go(1);
        else if (a === 'back') go(-1);
        else if (a === 'retake') { reset(); focusFirst(); }
        else if (a === 'workshop') {
          closeDialog($('#reflectionDialog'));
          var w = document.getElementById('workshop');
          w.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
        }
      });
      render();
    }

    function go(dir) {
      if (dir > 0 && step >= 0 && step < total() && !answers[step]) return;
      step = Math.max(-1, Math.min(total(), step + dir));
      render(); focusFirst();
    }

    function reset() { step = -1; answers = []; render(); }

    return { init: init, reset: reset, rerender: render, focus: focusFirst };
  })();

  /* ---------- Registration form ---------- */
  function clearErrors() {
    $$('.field-error').forEach(function (p) { p.textContent = ''; });
    $$('#regForm [aria-invalid]').forEach(function (i) { i.removeAttribute('aria-invalid'); i.removeAttribute('aria-describedby'); });
    var st = $('#formStatus'); if (st) { st.textContent = ''; st.className = 'form-status'; }
  }

  function setError(input, errId, msg) {
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', errId);
    $('#' + errId).textContent = msg;
  }

  function validate(form) {
    clearErrors();
    var ok = true, first = null;
    [['f-name', 'e-name'], ['f-org', 'e-org'], ['f-role', 'e-role']].forEach(function (p) {
      var i = $('#' + p[0]);
      if (!i.value.trim()) { setError(i, p[1], dyn('err.required')); ok = false; first = first || i; }
    });
    var email = $('#f-email');
    if (!email.value.trim()) { setError(email, 'e-email', dyn('err.required')); ok = false; first = first || email; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) { setError(email, 'e-email', dyn('err.email')); ok = false; first = first || email; }
    var consent = $('#f-consent');
    if (!consent.checked) { setError(consent, 'e-consent', dyn('err.consent')); ok = false; first = first || consent; }
    if (first) first.focus();
    return ok;
  }

  function showStatus(html, kind) {
    var st = $('#formStatus');
    st.className = 'form-status ' + (kind || '');
    st.innerHTML = html;
  }

  function paymentHTML() {
    var p = CFG.payment || {};
    var instr = pick(p.instructions);
    var out = '';
    if (p.url) out += '<a class="btn btn-gold btn-block" href="' + esc(p.url) + '" target="_blank" rel="noopener">' + esc(dyn('payBtn')) + '</a>';
    if (instr) out += '<h5>' + esc(dyn('payHeading')) + '</h5><p>' + esc(instr) + '</p>';
    if (!out) out = '<p class="muted">' + esc(dyn('payHeading')) + ': ' + placeholder('tbc') + '</p>';
    return out;
  }

  function initForm() {
    var form = $('#regForm');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!registrationState().open) return;
      if (!validate(form)) { showStatus(esc(dyn('err.summary')), 'is-error'); return; }
      if ($('#f-website').value) return; // honeypot triggered

      var data = {
        name: $('#f-name').value.trim(),
        email: $('#f-email').value.trim(),
        phone: $('#f-phone').value.trim(),
        organisation: $('#f-org').value.trim(),
        role: $('#f-role').value.trim(),
        preferred_language: $('#f-lang').value,
        message: $('#f-msg').value.trim(),
        consent: true,
        page_language: lang,
        workshop: 'Executive Mind Literacy — Five-Day Workshop (US$50)',
        submitted_at: new Date().toISOString()
      };

      var endpoint = CFG.registration && CFG.registration.formEndpoint;
      if (!endpoint) {
        var email = CFG.contact && CFG.contact.email;
        var html = '<p>' + esc(dyn('notOpen')) + '</p>';
        if (email) {
          var body = [data.name, data.email, data.phone, data.organisation, data.role, data.preferred_language, data.message].filter(Boolean).join('\n');
          html += '<a class="btn btn-outline-light btn-sm" href="mailto:' + esc(email) + '?subject=' + encodeURIComponent(dyn('mailSubject')) + '&body=' + encodeURIComponent(body) + '">' + esc(dyn('mailto')) + '</a>';
        }
        showStatus(html, 'is-info');
        return;
      }

      var btn = $('#regSubmit');
      var label = btn.innerHTML;
      btn.disabled = true; btn.textContent = dyn('sending');
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        form.hidden = true;
        $('#paymentBlock').innerHTML = paymentHTML();
        var ok = $('#formSuccess'); ok.hidden = false; ok.focus();
      }).catch(function () {
        showStatus(esc(dyn('sendFail')), 'is-error');
      }).then(function () {
        btn.disabled = false; btn.innerHTML = label;
      });
    });
  }

  /* ---------- boot ---------- */
  function initialLanguage() {
    var q = new URLSearchParams(location.search).get('lang');
    if (q === 'ar' || q === 'en') return q;
    var s = store('nubia-lang');
    if (s === 'ar' || s === 'en') return s;
    return (navigator.language || '').toLowerCase().indexOf('ar') === 0 ? 'ar' : 'en';
  }

  document.addEventListener('DOMContentLoaded', function () {
    $('#year').textContent = new Date().getFullYear();
    captureEnglish();
    quiz.init();
    initNav();
    initDialogs();
    initForm();
    applyLanguage(initialLanguage(), { initial: true });
    initReveal();
  });
})();
