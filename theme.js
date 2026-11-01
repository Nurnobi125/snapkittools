(() => {
  const key = 'snapkit-theme';
  let saved = null;
  try { saved = localStorage.getItem(key); } catch {}
  const initial = saved === 'dark' || saved === 'light'
    ? saved
    : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.dataset.theme = initial;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', initial === 'dark' ? '#000000' : '#f7f8f4');
  document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', initial);

  const addToggle = () => {
    const header = document.querySelector('header.nav, header.top, header.shell.nav');
    const target = header ? (header.querySelector('.navright') || header) : document.querySelector('.box');
    if (!target || target.querySelector('.theme-toggle')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'theme-toggle';
    button.setAttribute('aria-pressed', String(initial === 'dark'));
    const updateLabel = (theme) => {
      const next = theme === 'dark' ? 'light' : 'dark';
      const isBangla = document.documentElement.lang.toLowerCase().startsWith('bn');
      button.innerHTML = `<span class="theme-icon" aria-hidden="true">${next === 'dark' ? '☾' : '☀'}</span><span>${isBangla ? (next === 'dark' ? 'ডার্ক' : 'লাইট') : (next === 'dark' ? 'Dark' : 'Light')}</span>`;
      button.setAttribute('aria-label', isBangla ? `${next === 'dark' ? 'ডার্ক' : 'লাইট'} থিম চালু করুন` : `Switch to ${next} theme`);
      button.setAttribute('aria-pressed', String(theme === 'dark'));
    };
    updateLabel(document.documentElement.dataset.theme);
    button.addEventListener('click', () => {
      const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = theme;
      try { localStorage.setItem(key, theme); } catch {}
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#000000' : '#f7f8f4');
      document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', theme);
      updateLabel(theme);
    });
    target.append(button);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addToggle, { once: true });
  else addToggle();
})();
