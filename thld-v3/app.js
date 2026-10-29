/* ТехноХолдинг — концепт v3 */
(() => {
const D = window.THLD, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt = n => n.toLocaleString('ru-RU');
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ARROW = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 13 13 3M5 3h8v8"/></svg>';
const objUrl = o => 'object.html?id=' + encodeURIComponent(o.id);

/* ---------- лайтбокс ---------- */
const lb = $('#lb'); let lbList = [], lbI = 0;
function lbShow() { const it = lbList[lbI]; lb.querySelector('img').src = it.src; lb.querySelector('.lb__c').textContent = (it.cap || '') + (lbList.length > 1 ? `  ·  ${lbI + 1} / ${lbList.length}` : ''); }
window.openLB = (list, i = 0) => { lbList = list; lbI = i; lbShow(); lb.classList.add('open'); };
if (lb) {
  lb.querySelector('.lb__p').onclick = () => { lbI = (lbI - 1 + lbList.length) % lbList.length; lbShow(); };
  lb.querySelector('.lb__n').onclick = () => { lbI = (lbI + 1) % lbList.length; lbShow(); };
  lb.addEventListener('click', e => { if (e.target === lb || e.target.closest('[data-close]')) lb.classList.remove('open'); });
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { $$('.lb.open,.modal.open').forEach(m => m.classList.remove('open')); $('#mpanel')?.classList.remove('open'); }
  if (lb?.classList.contains('open') && e.key === 'ArrowRight') lb.querySelector('.lb__n').click();
  if (lb?.classList.contains('open') && e.key === 'ArrowLeft') lb.querySelector('.lb__p').click();
});
$$('[data-modal]').forEach(b => b.onclick = () => $('#' + b.dataset.modal).classList.add('open'));
$$('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-close]')) m.classList.remove('open'); }));

/* ---------- меню ---------- */
const mnav = $('#mnav');
if (mnav) { $('#burger').onclick = () => mnav.classList.add('open'); $('#mnavX').onclick = () => mnav.classList.remove('open'); $$('a', mnav).forEach(a => a.onclick = () => mnav.classList.remove('open')); }

if (!$('#hero')) return; // ниже — только главная

/* ---------- плавный скролл ---------- */
let lenis = null;
if (!RM && window.Lenis) {
  lenis = new Lenis({ lerp: .09, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const t = $(a.getAttribute('href')); if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: 0, duration: 1.4 }); } }));
}
gsap.registerPlugin(ScrollTrigger);

/* ---------- видео героя: пролёты над кровлями объектов; на телефоне лёгкая версия 720p, при «меньше движения» остаётся сцена ---------- */
const v = $('#heroVideo');
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  v.muted = true; v.defaultMuted = true; v.setAttribute('autoplay', '');
  v.src = innerWidth < 900 ? 'video/hero_720.mp4' : 'video/hero.mp4';
  v.hidden = false;
  v.addEventListener('playing', () => { v.classList.add('on'); $('#scene').style.opacity = 0; }, { once: true });
  // если телефон не дал автозапуск — запускаем при первом касании или прокрутке, без кнопки «play»
  v.play().catch(() => ['touchstart', 'pointerdown', 'scroll'].forEach(ev => addEventListener(ev, () => v.play().catch(() => {}), { once: true, passive: true })));
}

/* ---------- прелоадер: ТЕХНОХОЛДИНГ крутится и уходит ---------- */
const word = $('#preWord');
word.innerHTML = [...word.textContent].map(c => `<span>${c}</span>`).join('');
const letters = $$('span', word);
const intro = gsap.timeline({ paused: true });
intro.from('.hero__h .ln>span', { yPercent: 110, duration: 1.1, ease: 'power4.out', stagger: .12 })
  .from('.hero .eb, .hero__row > *', { y: 30, opacity: 0, duration: .9, ease: 'power3.out', stagger: .08 }, '-=.7')
  .from('#heroMedia', { scale: 1.18, duration: 2.2, ease: 'power3.out' }, 0);
if (RM || sessionStorage.getItem('thldPre')) { $('#pre').remove(); intro.progress(1); }
else {
  try { sessionStorage.setItem('thldPre', '1'); } catch (e) {}
  lenis?.stop();
  const n = { v: 0 }, tl = gsap.timeline({ paused: true });
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(() => requestAnimationFrame(() => tl.play())));
  tl.from(letters, { rotateX: -110, opacity: 0, duration: .9, ease: 'power3.out', stagger: .045 })
    .to(n, { v: 100, duration: 1.6, ease: 'power2.inOut', onUpdate: () => { $('#preN').textContent = Math.round(n.v); $('#preLine').style.width = n.v + '%'; } }, 0)
    .to(letters, { rotateX: 360, duration: 1, ease: 'power2.inOut', stagger: .03 }, .9)
    .to(letters, { yPercent: -120, opacity: 0, duration: .6, ease: 'power3.in', stagger: .025 }, 2.1)
    .to('#pre', { yPercent: -100, duration: .9, ease: 'power4.inOut', onStart: () => intro.play() }, 2.5)
    .add(() => { $('#pre').remove(); lenis?.start(); });
}

