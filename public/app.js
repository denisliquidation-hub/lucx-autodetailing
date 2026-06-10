(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(min-width: 960px) and (pointer: fine)').matches;

  /* ---------- Mobile slide-out menu ---------- */
  var toggle = document.getElementById('menuToggle');
  var menu = document.getElementById('mobileMenu');
  var backdrop = document.getElementById('menuBackdrop');
  var closeBtn = document.getElementById('menuClose');

  // elements that animate in, in DOM order (logo -> brand line -> links -> social -> CTA -> concierge -> footer)
  var seqEls = menu ? [].slice.call(menu.querySelectorAll(
    '.mm-head,.mm-brandline,.mm-link,.mm-social,.mm-cta,.mm-concierge,.mm-footer')) : [];
  var snapTimer;

  function openMenu() {
    if (!reduced) {
      seqEls.forEach(function (el, i) { el.style.transitionDelay = (0.1 + i * 0.08).toFixed(2) + 's'; });
    }
    backdrop.hidden = false;
    requestAnimationFrame(function () {
      menu.classList.add('open');
      backdrop.classList.add('show');
    });
    menu.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    document.body.classList.add('menu-open');
    // after the cascade finishes, drop the delays so hover/tap stays snappy
    clearTimeout(snapTimer);
    snapTimer = setTimeout(function () {
      seqEls.forEach(function (el) { el.style.transitionDelay = '0s'; });
    }, 1800);
  }
  function closeMenu() {
    menu.classList.remove('open');
    backdrop.classList.remove('show');
    menu.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    document.body.classList.remove('menu-open');
    clearTimeout(snapTimer);
    seqEls.forEach(function (el) { el.style.transitionDelay = ''; });
    setTimeout(function () { backdrop.hidden = true; }, 560);
  }
  if (toggle && menu && backdrop && closeBtn) {
    toggle.addEventListener('click', openMenu);
    closeBtn.addEventListener('click', closeMenu);
    backdrop.addEventListener('click', closeMenu);
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) closeMenu();
    });
  }

  // Gold atmosphere particles + subtle background parallax on menu scroll
  if (menu && !reduced) {
    var pc = menu.querySelector('.mm-particles');
    if (pc) {
      for (var pi = 0; pi < 16; pi++) {
        var sp = document.createElement('span');
        var sz = (Math.random() * 2 + 1).toFixed(1);
        sp.style.left = (Math.random() * 100).toFixed(1) + '%';
        sp.style.bottom = (-8 - Math.random() * 16).toFixed(0) + '%';
        sp.style.width = sz + 'px';
        sp.style.height = sz + 'px';
        sp.style.setProperty('--o', (0.06 + Math.random() * 0.16).toFixed(2));
        sp.style.animationDuration = (10 + Math.random() * 9).toFixed(1) + 's';
        sp.style.animationDelay = (-Math.random() * 14).toFixed(1) + 's';
        pc.appendChild(sp);
      }
    }
    var mmInner = menu.querySelector('.mm-inner');
    var mmBg = menu.querySelector('.mm-bg');
    if (mmInner && mmBg) {
      mmInner.addEventListener('scroll', function () {
        mmBg.style.transform = 'scale(1.08) translateY(' + Math.min(mmInner.scrollTop * 0.05, 14) + 'px)';
      }, { passive: true });
    }
  }

  /* ---------- Unified scroll handler (header + parallax + progress) ---------- */
  var header = document.getElementById('header');
  var heroBg = document.getElementById('heroBg');
  var progress = document.getElementById('scrollProgress');
  var doParallax = heroBg && !reduced && window.matchMedia('(min-width: 720px)').matches;
  var galleryImgs = document.querySelectorAll('.gd-media img');
  var doGalleryParallax = !reduced && window.matchMedia('(min-width: 720px)').matches && galleryImgs.length;
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var vh = window.innerHeight;
      var y = window.scrollY || document.documentElement.scrollTop;
      if (header) header.classList.toggle('scrolled', y > 24);
      if (doParallax && y < vh) {
        heroBg.style.transform = 'translateY(' + (y * 0.18) + 'px)';
      }
      if (progress) {
        var de = document.documentElement;
        var max = de.scrollHeight - de.clientHeight;
        progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
      }
      if (doGalleryParallax) {
        galleryImgs.forEach(function (img) {
          var r = img.getBoundingClientRect();
          if (r.bottom < 0 || r.top > vh) return;
          var prog = (r.top + r.height / 2 - vh / 2) / vh; // -0.5 .. 0.5
          img.style.transform = 'scale(1.06) translateY(' + (prog * -16).toFixed(1) + 'px)';
        });
      }
      ticking = false;
    });
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  /* ---------- Scroll reveal (with cascade inside grids) ---------- */
  document.querySelectorAll('.grid').forEach(function (grid) {
    var kids = grid.querySelectorAll('[data-reveal]');
    kids.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i * 0.08, 0.5) + 's';
    });
  });

  var reveals = document.querySelectorAll('[data-reveal]');
  if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var t = entry.target;
          t.classList.add('in');
          io.unobserve(t);
          // clear cascade delay so hover/tilt transitions stay snappy
          setTimeout(function () { t.style.transitionDelay = ''; }, 1300);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Count-up stats ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1500, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(dec) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(dec) + suffix;
    }
    requestAnimationFrame(step);
  }
  var nums = document.querySelectorAll('.stat-num');
  if (nums.length) {
    if (reduced || !('IntersectionObserver' in window)) {
      nums.forEach(function (el) {
        var t = parseFloat(el.getAttribute('data-count'));
        var d = parseInt(el.getAttribute('data-decimals') || '0', 10);
        el.textContent = t.toFixed(d) + (el.getAttribute('data-suffix') || '');
      });
    } else {
      var nio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { animateCount(entry.target); nio.unobserve(entry.target); }
        });
      }, { threshold: 0.5 });
      nums.forEach(function (el) { nio.observe(el); });
    }
  }

  /* ---------- Pointer effects (desktop only) ---------- */
  if (finePointer && !reduced) {
    // Magnetic primary buttons
    document.querySelectorAll('.btn-gold').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        btn.style.transform = 'translate(' + (x * 0.22) + 'px,' + (y * 0.32 - 2) + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });

    // Card 3D tilt + spotlight
    document.querySelectorAll('.lux-card, .coverage-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var x = e.clientX - r.left, y = e.clientY - r.top;
        var rx = ((y / r.height) - 0.5) * -5;
        var ry = ((x / r.width) - 0.5) * 5;
        card.style.setProperty('--mx', x + 'px');
        card.style.setProperty('--my', y + 'px');
        card.style.transform = 'perspective(900px) translateY(-6px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  }

  /* ---------- Before/After reveal (tap on touch, hover on desktop via CSS) ---------- */
  document.querySelectorAll('.gd-card').forEach(function (card) {
    card.addEventListener('click', function () { card.classList.toggle('revealed'); });
  });

  /* ---------- Premium draggable Before/After comparator ---------- */
  (function () {
    var stage = document.getElementById('baStage');
    if (!stage) return;

    function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

    var pos = 20;
    var dragging = false;
    var mode = reduced ? 'idle' : 'auto';   // 'auto' | 'user' | 'idle'
    var rafId = null, lastT = null, phase = 0;
    var resumeTimer = null;

    function setPos(p) {
      pos = clamp(p, 0.5, 99.5);
      stage.style.setProperty('--pos', pos.toFixed(2));
      stage.setAttribute('aria-valuenow', Math.round(pos));
    }

    // --- auto demo: pos = 50 - 30*cos(phase), 7s period, resumes from current pos ---
    function autoFrame(t) {
      if (mode !== 'auto') { rafId = null; return; }
      if (lastT === null) lastT = t;
      phase += ((t - lastT) / 1000) * (2 * Math.PI / 7);
      lastT = t;
      setPos(50 - 30 * Math.cos(phase));
      rafId = requestAnimationFrame(autoFrame);
    }
    function startAuto() {
      if (reduced || rafId !== null) return;
      phase = Math.acos(clamp((50 - pos) / 30, -1, 1)); // continue upward from current pos
      lastT = null;
      rafId = requestAnimationFrame(autoFrame);
    }
    function stopAuto() { if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; } }

    function userTakeover() {
      mode = 'user';
      stopAuto();
      if (resumeTimer) clearTimeout(resumeTimer);
      if (!reduced) resumeTimer = setTimeout(function () { mode = 'auto'; startAuto(); }, 5000);
    }

    // --- pointer drag (mouse + touch unified) ---
    var pendingX = null, rafPending = false;
    function flush() {
      rafPending = false;
      if (pendingX === null) return;
      var r = stage.getBoundingClientRect();
      setPos((pendingX - r.left) / r.width * 100);
      pendingX = null;
    }
    function queue(x) { pendingX = x; if (!rafPending) { rafPending = true; requestAnimationFrame(flush); } }

    stage.addEventListener('pointerdown', function (e) {
      dragging = true;
      stage.classList.add('dragging');
      if (stage.setPointerCapture) { try { stage.setPointerCapture(e.pointerId); } catch (_) {} }
      userTakeover();
      queue(e.clientX);
      e.preventDefault();
    });
    stage.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      userTakeover();
      queue(e.clientX);
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove('dragging');
    }
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);

    // --- keyboard ---
    stage.addEventListener('keydown', function (e) {
      var step = e.shiftKey ? 10 : 3;
      if (e.key === 'ArrowLeft') { userTakeover(); setPos(pos - step); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { userTakeover(); setPos(pos + step); e.preventDefault(); }
      else if (e.key === 'Home') { userTakeover(); setPos(0); e.preventDefault(); }
      else if (e.key === 'End') { userTakeover(); setPos(100); e.preventDefault(); }
    });

    setPos(reduced ? 50 : 20);
    if (mode === 'auto') startAuto();
  })();
})();
