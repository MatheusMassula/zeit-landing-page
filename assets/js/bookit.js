/* Bookit landing — interactions
   Ported from the Claude Design "Bookit Landing.dc.html" prototype:
   scroll-reveal, hero phone parallax, sticky-nav shadow, and the
   light/dark theme toggle with localStorage persistence.
   Float/pulse animations live in CSS; motion is gated on the CSS
   prefers-reduced-motion query, so this script mirrors that. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  /* ---------- Theme toggle ---------- */
  function currentTheme() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function syncToggleIcon() {
    var icon = document.querySelector('[data-theme-toggle] .material-symbols-outlined');
    if (icon) icon.textContent = currentTheme() === 'dark' ? 'light_mode' : 'dark_mode';
  }

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem('bk-theme', theme); } catch (e) {}
    syncToggleIcon();
  }

  syncToggleIcon();

  var toggle = document.querySelector('[data-theme-toggle]');
  if (toggle) {
    toggle.addEventListener('click', function () {
      setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
    });
  }

  /* ---------- Smooth-scroll for same-page anchors (#baixar / #topo) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href').slice(1);
      if (!id) return;
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.pageYOffset - 40;
      window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Sticky-nav shadow on scroll ---------- */
  var nav = document.querySelector('[data-nav]');
  function onScroll() {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll-reveal ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));

  function revealAll() {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var siblings = Array.prototype.filter.call(el.parentNode.children, function (n) {
          return n.hasAttribute && n.hasAttribute('data-reveal');
        });
        var i = Math.max(0, siblings.indexOf(el));
        if (siblings.length > 1) el.style.transitionDelay = ((i % 4) * 70) + 'ms';
        el.classList.add('is-visible');
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Hero phone mouse parallax ---------- */
  if (!reduceMotion) {
    var hero = document.querySelector('[data-hero]');
    var phoneWrap = document.querySelector('[data-phone-wrap]');
    if (hero && phoneWrap) {
      window.addEventListener('mousemove', function (ev) {
        var r = hero.getBoundingClientRect();
        var dx = (ev.clientX - (r.left + r.width / 2)) / r.width;
        var dy = (ev.clientY - (r.top + r.height / 2)) / r.height;
        phoneWrap.style.transform = 'translate(' + (dx * 16).toFixed(1) + 'px,' + (dy * 16).toFixed(1) + 'px)';
      });
    }
  }

  /* ---------- Hero screenshot rotation ---------- */
  (function () {
    var wrap = document.querySelector('[data-phone-wrap]');
    var dotsWrap = document.querySelector('[data-hero-dots]');
    if (!wrap || !dotsWrap) return;

    var images;
    try { images = JSON.parse(wrap.getAttribute('data-hero-images') || '[]'); }
    catch (e) { images = []; }
    if (!images || images.length < 2) return;

    var lightBase = wrap.getAttribute('data-hero-light') || '';
    var darkBase = wrap.getAttribute('data-hero-dark') || '';
    var imgLight = wrap.querySelector('.bk-phone--light');
    var imgDark = wrap.querySelector('.bk-phone--dark');
    if (!imgLight || !imgDark) return;

    var current = 0;
    var timer = null;
    var INTERVAL = 4000;

    var dots = images.map(function (name, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'bk-hero__dot' + (i === 0 ? ' is-active' : '');
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', 'Captura ' + (i + 1));
      b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      b.addEventListener('click', function () { show(i); restart(); });
      dotsWrap.appendChild(b);
      return b;
    });

    function show(i) {
      current = ((i % images.length) + images.length) % images.length;
      var name = images[current];
      var swap = function () {
        imgLight.src = lightBase + '/' + name;
        imgDark.src = darkBase + '/' + name;
      };
      if (reduceMotion) {
        swap();
      } else {
        wrap.classList.add('is-fading');
        window.setTimeout(function () {
          swap();
          wrap.classList.remove('is-fading');
        }, 300);
      }
      dots.forEach(function (d, di) {
        var active = di === current;
        d.classList.toggle('is-active', active);
        d.setAttribute('aria-selected', active ? 'true' : 'false');
      });
    }

    function restart() {
      if (timer) { window.clearInterval(timer); timer = null; }
      if (reduceMotion) return;
      timer = window.setInterval(function () { show(current + 1); }, INTERVAL);
    }

    wrap.addEventListener('click', function () { show(current + 1); restart(); });

    if (!reduceMotion) {
      wrap.addEventListener('mouseenter', function () {
        if (timer) { window.clearInterval(timer); timer = null; }
      });
      wrap.addEventListener('mouseleave', restart);
    }

    restart();
  })();
})();
