(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  root.classList.add('m-on');

  // старт вступления первого экрана — когда шрифты готовы (но не дольше 900 мс);
  // если страница держит прелоадер (класс p-wait) — ждём его сигнала p:go
  const counter = $('.hero-meta strong');
  const go = () => { root.classList.add('m-go'); countUp(); };
  const start = () => root.classList.contains('p-wait') ? addEventListener('p:go', go, { once: true }) : requestAnimationFrame(go);
  Promise.race([document.fonts?.ready, new Promise(r => setTimeout(r, 900))]).then(start);

  // счётчик «100%»
  if (counter && !reduce) counter.textContent = '0%';
  function countUp() {
    if (!counter || reduce || countUp.done) return;
    countUp.done = true;
    const t0 = performance.now() + 700;
    const tick = now => {
      const k = clamp((now - t0) / 1600);
      counter.textContent = Math.round(100 * (1 - Math.pow(1 - k, 3))) + '%';
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // бегущая строка
  const ticker = $('.hero-ticker');
  if (ticker && !reduce) {
    const html = ticker.innerHTML;
    ticker.innerHTML = `<div class="m-track"><div class="m-group">${html}</div><div class="m-group" aria-hidden="true">${html}</div></div>`;
    ticker.classList.add('m-marquee');
  }

  // пузырьки
  const bubbles = (host, n) => {
    if (!host || reduce) return;
    for (let i = 0; i < n; i++) {
      const b = document.createElement('i');
      const s = 4 + Math.random() * 12;
      b.className = 'm-bubble';
      b.setAttribute('aria-hidden', 'true');
      b.style.cssText = `left:${5 + Math.random() * 90}%;width:${s}px;height:${s}px;--t:${7 + Math.random() * 8}s;--d:${-Math.random() * 14}s;--x:${(Math.random() - .5) * 60}px`;
      host.appendChild(b);
    }
  };
  bubbles($('.hero-product'), 14);
  bubbles($('.benefits-banner'), 9);
  bubbles($('.contact-visual'), 8);

  // прогресс прокрутки
  const bar = document.createElement('div');
  bar.className = 'm-progress';
  document.body.appendChild(bar);

  // плавающая шапка
  const nav = $('.site-nav');
  const mbar = document.createElement('div');
  mbar.className = 'm-bar';
  mbar.setAttribute('inert', '');
  mbar.innerHTML = `<a class="m-bar-logo" href="#top" aria-label="UdaLit — наверх"><img src="assets/udalit-logo.png" alt="UdaLit"></a>
    <nav class="m-bar-menu" aria-label="Быстрое меню">${$('.desktop-menu')?.innerHTML || ''}</nav>
    <a class="m-bar-phone" href="tel:+79677330101" aria-label="Позвонить">☎</a>
    <a class="nav-order" href="#contacts">Заказать <span aria-hidden="true">↗</span></a>`;
  document.body.appendChild(mbar);

  // появление при прокрутке
  // [data-p-own] — блоки, которыми управляет премиум-слой сам
  const mark = (els, cls = 'r', step = 0.08) => els.filter(el => !el.closest('[data-p-own]')).forEach((el, i) => {
    el.classList.add(cls);
    el.style.setProperty('--d', (i * step).toFixed(2) + 's');
  });
  $$('.section-header').forEach(h => {
    mark($$('.eyebrow', h));
    mark($$('h2', h), 'r-clip');
    $$('h2', h).forEach(el => el.style.setProperty('--d', '.08s'));
    mark($$('p, .text-link', h).map(el => (el.style.setProperty('--d', '.2s'), el)));
  });
  mark($$('.intro .eyebrow, .intro p'), 'r', .15);
  mark($$('.intro .huge-title'), 'r-clip');
  mark($$('.product-card'), 'r', .1);
  mark($$('.catalog-note'));
  mark($$('.benefit'), 'r', .1);
  mark($$('.docs-facts > div'), 'r', .08);
  mark($$('.doc-card'), 'r', .12);
  mark($$('.benefits-banner'));
  mark($$('.use-card'), 'r', .1);
  $$('.use-image').forEach((el, i) => { el.classList.add('r-img'); el.style.setProperty('--d', (i * .1 + .15).toFixed(2) + 's'); });
  mark($$('.review-layout > div:first-child'));
  mark($$('.review-panel').map(el => (el.style.setProperty('--d', '.15s'), el)));
  mark($$('.contact-visual, .form-panel'), 'r', .12);
  mark($$('.site-footer > *'), 'r', .08);

  // обрезанные clip-path элементы наблюдатель «не видит», поэтому следим за их родителем
  const watched = new Map();
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    (watched.get(e.target) || []).forEach(el => el.classList.add('in'));
    io.unobserve(e.target);
  }), { rootMargin: '0px 0px -8% 0px', threshold: .01 });
  $$('.r, .r-clip, .r-img').forEach(el => {
    const t = el.matches('.r') ? el : el.parentElement;
    watched.has(t) ? watched.get(t).push(el) : (watched.set(t, [el]), io.observe(t));
  });

  // активный пункт меню
  const links = $$('.desktop-menu a, .m-bar-menu a');
  const spy = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['products', 'benefits', 'uses', 'reviews', 'contacts'].forEach(id => { const s = document.getElementById(id); s && spy.observe(s); });

  // наклон карточек продукции
  if (finePointer && !reduce) {
    $$('.product-card').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        card.style.transition = 'transform .15s ease-out, box-shadow .5s, border-color .4s';
        card.style.transform = `perspective(900px) rotateX(${-y * 5}deg) rotateY(${x * 6}deg) translateY(-8px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transition = ''; card.style.transform = ''; });
    });
    // «магнитные» кнопки
    $$('.round-arrow, .site-nav .nav-order, .m-bar .nav-order').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.style.translate = `${(e.clientX - r.left - r.width / 2) * .25}px ${(e.clientY - r.top - r.height / 2) * .3}px`;
      });
      el.addEventListener('pointerleave', () => { el.style.translate = ''; });
    });
  }

  // параллакс от мыши и прокрутки
  const heroProduct = $('.hero-product'), heroCopy = $('.hero-copy'), heroCurve = $('.hero-curve');
  const bannerImg = $('.benefits-banner img'), contactImg = $('.contact-visual > img');
  const fills = $$('.huge-title em, .review-layout h2 span').filter(el => !el.closest('[data-p-own]'));
  let mx = 0, my = 0, cx = 0, cy = 0, lastY = scrollY;
  if (finePointer && !reduce) addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });

  const frame = () => {
    const y = scrollY, vh = innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    bar.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);

    // шапка: появляется после первого экрана, прячется при прокрутке вниз
    const navGone = nav ? nav.getBoundingClientRect().bottom < 0 : y > 120;
    const show = navGone && (y < lastY - 2 || y > max - 40 || document.body.classList.contains('menu-open'));
    const hide = !navGone || y > lastY + 2;
    if (show && !mbar.classList.contains('is-shown')) { mbar.classList.add('is-shown'); mbar.removeAttribute('inert'); }
    else if (hide && !show && mbar.classList.contains('is-shown')) { mbar.classList.remove('is-shown'); mbar.setAttribute('inert', ''); }
    lastY = y;

    // заливка «серое → чистое»
    fills.forEach(el => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--f', reduce ? 1 : clamp((vh * .92 - r.top) / (vh * .45)).toFixed(3));
    });

    if (!reduce) {
      cx += (mx - cx) * .06; cy += (my - cy) * .06;
      if (y < vh * 1.2) {
        heroProduct && (heroProduct.style.translate = `${cx * -22}px ${y * .12 + cy * -16}px`);
        heroCopy && (heroCopy.style.translate = `0 ${y * -.06}px`);
        heroCurve && (heroCurve.style.translate = `${cx * 14}px ${y * .05}px`);
      }
      [[bannerImg, 70], [contactImg, 60]].forEach(([img, k]) => {
        if (!img) return;
        const r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const p = (r.top + r.height / 2 - vh / 2) / vh;
        img.style.translate = `0 ${(p * k).toFixed(1)}px`;
      });
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  // подсветка формы при переходе к ней с карточки товара / отзыва
  const panel = $('.form-panel');
  $$('[data-choose], #review-cta').forEach(b => b.addEventListener('click', () => {
    const sel = $('#product');
    sel && (sel.classList.remove('m-flash'), void sel.offsetWidth, sel.classList.add('m-flash'));
    panel && setTimeout(() => panel.classList.add('in'), 50);
  }));
  $('#request-form')?.addEventListener('submit', e => {
    if (e.target.checkValidity()) $('.submit-btn', e.target)?.classList.add('is-sending');
  });
})();
