/* =====================================================================
   Duas vozes, os mesmos valores — main.js
   GSAP + ScrollTrigger (único motor de animação da página)
   ===================================================================== */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGSAP = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  /* -------------------------------------------------------------------
     1. HERO — sequência de frames controlada pelo scroll
     ------------------------------------------------------------------- */
  function initHero() {
    const hero = document.getElementById("hero");
    if (!hero || reduceMotion || !hasGSAP) return;

    const stage = hero.querySelector(".hero__stage");
    const canvas = hero.querySelector(".hero__canvas");
    const ctx = canvas.getContext("2d", { alpha: false });
    const title = hero.querySelector(".hero__title");
    const hint = hero.querySelector(".hero__hint");
    const scrim = hero.querySelector(".hero__scrim");
    const quotes = Array.from(hero.querySelectorAll(".hq"));
    const FRAMES = parseInt(hero.dataset.frames, 10) || 99;
    const FRAME_W = 1280, FRAME_H = 720;

    const images = new Array(FRAMES);
    let loaded = 0;
    let current = -1;
    let pendingFrame = 0;

    const src = (i) => `assets/hero/f_${String(i + 1).padStart(3, "0")}.webp`;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(stage.clientWidth * dpr);
      canvas.height = Math.round(stage.clientHeight * dpr);
      current = -1;
      draw(pendingFrame);
    }

    function draw(i) {
      pendingFrame = i;
      // usa o frame mais próximo já carregado (busca para trás e para frente)
      let img = images[i];
      if (!img || !img.complete) {
        let found = null;
        for (let d = 1; d < FRAMES && !found; d++) {
          if (images[i - d] && images[i - d].complete) found = images[i - d];
          else if (images[i + d] && images[i + d].complete) found = images[i + d];
        }
        img = found;
      }
      if (!img || i === current) return;
      current = i;
      const cw = canvas.width, ch = canvas.height;
      const scale = Math.max(cw / FRAME_W, ch / FRAME_H);
      const w = FRAME_W * scale, h = FRAME_H * scale;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    }

    // Carrega o primeiro frame, marca pronto, depois o resto em ordem
    function loadFrame(i) {
      return new Promise((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => { loaded++; resolve(img); };
        img.onerror = () => resolve(null);
        img.src = src(i);
        images[i] = img;
      });
    }

    loadFrame(0).then(() => {
      resize();
      hero.classList.add("is-ready");
      // carrega o restante em ordem, com 6 downloads simultâneos
      let next = 1;
      const CONCURRENCY = 6;
      const pump = () => {
        if (next >= FRAMES) return;
        const i = next++;
        loadFrame(i).then(() => {
          current = -1; draw(pendingFrame);
          pump();
        });
      };
      for (let k = 0; k < CONCURRENCY; k++) pump();
    });

    window.addEventListener("resize", resize);

    /* ---- Timeline de scroll ---- */
    const N = quotes.length;
    const Q_START = 0.17;   // depois da revoada (2s ≈ 16%)
    const Q_END = 0.97;
    const win = (Q_END - Q_START) / N;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "+=" + (FRAMES * 55) + "px", // ~5400px de rolagem
        pin: stage,
        pinSpacing: true,
        scrub: 0.6,
        anticipatePin: 1,
        onUpdate(self) {
          const p = self.progress;
          draw(Math.min(FRAMES - 1, Math.round(p * (FRAMES - 1))));
          hero.style.setProperty("--hero-shade", Math.max(0, (p - 0.6) / 0.4).toFixed(3));
        }
      }
    });

    // Título e hint saem logo no início
    tl.to(title, { opacity: 0, y: -40, scale: 0.96, duration: 0.09, ease: "power2.in" }, 0.01);
    tl.to(scrim, { opacity: 0.3, duration: 0.14, ease: "power1.out" }, 0.01);
    tl.to(hint, { opacity: 0, duration: 0.05 }, 0);

    // Frases alternadas
    quotes.forEach((q, i) => {
      const s = Q_START + i * win;
      const fade = win * 0.28;
      const dir = q.classList.contains("hq--left") ? -1 : 1;
      tl.fromTo(q, { opacity: 0, x: 28 * dir }, { opacity: 1, x: 0, duration: fade, ease: "power2.out" }, s);
      tl.to(q, { opacity: 0, x: -18 * dir, duration: fade, ease: "power2.in" }, s + win - fade);
    });
  }

  /* -------------------------------------------------------------------
     2. LINHA DO TEMPO — horizontal, pinada, fundo por item
     ------------------------------------------------------------------- */
  function initTimeline() {
    const section = document.getElementById("linha-do-tempo");
    if (!section || reduceMotion || !hasGSAP) return;

    const pin = section.querySelector(".timeline__pin");
    const track = section.querySelector(".timeline__track");
    const items = Array.from(section.querySelectorAll(".tl-item"));
    const bgs = Array.from(section.querySelectorAll(".timeline__bg"));
    const rail = section.querySelector(".timeline__rail");
    const railFill = section.querySelector(".timeline__rail-fill");
    const sizeRail = () => { rail.style.width = track.scrollWidth + "px"; };
    sizeRail();
    window.addEventListener("resize", sizeRail);
    const counterCur = section.querySelector(".timeline__counter-cur");
    const counterTotal = section.querySelector(".timeline__counter-total");
    const N = items.length;
    counterTotal.textContent = String(N).padStart(2, "0");

    let active = -1;
    function setActive(i) {
      if (i === active) return;
      active = i;
      items.forEach((el, k) => el.classList.toggle("is-active", k === i));
      const key = items[i].dataset.bg;
      bgs.forEach((b) => b.classList.toggle("is-active", b.dataset.bg === key));
      counterCur.textContent = String(i + 1).padStart(2, "0");
    }
    setActive(0);

    gsap.to(track, {
      x: () => -(track.scrollWidth - window.innerWidth),
      ease: "none",
      scrollTrigger: {
        trigger: pin,
        start: "top top",
        end: () => "+=" + (N * Math.max(600, window.innerHeight * 0.85)),
        pin: pin,
        scrub: 0.8,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onUpdate(self) {
          const p = self.progress;
          setActive(Math.min(N - 1, Math.round(p * (N - 1))));
          const gutter = items[0].getBoundingClientRect().left + parseFloat(getComputedStyle(items[0]).paddingLeft) - track.getBoundingClientRect().left;
          railFill.style.width = (gutter + p * (track.scrollWidth - window.innerWidth) + 8) + "px";
        }
      }
    });
  }

  /* -------------------------------------------------------------------
     3. Accordion (múltiplos abertos, botão inteiro clicável)
     ------------------------------------------------------------------- */
  function initMenu() {
    const btn = document.querySelector(".topbar__toggle");
    const nav = document.getElementById("mainNav");
    if (!btn || !nav) return;
    btn.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
      nav.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false");
    }));
  }

  function initAccordions() {
    document.querySelectorAll(".acc__btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!open));
      });
    });
  }

  /* -------------------------------------------------------------------
     4. Trilha sonora
     ------------------------------------------------------------------- */
  function initAudio() {
    const btn = document.getElementById("playTrilha");
    const audio = document.getElementById("trilha");
    if (!btn || !audio) return;
    const label = btn.querySelector(".play__label");
    const time = btn.querySelector(".play__time");
    const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

    btn.addEventListener("click", () => {
      if (audio.paused) audio.play(); else audio.pause();
    });
    audio.addEventListener("play", () => {
      btn.classList.add("is-playing"); btn.setAttribute("aria-pressed", "true");
      label.textContent = "Tocando a trilha — pausar";
    });
    audio.addEventListener("pause", () => {
      btn.classList.remove("is-playing"); btn.setAttribute("aria-pressed", "false");
      label.textContent = audio.currentTime > 0 && audio.currentTime < audio.duration ? "Continuar a trilha" : "Ouça a trilha sonora";
    });
    audio.addEventListener("timeupdate", () => {
      if (!audio.duration) return;
      time.textContent = fmt(audio.currentTime);
      btn.style.setProperty("--p", (audio.currentTime / audio.duration).toFixed(4));
    });
    audio.addEventListener("ended", () => {
      btn.style.setProperty("--p", 0); time.textContent = "0:00";
      label.textContent = "Ouça a trilha sonora";
    });
  }

  /* -------------------------------------------------------------------
     5. Reveals discretos (uma passada) nos blocos de conteúdo
     ------------------------------------------------------------------- */
  function initReveals() {
    const targets = document.querySelectorAll(
      ".sociedade, .resultado, .frente, .vtl__item, .trilha, .mosaico, .grid3 .card, .status, .entregas, .media-block, .imagine, .note, .livro__capa, .radial, .topics, .hub, .gantt, .proximo__title, .proximo__steps li, .proximo__closing, .assinatura__logo"
    );
    targets.forEach((el) => el.setAttribute("data-reveal", ""));
    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    targets.forEach((el) => io.observe(el));
  }

  /* ------------------------------------------------------------------- */
  window.addEventListener("load", () => {
    initHero();
    initTimeline();
    initMenu();
    initAccordions();
    initAudio();
    initReveals();
    if (hasGSAP) ScrollTrigger.refresh();
  });
})();
