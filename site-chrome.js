(() => {
  const nav = document.getElementById('sk-nav');
  if (!nav) return;
  const burger = nav.querySelector('.sk-burger');
  const dds = [...nav.querySelectorAll('.sk-dd')];
  const hover = window.matchMedia('(hover:hover) and (min-width:900px)');
  const set = (d, open) => { d.classList.toggle('open', open); d.querySelector('.sk-dd-btn').setAttribute('aria-expanded', String(open)); };
  const closeAll = (except) => dds.forEach((d) => { if (d !== except) set(d, false); });
  dds.forEach((d) => {
    let timer;
    d.querySelector('.sk-dd-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      const open = hover.matches ? true : !d.classList.contains('open');
      closeAll(d); set(d, open);
    });
    d.addEventListener('mouseenter', () => { if (!hover.matches) return; clearTimeout(timer); closeAll(d); set(d, true); });
    d.addEventListener('mouseleave', () => { if (!hover.matches) return; timer = setTimeout(() => set(d, false), 180); });
  });
  if (burger) {
    burger.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
    });
  }
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) { closeAll(); nav.classList.remove('open'); burger?.setAttribute('aria-expanded', 'false'); }
    document.querySelectorAll('.sk-lang[open]').forEach((lang) => {
      if (!lang.contains(e.target)) lang.removeAttribute('open');
    });
    const langLink = e.target.closest('a[hreflang]');
    if (langLink) {
      try { localStorage.setItem('snapkit-lang', langLink.getAttribute('hreflang')); } catch {}
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeAll(); nav.classList.remove('open'); burger?.setAttribute('aria-expanded', 'false');
    document.querySelectorAll('.sk-lang[open]').forEach((l) => l.removeAttribute('open'));
  });
  document.querySelectorAll('.sk-lang').forEach((lang) => {
    lang.addEventListener('toggle', () => {
      if (lang.open) {
        document.querySelectorAll('.sk-lang').forEach((other) => {
          if (other !== lang) other.removeAttribute('open');
        });
      }
    });
  });
})();