/* ---------- шапка ---------- */
const hdr = $('#hdr'), logo = $('#logo'); let lastY = 0;
ScrollTrigger.create({ start: 0, end: 'max', onUpdate: s => {
  const y = s.scroll(), past = y > innerHeight * .85;
  hdr.classList.toggle('solid', past); hdr.classList.toggle('hdr--light', !past);
  hdr.classList.toggle('hide', past && y > lastY + 4 && !mnav.classList.contains('open')); if (y < lastY - 4) hdr.classList.remove('hide'); lastY = y;
}});

/* ---------- «наплывы»: герой уходит вглубь, листы наезжают ---------- */
if (!RM) {
  gsap.to('#heroMedia', { scale: 1.12, yPercent: 8, ease: 'none', scrollTrigger: { trigger: '#about', start: 'top bottom', end: 'top top', scrub: true } });
  gsap.to('.hero__in', { opacity: 0, y: -60, ease: 'none', scrollTrigger: { trigger: '#about', start: 'top 90%', end: 'top 30%', scrub: true } });
  $$('.rv').forEach(el => gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } }));
  $$('.clip').forEach(el => {
    gsap.to(el, { clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 1.5, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } });
    const img = $('img', el); if (img) gsap.fromTo(img, { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
}

/* ---------- счётчики ---------- */
$$('[data-count]').forEach(el => {
  const to = +el.dataset.count, pre = el.dataset.pre || '', suf = el.dataset.suf || '', plus = 'plus' in el.dataset ? '<sup>+</sup>' : '';
  const put = v => el.innerHTML = pre + fmt(Math.round(v)) + suf + plus;
  if (RM) return put(to);
  const o = { v: 0 }; put(0);
  ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => gsap.to(o, { v: to, duration: 2.2, ease: 'power3.out', onUpdate: () => put(o.v) }) });
});

/* ---------- услуги ---------- */
const SVC = [
  ['Плоские кровли из ПВХ-мембраны', 'ПВХ-мембрана', 'Механически закреплённые системы по профлисту и железобетону — основная технология компании. Быстрый монтаж, гарантия до 10 лет.'],
  ['Ремонт и реконструкция кровли', 'по старому кровельному покрытию', 'Укладка новой мембраны поверх старого покрытия без демонтажа — объект продолжает работать.'],
  ['Наплавляемые полимерно-битумные кровли', 'Наплавляемые', 'Классические многослойные кровли из битумно-полимерных материалов для любых оснований.'],
  ['Балластные и инверсионные кровли', 'Балластные', 'Эксплуатируемые кровли, парковки и террасы: утеплитель над гидроизоляцией, пригруз из щебня или плитки.'],
  ['Скатные кровли', 'Скатные', 'Скатные кровли промышленных и общественных зданий: металлочерепица, фальц, гибкая черепица.'],
  ['Фасадные системы и ЛОК', 'Фасадные', 'Вентилируемые фасады и лёгкие ограждающие конструкции — оболочка здания одной командой.'],
  ['Подземная гидроизоляция', 'Подземная', 'Гидроизоляция фундаментов, паркингов и заглублённых помещений.'],
];
const svcList = $('#svcList'), svcPic = $('#svcPic');
const svcObjs = SVC.map(([, key]) => D.objects.filter(o => o.work.some(w => w.includes(key)) || o.roof.includes(key)));
SVC.forEach(([t, , d], i) => {
  const n = svcObjs[i].length, sample = svcObjs[i].find(o => o.ph.length) || D.objects[i];
  svcList.insertAdjacentHTML('beforeend', `<div class="svc__it${i ? '' : ' on'}" data-i="${i}" tabindex="0" role="button"><i>0${i + 1}</i><h3>${t}</h3><em>${n ? n + ' объект.' : ''}</em><p>${d}</p></div>`);
  svcPic.insertAdjacentHTML('afterbegin', `<img src="${sample.img}" alt="${esc(sample.t)}" data-cap="${esc(sample.t)}"${i ? ' loading="lazy"' : ' class="on"'}>`);
});
const svcImgs = $$('img', svcPic).reverse();
$('#svcCap').textContent = svcImgs[0].dataset.cap;
const svcOn = i => { $$('.svc__it', svcList).forEach((e, k) => e.classList.toggle('on', k === i)); svcImgs.forEach((im, k) => im.classList.toggle('on', k === i)); $('#svcCap').textContent = svcImgs[i].dataset.cap; };
$$('.svc__it', svcList).forEach(e => { e.onclick = () => svcOn(+e.dataset.i); e.onmouseenter = () => matchMedia('(hover:hover)').matches && svcOn(+e.dataset.i); e.onkeydown = ev => ev.key === 'Enter' && svcOn(+e.dataset.i); });

