"use strict";

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
const media = (name) => "https://gouri-vote.tailf63b37.ts.net:8443/media/" + name;
const wrapIndex = (index, total) => (index + total) % total;
const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

const slides = [
  { image: "rooftop", title: "분홍빛 옥상", alt: "분홍빛 옥상 난간에 기대어 서로 바라보는 레이문, 소나, 젠, 아샤" },
  { image: "skywall", title: "하늘벽의 물결", alt: "소나의 손끝에서 분홍빛 하늘벽에 동그란 물결이 번지는 장면" },
  { image: "moons", title: "두 달이 뜬 밤", alt: "리피아 네 멤버가 옥상에서 크기가 다른 두 달을 올려다보는 뒷모습" }
];
const members = [
  { id: "raymoon", name: "Raymoon", ko: "레이문", meaning: "달빛", bio: "누군가 어둠 속에서 길을 찾을 때 조용히 곁을 지킨다. 레이문이라는 이름에는 달빛이라는 뜻이 담겨 있다.", stage: "검자주 턱시도 재킷", practice: "빙하색 스웨이드 재킷" },
  { id: "sona", name: "Sona", ko: "소나", meaning: "공명", bio: "스스로 고른 길로 먼저 발을 내딛는다. 소나의 선택이 일으킨 파문은 곁에 있는 사람들에게 번져간다.", stage: "검정 원숄더 드레스와 은회색 자락", practice: "자두색 랩 와이드 팬츠" },
  { id: "zen", name: "Zen", ko: "젠", meaning: "평정심", bio: "주위가 소란스러워져도 젠은 평정을 지킨다. 모두가 흔들릴 때 차분하게 상황을 읽고 중심을 잡는다.", stage: "건메탈 가죽 조끼", practice: "청록 레이싱 재킷" },
  { id: "asha", name: "Asha", ko: "아샤", meaning: "태양", bio: "어둠 속에서도 희망을 먼저 본다. 아샤가 건네는 활기에 곁에 있던 사람들도 다시 힘을 낸다.", stage: "진달래색 미니 드레스", practice: "산딸기색 랩 니트" }
];
const worlds = [
  { name: "소나의 방", image: "snowglobe", small: 600, large: 1400, alt: "침대 머리맡의 연보랏빛 스노우글로브", copy: "소나의 머리맡에 스노우글로브가 놓여 있다. 빛이 유리에 닿으면 연보랏빛 액체 속에 비친 시간이 다시 흐른다." },
  { name: "분홍 하늘의 SIM", image: "skywall", small: 760, large: 1840, alt: "가상세계 SIM에서 분홍 하늘벽에 손을 댄 소나", copy: "SIM은 현실에서 건너온 사람들이 사는 가상세계다. 소나가 분홍 하늘에 손을 대자 손끝에서 둥근 물결이 퍼진다." },
  { name: "기분을 담은 구슬", image: "orbs", small: 600, large: 1300, alt: "푸른빛, 붉은빛, 보랏빛으로 빛나는 구슬들", copy: "레이문과 젠, 아샤의 머리 위에는 작은 구슬이 떠 있다. SIM에서 마음이 움직이면 구슬도 저마다 다른 색으로 물든다." }
];
const photos = [
  { image: "stage", title: "구름 위의 무대", alt: "불이 켜진 구름 위 무대를 걸어 나오는 네 멤버" },
  { image: "recording", title: "녹음실의 오후", alt: "마이크 앞에 앉은 아샤와 악보를 고쳐 쓰는 소나" },
  { image: "neighbor", title: "옆 옥상의 소나", alt: "젠의 어깨 너머로 건너편 옥상의 소나가 보이는 장면" },
  { image: "rehearsal", title: "첫 합주", alt: "마이크를 들고 노래방 소파에 모여 앉은 네 멤버" },
  { image: "threshold", title: "하늘벽의 문턱", alt: "열린 문 앞에서 뒤돌아 손을 흔드는 소나와 세 멤버" },
  { image: "reflection", title: "유리에 비친 기억", alt: "어두운 유리에 젠, 아샤, 레이문의 얼굴과 사물이 겹쳐 보이는 장면" }
];
const films = {
  sequence: { title: "첫 번째 시퀀스", file: "film.mp4", poster: "film-poster", note: "뮤직비디오 제작 중 · 첫 시퀀스 38초" },
  reel: { title: "소나와 젠의 첫 번째 릴스", file: "reel.mp4", poster: "reel-poster", note: "리피아 릴스 1편 · 세로 영상 32초" }
};

