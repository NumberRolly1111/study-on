/* Study On — интерактив сайта (работает на всех страницах) */
(function () {
  'use strict';

  var PHONE = '77008250388';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function waLink(text) {
    return 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(text);
  }

  /* ---------- год в подвале ---------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- кнопки WhatsApp ---------- */
  $$('[data-wa]').forEach(function (a) {
    var topic = a.getAttribute('data-topic');
    var msg = topic
      ? 'Здравствуйте! Хочу узнать про Study On: ' + topic + '.'
      : 'Здравствуйте! Хочу записаться на бесплатный пробный урок в Study On.';
    a.href = waLink(msg);
    a.target = '_blank';
    a.rel = 'noopener';
  });

  /* ---------- шапка + прогресс прокрутки ---------- */
  var header = $('#header');
  var bar = $('.progress');
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (header) header.classList.toggle('scrolled', y > 30);
    if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(y / h, 1) : 0) + ')';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- логотип: по клику только анимация переключателя ---------- */
  $$('a.logo').forEach(function (logo) {
    logo.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
      e.preventDefault();
      if (logo.classList.contains('flip')) return;
      logo.classList.add('flip');
      setTimeout(function () { logo.classList.remove('flip'); }, 1000);
    });
  });

  /* ---------- заставка: STUDY OFF → переключатель → STUDY ON ---------- */
  (function () {
    var ld = document.getElementById('loader');
    if (!ld || !document.documentElement.classList.contains('has-loader')) return;
    try { sessionStorage.setItem('so_loaded', '1'); } catch (e) {}
    var slot = ld.querySelector('.ls');
    var off = ld.querySelector('.ls-off');
    var on = ld.querySelector('.ls-on');
    setTimeout(function () {
      if (slot && off && on) {
        slot.style.width = off.offsetWidth + 'px';
        void slot.offsetWidth;
        slot.style.width = on.offsetWidth + 'px';
      }
      ld.classList.add('on');
    }, 1700);
    setTimeout(function () { document.documentElement.classList.add('ld-out'); ld.classList.add('done'); }, 3200);
    setTimeout(function () {
      if (ld.parentNode) ld.parentNode.removeChild(ld);
      document.documentElement.classList.remove('has-loader', 'ld-out');
    }, 3900);
  })();

  /* ---------- мобильное меню ---------- */
  var burger = $('#burger');
  var nav = $('#nav');
  if (burger && nav) {
    var setMenu = function (open) {
      nav.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
    $$('a', nav).forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
    /* клик мимо панели и по кнопке выбора города закрывает меню */
    document.addEventListener('click', function (e) {
      if (burger.getAttribute('aria-expanded') !== 'true') return;
      if (e.target.closest('#nav, #burger')) return;
      setMenu(false);
    });
  }

  /* ---------- тумблер «English: ON» ---------- */
  var sw = $('#heroSwitch');
  if (sw) {
    var setSwitch = function (on) { sw.setAttribute('aria-checked', on ? 'true' : 'false'); };
    sw.addEventListener('click', function () {
      setSwitch(sw.getAttribute('aria-checked') !== 'true');
    });
    setTimeout(function () { setSwitch(true); }, reduce ? 0 : 900);
  }

  /* ---------- появление блоков ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el, i) {
      el.style.setProperty('--d', ((i % 4) * 0.08) + 's');
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- счётчики ---------- */
  var counters = $$('[data-count]');
  function runCounter(el) {
    var end = parseFloat(el.getAttribute('data-count'));
    var dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var suf = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = end.toFixed(dec) + suf; return; }
    var start = null, dur = 1400;
    function tick(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (end * eased).toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCounter(en.target); co.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  }

  /* ---------- тест уровня: A1 → C1, чем дальше, тем сложнее ---------- */
  if ($('#quiz')) {
    /* формат: [вопрос, правильный ответ, неверные варианты] */
    var TIERS = [
      { id: 'A1', name: 'Beginner', qs: [
        ['She ___ a student.', 'is', ['am', 'are', 'be']],
        ['___ you like coffee?', 'Do', ['Does', 'Are', 'Is']],
        ['There ___ two books on the table.', 'are', ['is', 'be', 'am']],
        ['My brother ___ in a bank.', 'works', ['work', 'working', 'is work']],
        ['This is my sister. ___ name is Aigerim.', 'Her', ['She', 'Hers', 'He']]
      ] },
      { id: 'A2', name: 'Elementary', qs: [
        ['Yesterday we ___ to the cinema.', 'went', ['go', 'gone', 'going']],
        ['Look! It ___ outside.', 'is raining', ['rains', 'rained', 'rain']],
        ['He is ___ than his brother.', 'taller', ['tall', 'the tallest', 'more tall']],
        ['You ___ smoke here. It is forbidden.', "mustn't", ["don't have to", "needn't", 'may']],
        ["I haven't seen him ___ Monday.", 'since', ['for', 'from', 'during']]
      ] },
      { id: 'B1', name: 'Intermediate', qs: [
        ['If it rains tomorrow, we ___ at home.', 'will stay', ['stay', 'would stay', 'stayed']],
        ['I ___ in Astana since 2020.', 'have lived', ['live', 'am living', 'lived']],
        ["I'm not used to ___ up so early.", 'getting', ['get', 'got', 'gets']],
        ['The book ___ by millions of people.', 'has been read', ['has read', 'is reading', 'was reading']],
        ['You look tired. You ___ get more sleep.', 'should', ['must to', 'can to', 'would']],
        ['She said she ___ come to the party.', "wouldn't", ["won't", "doesn't", 'not']]
      ] },
      { id: 'B2', name: 'Upper-Intermediate', qs: [
        ['If I ___ more free time, I would learn to play the guitar.', 'had', ['have', 'would have', 'will have']],
        ['By the time we arrived, the movie ___.', 'had already started', ['already started', 'has already started', 'was already starting']],
        ["I'd rather you ___ smoke in here.", "didn't", ["don't", "won't", "wouldn't"]],
        ['He denied ___ the window.', 'breaking', ['to break', 'break', 'to have broke']],
        ['Not only ___ late, but he also forgot the documents.', 'did he come', ['he came', 'he did come', 'came he']],
        ['I wish I ___ that email yesterday.', "hadn't sent", ["didn't send", "wouldn't send", "haven't sent"]]
      ] },
      { id: 'C1', name: 'Advanced', qs: [
        ['Had I known about the delay, I ___ earlier.', 'would have left', ['would leave', 'will have left', 'had left']],
        ['The committee insisted that he ___ the report by Friday.', 'submit', ['submits', 'submitted', 'is submitting']],
        ['She is said ___ the best lawyer in the city.', 'to be', ['being', 'to have being', 'that is']],
        ['Hardly ___ the room when the phone rang.', 'had he entered', ['he had entered', 'he entered', 'did he enter']],
        ['It never ___ my mind that he might be lying.', 'crossed', ['came', 'went', 'passed']],
        ['The company decided to ___ its workforce to cut costs.', 'downsize', ['downgrade', 'downplay', 'downfall']]
      ] }
    ];
    var PASS = 0.7; /* порог уровня: 70% верных (4 из 5, 5 из 6) */
    var LEVELS = {
      A0: { badge: 'A0', name: 'Начинающий (Beginner с нуля)', text: 'Базовые конструкции пока даются с трудом, и это нормально. Лучше начать с Level 1 · Beginner: освоите первые фразы и основу для разговора.', book: 'Level 1 Beginner (с нуля)' },
      A1: { badge: 'A1', name: 'Beginner', text: 'База есть, но простые времена и конструкции нужно закрепить. Вам подойдёт Level 1 · Beginner.', book: 'Level 1 Beginner' },
      A2: { badge: 'A2', name: 'Elementary', text: 'Вы справляетесь с простыми ситуациями. Вам подойдёт Level 2 · Elementary: расширим словарь и научимся поддерживать диалог.', book: 'Level 2 Elementary' },
      B1: { badge: 'B1', name: 'Intermediate', text: 'Уверенная база: вы можете объясниться в большинстве ситуаций. Подберём группу для продолжающих, чтобы говорить свободнее.', book: 'Intermediate' },
      B2: { badge: 'B2', name: 'Upper-Intermediate', text: 'Сильный уровень. Подберём группу или Speaking Club, где будет много практики речи на высоком уровне.', book: 'Upper-Intermediate' },
      C1: { badge: 'C1', name: 'Advanced', text: 'Очень высокий уровень, вы уверенно владеете сложной грамматикой. Подойдёт Speaking Club с носителями и разговорная практика.', book: 'Advanced / Speaking Club' }
    };

    var shuffle = function (arr) {
      for (var i = arr.length - 1; i > 0; i--) {
        var k = Math.floor(Math.random() * (i + 1));
        var t = arr[i]; arr[i] = arr[k]; arr[k] = t;
      }
      return arr;
    };

    var ti = 0, qi = 0, tierScore = 0, asked = 0, locked = false, results = [], cur = null;
    var total = TIERS.reduce(function (n, t) { return n + t.qs.length; }, 0);
    var elStep = $('#qStep'), elBar = $('#qBar'), elTitle = $('#qTitle'), elOpts = $('#qOpts');
    var elRes = $('#qResult'), top = $('.quiz-top');

    var need = function (tier) { return Math.ceil(tier.qs.length * PASS - 0.001); };

    var addOpt = function (text, key, cls, handler) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'opt' + (cls ? ' ' + cls : '');
      var k = document.createElement('span');
      k.className = 'k';
      k.textContent = key;
      b.appendChild(k);
      b.appendChild(document.createTextNode(text));
      b.addEventListener('click', handler);
      elOpts.appendChild(b);
    };

    var renderQ = function () {
      var tier = TIERS[ti], item = tier.qs[qi];
      locked = false;
      cur = { ok: item[1] };
      elStep.textContent = 'Вопрос ' + (asked + 1) + ' · уровень ' + tier.id;
      elBar.style.width = (asked / total * 100) + '%';
      elTitle.textContent = item[0];
      elOpts.innerHTML = '';
      shuffle([item[1]].concat(item[2])).forEach(function (text, i) {
        var btn;
        addOpt(text, String.fromCharCode(65 + i), '', function (e) { pick(text === cur.ok, e.currentTarget); });
      });
      addOpt('Не знаю', '?', 'idk', function (e) { pick(false, e.currentTarget); });
    };

    var pick = function (correct, btn) {
      if (locked) return;
      locked = true;
      btn.classList.add('picked');
      if (correct) tierScore++;
      asked++;
      setTimeout(function () {
        qi++;
        var tier = TIERS[ti];
        if (qi < tier.qs.length) { renderQ(); return; }
        /* уровень закончился: проверяем, пройден ли он */
        var passed = tierScore >= need(tier);
        results.push({ id: tier.id, score: tierScore, of: tier.qs.length, passed: passed });
        if (!passed || ti === TIERS.length - 1) { showResult(); return; }
        ti++; qi = 0; tierScore = 0;
        renderQ();
      }, reduce ? 0 : 320);
    };

    var showResult = function () {
      var lastPassed = null;
      results.forEach(function (r) { if (r.passed) lastPassed = r.id; });
      var lvl = LEVELS[lastPassed || 'A0'];
      var correctTotal = results.reduce(function (n, r) { return n + r.score; }, 0);
      top.hidden = true;
      elTitle.hidden = true;
      elOpts.hidden = true;
      elRes.hidden = false;
      $('#qBadge').textContent = lvl.badge;
      $('#qLevel').textContent = lvl.name;
      $('#qText').textContent = lvl.text + ' Результат ориентировочный, точный уровень определит преподаватель.';
      var br = $('#qBreak');
      if (br) {
        br.innerHTML = '';
        results.forEach(function (r) {
          var row = document.createElement('div');
          row.className = 'qb-row' + (r.passed ? ' ok' : ' no');
          var l = document.createElement('b'); l.textContent = r.id;
          var bar = document.createElement('i'); var fill = document.createElement('span');
          fill.style.width = (r.score / r.of * 100) + '%'; bar.appendChild(fill);
          var n = document.createElement('em'); n.textContent = r.score + ' из ' + r.of;
          row.appendChild(l); row.appendChild(bar); row.appendChild(n);
          br.appendChild(row);
        });
      }
      var detail = results.map(function (r) { return r.id + ' ' + r.score + '/' + r.of; }).join(', ');
      $('#qWa').href = waLink('Здравствуйте! Прошёл(ла) тест уровня на сайте Study On: ' + detail +
        ', ориентировочный уровень ' + lvl.badge + ' (' + lvl.book + '). Хочу записаться и уточнить группу.');
    };

    $('#qRestart').addEventListener('click', function () {
      ti = 0; qi = 0; tierScore = 0; asked = 0; results = [];
      elRes.hidden = true;
      top.hidden = false;
      elTitle.hidden = false;
      elOpts.hidden = false;
      renderQ();
    });
    renderQ();
  }

  /* ---------- слайдер отзывов (если есть) ---------- */
  var slider = $('#slider');
  if (slider) {
    var slideBy = function (dir) {
      var card = $('.rev', slider);
      var step = card ? card.getBoundingClientRect().width + 20 : 300;
      slider.scrollBy({ left: dir * step, behavior: reduce ? 'auto' : 'smooth' });
    };
    $('#rPrev').addEventListener('click', function () { slideBy(-1); });
    $('#rNext').addEventListener('click', function () { slideBy(1); });
    slider.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') slideBy(1);
      if (e.key === 'ArrowLeft') slideBy(-1);
    });
  }

  /* ---------- лайтбокс галереи ---------- */
  var lb = $('#lb');
  if (lb && typeof lb.showModal === 'function') {
    $$('[data-lb]').forEach(function (b) {
      b.addEventListener('click', function () {
        $('#lbImg').src = b.getAttribute('data-lb');
        $('#lbImg').alt = b.getAttribute('data-cap') || '';
        $('#lbCap').textContent = b.getAttribute('data-cap') || '';
        lb.showModal();
      });
    });
    $('#lbClose').addEventListener('click', function () { lb.close(); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  }

  /* ---------- FAQ: плавное раскрытие ---------- */
  var EASE = 'cubic-bezier(.2,.7,.2,1)';
  $$('.faq details').forEach(function (d) {
    var sum = $('summary', d);
    var body = $('p', d);
    var anim = null;
    var closing = false;
    d.classList.toggle('is-open', d.open);

    sum.addEventListener('click', function (e) {
      e.preventDefault();
      if (reduce) {
        d.open = !d.open;
        d.classList.toggle('is-open', d.open);
        return;
      }
      var start = d.offsetHeight;
      var willOpen = closing || !d.open;
      if (anim) { anim.onfinish = null; anim.cancel(); }

      var end;
      if (willOpen) {
        d.open = true;
        end = d.offsetHeight;
        body.animate(
          { opacity: [0, 1], transform: ['translateY(-8px)', 'translateY(0)'] },
          { duration: 420, easing: EASE, delay: 60, fill: 'backwards' }
        );
      } else {
        end = sum.offsetHeight + (d.offsetHeight - d.clientHeight);
      }
      closing = !willOpen;
      d.classList.toggle('is-open', willOpen);
      d.style.overflow = 'hidden';
      anim = d.animate({ height: [start + 'px', end + 'px'] }, { duration: 380, easing: EASE });
      anim.onfinish = function () {
        d.open = willOpen;
        d.style.overflow = '';
        anim = null;
        closing = false;
      };
    });
  });


  /* ---------- хранилище (с защитой от блокировки) ---------- */
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  };

  /* ---------- карта: только после согласия ---------- */
  var mapFrame = $('#mapFrame');
  var mapPh = $('#mapPh');
  function loadMap() {
    if (!mapFrame || mapFrame.getAttribute('src')) return;
    mapFrame.src = mapFrame.getAttribute('data-src');
    mapFrame.hidden = false;
    if (mapPh) mapPh.hidden = true;
  }
  if (mapPh && $('#mapLoad')) $('#mapLoad').addEventListener('click', loadMap);
  if (store.get('so_consent') === 'all') loadMap();

  /* ---------- плашка cookie ---------- */
  var cookieBar = $('#cookie');
  function showCookie() {
    if (!cookieBar || store.get('so_consent') || !cookieBar.hidden) return;
    cookieBar.hidden = false;
    document.body.classList.add('has-cookie');
    requestAnimationFrame(function () { requestAnimationFrame(function () { cookieBar.classList.add('show'); }); });
  }
  function hideCookie() {
    cookieBar.classList.remove('show');
    document.body.classList.remove('has-cookie');
    setTimeout(function () { cookieBar.hidden = true; }, reduce ? 0 : 450);
  }
  $$('[data-cookie]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var v = btn.getAttribute('data-cookie');
      store.set('so_consent', v);
      hideCookie();
      if (v === 'all') loadMap();
    });
  });

  /* плашка cookie отключена: карта грузится по кнопке «Показать карту» */

  /* ---------- форма → WhatsApp ---------- */
  var form = $('#lead');
  if (form) {
    var err = $('#formErr');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var phone = form.phone.value.trim();
      var okName = name.length >= 2;
      var okPhone = phone.replace(/\D/g, '').length >= 10;
      form.name.classList.toggle('bad', !okName);
      form.phone.classList.toggle('bad', !okPhone);
      err.hidden = okName && okPhone;
      if (!okName || !okPhone) {
        (okName ? form.phone : form.name).focus();
        return;
      }
      var text = 'Здравствуйте! Меня зовут ' + name + '. Хочу записаться на бесплатный пробный урок в Study On.\n' +
        'Мой уровень: ' + form.level.value + '.\nТелефон: ' + phone;
      window.open(waLink(text), '_blank', 'noopener');
    });
    ['input', 'change'].forEach(function (ev) {
      form.addEventListener(ev, function (e) {
        if (e.target.classList) e.target.classList.remove('bad');
        err.hidden = true;
      });
    });
  }
})();
