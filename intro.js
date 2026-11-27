"use strict";

function createOrbIntro(hero) {
  const stage = hero.querySelector(".hero-sticky");
  const opening = hero.querySelector(".hero-opening");
  const cover = hero.querySelector(".hero-frame");
  const view = hero.querySelector(".orb-view");
  const gallery = view.querySelector(".orb-gallery");
  const chapters = view.querySelector(".orb-chapters");
  const enter = hero.querySelector(".orb-enter");
  const optics = createGlassLights(view.querySelector("canvas"));
  const limit = (n) => Math.max(0, Math.min(1, n));
  const smooth = (a, b, value) => {
    const n = limit((value - a) / (b - a));
    return n * n * (3 - 2 * n);
  };
  const pixels = (n) => n.toFixed(2) + "px";
  const level = (n) => n.toFixed(4);
  const frames = [
    { id:"raymoon", eye:[.64,.36], tint:"#d6b7ff", start:.166, end:.265, alt:"보랏빛 구슬이 뜬 저녁, 유리창에 비친 레이문" },
    { id:"sona", eye:[.42,.25], tint:"#ffe2a0", start:.373, end:.466, alt:"따뜻한 햇빛 아래 누워 하늘을 보는 소나" },
    { id:"zen", eye:[.54,.43], tint:"#aadff8", start:.576, end:.670, alt:"손으로 둥근 원을 만들어 그 너머를 보는 젠" },
    { id:"asha", eye:[.52,.39], tint:"#ffb7dc", start:.779, end:.874, alt:"분홍 구름 속에서 선글라스를 살짝 내리고 정면을 보는 아샤" }
  ];
  // 16:9 원본에서 잰 옥상의 보랏빛 구슬, 하늘벽의 손끝, 밤하늘의 큰 달.
  const coverPoints = [[.85,.18,.022],[.677,.32,.015],[.652,.10,.036]];
  let width = 0, height = 0, travel = 0, headerHeight = 0;
  let anchorX = 0, anchorY = 0, originalRadius = 0, cameraGain = 2.4;
  let journey = false, previous = -1;

  const scenes = frames.map((art, index) => {
    const person = members.find((item) => item.id === art.id);
    const article = document.createElement("article");
    article.className = "orb-scene";
    article.id = "orb-" + art.id;
    article.setAttribute("aria-labelledby", "orb-name-" + art.id);
    article.style.setProperty("--art-x", art.eye[0] * 100 + "%");
    article.style.setProperty("--art-y", art.eye[1] * 100 + "%");
    article.style.setProperty("--tint", art.tint);
    article.innerHTML = '<img class="orb-photo" width="1600" height="900">' +
      '<div class="orb-band" aria-hidden="true"><img width="1600" height="900" alt=""></div>' +
      '<div class="orb-shade" aria-hidden="true"></div><div class="orb-caption">' +
      '<p class="orb-sign"><span></span><i aria-hidden="true"></i><span></span></p><h2 lang="en"></h2>' +
      '<button class="orb-profile" type="button">프로필 보기<i aria-hidden="true">+</i></button></div>';
    const photos = article.querySelectorAll("img");
    photos[0].alt = art.alt;
    for (const photo of photos) {
      photo.decoding = "async";
      // 세로 화면에서도 확대되는 가로 원본이 한 장면의 높이를 충분히 채우도록 고른다.
      photo.sizes = "(max-width:680px) max(100vw, 150svh), 100vw";
      photo.srcset = media("scene-" + art.id + "-sm.webp") + " 800w, " + media("scene-" + art.id + ".webp") + " 1600w";
      photo.src = media("scene-" + art.id + ".webp");
    }
    const title = article.querySelector("h2");
    title.textContent = person.name; title.id = "orb-name-" + art.id;
    const sign = article.querySelectorAll(".orb-sign span");
    sign[0].textContent = person.ko; sign[1].textContent = person.meaning;
    const profile = article.querySelector("button");
    profile.setAttribute("aria-label", person.ko + " 프로필 보기");
    profile.addEventListener("click", () => openMember(art.id, profile));
    const tab = document.createElement("button");
    tab.type = "button"; tab.textContent = person.ko;
    tab.style.setProperty("--tint", art.tint);
    tab.setAttribute("aria-label", person.ko + " 장면으로");
    tab.setAttribute("aria-controls", article.id);
    tab.addEventListener("click", () => goTo(index));
    gallery.append(article); chapters.append(tab);
    return { ...art, article, tab, band:article.querySelector(".orb-band") };
  });
  view.hidden = false;
  enter.addEventListener("click", (event) => {
    if (event.detail === 0 && journey) {
      window.addEventListener("scrollend", () => {
        if (scenes[0].tab.hasAttribute("aria-current")) scenes[0].tab.focus({ preventScroll:true });
      }, { once:true });
    }
    goTo(0);
    if (event.detail === 0 && !journey) scenes[0].article.querySelector("button").focus({ preventScroll:true });
  });
  chapters.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const index = scenes.findIndex((scene) => scene.tab === event.target);
    if (index < 0) return;
    event.preventDefault();
    const next = (index + (event.key === "ArrowRight" ? 1 : -1) + scenes.length) % scenes.length;
    scenes[next].tab.focus({ preventScroll:true }); goTo(next);
  });

  function locateCover() {
    const [x, y, radius] = coverPoints[slideIndex];
    const fit = Math.max(cover.offsetWidth / 16, cover.offsetHeight / 9);
    const fullWidth = 16 * fit, fullHeight = 9 * fit;
    const localX = (cover.offsetWidth - fullWidth) * .5 + fullWidth * x;
    const alignY = window.innerWidth <= 680 ? .42 : .44;
    const localY = (cover.offsetHeight - fullHeight) * alignY + fullHeight * y;
    originalRadius = Math.max(5, fullWidth * radius);
    anchorX = cover.offsetLeft + localX;
    anchorY = cover.offsetTop + localY;
    // 카메라가 구슬을 중앙으로 데려오는 동안 원래 사진의 끝이 노출되지 않게 한다.
    const panX = width * .5 - anchorX, panY = height * .48 - anchorY;
    const xScale = panX >= 0 ? panX / Math.max(1,localX) : -panX / Math.max(1,cover.offsetWidth-localX);
    const yScale = panY >= 0 ? panY / Math.max(1,localY) : -panY / Math.max(1,cover.offsetHeight-localY);
    cameraGain = Math.min(8,Math.max(1.7,xScale+.025,yScale+.025));
    stage.style.setProperty("--focus-x", pixels(localX));
    stage.style.setProperty("--focus-y", pixels(localY));
    hero.style.setProperty("--cover-art", "url('https://gouri-vote.tailf63b37.ts.net:8443/media/" + slides[slideIndex].image + "-sm.webp')");
  }
  hero.addEventListener("coverchange", () => {
    locateCover(); previous = -1; draw();
  });
  function goTo(index) {
    const scene = scenes[index];
    if (!journey) {
      scene.article.scrollIntoView({ block:"start", behavior:"instant" });
      return;
    }
    const top = window.scrollY + hero.getBoundingClientRect().top - headerHeight;
    window.scrollTo({ top:top + travel * (scene.end + .029), behavior:"smooth" });
  }
  function measure(header, viewport, reduce) {
    headerHeight = header;
    journey = !reduce && viewport - header >= 250 && CSS.supports("clip-path", "circle(10px at 50% 50%)");
    hero.toggleAttribute("data-journey", journey);
    hero.toggleAttribute("data-quiet", !journey);
    hero.style.setProperty("--intro-height", CSS.supports("height","100svh") ?
      "calc(100svh - var(--header-height))" : pixels(viewport - header));
    if (!journey) {
      opening.inert = false; view.classList.remove("inside"); chapters.inert = true;
      scenes.forEach(({ article, band, tab }) => {
        article.hidden = false; article.inert = false; article.removeAttribute("aria-hidden");
        article.style.clipPath = ""; article.style.setProperty("--shot-scale","1");
        article.style.setProperty("--caption-alpha","1"); article.style.setProperty("--caption-rise","0px");
        band.hidden = true; tab.removeAttribute("aria-current");
      });
      locateCover(); previous = -1; return;
    }
    width = stage.clientWidth; height = stage.clientHeight;
    travel = Math.max(1280,Math.min(4770,height * 4.4));
    hero.style.setProperty("--intro-travel", pixels(travel));
    locateCover();
    optics.resize(width,height);
    previous = -1; draw();
  }

  function draw() {
    if (!journey) return;
    const p = limit((headerHeight - hero.getBoundingClientRect().top) / travel);
    if (p === previous) return;
    previous = p;
    const dive = smooth(.002,.215,p);
    const dx = (width * .5 - anchorX) * dive;
    const dy = (height * .48 - anchorY) * dive;
    const cx = anchorX + dx, cy = anchorY + dy;
    const radius = originalRadius + (Math.hypot(width * .5,height * .52) + 12 - originalRadius) * dive;
    const set = (key, value) => stage.style.setProperty(key,value);
    set("--camera-x",pixels(dx)); set("--camera-y",pixels(dy));
    set("--camera-scale",level(1 + dive * cameraGain));
    set("--reflected-scale",level(1.08 + dive * (cameraGain + .55)));
    set("--foil-turn",(-80 + 165 * dive).toFixed(1) + "deg");
    set("--cover-alpha",level(1 - smooth(.014,.123,p)));
    set("--cover-lift",pixels(-32 * smooth(.008,.14,p)));
    set("--reflection",level(1 - smooth(.016,.119,p)));
    set("--shell-x",pixels(cx)); set("--shell-y",pixels(cy));
    set("--shell-radius",pixels(p === 0 ? 0 : radius));
    set("--shell-diameter",pixels(2 * radius));
    set("--rim-alpha",level(smooth(.001,.025,p) * (1 - smooth(.168,.218,p))));
    set("--chapters-alpha",level(smooth(.227,.272,p)));
    opening.inert = p > .123;
    view.classList.toggle("inside",p >= .216);
    chapters.inert = p < .25;
    let active = -1;
    let wave = null;
    for (let j = 0; j < scenes.length; j++) {
      const scene = scenes[j], next = scenes[j + 1];
      const reveal = smooth(scene.start,scene.end,p);
      const visible = p >= scene.start && (!next || p < next.end);
      if (p >= scene.start + (scene.end - scene.start) * .55) active = j;
      scene.article.hidden = !visible;
      const finish = next ? next.end : 1;
      if (visible) {
        const shot = smooth(scene.start,finish,p);
        const handoff = next ? 1 - smooth(next.start,next.start + .036,p) : 1;
        const name = smooth(scene.start + .046,scene.end + .014,p) * handoff;
        scene.article.style.setProperty("--caption-alpha",level(name));
        scene.article.style.setProperty("--caption-rise",pixels((1 - name) * 24));
        scene.article.style.setProperty("--shot-scale",level(1.085 - .075 * shot));
        scene.band.hidden = reveal <= .003 || reveal >= .999;
        if (reveal < .9995) {
          const x = scene.eye[0] * width, y = scene.eye[1] * height;
          const farthest = Math.hypot(Math.max(x,width - x),Math.max(y,height - y)) + 4;
          const r = farthest * reveal;
          const center = " at " + pixels(x) + " " + pixels(y);
          scene.article.style.clipPath = "circle(" + pixels(r) + center + ")";
          if (!scene.band.hidden) {
            const edge = (12 + 18 * Math.sin(Math.PI * reveal)) * Math.min(1.4,width / 700);
            scene.band.style.maskImage = "radial-gradient(circle" + center + ",transparent " + pixels(Math.max(0,r - edge)) +
              ",#000 " + pixels(Math.max(0,r - edge * .34)) + ",#000 " + pixels(r) + ",transparent " + pixels(r + 1) + ")";
            wave = { x,y,r,t:reveal,color:scene.tint,index:j };
          }
        } else scene.article.style.clipPath = "none";
      }
      const fill = limit((p - scene.start) / ((next ? next.start : 1) - scene.start));
      scene.tab.style.setProperty("--fill",level(fill));
    }
    scenes.forEach(({article,tab}, j) => {
      const isCurrent = active === j;
      if (isCurrent) tab.setAttribute("aria-current","step"); else tab.removeAttribute("aria-current");
      article.inert = !isCurrent; article.setAttribute("aria-hidden",String(!isCurrent));
    });
    optics.draw(p,cx,cy,dive,wave,active);
  }
  return { measure,draw };
}