function picture(image, small, large, alt, element) {
  element.alt = alt;
  element.srcset = media(image + "-sm.webp") + " " + small + "w, " + media(image + ".webp") + " " + large + "w";
  element.src = media(image + ".webp");
  if (!motion.matches && element.animate) {
    element.animate([{ opacity: 0.75 }, { opacity: 1 }], { duration: 240 });
  }
}

function listenForSwipe(element, step) {
  let start = null;
  element.addEventListener("touchstart", (event) => {
    const touch = event.touches[0];
    start = event.touches.length === 1 ? [touch.clientX, touch.clientY] : null;
  }, { passive: true });
  element.addEventListener("touchcancel", () => { start = null; }, { passive: true });
  element.addEventListener("touchend", (event) => {
    if (!start) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - start[0];
    const dy = touch.clientY - start[1];
    start = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) step(dx < 0 ? 1 : -1);
  }, { passive: true });
}

let slideIndex = 0;
function advanceHero(offset) {
  slideIndex = wrapIndex(slideIndex + offset, slides.length);
  const slide = slides[slideIndex];
  picture(slide.image, 760, 1840, slide.alt, $("#hero-photo"));
  picture(slide.image, 760, 1840, "", $("#lens-photo"));
  $("#hero-caption").textContent = slide.title;
  $("#hero-count").textContent = "0" + (slideIndex + 1) + " / 03";
  $(".hero").dispatchEvent(new Event("coverchange"));
}
$(".hero-prev").addEventListener("click", () => advanceHero(-1));
$(".hero-next").addEventListener("click", () => advanceHero(1));
listenForSwipe($(".hero-frame"), advanceHero);

const header = $(".site-header");
const menuToggle = $(".menu-toggle");
function setMenu(open) {
  header.dataset.open = String(open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
}
menuToggle.addEventListener("click", () => setMenu(menuToggle.getAttribute("aria-expanded") !== "true"));
header.addEventListener("click", (event) => { if (event.target.closest("a")) setMenu(false); });
document.addEventListener("pointerdown", (event) => { if (!header.contains(event.target)) setMenu(false); });
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    setMenu(false);
    menuToggle.focus();
  }
});
window.matchMedia("(min-width:681px)").addEventListener("change", () => setMenu(false));

function showWorld(index, changePhoto = true) {
  const item = worlds[index];
  $$("[data-world]").forEach((other) => other.setAttribute("aria-pressed", String(Number(other.dataset.world) === index)));
  if (changePhoto) picture(item.image, item.small, item.large, item.alt, $("#world-photo"));
  else $("#world-photo").alt = item.alt;
  $("#world-title").textContent = item.name;
  $("#world-text").textContent = item.copy;
}

const audio = $("#audio");
const seek = $("#seek");
const audioToggle = $("#audio-toggle");
const formatTime = (time) => Math.floor(time / 60) + ":" + String(Math.floor(time % 60)).padStart(2, "0");
let pendingSeek = null;
function syncAudio() {
  const playing = !audio.paused && !audio.ended;
  audioToggle.setAttribute("aria-label", playing ? "음원 일시정지" : "음원 미리듣기 재생");
  audioToggle.setAttribute("aria-pressed", String(playing));
  $("#audio-icon").className = playing ? "pause-icon" : "play-icon";
  const at = Math.min(40, Math.max(0, audio.currentTime || 0));
  seek.value = at;
  seek.setAttribute("aria-valuetext", Math.floor(at) + "초");
  seek.style.setProperty("--progress", (at / 40 * 100) + "%");
  $("#elapsed").textContent = formatTime(at);
}
audioToggle.addEventListener("click", () => {
  if (!audio.paused && !audio.ended) { audio.pause(); return; }
  if (audio.ended) audio.currentTime = 0;
  $("#audio-message").textContent = "";
  audio.play().catch(() => { $("#audio-message").textContent = "음원을 불러오지 못했어요. 재생 버튼을 다시 눌러주세요."; });
});
seek.addEventListener("input", () => {
  const next = Number(seek.value);
  if (audio.readyState >= 1) { audio.currentTime = next; syncAudio(); }
  else { pendingSeek = next; audio.load(); }
});
audio.addEventListener("loadedmetadata", () => {
  if (pendingSeek !== null) { audio.currentTime = pendingSeek; pendingSeek = null; }
  syncAudio();
});
["timeupdate", "play", "pause", "ended", "seeked"].forEach((type) => audio.addEventListener(type, syncAudio));

