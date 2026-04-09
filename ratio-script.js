/* =============================================
   ra:tio — script.js  (v2 — Extraordinary Edition)

   Features:
   ✦ Preloader with canvas particle burst + glitch + counter
   ✦ Magnetic cursor with label mode
   ✦ Steam particle canvas (hero background)
   ✦ 3D card tilt on mouse (hero card + mosaic)
   ✦ Kinetic strip speed on scroll
   ✦ Split-word text reveal via IntersectionObserver
   ✦ [data-reveal] fade-up system
   ✦ Craft card stagger reveal
   ✦ Animated counter (stats band)
   ✦ Hero card ratio cycling with animated bar
   ✦ Menu tab switch with stagger entrance
   ✦ Scroll-driven parallax bg words
   ✦ Scroll progress bar
   ✦ Active nav highlight
   ✦ Mosaic card shine tracking
   ✦ Hamburger / drawer with staggered links
   ============================================= */

'use strict';

/* ─────────────────────────────────────────────
   UTILS
   ───────────────────────────────────────────── */
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const lerp = (a, b, t) => a + (b - a) * t;
const isMobile = () => window.innerWidth < 768;

/* ─────────────────────────────────────────────
   PRELOADER — canvas burst + glitch + counter
   ───────────────────────────────────────────── */