/* ---------- объекты: фильтры, годы, лента ---------- */
const TYPES = ['Все объекты', 'Жилые', 'Коммерческие', 'Производственные', 'Социальные'];
let fType = 'Все объекты', fYear = 'all';
const years = [...new Set(D.objects.map(o => o.year).filter(Boolean))].sort((a, b) => b - a);
$('#objF').innerHTML = TYPES.map(t => `<button class="chip${t === fType ? ' on' : ''}" data-t="${t}">${t}</button>`).join('');
$('#objY').innerHTML = `<button class="on" data-y="all">Все годы</button>` + years.map(y => `<button data-y="${y}">${y}</button>`).join('') + `<button data-y="none">Без года</button>`;
const card = o => `<a class="card" href="${objUrl(o)}"><div class="card__img"><img src="${o.img}" alt="${esc(o.t)}" loading="lazy">${o.year ? `<span class="card__yr">${o.year}</span>` : ''}</div>
  <div class="card__b"><h3>${esc(o.t)}</h3><div class="card__m">${esc(o.roof)}</div><div class="card__m">📍 ${esc(o.city || 'Челябинская область')}</div>
  <div class="card__f"><div><small>Площадь кровли</small><b>${esc(o.area)}</b></div><span class="card__go">${ARROW}</span></div></div></a>`;
let trackST = null;
function renderObjs() {
  const list = D.objects.filter(o => (fType === 'Все объекты' || o.type === fType) && (fYear === 'all' || (fYear === 'none' ? !o.year : o.year === +fYear)));
  const N = 14;
  $('#track').innerHTML = list.length ? list.slice(0, N).map(card).join('') + `<a class="card card--all" href="objects.html"><b>Все ${D.objects.length} объектов</b><span>Фильтры по типу и году, страница каждого объекта →</span></a>` : '<p style="padding:40px;color:var(--g4)">Нет объектов по выбранным условиям</p>';
  $('#objCount').innerHTML = `Показано <b>${Math.min(list.length, N)}</b> из <b>${list.length}</b>`;
  setupTrack();
}
function setupTrack() {
  trackST?.kill(); gsap.set('#track', { x: 0 });
  const tr = $('#track'), dist = () => Math.max(0, tr.scrollWidth - innerWidth);
  if (RM || innerWidth < 760) { $('#pin').style.overflowX = 'auto'; return; }
  $('#pin').style.overflowX = 'hidden';
  trackST = gsap.to(tr, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '#pin', start: 'center 55%', end: () => '+=' + dist(), pin: '#objects', pinSpacing: true, scrub: .6, invalidateOnRefresh: true, anticipatePin: 1 } }).scrollTrigger;
  ScrollTrigger.refresh();
}
$('#objF').onclick = e => { const b = e.target.closest('[data-t]'); if (!b) return; fType = b.dataset.t; $$('#objF .chip').forEach(c => c.classList.toggle('on', c === b)); renderObjs(); };
$('#objY').onclick = e => { const b = e.target.closest('[data-y]'); if (!b) return; fYear = b.dataset.y; $$('#objY button').forEach(c => c.classList.toggle('on', c === b)); renderObjs(); };
renderObjs();

/* ---------- карта: кластеры «как Авито» ---------- */
const HEX = '<svg viewBox="0 0 38 42"><path d="M19 1 36 11v20L19 41 2 31V11z" fill="#16171a"/><path d="M19 12 27 16.5v9L19 30l-8-4.5v-9z" fill="#f2c200"/></svg>';
const map = L.map('map', { scrollWheelZoom: false, zoomControl: true, attributionControl: true }).setView([55.6, 61.3], 7);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 18 }).addTo(map);
const cl = L.markerClusterGroup({ showCoverageOnHover: false, zoomToBoundsOnClick: false, maxClusterRadius: 50, spiderfyOnMaxZoom: false,
  iconCreateFunction: c => L.divIcon({ html: `<div class="mcl">${c.getChildCount()}</div>`, className: '', iconSize: [50, 50] }) });
