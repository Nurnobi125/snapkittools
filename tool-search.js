(() => {
  const input = document.querySelector('#tool-search');
  const grid = document.querySelector('#main-tool-grid');
  const status = document.querySelector('#tool-search-status');
  if (!input || !grid || !status) return;

  const cards = [...grid.querySelectorAll('.tool')];
  const empty = document.createElement('p');
  empty.className = 'tool-search-empty';
  empty.hidden = true;
  empty.textContent = 'এই নামে কোনো টুল পাওয়া যায়নি। অন্য শব্দ দিয়ে খুঁজুন।';
  grid.append(empty);

  const normalize = (value) => value.toLocaleLowerCase().normalize('NFKC').trim();
  input.addEventListener('input', () => {
    const query = normalize(input.value);
    let visible = 0;
    for (const card of cards) {
      const matches = !query || normalize(card.textContent).includes(query);
      card.classList.toggle('tool-search-hidden', !matches);
      if (matches) visible++;
    }
    empty.hidden = visible !== 0;
    status.textContent = !query ? '' : document.documentElement.lang === 'bn' ? `${visible}টি টুল পাওয়া গেছে` : `${visible} tools found`;
  });

  document.addEventListener('keydown', (event) => {
    const target = event.target;
    const typing = target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
    if (event.key === '/' && !typing && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      input.focus();
    } else if (event.key === 'Escape' && target === input && input.value) {
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.blur();
    }
  });
})();