(function initPreloader() {
  const loader = $('#preloader');
  const bar    = $('#preBar');
  const pct    = $('#prePct');
  const canvas = $('#pre-canvas');
  if (!loader || !canvas) return;

  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  /* Particle burst */
  const particles = [];
  class Particle {
    constructor() { this.reset(true); }
    reset(initial) {
      const cx = canvas.width / 2, cy = canvas.height / 2;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 0.5;
      this.x = initial ? cx + (Math.random() - .5) * 200 : cx;
      this.y = initial ? cy + (Math.random() - .5) * 200 : cy;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.life = Math.random() * 80 + 40;
      this.maxLife = this.life;
      this.r = Math.random() * 2 + 0.5;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.98;
      this.vy *= 0.98;
      this.life--;
      if (this.life <= 0) this.reset(false);
    }
    draw() {
      const alpha = this.life / this.maxLife;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,146,42,${alpha * 0.7})`;
      ctx.fill();
    }
  }
  for (let i = 0; i < 80; i++) particles.push(new Particle());

  let animId;
  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    animId = requestAnimationFrame(drawParticles);
  }
  drawParticles();

  /* Progress counter */
  let progress = 0;
  const duration = 1800;
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    progress = clamp(elapsed / duration, 0, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const val = Math.round(eased * 100);
    if (bar) bar.style.width = val + '%';
    if (pct) pct.textContent = val + '%';
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      setTimeout(() => {
        loader.classList.add('gone');
        cancelAnimationFrame(animId);
        document.body.style.overflow = '';
        initAll(); // start everything after loader
      }, 300);
    }
  }
  requestAnimationFrame(tick);
  document.body.style.overflow = 'hidden';
})();

/* ─────────────────────────────────────────────
   MAIN INIT (called after preloader)
   ───────────────────────────────────────────── */
function initAll() {
  initCursor();
  initScrollBar();
  initNav();
  initDrawer();
  initSteamCanvas();
  initHeroCard();
  initKineticStrip();
  initSplitText();
  initReveal();
  initCraftCards();
  initMenuTabs();
  initCounters();
  initParallaxWords();
  initMosaicShine();
  initSmoothScroll();
}

/* ─────────────────────────────────────────────
   MAGNETIC CURSOR
   ───────────────────────────────────────────── */
function initCursor() {
  if (isMobile()) return;
  const dot   = $('#cursor-dot');
  const ring  = $('#cursor-ring');
  const label = $('#cursor-label');
  if (!dot || !ring) return;

  let mx = -100, my = -100, rx = -100, ry = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  });

  // smooth ring follow
  (function trackRing() {
    rx = lerp(rx, mx, 0.12);
    ry = lerp(ry, my, 0.12);
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    label.style.left = rx + 'px'; label.style.top = (ry + 30) + 'px';
    requestAnimationFrame(trackRing);
  })();

  // magnetic pull on [data-magnetic] elements
  $$('[data-magnetic]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = e.clientX - cx, dy = e.clientY - cy;
      el.style.transform = `translate(${dx * 0.25}px, ${dy * 0.25}px)`;
      document.body.classList.add('cur-hover');
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
      document.body.classList.remove('cur-hover');
      document.body.classList.remove('cur-label');
      label.textContent = '';
    });
    el.addEventListener('mouseenter', () => {
      const txt = el.dataset.cursorLabel;
      if (txt) {
        label.textContent = txt;
        document.body.classList.add('cur-label');
      }
    });
  });

  // generic hover
  $$('a:not([data-magnetic]), button:not([data-magnetic]), .m-card, .menu-grid').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cur-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cur-hover'));
  });
}

/* ─────────────────────────────────────────────
   SCROLL PROGRESS BAR
   ───────────────────────────────────────────── */
function initScrollBar() {
  const bar = $('#scroll-bar');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (window.scrollY / max * 100).toFixed(2) + '%';
  }, { passive: true });
}

/* ─────────────────────────────────────────────
   NAV SCROLL STATE
   ───────────────────────────────────────────── */
function initNav() {
  const header = $('#header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  // Active link
  const sections = $$('section[id]');
  const links    = $$('.nl');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => {
          l.style.color = l.getAttribute('href') === '#' + e.target.id ? 'var(--wht)' : '';
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => obs.observe(s));
}

/* ─────────────────────────────────────────────
   DRAWER (mobile)
   ───────────────────────────────────────────── */
function initDrawer() {
  const burger = $('#burger');
  const drawer = $('#drawer');
  if (!burger || !drawer) return;

  burger.addEventListener('click', () => {
    const open = drawer.classList.toggle('open');
    burger.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('.drawer-link').forEach(l => {
    l.addEventListener('click', () => {
      drawer.classList.remove('open');
      burger.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ─────────────────────────────────────────────
   STEAM CANVAS (hero background)
   ───────────────────────────────────────────── */
function initSteamCanvas() {
  const canvas = $('#steam-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const particles = [];
  class Steam {
    constructor() { this.init(); }
    init() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + 20;
      this.vx = (Math.random() - .5) * 0.6;
      this.vy = -(Math.random() * 1.2 + 0.6);
      this.r  = Math.random() * 20 + 8;
      this.life = 0;
      this.maxLife = Math.random() * 180 + 100;
      this.wobble = Math.random() * Math.PI * 2;
    }
    update() {
      this.life++;
      this.wobble += 0.02;
      this.x += this.vx + Math.sin(this.wobble) * 0.3;
      this.y += this.vy;
      this.r += 0.08;
      if (this.life >= this.maxLife || this.y < -50) this.init();
    }
    draw() {
      const alpha = Math.sin((this.life / this.maxLife) * Math.PI) * 0.12;
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
      g.addColorStop(0, `rgba(200,146,42,${alpha})`);
      g.addColorStop(1, 'rgba(200,146,42,0)');
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    }
  }

  for (let i = 0; i < 35; i++) {
    const s = new Steam();
    s.life = Math.random() * s.maxLife; // pre-age
    particles.push(s);
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
}

/* ─────────────────────────────────────────────
   HERO CARD — 3D tilt + ratio cycling
   ───────────────────────────────────────────── */
function initHeroCard() {
  const card = $('#heroCard');
  if (card) {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - .5;
      const y = (e.clientY - r.top)  / r.height - .5;
      card.style.transform = `perspective(800px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateY(0) rotateX(0) scale(1)';
      card.style.transition = 'transform .6s var(--ease)';
      setTimeout(() => card.style.transition = '', 600);
    });
  }

  // Ratio cycling
  const ratios = [
    { ratio: '1:2',   dose: '18g', yield: '36g', time: '28s', bar: '33%'  },
    { ratio: '1:2.5', dose: '16g', yield: '40g', time: '30s', bar: '40%'  },
    { ratio: '1:3',   dose: '20g', yield: '60g', time: '35s', bar: '50%'  },
    { ratio: '1:1.5', dose: '20g', yield: '30g', time: '22s', bar: '25%'  },
  ];
  let ri = 0;
  const ratioEl = $('#cardRatio');
  const doseEl  = $('#cpDose');
  const yieldEl = $('#cpYield');
  const timeEl  = $('#cpTime');
  const barEl   = $('#cardBar');

  function cycleRatio() {
    ri = (ri + 1) % ratios.length;
    const d = ratios[ri];
    [ratioEl, doseEl, yieldEl, timeEl].forEach(el => { if (el) el.style.opacity = '0'; });
    setTimeout(() => {
      if (ratioEl) {
        const [a, b] = d.ratio.split(':');
        ratioEl.innerHTML = `${a}<span class="cr-colon">:</span>${b}`;
      }
      if (doseEl)  doseEl.textContent  = d.dose;
      if (yieldEl) yieldEl.textContent = d.yield;
      if (timeEl)  timeEl.textContent  = d.time;
      if (barEl)   barEl.style.width   = d.bar;
      [ratioEl, doseEl, yieldEl, timeEl].forEach(el => {
        if (el) { el.style.transition = 'opacity .4s'; el.style.opacity = '1'; }
      });
    }, 300);
  }
  setInterval(cycleRatio, 3500);
}

