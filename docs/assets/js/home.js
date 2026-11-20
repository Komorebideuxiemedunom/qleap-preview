/* Accueil : séquence « release » pilotée par le scroll (rendu déterministe render(p), p de 0 à 4),
   manifeste mot à mot, parallaxe légère, prochaines sessions depuis sessions.json. Sans dépendance. */
(() => {
  const motion = document.documentElement.classList.contains('motion');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const io = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  /* ---------- Séquence ---------- */
  const stage = $('.stage'), inner = $('[data-stage]'), canvas = $('[data-canvas]');
  const steps = $$('.step');
  if (stage && canvas) {
    const win = $('[data-win]'), body = $('.win-body', win);
    const fields = $$('[data-f]', win).sort((a, b) => a.dataset.f - b.dataset.f);
    const focus = $('[data-focus]'), notes = $$('[data-note]'), rails = $$('[data-rail]'), railMark = $('[data-rail-mark]');
    const tcs = $$('[data-tc]'), st = tcs.map((li) => $('[data-st]', li)), count = $('[data-count]');
    const perf = $('[data-perf]'), curve = $('[data-curve]'), dot = $('[data-dot]'), val = $('[data-val]');
    const toasts = $$('[data-toast]'), nofocus = $('[data-nofocus]'), confirmBtn = $('[data-confirm]');
    const issues = $$('[data-issue]'), ship = $('[data-ship]'), rc = $('[data-rc]');
    const failTxt = $$('.reqs--fail li');
    let K = 1;

    const fit = () => {
      const cs = getComputedStyle(stage);
      const w = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const h = (stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)) || innerHeight * .6;
      const compact = innerWidth < 700;
      stage.classList.toggle('is-compact', compact);
      const cw = compact ? 600 : 960;
      K = Math.min(w / cw, (h - 8) / 640);
      inner.style.width = cw * K + 'px';
      inner.style.height = 640 * K + 'px';
      inner.style.aspectRatio = 'auto';
      canvas.style.setProperty('--k', K);
    };
    /* positions dans le repère de la fenêtre */
    const box = (el) => ({ x: el.offsetLeft + body.offsetLeft, y: el.offsetTop + body.offsetTop, w: el.offsetWidth, h: el.offsetHeight });
    let B = [];
    const measure = () => {
      B = fields.map(box);
      const heading = $('.win-h', win);
      const hb = box(heading), btn = B[4], seats = B[3];
      notes[0].style.cssText = `left:${seats.x + seats.w - 34}px;top:${seats.y - 4}px`;
      notes[1].style.cssText = `left:${hb.x + 190}px;top:${hb.y + 4}px`;
      notes[2].style.cssText = `left:${btn.x + btn.w - 40}px;top:${btn.y + btn.h - 6}px`;
    };

    const tcState = (p, run, fail, pass) => (p < run ? 0 : p < fail ? 1 : p < pass ? 2 : 3);
    const LABEL = ['Not run', 'Running', 'Failed', 'Passed'];
    const CLS = ['', 'is-run', 'is-fail', 'is-pass'];
    const TIMES = [[2.0, 2.31, 3.34], [2.36, 2.62, 3.5], [2.68, 2.93, 3.66]];
    const lerpBox = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, w: a.w + (b.w - a.w) * t, h: a.h + (b.h - a.h) * t });

    const render = (p) => {
      /* rail + étape active */
      const idx = Math.min(3, Math.floor(p));
      rails.forEach((r, i) => r.classList.toggle('on', i <= idx));
      railMark.style.transform = `translateX(${idx * 100}%) scaleX(${0.15 + 0.85 * ease(clamp(p - idx))})`;
      steps.forEach((s, i) => s.classList.toggle('is-active', i === idx));

      /* 01 analyse : notes */
      notes.forEach((n, i) => {
        const a = ease(seg(p, .15 + i * .18, .35 + i * .18));
        const fade = 1 - .6 * seg(p, 1.7, 1.9) - .4 * seg(p, 1.95, 2.05);
        n.style.opacity = a * fade;
        n.style.transform = `translateY(${(1 - a) * 10}px)`;
      });

      /* 02 plan */
      tcs.forEach((li, i) => { li.style.opacity = .25 + .75 * ease(seg(p, 1.1 + i * .18, 1.35 + i * .18)); });

      /* statuts + compteur */
      let open = 0;
      TIMES.forEach(([r, f, ps], i) => {
        const s = tcState(p, r, f, ps);
        if (st[i].textContent !== LABEL[s]) { st[i].textContent = LABEL[s]; st[i].className = CLS[s]; }
        if (s === 2) open++;
        if (failTxt[i]) failTxt[i].classList.toggle('is-pending', s < 2);
      });
      if (count.textContent !== String(open)) count.textContent = open;
      count.classList.toggle('is-fail', open > 0);

      /* 03a TC-01 : le focus clavier parcourt le formulaire puis saute le bouton */
      const f1 = seg(p, 2.0, 2.3);
      const fOn = seg(p, 2.0, 2.04) * (1 - seg(p, 2.98, 3.04));
      focus.style.opacity = fOn;
      if (fOn > 0 && B.length) {
        const path = [B[0], B[1], B[2], B[3], B[5]];
        const t = f1 * (path.length - 1), k = Math.min(path.length - 2, Math.floor(t));
        const b = lerpBox(path[k], path[k + 1], io(clamp(t - k)));
        focus.style.transform = `translate(${b.x - 6}px,${b.y - 6}px)`;
        focus.style.width = b.w + 12 + 'px';
        focus.style.height = b.h + 12 + 'px';
      }
      const miss = seg(p, 2.26, 2.31) * (1 - seg(p, 3.3, 3.34));
      nofocus.style.opacity = miss;
      confirmBtn.style.outlineColor = miss > .5 ? 'var(--fail)' : 'transparent';

      /* 03b TC-02 : courbe de temps de réponse */
      const pv = seg(p, 2.36, 2.42) * (1 - seg(p, 2.64, 2.68));
      perf.style.opacity = pv;
      perf.style.transform = `translateY(${(1 - ease(seg(p, 2.36, 2.42))) * 18}px)`;
      curve.style.strokeDashoffset = 640 * (1 - io(seg(p, 2.42, 2.6)));
      const hit = seg(p, 2.59, 2.62);
      dot.style.opacity = hit; val.style.opacity = hit;

      /* 03c TC-03 : double réservation */
      toasts.forEach((t, i) => {
        const a = ease(seg(p, 2.7 + i * .12, 2.76 + i * .12)) * (1 - seg(p, 3.0, 3.06));
        t.style.opacity = a;
        t.style.transform = `translateX(${(1 - a) * 24}px)`;
      });

      /* 04 rapport : fiches, trait de correction, re-test */
      issues.forEach((card, i) => {
        const a = ease(seg(p, 3.04 + i * .06, 3.14 + i * .06)) * (1 - seg(p, 3.78, 3.86));
        card.style.opacity = a;
        card.style.transform = `translateY(${(1 - a) * 22}px)`;
        const s0 = 3.22 + i * .16;
        const sl = io(seg(p, s0, s0 + .08));
        card.style.setProperty('--s', sl);
        card.classList.toggle('is-fixed', sl > .99);
        $('.fixed', card).style.opacity = seg(p, s0 + .1, s0 + .13);
      });
      const sh = ease(seg(p, 3.84, 3.96));
      ship.style.opacity = sh;
      ship.style.transform = `translateY(${(1 - sh) * 16}px)`;
      const live = p > 3.9 ? 'Release 4.2 · live' : 'Release 4.2 · candidate';
      if (rc.textContent !== live) rc.textContent = live;
    };

    /* progression = somme des progressions locales de chaque étape (ligne de lecture à 62 % de l'écran) */
    const progress = () => {
      const line = innerHeight * .62;
      return steps.reduce((acc, s) => {
        const r = s.getBoundingClientRect();
        return acc + clamp((line - r.top) / r.height);
      }, 0);
    };

    /* étape dont le titre a passé la ligne de lecture (mode mouvement réduit) */
    const readStep = () => Math.max(0, steps.filter((s) => $('.h3', s).getBoundingClientRect().top < innerHeight * .62).length - 1);
    let cur = 0, target = 0, raf = 0;
    const tick = () => {
      cur += (target - cur) * .14;
      if (Math.abs(target - cur) < .0005) cur = target;
      render(cur);
      raf = cur !== target ? requestAnimationFrame(tick) : 0;
    };
    const onScroll = () => {
      if (motion) { target = progress(); if (!raf) raf = requestAnimationFrame(tick); }
      else {
        /* mouvement réduit : on affiche directement l'état final de l'étape lue */
        render(readStep() + .999);
      }
    };
    const setup = () => { fit(); measure(); cur = target = progress(); render(motion ? cur : readStep() + .999); };
    addEventListener('resize', () => { fit(); measure(); onScroll(); });
    addEventListener('scroll', onScroll, { passive: true });
    document.fonts?.ready.then(setup);
    setup();
  }

  /* ---------- Manifeste : les mots s'allument au scroll ---------- */
  const q = $('[data-words]');
  if (q) {
    const words = q.textContent.trim().split(/\s+/);
    q.setAttribute('aria-label', q.textContent.trim());
    q.innerHTML = words.map((w) => `<span class="w${/^not$/i.test(w) ? ' hit' : ''}" aria-hidden="true">${w}</span>`).join(' ');
    const spans = $$('.w', q), hitEl = $('.hit', q);
    if (motion) {
      const upd = () => {
        const r = q.getBoundingClientRect();
        const t = clamp((innerHeight * .85 - r.top) / (innerHeight * .55));
        const n = Math.round(t * spans.length);
        spans.forEach((s, i) => s.classList.toggle('on', i < n));
        hitEl && hitEl.style.setProperty('--hit', clamp((t - .78) / .2));
      };
      addEventListener('scroll', upd, { passive: true }); upd();
    }
  }

  /* ---------- Parallaxe légère des photos ---------- */
  const px = $$('[data-parallax]');
  if (motion && px.length) {
    const upd = () => px.forEach((el) => {
      const r = el.getBoundingClientRect();
      const c = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      el.style.transform = `translateY(${c * (parseFloat(el.dataset.speed) || -0.05) * 100}px)`;
    });
    addEventListener('scroll', () => requestAnimationFrame(upd), { passive: true }); upd();
  }

  /* ---------- Prochaines sessions ---------- */
  const tb = $('[data-sessions]');
  if (tb && 'fetch' in window) {
    fetch((window.QBASE||'/')+'assets/data/sessions.json').then((r) => r.json()).then((list) => {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const fmt = (d, o) => new Date(d + 'T12:00:00').toLocaleDateString('en-GB', o);
      const next = list.filter((s) => new Date(s.start + 'T00:00:00') >= today)
        .sort((a, b) => a.start.localeCompare(b.start)).slice(0, 3);
      if (!next.length) {
        tb.innerHTML = '<tr><td colspan="3">Next dates on request: <a href="mailto:training@q-leap.eu">training@q-leap.eu</a></td></tr>';
        return;
      }
      tb.innerHTML = next.map((s) => {
        const same = s.start.slice(0, 7) === s.end.slice(0, 7);
        const dates = `${fmt(s.start, same ? { day: 'numeric' } : { day: 'numeric', month: 'short' })} to ${fmt(s.end, { day: 'numeric', month: 'short', year: 'numeric' })}`;
        const price = s.price_eur_ex_vat ? '€' + s.price_eur_ex_vat.toLocaleString('en-GB') : 'On request';
        const title = s.title.replace(/\s-\s/, ', ');
        return `<tr><td><a href="${window.QBASE||'/'}training/#${s.slug}">${title}</a></td><td class="num">${dates}</td><td class="num">${price}</td></tr>`;
      }).join('');
    }).catch(() => {});
  }
})();