const dialog = $("#viewer");
const viewerBody = $("#viewer-body");
const viewerName = $("#viewer-name");
const viewerPrev = $("#viewer-prev");
const viewerNext = $("#viewer-next");
let viewerMode = null;
let viewerIndex = 0;
let opener = null;

function openViewer(mode, title, trigger) {
  opener = trigger;
  viewerMode = mode;
  dialog.dataset.mode = mode;
  viewerName.textContent = title;
  const canStep = mode !== "film";
  viewerPrev.hidden = !canStep;
  viewerNext.hidden = !canStep;
  const noun = mode === "member" ? "멤버" : "사진";
  viewerPrev.setAttribute("aria-label", "이전 " + noun);
  viewerNext.setAttribute("aria-label", "다음 " + noun);
  if (!dialog.open) {
    dialog.showModal();
    document.documentElement.classList.add("viewer-open");
  }
  dialog.scrollTop = 0;
  $("#viewer-close").focus({ preventScroll: true });
}
function clearViewer() {
  const video = $("video", viewerBody);
  if (video) { video.pause(); video.removeAttribute("src"); video.load(); }
  viewerBody.replaceChildren();
}
dialog.addEventListener("close", () => {
  clearViewer();
  document.documentElement.classList.remove("viewer-open");
  viewerMode = null;
  if (opener && opener.isConnected) opener.focus({ preventScroll: true });
  opener = null;
});
$("#viewer-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});

function showLook(person, look) {
  const image = $("#profile-photo");
  const isFace = look === "face";
  const label = isFace ? "프로필 사진" : look === "stage" ? "무대복" : "연습복";
  $(".profile-visual").dataset.look = look;
  image.src = media(person.id + (isFace ? "" : "-" + look) + ".webp");
  image.alt = person.ko + " " + label;
  $("#look-caption").textContent = isFace ? "" : (look === "stage" ? "자정의 앙코르" : "아침 리허설") + " · " + person[look];
  $$("[data-look-button]", viewerBody).forEach((btn) => btn.setAttribute("aria-pressed", String(btn.dataset.lookButton === look)));
}
function renderMember() {
  const person = members[viewerIndex];
  viewerName.textContent = person.ko + "의 프로필";
  viewerBody.innerHTML = '<div class="profile-layout"><div class="profile-visual" data-look="face"><img id="profile-photo" alt=""></div>' +
    '<div class="profile-copy"><h2 class="profile-name" lang="en"></h2><div class="profile-korean"></div><p id="bio"></p>' +
    '<div class="look-tabs" aria-label="멤버 사진 선택"><button type="button" data-look-button="face">프로필</button>' +
    '<button type="button" data-look-button="stage">무대복</button><button type="button" data-look-button="practice">연습복</button></div>' +
    '<small id="look-caption" class="look-caption" aria-live="polite"></small></div></div>';
  $(".profile-name", viewerBody).textContent = person.name;
  $(".profile-korean", viewerBody).textContent = person.ko + " · " + person.meaning;
  $("#bio").textContent = person.bio;
  $$("[data-look-button]", viewerBody).forEach((btn) => btn.addEventListener("click", () => showLook(person, btn.dataset.lookButton)));
  showLook(person, "face");
}
function openMember(id, button) {
  viewerIndex = members.findIndex((person) => person.id === id);
  if (viewerIndex < 0) return;
  openViewer("member", "멤버 프로필", button);
  renderMember();
}
$$("[data-member]").forEach((button) => button.addEventListener("click", () => openMember(button.dataset.member, button)));

function renderPhoto() {
  const photo = photos[viewerIndex];
  viewerName.textContent = "콘셉트 포토 · " + (viewerIndex + 1) + " / " + photos.length;
  viewerBody.innerHTML = '<figure><img class="viewer-media" alt=""><figcaption class="media-note"></figcaption></figure>';
  const image = $("img", viewerBody);
  image.src = media(photo.image + ".webp");
  image.alt = photo.alt;
  $("figcaption", viewerBody).textContent = photo.title;
}
function stepViewer(offset) {
  if (viewerMode === "member") {
    viewerIndex = wrapIndex(viewerIndex + offset, members.length);
    renderMember();
  } else if (viewerMode === "photo") {
    viewerIndex = wrapIndex(viewerIndex + offset, photos.length);
    renderPhoto();
  }
}
viewerPrev.addEventListener("click", () => stepViewer(-1));
viewerNext.addEventListener("click", () => stepViewer(1));
dialog.addEventListener("keydown", (event) => {
  if (viewerMode === "film" || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
  event.preventDefault();
  const offset = event.key === "ArrowRight" ? 1 : -1;
  const look = event.target.closest("[data-look-button]");
  if (look) {
    const buttons = $$("[data-look-button]", viewerBody);
    const next = buttons[wrapIndex(buttons.indexOf(look) + offset, buttons.length)];
    next.focus(); next.click();
  } else {
    stepViewer(offset);
  }
});
listenForSwipe(viewerBody, (offset) => { if (viewerMode === "photo") stepViewer(offset); });

const track = $("#photo-track");
photos.forEach((item, index) => {
  const button = document.createElement("button");
  button.className = "photo-card";
  button.type = "button";
  button.setAttribute("aria-label", item.title + " 사진 확대");
  button.innerHTML = '<span><img width="560" height="315" loading="lazy" alt=""></span><span class="photo-name"></span>';
  const img = $("img", button);
  img.src = media(item.image + "-sm.webp");
  img.alt = item.alt;
  $(".photo-name", button).textContent = item.title;
  button.addEventListener("click", () => {
    viewerIndex = index;
    openViewer("photo", item.title, button);
    renderPhoto();
  });
  track.append(button);
});
function scrollGallery(direction) {
  const cards = $$(".photo-card", track);
  const step = cards[1].offsetLeft - cards[0].offsetLeft;
  track.scrollBy({ left: step * (track.clientWidth >= 850 ? 2 : 1) * direction,
    behavior: motion.matches ? "instant" : "smooth" });
}
function updateGallery() {
  $("#photos-back").disabled = track.scrollLeft <= 3;
  $("#photos-next").disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 3;
}
$("#photos-back").addEventListener("click", () => scrollGallery(-1));
$("#photos-next").addEventListener("click", () => scrollGallery(1));
track.addEventListener("scroll", updateGallery, { passive: true });
window.addEventListener("resize", updateGallery);
updateGallery();

$$("[data-film]").forEach((button) => button.addEventListener("click", () => {
  const film = films[button.dataset.film];
  audio.pause();
  openViewer("film", film.title, button);
  const video = document.createElement("video");
  video.className = "viewer-media viewer-video";
  video.controls = true;
  video.playsInline = true;
  video.preload = "metadata";
  video.poster = media(film.poster + ".webp");
  video.src = media(film.file);
  video.setAttribute("aria-label", film.title);
  const note = document.createElement("p");
  note.className = "media-note"; note.textContent = film.note;
  video.addEventListener("error", () => {
    if (video.hasAttribute("src")) note.textContent = "영상을 불러오지 못했어요. 창을 닫고 다시 열어주세요.";
  });
  viewerBody.replaceChildren(video, note);
  video.play().catch(() => { /* 기본 재생 버튼으로도 시작할 수 있다. */ });
}));

if ("IntersectionObserver" in window) {
  const navLinks = $$("#site-nav a");
  const regions = navLinks.map((link) => $(link.getAttribute("href")));
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const link = navLinks[regions.indexOf(entry.target)];
      if (entry.isIntersecting) {
        navLinks.forEach((other) => other.removeAttribute("aria-current"));
        link.setAttribute("aria-current","location");
      } else if (link.hasAttribute("aria-current")) {
        link.removeAttribute("aria-current");
      }
    }
  }, { rootMargin: "-12% 0px -55% 0px" });
  regions.forEach((region) => observer.observe(region));
}
