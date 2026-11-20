/* Q-LEAP : comportements communs (header, menu, apparitions, vidéos). Sans dépendance. */
(() => {
  const html = document.documentElement;
  const motion = html.classList.contains('motion');

  /* Header : fond plein après le hero, masqué en descendant, visible en remontant */
  const hdr = document.querySelector('[data-hdr]');
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    hdr.classList.toggle('is-solid', y > 40);
    const menuOpen = html.classList.contains('menu-open');
    hdr.classList.toggle('is-hidden', !menuOpen && y > 400 && y > lastY + 2);
    if (y < lastY - 2) hdr.classList.remove('is-hidden');
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  hdr.addEventListener('focusin', () => hdr.classList.remove('is-hidden'));

  /* Menu mobile : focus piégé, Échap pour fermer */
  const btn = document.querySelector('[data-menu]');
  const panel = document.querySelector('[data-panel]');
  const setMenu = (open) => {
    html.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.querySelector('span').textContent = open ? 'Close' : 'Menu';
    document.body.style.overflow = open ? 'hidden' : '';
    panel.toggleAttribute('inert', !open);
    if (open) setTimeout(() => panel.querySelector('a')?.focus(), 80);
  };
  panel.setAttribute('inert', '');
  btn.addEventListener('click', () => setMenu(!html.classList.contains('menu-open')));
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && html.classList.contains('menu-open')) { setMenu(false); btn.focus(); }
    if (e.key === 'Tab' && html.classList.contains('menu-open')) {
      const f = [btn, ...panel.querySelectorAll('a')];
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });
  matchMedia('(min-width:1081px)').addEventListener('change', (m) => m.matches && setMenu(false));

  /* Titres découpés en lignes : <h1 class="line-in"><span><span>…</span></span></h1> écrit dans le HTML */
  /* Apparitions au scroll */
  const targets = document.querySelectorAll('[data-reveal],[data-mask],.line-in');
  if (motion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.01 });
    targets.forEach((t) => io.observe(t));
    /* filet de sécurité : rien ne reste caché */
    setTimeout(() => targets.forEach((t) => {
      const r = t.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) t.classList.add('is-in');
    }), 1800);
  } else {
    targets.forEach((t) => t.classList.add('is-in'));
  }

  /* Vidéos décoratives : lecture seulement visibles, bouton pause obligatoire (WCAG 2.2.2) */
  document.querySelectorAll('[data-autoplay]').forEach((v) => {
    const wrap = v.closest('[data-video]');
    const toggle = wrap?.querySelector('[data-video-toggle]');
    let userPaused = !motion;
    const sync = () => toggle && (toggle.textContent = v.paused ? 'Play video' : 'Pause video');
    const loadSources = () => {
      const lazy = v.querySelectorAll('source[data-src]');
      if (lazy.length) { lazy.forEach((so) => { so.src = so.dataset.src; so.removeAttribute('data-src'); }); v.load(); }
      else if (!v.currentSrc && v.dataset.src) v.src = v.dataset.src;
    };
    if (toggle) toggle.addEventListener('click', () => {
      if (v.paused) { userPaused = false; loadSources(); v.play().catch(() => {}); }
      else { userPaused = true; v.pause(); }
      sync();
    });
    v.addEventListener('play', sync); v.addEventListener('pause', sync);
    new IntersectionObserver(([en]) => {
      if (en.isIntersecting && !userPaused) {
        loadSources();
        v.play().catch(() => {});
      } else v.pause();
    }, { threshold: 0.25 }).observe(v);
    sync();
  });

  /* Textes datés : après la date, on bascule vers data-after */
  document.querySelectorAll('[data-until]').forEach((n) => {
    const end = new Date(n.dataset.until + 'T23:59:59');
    if (new Date() > end && n.dataset.after) n.textContent = n.dataset.after;
  });

  /* Année courante */
  document.querySelectorAll('[data-year]').forEach((n) => (n.textContent = new Date().getFullYear()));
})();
