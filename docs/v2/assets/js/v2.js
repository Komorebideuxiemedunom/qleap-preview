/* Q-LEAP V2 « Test run ». Journal local de la visite (sessionStorage de l'onglet, rien n'est envoyé),
   apparitions, lettres défilantes, matrice, vidéo pilotée par le scroll, tableau des départs, scénario final. */
(() => {
  const html = document.documentElement;
  const motion = html.classList.contains('motion');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const BASE = (window.QBASE || '/');
  const KEY = 'qleap-v2-run';
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- journal ---------- */
  let log = [];
  const OFF = 'qleap-v2-off';
  let off = false;
  try { off = sessionStorage.getItem(OFF) === '1'; log = off ? [] : JSON.parse(sessionStorage.getItem(KEY) || '[]').slice(-40); } catch { log = []; }
  const save = () => { if (off) return; try { sessionStorage.setItem(KEY, JSON.stringify(log)); } catch {} };
  const ul = $('[data-r-log]'), empty = $('[data-r-empty]');
  const countEl = $('[data-r-count]'), countM = $('[data-r-count-m]'), stepsEl = $('[data-r-steps]'), bar = $('[data-r-bar]'), cur = $('[data-r-current]');
  const pad = (n) => String(n).padStart(2, '0');
  const total = () => Math.max(7, $$('[data-step]').length);
  const draw = (fresh) => {
    if (!ul) return;
    const pageSteps = $$('[data-step]');
    const done = (st) => log.some((e) => e.id === st.dataset.stepId);
    const seen = pageSteps.filter(done).length;
    const pending = pageSteps.filter((st) => !done(st)).map((st) => ({ k: st.dataset.step, t: st.dataset.line }));
    const shown = log.slice(-8), hidden = log.length - shown.length;
    ul.innerHTML = (hidden > 0 ? `<li class="r-more"><i>+${hidden}</i><span>earlier steps, in the scenario below</span></li>` : '') +
      shown.map((e, i) => `<li class="${fresh && i === shown.length - 1 ? 'is-new' : ''}"><i>${esc(e.k)}</i><span>${esc(e.t)}</span></li>`).join('') +
      pending.slice(0, 7).map((e) => `<li class="is-pending"><i>${esc(e.k)}</i><span>${esc(e.t)}</span></li>`).join('');
    const lastDone = ul.querySelector('li:not(.is-pending):last-of-type');
    lastDone && lastDone.scrollIntoView && (ul.scrollTop = Math.max(0, lastDone.offsetTop - ul.clientHeight / 2));
    if (empty) empty.hidden = log.length > 0;
    const t = pageSteps.length || 1;
    countEl && (countEl.textContent = pad(seen));
    countM && (countM.textContent = pad(seen) + '/' + pad(pageSteps.length));
    stepsEl && (stepsEl.textContent = 'this page: ' + seen + ' of ' + pageSteps.length);
    bar && bar.style.setProperty('--p', (seen / t) * 100 + '%');
    document.dispatchEvent(new CustomEvent('qrun:change'));
  };
  const add = (k, t, id) => {
    id = id || k + ':' + t;
    if (off || log.some((e) => e.id === id)) return;
    log.push({ k, t, id });
    if (log.length > 40) log = log.slice(-40);
    save(); draw(true);
  };
  window.QRUN = { add, get: () => log.slice() };
  draw(false);

  /* (runner déclaré plus bas) */
  /* étape d'une page intérieure : on note la page */
  const feat = document.body.dataset.feature;
  if (feat) add('When', 'you open ' + feat, 'page:' + location.pathname);

  /* sections-étapes */
  const steps = $$('[data-step]');
  steps.forEach((s, i) => (s.dataset.stepId = s.dataset.stepId || 'step:' + location.pathname + ':' + i));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((ens) => ens.forEach((en) => {
      if (en.isIntersecting && !en.target.hasAttribute('data-step-on-action')) { add(en.target.dataset.step, en.target.dataset.line, en.target.dataset.stepId); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -45% 0px', threshold: 0 });
    steps.forEach((s) => io.observe(s));
  }
  /* portes choisies */
  $$('[data-gate]').forEach((a) => a.addEventListener('click', () => add('And', 'you choose the gate "' + a.dataset.gate + '"', 'gate:' + a.dataset.gate)));
  /* clavier, mouvement réduit */
  /* effacer */
  $('[data-r-clear]')?.addEventListener('click', () => { log = []; try { sessionStorage.removeItem(KEY); } catch {} draw(false); });
  const stopBtn = $('[data-r-stop]');
  const syncStop = () => { if (stopBtn) stopBtn.textContent = off ? 'Resume logging' : 'Stop logging'; runner?.classList.toggle('is-off', off); };
  stopBtn?.addEventListener('click', () => {
    off = !off;
    try { if (off) { sessionStorage.removeItem(KEY); sessionStorage.setItem(OFF, '1'); } else sessionStorage.removeItem(OFF); } catch {}
    if (off) log = [];
    syncStop(); draw(false);
  });

  /* runner mobile */
  const runner = $('[data-runner]'), tgl = $('[data-r-toggle]');
  setTimeout(() => syncStop && syncStop(), 0);
  tgl?.addEventListener('click', () => {
    const open = !runner.classList.contains('is-open');
    runner.classList.toggle('is-open', open);
    tgl.setAttribute('aria-expanded', String(open));
  });
  /* menu mobile */
  const mb = $('[data-menu]');
  mb?.addEventListener('click', () => {
    const open = !html.classList.contains('menu-open');
    html.classList.toggle('menu-open', open);
    mb.setAttribute('aria-expanded', String(open));
    mb.textContent = open ? 'Close' : 'Menu';
    if (open) $('.top nav a')?.focus();
  });
  addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (html.classList.contains('menu-open')) { mb.click(); mb.focus(); }
    if (runner?.classList.contains('is-open')) { tgl.click(); tgl.focus(); }
  });

  /* ---------- apparitions ---------- */
  const rev = $$('[data-rise],[data-wipe],.matrix,[data-flap]');
  if (motion && 'IntersectionObserver' in window) {
    const io2 = new IntersectionObserver((ens) => ens.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('in'); if (en.target.hasAttribute('data-flap')) flap(en.target); io2.unobserve(en.target); }
    }), { rootMargin: '0px 0px -10% 0px' });
    rev.forEach((el) => io2.observe(el));
  } else rev.forEach((el) => el.classList.add('in'));

  /* ---------- lettres défilantes (texte réel en aria-label) ---------- */
  const CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  function flap(el) {
    if (!motion || el.dataset.flapped) return;
    el.dataset.flapped = '1';
    const text = el.textContent;
    el.setAttribute('aria-label', text);
    el.innerHTML = [...text].map((c) => `<span aria-hidden="true">${c === ' ' ? '&nbsp;' : esc(c)}</span>`).join('');
    const spans = $$('span', el);
    spans.forEach((s, i) => {
      const final = text[i];
      if (final === ' ') return;
      let n = 0; const max = 6 + Math.floor(i * 0.6);
      const t = setInterval(() => {
        s.textContent = n >= max ? final : CH[Math.floor(Math.random() * CH.length)];
        if (n++ >= max) clearInterval(t);
      }, 38);
    });
  }

  /* ---------- vidéo pilotée par le scroll (Q-Bot) ---------- */
  $$('[data-scrub]').forEach((sec) => {
    const v = $('video', sec), caps = $$('[data-cap]', sec), barS = $('.scrub-bar i', sec);
    const small = () => innerWidth < 1024;
    const goStatic = () => { sec.classList.add('is-static'); v.controls = true; v.preload = 'metadata'; };
    if (!motion || small()) { goStatic(); return; }
    v.addEventListener('error', goStatic, true);
    addEventListener('resize', () => { if (small()) goStatic(); });
    v.preload = 'auto'; v.muted = true; v.pause();
    let target = 0, now = 0, raf = 0;
    const tick = () => {
      now += (target - now) * 0.18;
      if (Math.abs(target - now) < 0.002) now = target;
      if (v.duration) { try { v.currentTime = now * (v.duration - 0.05); } catch {} }
      raf = now !== target ? requestAnimationFrame(tick) : 0;
    };
    const upd = () => {
      if (sec.classList.contains('is-static')) return;
      const r = sec.getBoundingClientRect();
      const p = clamp(-r.top / (r.height - innerHeight));
      target = p;
      caps.forEach((c) => c.classList.toggle('on', p >= +c.dataset.from && p < +c.dataset.to));
      barS && (barS.style.width = p * 100 + '%');
      if (p > 0.2 && v.readyState >= 2) add('And', 'you watch Q-Bot pass a LuxTrust 2FA', 'qbot');
      if (!raf) raf = requestAnimationFrame(tick);
    };
    addEventListener('scroll', upd, { passive: true });
    v.addEventListener('loadedmetadata', upd);
    upd();
  });

  /* ---------- vidéo décorative avec bouton pause (Q-Guard) ---------- */
  $$('[data-autoplay]').forEach((v) => {
    const btn = v.parentElement.querySelector('[data-video-toggle]');
    let userPaused = !motion;
    const load = () => { $$('source[data-src]', v).forEach((s) => { s.src = s.dataset.src; s.removeAttribute('data-src'); }); if (!v.currentSrc) v.load(); };
    const sync = () => btn && (btn.textContent = v.paused ? 'Play video' : 'Pause video');
    btn?.addEventListener('click', () => { if (v.paused) { userPaused = false; load(); v.play().catch(() => {}); } else { userPaused = true; v.pause(); } sync(); });
    v.addEventListener('play', sync); v.addEventListener('pause', sync);
    new IntersectionObserver(([en]) => { if (en.isIntersecting && !userPaused) { load(); v.play().catch(() => {}); } else v.pause(); }, { threshold: 0.3 }).observe(v);
    sync();
  });

  /* ---------- tableau des départs : prochaines sessions ---------- */
  const board = $('[data-departures]');
  if (board && 'fetch' in window) {
    fetch(BASE + 'assets/data/sessions.json').then((r) => r.json()).then((list) => {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const next = list.filter((s) => new Date(s.start + 'T00:00:00') >= today).sort((a, b) => a.start.localeCompare(b.start)).slice(0, 4);
      if (!next.length) return;
      const fmt = (d) => new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase();
      const days = (s) => Math.round((new Date(s.end) - new Date(s.start)) / 864e5) + 1;
      board.innerHTML = next.map((s) => {
        const title = s.title.replace(/\s-\s/, ', ');
        const sub = `Training: ${title}, ${s.start} to ${s.end}`;
        const body = `Hello,\n\nWe would like to book: ${title}\nDates: ${s.start} to ${s.end}\nNumber of participants:\nCompany:\nInvoice to the company (yes/no):\nName:`;
        return `<a href="mailto:training@q-leap.eu?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(body)}"><span class="b-gate"><span data-flap>${fmt(s.start)}</span></span><span class="b-dest">${esc(title)}</span><span class="b-info">${days(s)} days · ${s.price_eur_ex_vat ? '€' + Number(s.price_eur_ex_vat).toLocaleString('en-GB') + ' excl. VAT' : 'price on request'}${s.language ? ' · ' + esc(s.language) : ''}</span><span class="b-stat">Book a seat</span></a>`;
      }).join('');
      if (motion) {
        const io3 = new IntersectionObserver(([en]) => { if (en.isIntersecting) { $$('[data-flap]', board).forEach(flap); io3.disconnect(); } });
        io3.observe(board);
      }
    }).catch(() => {});
  }

  /* ---------- scénario final ---------- */
  const out = $('[data-scenario]'), send = $('[data-send]');
  const compile = () => {
    const lines = ['Feature: A visit to q-leap.eu', '', '  Scenario: Your test run'];
    const body = log.length ? log : [{ k: 'Given', t: 'you open q-leap.eu' }];
    body.forEach((e) => lines.push('    ' + e.k.padEnd(5) + ' ' + e.t));
    return lines.join('\n');
  };
  const renderScenario = () => {
    if (!out) return;
    const txt = compile();
    out.innerHTML = esc(txt).replace(/^(\s*)(Feature:|Scenario:|Given|When|And|Then)/gm, '$1<span class="k">$2</span>');
    if (send) {
      let body = 'Hello Q-Leap,\n\nHere is what I looked at on your site:\n\n' + txt + '\n\nWhat we need:\n\nName:\nCompany:';
      if (body.length > 1800) body = body.slice(0, 1800) + '\n[...]';
      const gate = log.find((e) => e.id && e.id.startsWith('gate:'));
      const subject = 'My visit to q-leap.eu' + (gate ? ': ' + gate.id.slice(5) : '');
      send.href = 'mailto:contact@q-leap.eu?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    }
  };
  const finalStep = $('[data-step-on-action]');
  const passFinal = () => finalStep && add(finalStep.dataset.step, finalStep.dataset.line, finalStep.dataset.stepId);
  send?.addEventListener('click', passFinal);
  $('[data-copy-scenario]')?.addEventListener('click', passFinal);
  $('[data-copy-scenario]')?.addEventListener('click', async (e) => {
    const b = e.currentTarget;
    try { await navigator.clipboard.writeText(compile()); b.textContent = 'Copied'; } catch { b.textContent = 'Copy failed: select the text'; }
    setTimeout(() => (b.textContent = 'Copy scenario'), 2200);
  });
  const rcta = $('.r-cta');
  document.addEventListener('qrun:change', () => { if (rcta && log.length >= 7) rcta.firstChild.textContent = 'Send your scenario '; });
  document.addEventListener('qrun:change', renderScenario);
  renderScenario();
})();
