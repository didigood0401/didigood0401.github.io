(() => {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#mobile-menu');
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    menu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
  };
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => {if (e.key === 'Escape') setMenu(false);});
  const productSelect = document.querySelector('#product');
  document.querySelectorAll('[data-choose]').forEach(btn => btn.addEventListener('click', () => {
    if (productSelect) productSelect.value = btn.getAttribute('data-choose');
    document.querySelector('#contacts')?.scrollIntoView({ behavior: 'smooth' });
  }));
  document.querySelector('#review-cta')?.addEventListener('click', () => {
    if (productSelect) productSelect.value = 'Отзыв о продукции';
    const comment = document.querySelector('#comment');
    if (comment) comment.placeholder = 'Расскажите о своём опыте с UdaLit';
    document.querySelector('#contacts')?.scrollIntoView({ behavior: 'smooth' });
  });
})();
