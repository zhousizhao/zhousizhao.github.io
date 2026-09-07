(() => {
  const root = document.documentElement;
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme) root.dataset.theme = storedTheme;

  document.querySelector('.theme-toggle')?.addEventListener('click', () => {
    const nextTheme = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = nextTheme;
    localStorage.setItem('theme', nextTheme);
  });

  const menuButton = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  menuButton?.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    mobileMenu.hidden = isOpen;
  });
  mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    mobileMenu.hidden = true;
  }));

  const filters = document.querySelectorAll('.filter-button');
  const posts = document.querySelectorAll('.post-row');
  const emptyState = document.querySelector('.empty-state');
  filters.forEach((filter) => filter.addEventListener('click', () => {
    const category = filter.dataset.filter;
    let visibleCount = 0;
    filters.forEach((button) => button.classList.toggle('active', button === filter));
    posts.forEach((post) => {
      const visible = category === 'all' || post.dataset.category === category;
      post.hidden = !visible;
      if (visible) visibleCount += 1;
    });
    if (emptyState) emptyState.hidden = visibleCount !== 0;
  }));

  const progress = document.querySelector('.article-progress span');
  if (progress) window.addEventListener('scroll', () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0}%`;
  }, { passive: true });
})();
