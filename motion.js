"use strict";

// 스크롤 위치가 같은 자리로 돌아오면 광학 효과와 장면도 같은 상태로 돌아온다.
(() => {
  const root = document.documentElement;
  const intro = createOrbIntro(document.querySelector(".hero"));
  const story = document.querySelector(".world-story");
  const panel = story.querySelector(".world-sticky");
  const screen = panel.querySelector(".world-image");
  const meter = document.querySelector(".page-meter");
  const grid = document.querySelector(".member-grid");
  const cards = Array.from(grid.querySelectorAll(".member-card"));
  const choices = Array.from(story.querySelectorAll("[data-world]"));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const clamp = (value) => Math.max(0, Math.min(1, value));
  const ease = (value) => value * value * (3 - 2 * value);
  const towards = (from, to, number) => ease(clamp((number - from) / (to - from)));
  const px = (number) => number.toFixed(2) + "px";
  const unit = (number) => number.toFixed(4);
  const stops = [0.035, 0.515, 0.975];
  let headerHeight, viewportHeight, storySpace, stickyTop;
  let screenWidth, screenHeight;
  let worldMotion = false;
  let activeWorld = 0;
  let lastWorld = -2, lastCards = -2, frame = 0;

  function applyWorld(index, useSingleImage) {
    activeWorld = index;
    showWorld(index, useSingleImage);
  }

  function measure() {
    viewportHeight = document.documentElement.clientHeight;
    headerHeight = document.querySelector(".site-header").offsetHeight;
    root.style.setProperty("--header-height", px(headerHeight));
    root.toggleAttribute("data-motion", !reduced.matches);
    intro.measure(headerHeight, viewportHeight, reduced.matches);
    stickyTop = headerHeight + (window.innerWidth <= 680 ? 12 : 18);
    story.style.setProperty("--world-top", px(stickyTop));
    // 작은 가로 화면에서 하단 설명이나 메뉴가 가려지면 탭으로 장면을 넘긴다.
    worldMotion = !reduced.matches && viewportHeight >= 565;
    root.toggleAttribute("data-world-motion", worldMotion);
    if (worldMotion && panel.offsetHeight + stickyTop + 12 > viewportHeight) {
      worldMotion = false;
      root.removeAttribute("data-world-motion");
    }
    storySpace = Math.min(1180, Math.max(560, viewportHeight * 1.32));
    story.style.setProperty("--panel-height", px(panel.offsetHeight));
    story.style.setProperty("--world-distance", px(storySpace));
    screenWidth = screen.clientWidth; screenHeight = screen.clientHeight;
    if (worldMotion) {
      const base = worlds[0], img = document.querySelector("#world-photo");
      img.srcset = "https://gouri-vote.tailf63b37.ts.net:8443/media/snowglobe-sm.webp 600w, https://gouri-vote.tailf63b37.ts.net:8443/media/snowglobe.webp 1400w";
      img.src = "https://gouri-vote.tailf63b37.ts.net:8443/media/snowglobe.webp"; img.alt = base.alt;
    } else {
      applyWorld(activeWorld, true);
    }
    if (reduced.matches) cards.forEach((card) => card.style.removeProperty("transform"));
    lastWorld = lastCards = -2;
    schedule();
  }

  function worldScene(p) {
    if (p === lastWorld) return;
    lastWorld = p;
    const sim = towards(.10,.48,p), orbs = towards(.55,.92,p);
    const simMax = Math.hypot(screenWidth * .51,screenHeight * .52) + 2;
    const orbMax = Math.hypot(screenWidth * .69,screenHeight * .68) + 2;
    const second = p >= .52;
    const edge = second ? orbs * orbMax : sim * simMax;
    const pass = second ? orbs : sim;
    const bright = Math.sin(Math.PI * pass);
    panel.style.setProperty("--sim-radius", px(sim * simMax));
    panel.style.setProperty("--orb-radius", px(orbs * orbMax));
    panel.style.setProperty("--edge-x", second ? "69%" : "51%");
    panel.style.setProperty("--edge-y", second ? "32%" : "48%");
    panel.style.setProperty("--edge-d", px(edge * 2));
    panel.style.setProperty("--edge-alpha", unit(bright));
    panel.style.setProperty("--globe-zoom", unit(1 + sim * .21));
    panel.style.setProperty("--sim-zoom", unit(1 + (1 - sim) * .17 + orbs * .10));
    panel.style.setProperty("--orb-zoom", unit(1 + (1 - orbs) * .10));
    panel.style.setProperty("--emblem-turn", (p * 102).toFixed(1) + "deg");
    panel.style.setProperty("--chapter-progress", unit(.03 + .97 * p));
    const next = p < .32 ? 0 : p < .765 ? 1 : 2;
    if (next !== activeWorld || document.querySelector("#world-photo").alt !== worlds[next].alt) applyWorld(next, false);
  }

  function spreadCards(p) {
    if (p === lastCards) return;
    lastCards = p;
    const mobile = window.innerWidth <= 680;
    cards.forEach((card, index) => {
      const progress = towards((mobile ? index % 2 : index) * .055, .78 + (mobile ? index % 2 : index) * .055, p);
      const rest = 1 - progress;
      const origin = mobile ? index % 2 - .5 : index - 1.5;
      card.style.transform = "translate3d(" + px(-origin * rest * (mobile ? 4 : 9)) + "," +
        px(rest * (mobile ? 11 : 27)) + ",0) rotate(" + (origin * rest * (mobile ? 1.1 : 1.35)).toFixed(2) + "deg)";
    });
  }

  function draw() {
    frame = 0;
    if (reduced.matches) return;
    intro.draw();
    const storyTop = story.getBoundingClientRect().top;
    const gridTop = grid.getBoundingClientRect().top;
    if (worldMotion) worldScene(clamp((stickyTop - storyTop) / storySpace));
    spreadCards(clamp((viewportHeight * .93 - gridTop) / (viewportHeight * .42)));
    const documentTravel = root.scrollHeight - viewportHeight;
    meter.style.setProperty("--page-progress", unit(clamp(window.scrollY / Math.max(1,documentTravel))));
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(draw); }
  function goToWorld(index) {
    if (!worldMotion) { applyWorld(index, true); return; }
    const top = window.scrollY + story.getBoundingClientRect().top - stickyTop + stops[index] * storySpace;
    window.scrollTo({ top, behavior: "smooth" });
  }
  choices.forEach((button, index) => {
    button.addEventListener("click", () => goToWorld(index));
    button.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      const next = (index + (event.key === "ArrowRight" ? 1 : -1) + choices.length) % choices.length;
      choices[next].focus(); goToWorld(next);
    });
  });
  window.addEventListener("scroll", schedule, { passive:true });
  let remeasure = 0;
  function onResize() {
    cancelAnimationFrame(remeasure);
    remeasure = requestAnimationFrame(measure);
  }
  window.addEventListener("resize", onResize);
  reduced.addEventListener("change", measure);
  document.fonts.ready.then(onResize);
  window.addEventListener("load", onResize, {once:true});
  measure();
})();
