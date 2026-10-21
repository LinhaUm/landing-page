/* LinhaUm — animações (GSAP + ScrollTrigger + SplitText) e scroll suave (Lenis) */
(() => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Fundo da navegação ao rolar
  const nav = document.querySelector('.nav');
  const onScroll = () => nav && nav.classList.toggle('is-scrolled', window.scrollY > 20);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Holofote nos cards (segue o mouse)
  document.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  const showHero = () => document.documentElement.classList.remove('js');

  if (!window.gsap) { showHero(); return; }

  gsap.registerPlugin(ScrollTrigger, SplitText);

  const mm = gsap.matchMedia();

  // Movimento reduzido: sem Lenis e sem animações
  mm.add('(prefers-reduced-motion: reduce)', () => { showHero(); });

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // ---------- Scroll suave ----------
    let lenis = null;
    if (window.Lenis) {
      lenis = new Lenis({ anchors: true });
      lenis.on('scroll', ScrollTrigger.update);
      const raf = (time) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
    }

    // ---------- Hero ----------
    const hero = document.querySelector('.hero');
    if (hero) {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      showHero();

      const markParts = hero.querySelectorAll('.mark span');
      const eyebrow = hero.querySelector('.eyebrow');
      const title = hero.querySelector('h1');
      const sub = hero.querySelector('.hero-sub');
      const btn = hero.querySelector('.btn');

      if (markParts.length) {
        tl.from(markParts, { autoAlpha: 0, scale: 0.6, filter: 'blur(12px)', duration: 0.9, stagger: 0.12 });
        // "<" e ">" abrem, o "1" fica no centro
        tl.from(markParts[0], { x: 40, duration: 0.9 }, '<')
          .from(markParts[2], { x: -40, duration: 0.9 }, '<');
      }
      if (eyebrow) tl.from(eyebrow, { autoAlpha: 0, y: 12, duration: 0.6 }, '-=0.4');
      if (title) {
        const split = SplitText.create(title, { type: 'words,chars', mask: 'words' });
        tl.from(split.chars, { yPercent: 110, duration: 0.8, stagger: 0.018 }, '-=0.3');
      }
      if (sub) tl.from(sub, { autoAlpha: 0, y: 20, duration: 0.7 }, '-=0.5');
      if (btn) tl.from(btn, { autoAlpha: 0, y: 20, scale: 0.95, duration: 0.7 }, '-=0.45');

      // Parallax do fundo ao sair do hero
      gsap.to(hero.querySelectorAll('.orb-1'), { yPercent: 60, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to(hero.querySelectorAll('.orb-2'), { yPercent: -40, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to(hero.querySelector('.hero-content'), { y: 80, autoAlpha: 0.2, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    }

    // ---------- Texto que acende com o scroll ----------
    document.querySelectorAll('[data-scroll-reveal]').forEach((el) => {
      const split = SplitText.create(el, { type: 'words', wordsClass: 'word' });
      gsap.fromTo(split.words, { opacity: 0.14 }, {
        opacity: 1,
        ease: 'none',
        stagger: 0.05,
        scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true },
      });
    });

    // ---------- Títulos das seções ----------
    document.querySelectorAll('.section-head').forEach((head) => {
      gsap.from(head.children, {
        autoAlpha: 0, y: 28, duration: 0.8, ease: 'power3.out', stagger: 0.1,
        scrollTrigger: { trigger: head, start: 'top 85%' },
      });
    });

    // ---------- Cards, stats e listas entram em sequência ----------
    document.querySelectorAll('[data-stagger]').forEach((group) => {
      gsap.from(group.children, {
        autoAlpha: 0, y: 48, duration: 0.9, ease: 'power3.out', stagger: 0.12,
        scrollTrigger: { trigger: group, start: 'top 85%' },
      });
    });

    document.querySelectorAll('[data-fade]').forEach((el) => {
      gsap.from(el, {
        autoAlpha: 0, y: 30, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' },
      });
    });

    // ---------- Contador ----------
    document.querySelectorAll('[data-count]').forEach((el) => {
      const target = Number(el.dataset.count);
      const obj = { v: 0 };
      gsap.to(obj, {
        v: target, duration: 1.6, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%' },
        onUpdate: () => { el.textContent = Math.round(obj.v); },
      });
    });

    // ---------- Imagem de destaque flutuando ----------
    document.querySelectorAll('.feature-visual img').forEach((img) => {
      gsap.to(img, { y: -14, rotate: -2, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    });

    // ---------- Botões magnéticos (só com mouse) ----------
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (finePointer) {
      document.querySelectorAll('[data-magnet]').forEach((btn) => {
        const xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' });
        const yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' });
        btn.addEventListener('pointermove', (e) => {
          const r = btn.getBoundingClientRect();
          xTo((e.clientX - (r.left + r.width / 2)) * 0.3);
          yTo((e.clientY - (r.top + r.height / 2)) * 0.4);
        });
        btn.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
      });
    }

    // Recalcula quando fontes e imagens terminarem de carregar
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener('load', () => ScrollTrigger.refresh());

    return () => { if (lenis) lenis.destroy(); };
  });
})();