const panel = $('#mpanel'), mpList = $('#mpList');
const showList = objs => {
  $('#mpTitle').textContent = `Объектов в этой точке: ${objs.length}`;
  mpList.innerHTML = objs.map(o => `<a class="mitem" href="${objUrl(o)}"><img src="${o.img}" alt="" loading="lazy"><div><b>${esc(o.t)}</b><span>${esc(o.city || '')}</span><span>${esc(o.area)}${o.year ? ' · ' + o.year : ''}</span></div></a>`).join('');
  panel.classList.add('open');
};
const showOne = o => {
  $('#mpTitle').textContent = o.type;
  mpList.innerHTML = `<div class="mone"><img src="${o.img}" alt=""><h4>${esc(o.t)}</h4><dl><dt>Город</dt><dd>${esc(o.city || '—')}</dd><dt>Площадь</dt><dd>${esc(o.area)}</dd><dt>Год</dt><dd>${o.year || '—'}</dd><dt>Кровля</dt><dd>${esc(o.roof)}</dd></dl><a class="btn" href="${objUrl(o)}">Открыть объект <span class="ar">→</span></a></div>`;
  panel.classList.add('open');
};
D.objects.filter(o => o.c).forEach(o => {
  const m = L.marker([o.c[1], o.c[0]], { icon: L.divIcon({ html: `<div class="mk">${HEX}</div>`, className: '', iconSize: [38, 42], iconAnchor: [19, 40] }), title: o.t });
  m.obj = o; m.on('click', () => showOne(o)); m.on('mouseover', () => m.bindTooltip(`${o.t}<br><small>${o.area}${o.year ? ' · ' + o.year : ''}</small>`, { direction: 'top', offset: [0, -36] }).openTooltip());
  cl.addLayer(m);
});
cl.on('clusterclick', e => { const objs = e.layer.getAllChildMarkers().map(m => m.obj); if (objs.length <= 30 || map.getZoom() >= 13) showList(objs); else e.layer.zoomToBounds({ padding: [40, 40] }); });
map.addLayer(cl);
map.on('click', () => panel.classList.remove('open'));
map.once('focus', () => map.scrollWheelZoom.enable());
$('#mpX').onclick = () => panel.classList.remove('open');
ScrollTrigger.create({ trigger: '#map-sec', start: 'top bottom', once: true, onEnter: () => map.invalidateSize() });

/* ---------- преимущества ---------- */
const P = D.proofs, pf = p => `<button class="pf" ${p.full ? `data-full="${p.full}"` : ''} data-cap="${esc(p.t)}"><img src="${p.img}" alt="" loading="lazy"><span><b>${esc(p.t)}</b>${p.full ? '<small>Открыть документ</small>' : ''}</span></button>`;
const SK = '<svg viewBox="0 0 200 160" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 150h180M30 150V60l60-40 60 40v90M60 150V90h60v60M90 20v130"/></svg>';
$('#adv').innerHTML = `<div class="adv__col">${P.slice(0, 4).map(pf).join('')}</div>
  <div class="adv__col adv__mid"><div class="big"><b data-count2="10">до 10 лет</b><span>гарантии на выполненные кровли</span>${SK}</div><div class="big"><b>1 500 000+ м²</b><span>выполненных кровель</span>${SK}</div><div class="big"><b>1 000+</b><span>объектов за 20 лет</span>${SK}</div></div>
  <div class="adv__col">${P.slice(4).map(pf).join('')}</div>`;
$('#adv').onclick = e => { const b = e.target.closest('.pf[data-full]'); if (!b) return; const docs = $$('.pf[data-full]', $('#adv')); openLB(docs.map(d => ({ src: d.dataset.full, cap: d.dataset.cap })), docs.indexOf(b)); };

/* ---------- команда ---------- */
$('#deps').innerHTML = D.team.slice(2).map(t => `<div class="dep"><img src="${t.img}" alt="" loading="lazy"><b>${esc(t.cap)}</b></div>`).join('');

/* ---------- рекомендации ---------- */
const R = D.recs;
$('#recList').innerHTML = R.map((r, i) => `<button class="rec" data-i="${i}"><div class="rec__img">${r.img ? `<img src="${r.img}" alt="" loading="lazy">` : ''}</div><div class="rec__b"><b>${esc(r.name)}</b><span>${esc(r.obj || 'Рекомендательное письмо')}</span></div><div class="rec__letter"><img src="${r.letters[0]}" alt="Рекомендательное письмо" loading="lazy"></div></button>`).join('');
$('#recList').onclick = e => { const b = e.target.closest('.rec'); if (!b) return; const r = R[+b.dataset.i]; openLB(r.letters.map(s => ({ src: s, cap: r.name })), 0); };

addEventListener('load', () => ScrollTrigger.refresh());
})();
