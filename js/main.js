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

  /* ---------- мини-тест уровня ---------- */
  if ($('#quiz')) {
    var QUESTIONS = [
      { q: 'She ___ a student.', o: ['am', 'is', 'are'], a: 1 },
      { q: 'I ___ coffee every morning.', o: ['drink', 'drinks', 'drinking'], a: 0 },
      { q: 'There ___ two books on the table.', o: ['is', 'are', 'be'], a: 1 },
      { q: 'Yesterday we ___ to the cinema.', o: ['go', 'gone', 'went'], a: 2 },
      { q: 'I ___ in Astana since 2020.', o: ['live', 'have lived', 'am living'], a: 1 },
      { q: 'If it rains tomorrow, we ___ at home.', o: ['stay', 'will stay', 'would stay'], a: 1 },
      { q: 'He asked me where ___.', o: ['I lived', 'did I live', 'do I live'], a: 0 },
      { q: 'This is the ___ film I have ever seen.', o: ['more good', 'better', 'best'], a: 2 },
      { q: 'I wish I ___ more free time.', o: ['have', 'had', 'would have'], a: 1 },
      { q: 'By the time we arrived, the movie ___.', o: ['already started', 'had already started', 'has already started'], a: 1 }
    ];
    var LEVELS = [
      { max: 3, badge: 'A1', name: 'Начальный уровень (Beginner)', text: 'Лучше начать с Level 1 · Beginner: освоите базовую лексику и первые фразы для разговора.', book: 'Level 1 Beginner' },
      { max: 5, badge: 'A2', name: 'Базовый уровень (Elementary)', text: 'Вам подойдёт Level 2 · Elementary: расширим словарь и научимся поддерживать простой диалог.', book: 'Level 2 Elementary' },
      { max: 7, badge: 'B1', name: 'Средний уровень (Intermediate)', text: 'У вас уверенная база. Подберём группу для продолжающих, чтобы говорить свободнее.', book: 'Intermediate' },
      { max: 10, badge: 'B2', name: 'Выше среднего (Upper-Intermediate)', text: 'Отличный результат! Подберём группу, где будет много практики речи на высоком уровне.', book: 'Upper-Intermediate' }
    ];

    var qi = 0, score = 0, locked = false;
    var elStep = $('#qStep'), elBar = $('#qBar'), elTitle = $('#qTitle'), elOpts = $('#qOpts');
    var elRes = $('#qResult'), top = $('.quiz-top');

    var renderQ = function () {
      var item = QUESTIONS[qi];
      locked = false;
      elStep.textContent = 'Вопрос ' + (qi + 1) + ' из ' + QUESTIONS.length;
      elBar.style.width = (qi / QUESTIONS.length * 100) + '%';
      elTitle.textContent = item.q;
      elOpts.innerHTML = '';
      item.o.forEach(function (text, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'opt';
        var k = document.createElement('span');
        k.className = 'k';
        k.textContent = String.fromCharCode(65 + i);
        b.appendChild(k);
        b.appendChild(document.createTextNode(text));
        b.addEventListener('click', function () { pick(i, b); });
        elOpts.appendChild(b);
      });
    };

    var pick = function (i, btn) {
      if (locked) return;
      locked = true;
      btn.classList.add('picked');
      if (i === QUESTIONS[qi].a) score++;
      setTimeout(function () {
        qi++;
        if (qi < QUESTIONS.length) renderQ(); else showResult();
      }, reduce ? 0 : 320);
    };

    var showResult = function () {
      var lvl = LEVELS.filter(function (l) { return score <= l.max; })[0] || LEVELS[LEVELS.length - 1];
      top.hidden = true;
      elTitle.hidden = true;
      elOpts.hidden = true;
      elRes.hidden = false;
      $('#qBadge').textContent = lvl.badge;
      $('#qLevel').textContent = lvl.name;
      $('#qText').textContent = 'Правильных ответов: ' + score + ' из ' + QUESTIONS.length + '. ' + lvl.text +
        ' Результат ориентировочный, точный уровень определит преподаватель.';
      $('#qWa').href = waLink('Здравствуйте! Прошёл(ла) мини-тест на сайте Study On: ' + score + ' из ' + QUESTIONS.length +
        ', ориентировочный уровень: ' + lvl.book + '. Хочу записаться и уточнить группу.');
    };

    $('#qRestart').addEventListener('click', function () {
      qi = 0; score = 0;
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

  /* ---------- выбор города ---------- */
  var cityDlg = $('#cityDlg');
  var cityBtn = $('#cityBtn');
  if (cityDlg && typeof cityDlg.showModal === 'function') {
    if (cityBtn) cityBtn.addEventListener('click', function () { cityDlg.showModal(); });
    $$('[data-city]', cityDlg).forEach(function (el) {
      el.addEventListener('click', function () {
        store.set('so_city', el.getAttribute('data-city'));
        cityDlg.close();
      });
    });
    cityDlg.addEventListener('click', function (e) { if (e.target === cityDlg) cityDlg.close(); });
    cityDlg.addEventListener('close', function () {
      store.set('so_city_seen', '1');
      setTimeout(showCookie, 300);
    });
    if (!store.get('so_city_seen')) {
      setTimeout(function () { if (!cityDlg.open) cityDlg.showModal(); }, 700);
    } else {
      setTimeout(showCookie, 900);
    }
  } else {
    setTimeout(showCookie, 900);
  }

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
