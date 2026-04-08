/* =============================================
   ra:tio — script.js
   ============================================= */

/* ---- PRELOADER ---- */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('preloader').classList.add('gone');
    document.body.style.overflow = '';
  }, 1900);
  document.body.style.overflow = 'hidden';
});

/* ---- NAV SCROLL ---- */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

/* ---- BURGER / DRAWER ---- */
const burger = document.getElementById('burger');
const drawer = document.getElementById('drawer');

burger.addEventListener('click', () => {
  const isOpen = drawer.classList.toggle('open');
  burger.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

document.querySelectorAll('.drawer-link').forEach(link => {
  link.addEventListener('click', () => {
    drawer.classList.remove('open');
    burger.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ---- MENU DATA ---- */
const menuData = {
  espresso: [
    { name: 'Espresso', desc: 'Single shot. 18g in, 36g out. Our house blend — rotating seasonally.', price: '₹120', badge: 'Signature' },
    { name: 'Cortado', desc: '1:1 ratio of espresso to steamed milk. Balanced. Clean. No fluff.', price: '₹160' },
    { name: 'Flat White', desc: 'Double ristretto, microfoam. Silky, concentrated, no room for error.', price: '₹180', badge: 'Best Seller' },
    { name: 'Cappuccino', desc: 'Thirds: espresso, steamed milk, thick foam. Classic done right.', price: '₹170' },
    { name: 'Latte', desc: 'Double espresso stretched with 180ml of velvety steamed whole milk.', price: '₹190' },
    { name: 'Macchiato', desc: 'Espresso "stained" with a dot of foam. Purist order.', price: '₹140' },
  ],
  filter: [
    { name: 'Pour Over — V60', desc: 'Bright, clean extraction. Highlights floral and fruit notes.', price: '₹200', badge: 'Slow Brew' },
    { name: 'Chemex', desc: '6-cup brew for the table. Perfect for those who like to sit and stay.', price: '₹240' },
    { name: 'AeroPress', desc: 'Pressure-brewed. Smooth body, low acidity, high versatility.', price: '₹180' },
    { name: 'Batch Filter', desc: 'Our house drip — brewing all day, dialled fresh every 30 minutes.', price: '₹140' },
    { name: 'Single Origin Drip', desc: 'Ask the barista. The origin rotates weekly. Always interesting.', price: '₹210', badge: 'Ask Us' },
    { name: 'French Press', desc: '4-minute steep. Full body, textured, heavy mouthfeel.', price: '₹170' },
  ],
  cold: [
    { name: 'Cold Brew', desc: '18-hour steep. Smooth, low acidity, naturally sweet finish.', price: '₹200', badge: 'House Favourite' },
    { name: 'Nitro Cold Brew', desc: 'Cold brew on nitrogen tap. Cascading pour, creamy head. No milk needed.', price: '₹240' },
    { name: 'Iced Flat White', desc: 'Double ristretto over ice, topped with cold milk. Refreshing, not watered down.', price: '₹200' },
    { name: 'Cold Brew Tonic', desc: 'Cold brew over Indian tonic water. Divisive. We love it.', price: '₹220', badge: 'Divisive' },
    { name: 'Iced Latte', desc: 'Double espresso, ice, cold milk. Simple. We use full-fat only.', price: '₹190' },
    { name: 'Affogato', desc: 'A scoop of vanilla gelato drowned in a hot double espresso shot.', price: '₹180' },
  ],
  food: [
    { name: 'Avocado Toast', desc: 'Smashed avo on sourdough, chilli flakes, lemon zest, sea salt.', price: '₹280' },
    { name: 'Banana Bread', desc: 'Baked in-house. Pairs particularly well with the cortado.', price: '₹160', badge: 'Baked Fresh' },
    { name: 'Butter Croissant', desc: 'Flaky, laminated, still warm from the oven. Classic.', price: '₹140' },
    { name: 'Granola Bowl', desc: 'House granola, Greek yogurt, seasonal fruit, local honey.', price: '₹240' },
    { name: 'Egg on Toast', desc: 'Two ways — scrambled or poached. Good eggs, good bread.', price: '₹220' },
    { name: 'Cookie', desc: 'Chocolate chip or oat raisin. Baked to order. Goes with everything.', price: '₹80', badge: 'Ask for Warm' },
  ],
};

/* ---- RENDER MENU ---- */
const menuList = document.getElementById('menuList');
let activeCategory = 'espresso';

function renderMenu(cat) {
  const items = menuData[cat];
  menuList.style.opacity = '0';
  menuList.style.transform = 'translateY(8px)';

  setTimeout(() => {
    menuList.innerHTML = '';
    items.forEach(item => {
      const el = document.createElement('div');
      el.className = 'menu-item';
      el.innerHTML = `
        <div class="mi-left">
          <div class="mi-name">${item.name}</div>
          <div class="mi-desc">${item.desc}</div>
          ${item.badge ? `<span class="mi-badge">${item.badge}</span>` : ''}
        </div>
        <div class="mi-right">
          <div class="mi-price">${item.price}</div>
        </div>
      `;
      menuList.appendChild(el);
    });

    menuList.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
    menuList.style.opacity = '1';
    menuList.style.transform = 'translateY(0)';
  }, 200);
}

renderMenu('espresso');

document.querySelectorAll('.mtab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.mtab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeCategory = tab.dataset.cat;
    renderMenu(activeCategory);
  });
});

/* ---- REVEAL ON SCROLL ---- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

/* ---- STAGGER CRAFT CARDS ---- */
const craftObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    document.querySelectorAll('.craft-card').forEach((card, i) => {
      setTimeout(() => card.classList.add('visible'), i * 100);
    });
    craftObserver.disconnect();
  }
}, { threshold: 0.1 });

const craftGrid = document.querySelector('.craft-grid');
if (craftGrid) {
  craftGrid.querySelectorAll('[data-reveal]').forEach(el => {
    el.style.transitionDelay = '0s';
  });
  craftObserver.observe(craftGrid);
}

/* ---- SMOOTH SCROLL ---- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 64;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ---- ACTIVE NAV HIGHLIGHT ---- */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nl');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => {
        l.style.color = l.getAttribute('href') === `#${entry.target.id}`
          ? 'var(--white)'
          : '';
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => navObserver.observe(s));

/* ---- HERO CARD — live ratio counter ---- */
const ratioDisplay = document.querySelector('.card-ratio');
if (ratioDisplay) {
  const ratios = ['1:2', '1:2.5', '1:3', '1:1.5'];
  const descs = ['18g in · 36g out · 28s', '16g in · 40g out · 30s', '20g in · 60g out · 35s', '20g in · 30g out · 22s'];
  let idx = 0;
  setInterval(() => {
    idx = (idx + 1) % ratios.length;
    ratioDisplay.style.opacity = '0';
    const descEl = document.querySelector('.card-desc');
    setTimeout(() => {
      const [a, b] = ratios[idx].split(':');
      ratioDisplay.innerHTML = `${a}<span>:</span>${b}`;
      if (descEl) descEl.textContent = descs[idx];
      ratioDisplay.style.transition = 'opacity 0.4s';
      ratioDisplay.style.opacity = '1';
    }, 300);
  }, 3500);
}

/* ---- CLOSE DRAWER ON OUTSIDE CLICK ---- */
document.addEventListener('click', e => {
  if (drawer.classList.contains('open')
    && !drawer.contains(e.target)
    && !burger.contains(e.target)) {
    drawer.classList.remove('open');
    burger.classList.remove('open');
    document.body.style.overflow = '';
  }
});