// 유리 표면을 통과하는 궤적과 굴절광. 시간 대신 스크롤 위치로만 깊이를 바꾼다.
function createGlassLights(canvas) {
  const ctx = canvas.getContext("2d");
  const tau = Math.PI * 2;
  const frac = (n) => n - Math.floor(n);
  const seeds = Array.from({length:60},(_,i) => ({
    angle:tau * frac((i + 1) * .618034), depth:frac(i * .381966 + .17),
    lean:Math.sin(i * 8.27), weight:.3 + frac(i * .732) * .7
  }));
  let w = 0, h = 0, diagonal = 0, pearl;
  function resize(width,height) {
    if (!ctx || (width === w && height === h)) return;
    w = width; h = height; diagonal = Math.hypot(w,h);
    const resolution = Math.min(window.devicePixelRatio || 1,1.65,Math.sqrt(2450000 / (w * h)));
    canvas.width = Math.round(w * resolution); canvas.height = Math.round(h * resolution);
    ctx.setTransform(resolution,0,0,resolution,0,0);
    pearl = ctx.createLinearGradient(0,h*.12,w,h*.87);
    [[0,"#6eacff"],[.16,"#d7a5ff"],[.34,"#a196ff"],[.49,"#ff9bd5"],[.65,"#95faf3"],[.83,"#ffd9ad"],[1,"#d5a5ff"]]
      .forEach(([stop,color]) => pearl.addColorStop(stop,color));
  }
  // 각 띠의 가장자리와 가운데 두께를 따로 주어 얇은 유리막처럼 굽힌다.
  function ribbon(x,y,radius,flat,spin,phase,start,span,thick,opacity,material) {
    if (radius < 2 || opacity < .003) return;
    const steps = 50;
    ctx.save(); ctx.translate(x,y); ctx.rotate(spin); ctx.scale(1,flat);
    ctx.beginPath();
    for (let side = 0; side < 2; side++) {
      for (let k = 0; k <= steps; k++) {
        const t = side ? 1 - k / steps : k / steps;
        const a = start + span * t;
        const r = radius * (1 + .055 * Math.sin(3*a + phase) + .022 * Math.sin(5*a - phase)) +
          (side ? -1 : 1) * thick * Math.pow(Math.max(0,Math.sin(Math.PI*t)),.78);
        const xx = r * Math.cos(a), yy = r * Math.sin(a);
        if (!side && !k) ctx.moveTo(xx,yy); else ctx.lineTo(xx,yy);
      }
    }
    ctx.closePath(); ctx.globalAlpha = opacity; ctx.fillStyle = material; ctx.fill();
    ctx.restore();
  }
  function draw(p,cx,cy,flight,wave,active) {
    if (!ctx || !w || !h) return;
    ctx.clearRect(0,0,w,h);
    if (p <= .002) return;
    ctx.globalCompositeOperation = "screen";
    const lift = Math.max(0,Math.min(1,(p - .002) / .043));
    const decay = 1 - Math.max(0,Math.min(1,(p - .173) / .139));
    const energy = lift * decay;
    if (energy > .003) {
      const flow = p * 4.2;
      for (let i=0; i<9; i++) {
        const z = frac(i / 9 + flow);
        const r = (.012 + 1.23 * Math.pow(z,2.55)) * diagonal;
        const a = energy * Math.min(1,z * 4.3) * Math.min(1,(1-z)*5);
        const x = cx + (1-z)*w*.055*Math.sin(i*.69 + flight*2);
        const y = cy + (1-z)*h*.058*Math.cos(i*.83 + flight*2);
        const twist = -.54 + z*.76 + Math.sin(i*.86 + flight)*.19;
        const start = i * 1.51 + flow*.81;
        ribbon(x,y,r,.61+.20*z,twist,i*.57+flow,start,4.25,Math.max(2,r*.068),a*.17,i % 2 ? "#76e5ef" : "#ec8bc9");
        ribbon(x,y,r,.61+.20*z,twist,i*.57+flow,start,4.25,Math.max(1,r*.031),a*.62,pearl);
        ribbon(x,y,r*1.019,.61+.20*z,twist,i*.57+flow,start+.13,4.75,Math.max(.7,r*.0035),a*.92,"#f5ecff");
        ribbon(x,y,r*.94,.61+.20*z,twist,i*.57+flow,start+1.7,2.9,Math.max(.8,r*.011),a*.49,"#a3c5ff");
      }
      ctx.save(); ctx.lineCap="round";
      for (const seed of seeds) {
        const z = frac(seed.depth + flow * .9);
        const a = seed.angle + flight*.44 + z*.14*seed.lean;
        const r = Math.pow(z,2.4)*diagonal;
        const tail = r * (.035+.075*seed.weight) * energy;
        const dx=Math.cos(a), dy=Math.sin(a)*.85;
        ctx.globalAlpha=energy*seed.weight*.55*Math.min(1,z*3);
        ctx.strokeStyle=seed.lean>0 ? "#efe2ff":"#a9d6ff"; ctx.lineWidth=.65+z*1.25;
        ctx.beginPath(); ctx.moveTo(cx+dx*(r-tail),cy+dy*(r-tail)); ctx.lineTo(cx+dx*r,cy+dy*r); ctx.stroke();
      }
      ctx.restore();
    }
    if (active >= 0) {
      const turn = p * .79 + active * .43;
      const tones = ["#c8c1ff","#f7d4aa","#a8ddff","#ffc4e8"];
      // 얕은 반사광은 사진 테두리에만 남겨 얼굴이 보이는 시간을 확보한다.
      ribbon(w*(.11+.02*Math.sin(turn)),h*.97,diagonal*.72,.49,-.37,turn,3.34,2.24,diagonal*.005,.19,tones[active]);
      ribbon(w*.93,h*.05,diagonal*.55,.63,.26,turn,5.12,1.93,diagonal*.008,.19,pearl);
    }
    if (wave) {
      const a=Math.sin(Math.PI*wave.t);
      ctx.save(); ctx.beginPath(); ctx.arc(wave.x,wave.y,wave.r,0,tau);
      ctx.strokeStyle=wave.color; ctx.lineWidth=2.1; ctx.globalAlpha=a*.78; ctx.stroke();
      ctx.beginPath(); ctx.arc(wave.x,wave.y,Math.max(0,wave.r-3),-.91,2.54);
      ctx.strokeStyle="#fffcf4"; ctx.globalAlpha=a*.9; ctx.lineWidth=1; ctx.stroke();
      ctx.restore();
      const r=wave.r, x=wave.x, y=wave.y, t=wave.t;
      if (wave.index === 0) {
        ribbon(x,y,r*.95,.98,-.4,t,3.05,2.8,r*.020,a*.72,"#cdc8ff");
      } else if (wave.index === 1) {
        for (let n=1; n<=3; n++)
          ribbon(x,y,r*(1-n*.066),1,.02*n,t,n*.52,4.8,1.1+n*.3,a*(.69-n*.12),"#ffe5b0");
      } else if (wave.index === 2) {
        ribbon(x,y,r*.95,.85,-.65,t,.4,3.2,r*.019,a*.7,"#9ee4ff");
        ribbon(x,y,r*.91,.89,.63,t,2.1,3.1,1.5,a*.82,"#ead8ff");
      } else {
        for (let n=0; n<7; n++)
          ribbon(x,y,r*(.89+n*.015),1,-.05,t,n*.86+t*.34,.47+n*.024,Math.max(.9,r*.011),a*.74,n%2 ? "#ffd9ab":"#ff9fd5");
      }
    }
    ctx.globalCompositeOperation = "source-over";
  }
  return { resize,draw };
}
