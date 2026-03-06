/* ═══════════════════════════════════════════════════════════
   EDITORIAL BOLD — Purple Edition  Animations
   cursor · reveal · counter · badge stagger · magnetic btns
   tilt cards · section rule draw · typed tagline
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── 1. Custom cursor ──────────────────────────────────── */
  const cur = document.getElementById('cursor');
  if (cur) {
    document.addEventListener('mousemove', e => {
      cur.style.left = e.clientX + 'px';
      cur.style.top  = e.clientY + 'px';
    });
    document.querySelectorAll('a,button,.badge,.project-item,input,textarea').forEach(el => {
      el.addEventListener('mouseenter', () => cur.classList.add('grow'));
      el.addEventListener('mouseleave', () => cur.classList.remove('grow'));
    });
    document.addEventListener('mouseleave', () => { cur.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { cur.style.opacity = '1'; });
  }

  /* ── 2. Scroll reveal ──────────────────────────────────── */
  const io = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    }),
    { threshold: 0.1, rootMargin: '0px 0px -32px 0px' }
  );
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ── 3. Section rule draw animation ───────────────────── */
  const ruleIo = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('drawn'); ruleIo.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.section-rule').forEach(r => ruleIo.observe(r));

  /* ── 4. Animated number counter ───────────────────────── */
  function animateCounter(el) {
    const target = parseInt(el.textContent, 10);
    if (isNaN(target)) return;
    const duration = 1100;
    const start = performance.now();
    (function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 4);
      el.textContent = Math.round(ease * target);
      if (t < 1) requestAnimationFrame(step);
    })(start);
  }
  const cntIo = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { animateCounter(e.target); cntIo.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat-value').forEach(el => cntIo.observe(el));

  /* ── 5. Badge stagger reveal ───────────────────────────── */
  const badgeWrapIo = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll('.badge').forEach((b, i) => {
        b.style.transition = `opacity .4s ease ${i * 45}ms, transform .4s ease ${i * 45}ms, color .2s, border-color .2s, background .2s, box-shadow .2s`;
        b.classList.add('badge-visible');
      });
      badgeWrapIo.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.skills-wrap').forEach(w => badgeWrapIo.observe(w));

  /* ── 6. Nav: active page highlight ────────────────────── */
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === page) a.classList.add('active');
  });

  /* ── 7. Hero entrance sequence ─────────────────────────── */
  document.querySelectorAll('.hero-enter > *').forEach((el, i) => {
    el.style.cssText += `opacity:0;transform:translateY(22px);transition:opacity .75s ease,transform .75s ease;transition-delay:${i * 120}ms`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    }));
  });

  /* ── 8. Typed tagline (hero page only) ─────────────────── */
  const tagline = document.querySelector('.hero-tagline');
  if (tagline) {
    const full = tagline.textContent.trim();
    tagline.textContent = '';
    tagline.style.borderLeft = '2px solid #a855f7';
    let i = 0;
    const TYPE_DELAY = 1200; // ms before typing starts
    setTimeout(() => {
      const timer = setInterval(() => {
        tagline.textContent = full.slice(0, ++i);
        if (i >= full.length) clearInterval(timer);
      }, 28);
    }, TYPE_DELAY);
  }

  /* ── 9. Magnetic hover on buttons ─────────────────────── */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const x  = e.clientX - r.left - r.width  / 2;
      const y  = e.clientY - r.top  - r.height / 2;
      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  /* ── 10. 3-D tilt on project items ────────────────────── */
  document.querySelectorAll('.project-item').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r   = card.getBoundingClientRect();
      const x   = (e.clientX - r.left) / r.width  - 0.5;
      const y   = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `perspective(800px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ── 11. Interactive skills physics canvas ─────────────── */
  (function initSkillsCanvas() {
    const canvas = document.getElementById('skills-canvas');
    if (!canvas) return;

    const wrap   = canvas.parentElement;
    const ctx    = canvas.getContext('2d');
    const data   = document.getElementById('skills-data');
    if (!data) return;

    const skills = Array.from(data.querySelectorAll('.badge')).map(b => b.textContent.trim().toUpperCase());
    if (!skills.length) return;

    let W, H;
    function resize() {
      W = canvas.width  = wrap.offsetWidth;
      H = canvas.height = wrap.offsetHeight;
    }
    resize();
    window.addEventListener('resize', () => { resize(); });

    /* mouse */
    let mx = -9999, my = -9999;
    wrap.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    });
    wrap.addEventListener('mouseleave', () => { mx = -9999; my = -9999; });

    /* scatter on click */
    wrap.addEventListener('click', () => {
      bubbles.forEach(b => {
        const ang = Math.random() * Math.PI * 2;
        b.vx += Math.cos(ang) * (4 + Math.random() * 6);
        b.vy += Math.sin(ang) * (4 + Math.random() * 6);
      });
    });

    /* measure text */
    ctx.font = 'bold 11px Space Mono, monospace';
    const PAD_X = 22, PAD_Y = 12, R = 4;

    /* bubble colors — purple/violet/fuchsia palette */
    const HUES = [262, 272, 285, 300, 252, 240];

    const bubbles = skills.map((text, i) => {
      const tw = ctx.measureText(text).width;
      const bw = tw + PAD_X * 2;
      const bh = 13 + PAD_Y * 2;
      return {
        text, bw, bh,
        x:  Math.random() * (W - bw) + bw / 2,
        y:  Math.random() * (H - bh) + bh / 2,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        hue: HUES[i % HUES.length],
        hover: false,
        scale: 1,
      };
    });

    /* rounded rect helper */
    function pill(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.arcTo(x + w, y, x + w, y + r, r);
      ctx.lineTo(x + w, y + h - r);
      ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
      ctx.lineTo(x + r, y + h);
      ctx.arcTo(x, y + h, x, y + h - r, r);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.closePath();
    }

    function drawBubble(b) {
      const x = b.x - b.bw / 2;
      const y = b.y - b.bh / 2;
      const s = b.scale;

      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.scale(s, s);
      ctx.translate(-b.x, -b.y);

      /* glow */
      ctx.shadowBlur   = b.hover ? 28 : 8;
      ctx.shadowColor  = `hsla(${b.hue},80%,65%,${b.hover ? .9 : .35})`;

      /* fill */
      pill(x, y, b.bw, b.bh, R);
      ctx.fillStyle = b.hover
        ? `hsla(${b.hue},72%,52%,0.95)`
        : `hsla(${b.hue},55%,22%,0.75)`;
      ctx.fill();

      /* border */
      ctx.strokeStyle = `hsla(${b.hue},70%,65%,${b.hover ? .95 : .4})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.shadowBlur = 0;

      /* text */
      ctx.font = `bold 11px Space Mono, monospace`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = b.hover ? '#fff' : `hsla(${b.hue},70%,78%,0.9)`;
      ctx.fillText(b.text, b.x, b.y);

      ctx.restore();
    }

    const REPEL_R  = 130;
    const ATTRACT_R = 300;
    const MAX_SPD  = 10;
    const FRICTION = 0.965;

    function loop() {
      /* clear */
      ctx.clearRect(0, 0, W, H);

      /* subtle grid */
      ctx.strokeStyle = 'rgba(168,85,247,.04)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < W; gx += 72) { ctx.beginPath(); ctx.moveTo(gx,0); ctx.lineTo(gx,H); ctx.stroke(); }
      for (let gy = 0; gy < H; gy += 72) { ctx.beginPath(); ctx.moveTo(0,gy); ctx.lineTo(W,gy); ctx.stroke(); }

      bubbles.forEach(b => {
        /* mouse forces */
        const dx   = b.x - mx;
        const dy   = b.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        b.hover = dist < 55;
        b.scale += (( b.hover ? 1.12 : 1) - b.scale) * 0.15;

        if (dist < REPEL_R) {
          const f = ((REPEL_R - dist) / REPEL_R) * 1.2;
          b.vx += (dx / dist) * f;
          b.vy += (dy / dist) * f;
        }

        /* friction */
        b.vx *= FRICTION;
        b.vy *= FRICTION;

        /* speed cap */
        const spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        if (spd > MAX_SPD) { b.vx *= MAX_SPD / spd; b.vy *= MAX_SPD / spd; }

        /* move */
        b.x += b.vx;
        b.y += b.vy;

        /* wall bounce */
        const hw = b.bw / 2 + 6, hh = b.bh / 2 + 6;
        if (b.x < hw)     { b.x = hw;     b.vx =  Math.abs(b.vx) * 0.7; }
        if (b.x > W - hw) { b.x = W - hw; b.vx = -Math.abs(b.vx) * 0.7; }
        if (b.y < hh)     { b.y = hh;     b.vy =  Math.abs(b.vy) * 0.7; }
        if (b.y > H - hh) { b.y = H - hh; b.vy = -Math.abs(b.vy) * 0.7; }

        drawBubble(b);
      });

      /* bubble–bubble soft collision */
      for (let i = 0; i < bubbles.length; i++) {
        for (let j = i + 1; j < bubbles.length; j++) {
          const a = bubbles[i], b = bubbles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const minD = (a.bw + b.bw) / 2 - 4;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < minD) {
            const push = (minD - dist) / minD * 0.4;
            a.vx += (dx / dist) * push;
            a.vy += (dy / dist) * push;
            b.vx -= (dx / dist) * push;
            b.vy -= (dy / dist) * push;
          }
        }
      }

      requestAnimationFrame(loop);
    }

    loop();
  })();

  /* ── 12. Sparkle on primary button click ───────────────── */
  function spawnSparkle(e) {
    const btn = e.currentTarget;
    const r   = btn.getBoundingClientRect();
    const x   = e.clientX - r.left;
    const y   = e.clientY - r.top;
    for (let i = 0; i < 6; i++) {
      const dot = document.createElement('span');
      const ang = (i / 6) * 2 * Math.PI;
      const dist = 36 + Math.random() * 24;
      dot.style.cssText = `
        position:fixed;z-index:9998;pointer-events:none;
        width:5px;height:5px;border-radius:50%;
        background:${Math.random() > .5 ? '#a855f7' : '#e879f9'};
        left:${e.clientX}px;top:${e.clientY}px;
        transition:transform .55s ease,opacity .55s ease;
        transform:translate(-50%,-50%);opacity:1;
      `;
      document.body.appendChild(dot);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        dot.style.transform = `translate(calc(-50% + ${Math.cos(ang)*dist}px),calc(-50% + ${Math.sin(ang)*dist}px)) scale(0)`;
        dot.style.opacity = '0';
      }));
      setTimeout(() => dot.remove(), 600);
    }
  }
  document.querySelectorAll('.btn-primary').forEach(b => b.addEventListener('click', spawnSparkle));

})();
