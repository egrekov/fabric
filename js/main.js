/* ============================================================
   Лавка.Доллс — интерактив главной страницы
   ============================================================ */
(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Шапка: тень при прокрутке ---------- */
  const header = document.getElementById('header');
  const toTop = document.getElementById('toTop');

  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 8);
    toTop.classList.toggle('is-visible', y > 600);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  });

  /* ---------- Счётчики (избранное / корзина) ---------- */
  const counts = { fav: 0, cart: 0 };

  const renderCount = (name) => {
    document.querySelectorAll(`[data-count="${name}"]`).forEach((el) => {
      el.textContent = String(counts[name]);
      el.dataset.empty = String(counts[name] === 0);
    });
  };

  const bump = (name) => {
    const el = document.querySelector(`[data-count="${name}"]`);
    if (!el) return;
    el.classList.add('is-bump');
    setTimeout(() => el.classList.remove('is-bump'), 250);
  };

  Object.keys(counts).forEach(renderCount);

  /* ---------- Мобильное меню ---------- */
  const drawer = document.getElementById('drawer');
  const drawerOverlay = document.getElementById('drawerOverlay');
  const burgerBtn = document.getElementById('burgerBtn');
  const drawerClose = document.getElementById('drawerClose');

  const openDrawer = () => {
    drawerOverlay.hidden = false;
    requestAnimationFrame(() => drawerOverlay.classList.add('is-open'));
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    burgerBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawerOverlay.classList.remove('is-open');
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    burgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    setTimeout(() => { drawerOverlay.hidden = true; }, 300);
  };

  burgerBtn.addEventListener('click', openDrawer);
  drawerClose.addEventListener('click', closeDrawer);
  drawerOverlay.addEventListener('click', closeDrawer);
  drawer.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeDrawer));

  /* ---------- Панель каталога ---------- */
  const catalogBtn = document.getElementById('catalogBtn');
  const catalogPanel = document.getElementById('catalogPanel');

  const closeCatalog = () => {
    catalogPanel.classList.remove('is-open');
    catalogBtn.setAttribute('aria-expanded', 'false');
    setTimeout(() => { if (!catalogPanel.classList.contains('is-open')) catalogPanel.hidden = true; }, 250);
  };

  catalogBtn.addEventListener('click', () => {
    // На узких экранах кнопка «Каталог» открывает мобильное меню
    if (window.matchMedia('(max-width: 640px)').matches) {
      openDrawer();
      return;
    }
    const isOpen = !catalogPanel.hidden && catalogPanel.classList.contains('is-open');
    if (isOpen) {
      closeCatalog();
    } else {
      catalogPanel.hidden = false;
      requestAnimationFrame(() => {
        catalogPanel.classList.add('is-open');
        catalogBtn.setAttribute('aria-expanded', 'true');
      });
    }
  });

  document.addEventListener('click', (e) => {
    if (!catalogPanel.hidden && !e.target.closest('#catalogPanel') && !e.target.closest('#catalogBtn')) {
      closeCatalog();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDrawer();
      closeCatalog();
    }
  });

  /* ---------- Hero-слайдер ---------- */
  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero__dots button'));
  let current = 0;
  let timer = null;

  const goTo = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
    dots.forEach((d, i) => {
      d.classList.toggle('is-active', i === current);
      d.setAttribute('aria-selected', String(i === current));
    });
  };

  const play = () => {
    if (reducedMotion || slides.length < 2) return;
    stop();
    timer = setInterval(() => goTo(current + 1), 6000);
  };

  const stop = () => {
    if (timer) clearInterval(timer);
    timer = null;
  };

  dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); play(); }));

  const heroFrame = document.querySelector('.hero__frame');
  if (heroFrame) {
    heroFrame.addEventListener('mouseenter', stop);
    heroFrame.addEventListener('mouseleave', play);
  }

  goTo(0);
  play();

  /* ---------- Табы подборок ---------- */
  const tabs = Array.from(document.querySelectorAll('.tab'));

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => {
        t.classList.toggle('is-active', t === tab);
        t.setAttribute('aria-selected', String(t === tab));
      });

      document.querySelectorAll('.tab-panel').forEach((panel) => {
        const active = panel.dataset.panel === tab.dataset.tab;
        panel.classList.toggle('is-active', active);
        panel.hidden = !active;
      });
    });
  });

  /* ---------- Горизонтальные строки: стрелки ---------- */
  document.querySelectorAll('.row-wrapper').forEach((wrapper) => {
    const row = wrapper.querySelector('.product-row, .review-row');
    if (!row) return;

    const step = () => {
      const card = row.firstElementChild;
      return card ? card.getBoundingClientRect().width + 16 : 300;
    };

    wrapper.querySelectorAll('.row-arrow').forEach((btn) => {
      const dir = btn.classList.contains('row-arrow--next') ? 1 : -1;
      btn.addEventListener('click', () => {
        row.scrollBy({ left: dir * step(), behavior: reducedMotion ? 'auto' : 'smooth' });
      });
    });
  });

  /* ---------- Избранное ---------- */
  document.querySelectorAll('.fav-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const active = btn.classList.toggle('is-active');
      counts.fav += active ? 1 : -1;
      renderCount('fav');
      bump('fav');
    });
  });

  /* ---------- Добавление в корзину (заглушка) ---------- */
  document.querySelectorAll('.add-to-cart').forEach((btn) => {
    const original = btn.textContent;
    btn.addEventListener('click', () => {
      counts.cart += 1;
      renderCount('cart');
      bump('cart');
      btn.textContent = 'Добавлено ✓';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
      }, 1200);
    });
  });

  /* ---------- Появление блоков при прокрутке ---------- */
  const revealEls = document.querySelectorAll('.reveal');

  // каскадная задержка внутри общих родителей (сеток)
  document.querySelectorAll('.cat-grid, .usp-grid, .product-row, .delivery-grid').forEach((parent) => {
    Array.from(parent.children).forEach((child, i) => {
      child.style.setProperty('--reveal-delay', `${Math.min(i * 0.07, 0.35)}s`);
    });
  });

  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-revealed'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach((el) => io.observe(el));
  }
})();