/* ─────────────────────────────────────────────
   KINETIC STRIP — speed up on scroll
   ───────────────────────────────────────────── */
function initKineticStrip() {
  const fwd = $('.k-fwd .k-inner');
  const rev = $('.k-rev .k-inner');
  if (!fwd || !rev) return;

  let lastY = 0, vel = 0;
  window.addEventListener('scroll', () => {
    const dy = window.scrollY - lastY;
    vel = dy;
    lastY = window.scrollY;
    const speed = clamp(1 + Math.abs(dy) * 0.08, 1, 4);
    fwd.style.animationDuration = (20 / speed) + 's';
    rev.style.animationDuration = (25 / speed) + 's';
  }, { passive: true });
}

/* ─────────────────────────────────────────────
   SPLIT TEXT WORD REVEAL
   ───────────────────────────────────────────── */
function initSplitText() {
  $$('[data-split]').forEach(el => {
    const html = el.innerHTML;
    const parts = html.split(/(<br\s*\/?>|\s+)/);
    el.innerHTML = parts.map(p => {
      if (!p.trim() || p.match(/^<br/i)) return p;
      return `<span class="word"><span class="inner">${p}</span></span>`;
    }).join(' ');

    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        el.classList.add('revealed');
        obs.disconnect();
      }
    }, { threshold: 0.2 });
    obs.observe(el);
  });
}

/* ─────────────────────────────────────────────
   DATA-REVEAL (fade up)
   ───────────────────────────────────────────── */
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });
  $$('[data-reveal]').forEach(el => obs.observe(el));
}

/* ─────────────────────────────────────────────
   CRAFT CARDS stagger
   ───────────────────────────────────────────── */
function initCraftCards() {
  const grid = $('.craft-grid');
  if (!grid) return;
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      $$('.craft-card').forEach((c, i) => {
        setTimeout(() => c.classList.add('revealed'), i * 100);
      });
      obs.disconnect();
    }
  }, { threshold: 0.1 });
  obs.observe(grid);
}

/* ─────────────────────────────────────────────
   MENU TABS + STAGGER
   ───────────────────────────────────────────── */
const menuData = {
  espresso: [
    { name: 'Espresso',    desc: 'Single shot. 18g in, 36g out. Our house blend — rotating seasonally.', price: '₹120', badge: 'Signature' },
    { name: 'Cortado',     desc: '1:1 ratio of espresso to steamed milk. Balanced. Clean. No fluff.', price: '₹160' },
    { name: 'Flat White',  desc: 'Double ristretto, microfoam. Silky, concentrated, no room for error.', price: '₹180', badge: 'Best Seller' },
    { name: 'Cappuccino',  desc: 'Thirds: espresso, steamed milk, thick foam. Classic done right.', price: '₹170' },
    { name: 'Latte',       desc: 'Double espresso stretched with 180ml of velvety steamed whole milk.', price: '₹190' },
    { name: 'Macchiato',   desc: 'Espresso "stained" with a dot of foam. The purist order.', price: '₹140' },
  ],
  filter: [
    { name: 'Pour Over — V60', desc: 'Bright, clean extraction. Highlights floral and fruit notes.', price: '₹200', badge: 'Slow Brew' },
    { name: 'Chemex',     desc: '6-cup brew for the table. Perfect for those who like to sit and stay.', price: '₹240' },
    { name: 'AeroPress',  desc: 'Pressure-brewed. Smooth body, low acidity, high versatility.', price: '₹180' },
    { name: 'Batch Filter', desc: 'Our house drip — brewing all day, dialled fresh every 30 minutes.', price: '₹140' },
    { name: 'Single Origin Drip', desc: 'Ask the barista. The origin rotates weekly. Always interesting.', price: '₹210', badge: 'Ask Us' },
    { name: 'French Press', desc: '4-minute steep. Full body, textured, heavy mouthfeel.', price: '₹170' },
  ],
  cold: [
    { name: 'Cold Brew',   desc: '18-hour steep. Smooth, low acidity, naturally sweet finish.', price: '₹200', badge: 'House Fav' },
    { name: 'Nitro Cold Brew', desc: 'Cold brew on nitrogen tap. Cascading pour, creamy head.', price: '₹240' },
    { name: 'Iced Flat White', desc: 'Double ristretto over ice, topped with cold milk.', price: '₹200' },
    { name: 'Cold Brew Tonic', desc: 'Cold brew over Indian tonic water. Divisive. We love it.', price: '₹220', badge: 'Divisive' },
    { name: 'Iced Latte',  desc: 'Double espresso, ice, cold milk. Simple. We use full-fat only.', price: '₹190' },
    { name: 'Affogato',   desc: 'Vanilla gelato drowned in a hot double espresso shot.', price: '₹180' },
  ],
  food: [
    { name: 'Avocado Toast', desc: 'Smashed avo on sourdough, chilli flakes, lemon zest, sea salt.', price: '₹280' },
    { name: 'Banana Bread', desc: 'Baked in-house. Pairs particularly well with the cortado.', price: '₹160', badge: 'Baked Fresh' },
    { name: 'Butter Croissant', desc: 'Flaky, laminated, still warm from the oven. Classic.', price: '₹140' },
    { name: 'Granola Bowl', desc: 'House granola, Greek yogurt, seasonal fruit, local honey.', price: '₹240' },
    { name: 'Egg on Toast', desc: 'Two ways — scrambled or poached. Good eggs, good bread.', price: '₹220' },
    { name: 'Cookie',      desc: 'Chocolate chip or oat raisin. Ask for warm. Goes with everything.', price: '₹80', badge: 'Ask Warm' },
  ],
};

