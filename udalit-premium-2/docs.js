(() => {
  // просмотр документов во всплывающем окне
  const docs = {
    sgr: { title: 'Свидетельство о государственной регистрации', pdf: 'assets/docs/svidetelstvo-gosregistracii.pdf', pages: ['assets/docs/sgr-1.jpg'] },
    protokol: { title: 'Протокол испытаний № 1736/Р', pdf: 'assets/docs/protokol-ispytanij-1736.pdf', pages: ['assets/docs/protokol-1.jpg', 'assets/docs/protokol-2.jpg'] }
  };
  const modal = document.getElementById('doc-modal');
  if (!modal) return;
  const title = modal.querySelector('.doc-modal-title');
  const pdf = modal.querySelector('.doc-pdf');
  const pages = modal.querySelector('.doc-pages');
  const close = modal.querySelector('.doc-close');
  let opener = null;

  const open = (key, from) => {
    const d = docs[key];
    if (!d) return;
    opener = from;
    title.textContent = d.title;
    pdf.href = d.pdf;
    pages.innerHTML = d.pages.map((src, i) => `<img src="${src}" alt="${d.title}, страница ${i + 1}">`).join('');
    pages.scrollTop = 0;
    modal.hidden = false;
    document.documentElement.classList.add('doc-open');
    close.focus();
  };
  const hide = () => {
    modal.hidden = true;
    document.documentElement.classList.remove('doc-open');
    opener?.focus();
  };

  document.querySelectorAll('[data-doc]').forEach(b => b.addEventListener('click', () => open(b.dataset.doc, b)));
  close.addEventListener('click', hide);
  modal.addEventListener('click', e => { if (e.target === modal || e.target === pages) hide(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) hide(); });
})();
