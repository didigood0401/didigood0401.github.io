(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => 1 - Math.pow(1 - t, 3);

  // ---------- плавный скролл ----------
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    lenis.stop();
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      const id = a?.getAttribute('href');
      if (!id || id.length < 2) return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      lenis.scrollTo(id === '#top' ? 0 : t, { duration: 1.6 });
    });
    // кнопки «Узнать условия» / «Оставить отзыв» прокручивают через scrollIntoView
    Element.prototype.scrollIntoView = function () { lenis.scrollTo(this, { duration: 1.6 }); };
  }

  // ---------- прелоадер ----------
  const loader = $('.p-loader');
  const finish = () => {
    if (finish.done) return;
    finish.done = true;
    loader?.classList.add('is-out');
    setTimeout(() => {
      root.classList.remove('p-wait');
      lenis?.start();
      dispatchEvent(new Event('p:go'));
    }, reduce ? 0 : 380);
    setTimeout(() => loader?.classList.add('is-gone'), reduce ? 0 : 1500);
  };
  if (loader) {
    const line = $('.p-loader-line', loader), num = $('.p-loader-num', loader);
    const imgs = $$('.hero-frame img').filter(i => !i.complete);
    const total = imgs.length + 1;
    let loaded = 0, shown = 0;
    const done = () => loaded++;
    imgs.forEach(i => { i.addEventListener('load', done, { once: true }); i.addEventListener('error', done, { once: true }); });
    document.fonts?.ready.then(done) ?? done();
    const t0 = performance.now();
    const step = now => {
      const real = (loaded / total), byTime = clamp((now - t0) / 1300);
      shown += (Math.min(real, byTime) - shown) * .12;
      if (real >= 1 && byTime >= 1) shown = Math.max(shown, .999);
      line.style.setProperty('--lp', shown.toFixed(3));
      num.textContent = String(Math.round(shown * 100)).padStart(3, '0');
      if (shown >= .999 || now - t0 > 4500) { num.textContent = '100'; line.style.setProperty('--lp', 1); setTimeout(finish, 220); }
      else requestAnimationFrame(step);
    };
    reduce ? finish() : requestAnimationFrame(step);
  } else finish();

  // ---------- сцена-манифест (если на странице нет сцены со слоганом) ----------
  const slogan = $('.p-slogan');
  const intro = slogan ? null : $('.intro');
  const stage = document.createElement('div');
  let introEm = null;
  if (intro) {
    intro.dataset.pOwn = '';
    intro.classList.add('p-intro');
    const shell = $('.intro-flex', intro);
    const h = $('.huge-title', shell);
    const [l1, l2] = h.innerHTML.split(/<br\s*\/?>/i);
    h.innerHTML = `<span class="p-l1">${l1.trim()}</span><span class="p-l2">${(l2 || '').trim()}</span>`;
    introEm = $('em', h);
    stage.className = 'p-stage';
    stage.innerHTML = `<div class="p-glow" aria-hidden="true"></div><div class="p-rings" aria-hidden="true"><i></i><i></i><i></i></div>
      <img class="p-bottle" src="assets/bottle-original.png" alt="" aria-hidden="true">
      <div class="p-scrollhint" aria-hidden="true">ЛИСТАЙТЕ<i></i></div>`;
    stage.insertBefore(shell, $('.p-scrollhint', stage));
    intro.appendChild(stage);
  }

  // ---------- сцена со слоганом ----------
  const sStage = slogan && $('.s-stage', slogan);
  const sEm = slogan && $('.s-title em', slogan);
  const chips = slogan ? $$('.s-chip', slogan) : [];
  if (slogan) slogan.dataset.pOwn = '';

  // ---------- тёмный «занавес» для преимуществ ----------
  const benefits = $('.section-benefits');
  if (benefits) {
    const dark = document.createElement('div');
    dark.className = 'p-dark';
    benefits.before(dark);
    dark.appendChild(benefits);
  }
  const curtains = $$('.p-dark, .p-orange, .reviews-section');

  // ---------- большой знак в подвале ----------
  const wm = document.createElement('div');
  wm.className = 'p-wordmark';
  wm.setAttribute('aria-hidden', 'true');
  wm.innerHTML = '<span>UDALIT</span>';
  $('main')?.appendChild(wm);

  // ---------- курсор и подсветка первого экрана ----------
  if (finePointer && !reduce) {
    const dot = document.createElement('div'), ring = document.createElement('div');
    dot.className = 'p-dot'; ring.className = 'p-ring';
    document.body.append(dot, ring);
    root.classList.add('p-cursor-on');
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
    addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; dot.style.transform = `translate(${x}px,${y}px)`; }, { passive: true });
    const loop = () => {
      rx += (x - rx) * .18; ry += (y - ry) * .18;
      ring.style.transform = `translate(${rx}px,${ry}px)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    document.addEventListener('pointerover', e => {
      const t = e.target;
      const card = t.closest('.product-card, .use-card, .area-item');
      const field = t.closest('input, select, textarea');
      const link = !card && t.closest('a, button, label');
      ring.classList.toggle('is-card', !!card && !t.closest('button'));
      ring.classList.toggle('is-link', !!link || !!(card && t.closest('button')));
      ring.classList.toggle('is-field', !!field); dot.classList.toggle('is-field', !!field);
      ring.classList.toggle('on-dark', !!t.closest('.p-dark, .reviews-section, .hero-categories, .contact-visual, .benefits-banner'));
      ring.textContent = card && !t.closest('button') ? '↗' : '';
    });
    document.addEventListener('pointerleave', () => { dot.style.opacity = ring.style.opacity = 0; });
    document.addEventListener('pointerenter', () => { dot.style.opacity = ring.style.opacity = ''; });

    const hero = $('.hero-frame');
    hero?.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--sx', (e.clientX - r.left) + 'px');
      hero.style.setProperty('--sy', (e.clientY - r.top) + 'px');
    });
  }

  // ---------- покадровые сцены ----------
  const frame = () => {
    const vh = innerHeight;
    if (intro) {
      const r = intro.getBoundingClientRect();
      const total = intro.offsetHeight - vh;
      const p = reduce ? 1 : clamp(-r.top / total);
      stage.style.setProperty('--pp', p.toFixed(4));
      // 1) бутылка выходит в центр  2) уходит вверх, строки съезжаются  3) заливка и абзац
      stage.style.setProperty('--pa', ease(clamp(p / .3)).toFixed(4));
      stage.style.setProperty('--pb', ease(clamp((p - .34) / .3)).toFixed(4));
      stage.style.setProperty('--pc', ease(clamp((p - .68) / .2)).toFixed(4));
      introEm?.style.setProperty('--f', clamp((p - .6) / .25).toFixed(4));
    }
    if (slogan) {
      const r = slogan.getBoundingClientRect();
      const p = reduce ? 1 : clamp(-r.top / (slogan.offsetHeight - vh));
      // 1) бутылка и первая строка  2) пространства разлетаются  3) вторая строка и заливка
      const pb = clamp((p - .3) / .3);
      sStage.style.setProperty('--pp', p.toFixed(4));
      sStage.style.setProperty('--pa', ease(clamp(p / .28)).toFixed(4));
      sStage.style.setProperty('--pb', ease(pb).toFixed(4));
      sStage.style.setProperty('--pc', ease(clamp((p - .58) / .2)).toFixed(4));
      sEm?.style.setProperty('--f', clamp((p - .7) / .2).toFixed(4));
      chips.forEach((c, i) => c.style.setProperty('--k', ease(clamp((pb - i * .12) / .64)).toFixed(4)));
    }
    curtains.forEach(el => {
      const r = el.getBoundingClientRect();
      const c = reduce ? 0 : Math.max(clamp(r.top / (vh * .9)), clamp((vh - r.bottom) / (vh * .9)));
      el.style.setProperty('--c', c.toFixed(4));
    });
    const w = wm.getBoundingClientRect();
    wm.style.setProperty('--wm', reduce ? 1 : ease(clamp((vh - w.top) / (w.height + vh * .15))).toFixed(4));
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();