function initMenuTabs() {
  const grid = $('#menuGrid');
  if (!grid) return;
  let active = 'espresso';

  function render(cat, delay = 0) {
    grid.style.opacity = '0';
    grid.style.transform = 'translateY(8px)';
    setTimeout(() => {
      grid.innerHTML = menuData[cat].map((item, i) => `
        <div class="m-item" style="animation-delay:${i * 55}ms">
          <div>
            <div class="mi-name">${item.name}</div>
            <div class="mi-desc">${item.desc}</div>
            ${item.badge ? `<span class="mi-badge">${item.badge}</span>` : ''}
          </div>
          <div class="mi-price">${item.price}</div>
        </div>
      `).join('');
      grid.style.transition = 'opacity .35s ease, transform .35s ease';
      grid.style.opacity = '1';
      grid.style.transform = 'translateY(0)';
    }, delay);
  }
  render('espresso');

  $$('.mtab').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.cat === active) return;
      active = btn.dataset.cat;
      $$('.mtab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render(active, 200);
    });
  });
}

/* ─────────────────────────────────────────────
   ANIMATED COUNTERS
   ───────────────────────────────────────────── */
function initCounters() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el  = e.target;
      const end = parseFloat(el.dataset.count);
      const dec = parseInt(el.dataset.dec || '0');
      const sfx = el.dataset.sfx || '';
      const dur = 1600;
      const t0  = performance.now();

      function tick(now) {
        const p = clamp((now - t0) / dur, 0, 1);
        const ease = 1 - Math.pow(1 - p, 4);
        const val  = ease * end;
        el.textContent = val.toFixed(dec) + sfx;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.4 });
  $$('[data-count]').forEach(el => obs.observe(el));
}

/* ─────────────────────────────────────────────
   SCROLL-DRIVEN PARALLAX BG WORDS
   ───────────────────────────────────────────── */
function initParallaxWords() {
  const words = $$('[data-parallax]');
  if (!words.length) return;

  function update() {
    words.forEach(el => {
      const rect = el.parentElement.getBoundingClientRect();
      const speed = parseFloat(el.dataset.parallax);
      const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      const offset = (progress - .5) * 100 * speed;
      el.style.transform = `translateX(-50%) translateY(${offset}px)`;
    });
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ─────────────────────────────────────────────
   MOSAIC CARD 3D TILT + SHINE
   ───────────────────────────────────────────── */
function initMosaicShine() {
  $$('[data-tilt]').forEach(card => {
    const shine = card.querySelector('.mc-shine');
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const x  = (e.clientX - r.left) / r.width;
      const y  = (e.clientY - r.top)  / r.height;
      const rx = (y - .5) * -16;
      const ry = (x - .5) *  16;
      card.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.03)`;
      if (shine) {
        shine.style.setProperty('--mx', `${x * 100}%`);
        shine.style.setProperty('--my', `${y * 100}%`);
      }
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform .5s var(--ease), border-color .3s';
      setTimeout(() => card.style.transition = '', 500);
    });
  });
}

/* ─────────────────────────────────────────────
   SMOOTH ANCHOR SCROLL
   ───────────────────────────────────────────── */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) {
        e.preventDefault();
        t.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}
