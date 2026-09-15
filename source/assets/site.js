/* Enhancement only: all page content and navigation work without JavaScript. */
(() => {
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const dark = () => root.dataset.theme ? root.dataset.theme === 'dark' : media.matches;
  const sync = () => {
    document.querySelectorAll('.theme-toggle').forEach(button => {
      button.hidden = false;
      button.setAttribute('aria-pressed', String(dark()));
      button.setAttribute('aria-label', dark() ? '切换浅色主题' : '切换深色主题');
      const label = button.querySelector('.theme-label');
      if (label) label.textContent = dark() ? '浅色' : '深色';
    });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = dark() ? '#0f1420' : '#f7f8fc';
  };
  document.querySelectorAll('.theme-toggle').forEach(button => {
    button.addEventListener('click', () => {
      root.dataset.theme = dark() ? 'light' : 'dark';
      try { localStorage.setItem('happys-theme', root.dataset.theme); } catch (_) { /* Storage is optional. */ }
      sync();
    });
  });
  media.addEventListener('change', sync);
  window.addEventListener('storage', event => {
    if (event.key === 'happys-theme') {
      if (event.newValue === 'light' || event.newValue === 'dark') root.dataset.theme = event.newValue;
      else delete root.dataset.theme;
      sync();
    }
  });
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = String(new Date().getFullYear()); });
  sync();
})();
