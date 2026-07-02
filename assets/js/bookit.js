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
})();
