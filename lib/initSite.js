/* je.design — interactions & animation (Next.js port) */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { createInquiry } from "@/lib/inquiriesApi";

export default function initSite() {

  // Guard against double-initialization (StrictMode, HMR, fast remounts):
  // binding listeners twice makes the carousel/FAQ/drawer fight themselves.
  if (window.__jeSiteInit) return window.__jeSiteInit;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = true;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  gsap.registerPlugin(ScrollTrigger);

  // Client-side routing re-runs this on every navigation. Many listeners attach
  // to targets that survive route changes (document, window, and the persistent
  // Header/Footer/cursor/lightbox/drawer nodes), so without teardown they would
  // stack and fire multiple times. We tag every listener added during init with
  // an AbortSignal by briefly wrapping addEventListener, then abort it all in
  // cleanup. All addEventListener calls below run synchronously, so the wrapper
  // is restored at the end of init before any async code can run.
  var ac = new AbortController();
  var abortSignal = ac.signal;
  var rafId = null;
  var disposers = [];
  var _nativeAdd = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function (type, listener, opts) {
    var o = opts === true ? { capture: true } : (opts && typeof opts === "object") ? Object.assign({}, opts) : {};
    if (!("signal" in o)) o.signal = abortSignal;
    return _nativeAdd.call(this, type, listener, o);
  };

  /* ---------- Smooth scroll (Lenis) ---------- */
  // Desktop only. On touch devices Lenis hijacks native scrolling and runs a
  // permanent rAF loop, which makes phones feel laggy/unresponsive for no gain
  // (mobile scroll is already smooth). Anchor jumps fall back to scrollIntoView.
  var lenis = null;
  if (!reduceMotion && finePointer) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);
    lenis.on("scroll", ScrollTrigger.update);
  }

  function scrollToTarget(hash) {
    var el = document.querySelector(hash);
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -70, duration: 1.2 });
    else el.scrollIntoView({ behavior: "smooth" });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    if (window.__jeUIReady) return; // anchor smooth-scroll owned by initUI
    a.addEventListener("click", function (e) {
      if (a.closest(".service")) return; // service rows expand instead of navigating
      var hash = a.getAttribute("href");
      if (hash.length > 1 && document.querySelector(hash)) {
        e.preventDefault();
        closeMenu();
        scrollToTarget(hash);
      }
    });
  });

  /* ---------- Hero intro ---------- */
  heroIntro();

  function heroIntro() {
    if (!hasGsap || reduceMotion) return;
    var tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.from(".heroB__rating", { y: 18, autoAlpha: 0, duration: 0.6 })
      .from(".b-line > span", { yPercent: 115, duration: 1.05, stagger: 0.1 }, "-=0.25")
      .from(".heroB__sub, .heroB__cta", { y: 26, autoAlpha: 0, duration: 0.7, stagger: 0.1 }, "-=0.6")
      .from(".heroB__right", { y: 60, autoAlpha: 0, duration: 1 }, 0.45)
      .from(".heroB__note", {
        scale: 0, rotation: -14, autoAlpha: 0, transformOrigin: "20% 100%",
        duration: 0.7, ease: "back.out(1.8)"
      }, "-=0.35")
      .add(runCounters, "-=0.6")
      .add(function () {
        document.querySelectorAll(".b-line").forEach(function (b) { b.style.overflow = "visible"; });
      });
  }
  if (reduceMotion) runCounters();

  /* ---------- Stat counters ---------- */
  var countersDone = false;
  function runCounters() {
    if (countersDone) return;
    countersDone = true;
    document.querySelectorAll("[data-count]").forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      if (reduceMotion || !hasGsap) {
        el.textContent = target.toLocaleString("en-US");
        return;
      }
      var obj = { v: 0 };
      gsap.to(obj, {
        v: target, duration: 1.8, ease: "power2.out",
        onUpdate: function () { el.textContent = Math.round(obj.v).toLocaleString("en-US"); }
      });
    });
  }

  /* ---------- Sister companies switcher ---------- */
  var switcher = document.getElementById("switcher");
  if (switcher && !window.__jeUIReady) {
    var switcherBtn = document.getElementById("switcherBtn");
    var switcherMenu = document.getElementById("switcherMenu");
    switcherBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = switcher.classList.toggle("is-open");
      switcherBtn.setAttribute("aria-expanded", String(open));
      switcherMenu.setAttribute("aria-hidden", String(!open));
    });
    document.addEventListener("click", function (e) {
      if (switcher.classList.contains("is-open") && !switcher.contains(e.target)) {
        switcher.classList.remove("is-open");
        switcherBtn.setAttribute("aria-expanded", "false");
        switcherMenu.setAttribute("aria-hidden", "true");
      }
    });
  }

  /* ---------- Header ---------- */
  var header = document.getElementById("header");
  var lastY = 0;
  if (header && !window.__jeUIReady) {
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      header.classList.toggle("is-scrolled", y > 40);
      header.classList.toggle("is-hidden", y > 400 && y > lastY);
      lastY = y;
    }, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  var burger = document.getElementById("burger");
  var mobileMenu = document.getElementById("mobileMenu");
  function closeMenu() {
    if (!burger || !mobileMenu) return;
    burger.classList.remove("is-open");
    mobileMenu.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    mobileMenu.setAttribute("aria-hidden", "true");
    if (lenis) lenis.start();
  }
  if (burger && mobileMenu && !window.__jeUIReady) burger.addEventListener("click", function () {
    var open = mobileMenu.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    mobileMenu.setAttribute("aria-hidden", String(!open));
    if (lenis) open ? lenis.stop() : lenis.start();
  });

  /* ---------- Custom cursor ---------- */
  var cursor = document.getElementById("cursor");
  var cursorDot = document.getElementById("cursorDot");
  if (finePointer && hasGsap && !reduceMotion) {
    // start hidden at 0,0 so it never shows parked in the corner
    gsap.set([cursor, cursorDot], { autoAlpha: 0 });
    var xTo = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3" });
    var yTo = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3" });
    var xDot = gsap.quickTo(cursorDot, "x", { duration: 0.08 });
    var yDot = gsap.quickTo(cursorDot, "y", { duration: 0.08 });
    var cursorPrimed = false;
    var hoverSel = '[data-cursor="hover"], .faq__item summary, .bap-acc__item summary';
    // Derive the state from whatever is actually under the pointer on every move.
    // Binding enter/leave to fixed nodes leaks: if a node is removed while hovered
    // (the work/project grids swap in on async load), its mouseleave never fires
    // and the class sticks for the rest of the page.
    function syncCursorState(t) {
      var inView = !!(t && t.closest && t.closest('[data-cursor="view"]'));
      var inHover = !!(t && t.closest && t.closest(hoverSel));
      cursor.classList.toggle("is-view", inView);
      cursor.classList.toggle("is-hover", inHover);
    }
    window.addEventListener("mousemove", function (e) {
      if (!cursorPrimed) {
        // first move (or first move after a route change): jump to the pointer
        // instantly with no easing, THEN reveal — this is what kills the top-left fling
        cursorPrimed = true;
        gsap.set(cursor, { x: e.clientX, y: e.clientY });
        gsap.set(cursorDot, { x: e.clientX, y: e.clientY });
        gsap.to([cursor, cursorDot], { autoAlpha: 1, duration: 0.18, ease: "none" });
      } else {
        xTo(e.clientX); yTo(e.clientY);
        xDot(e.clientX); yDot(e.clientY);
      }
      syncCursorState(e.target);
    });
    // clear when the pointer leaves the document entirely
    document.addEventListener("mouseleave", function () {
      cursor.classList.remove("is-view", "is-hover");
    });
  } else {
    cursor.style.display = "none";
    cursorDot.style.display = "none";
  }

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && hasGsap && !reduceMotion) {
    document.querySelectorAll(".magnetic").forEach(function (el) {
      var strength = 0.35;
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        gsap.to(el, {
          x: (e.clientX - r.left - r.width / 2) * strength,
          y: (e.clientY - r.top - r.height / 2) * strength,
          duration: 0.4, ease: "power3.out"
        });
      });
      el.addEventListener("mouseleave", function () {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
      });
    });
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      if (hasGsap && window.ScrollTrigger) window.ScrollTrigger.refresh();
    });
  }

  /* ---------- Scroll reveals ---------- */
  if (!reduceMotion) {

    gsap.utils.toArray(".reveal").forEach(function (el) {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" }
      });
    });

    // split section titles into masked lines
    document.querySelectorAll(".split-lines").forEach(function (title) {
      var spans = title.querySelectorAll(":scope > span");
      spans.forEach(function (s) {
        var mask = document.createElement("span");
        mask.className = "line-mask";
        var inner = document.createElement("span");
        inner.className = "line-inner";
        while (s.firstChild) inner.appendChild(s.firstChild);
        mask.appendChild(inner);
        s.appendChild(mask);
      });
      gsap.set(title.querySelectorAll(".line-inner"), { yPercent: 110 });
      gsap.to(title.querySelectorAll(".line-inner"), {
        yPercent: 0, duration: 1.1, ease: "power4.out", stagger: 0.1,
        scrollTrigger: { trigger: title, start: "top 85%" },
        onComplete: function () {
          title.querySelectorAll(".line-mask").forEach(function (m) { m.style.overflow = "visible"; });
        }
      });
    });

    // word-by-word statement reveal
    document.querySelectorAll(".split-words").forEach(function (p) {
      var words = p.textContent.trim().split(/\s+/);
      p.innerHTML = words.map(function (w) { return '<span class="word">' + w + "</span>"; }).join(" ");
      var wordEls = Array.prototype.slice.call(p.querySelectorAll(".word"));

      // pinned zoom-focus treatment (homepage statement, desktop)
      if (p.classList.contains("statement-zoom") && window.innerWidth > 820) {
        var breakIdx = words.findIndex(function (w) { return w.indexOf("\u2014") !== -1; });
        if (breakIdx < 0) breakIdx = Math.floor(words.length / 2);
        var first = wordEls.slice(0, breakIdx + 1);
        var rest = wordEls.slice(breakIdx + 1);
        gsap.set(p, { scale: 1.35, transformOrigin: "0% 40%" });
        var ztl = gsap.timeline({
          scrollTrigger: {
            trigger: p, start: "center 55%", end: "+=140%",
            pin: true, scrub: 1, anticipatePin: 1
          }
        });
        ztl.to(first, { opacity: 1, stagger: 0.12, ease: "none" }, 0)
           .to(p, { scale: 1, duration: 1.2, ease: "power2.inOut" }, ">0.1")
           .to(rest, { opacity: 1, stagger: 0.07, ease: "none" }, "<0.25");
        return;
      }

      gsap.to(wordEls, {
        opacity: 1, stagger: 0.04, ease: "none",
        scrollTrigger: { trigger: p, start: "top 80%", end: "top 35%", scrub: true }
      });
    });

    // work cards stagger in
    gsap.utils.toArray(".work-card").forEach(function (card, i) {
      gsap.from(card, {
        y: 60, autoAlpha: 0, duration: 1, ease: "power3.out",
        delay: (i % 3) * 0.08,
        scrollTrigger: { trigger: card, start: "top 92%" }
      });
    });

    // service rows
    gsap.utils.toArray(".service").forEach(function (row, i) {
      gsap.from(row, {
        y: 40, autoAlpha: 0, duration: 0.8, ease: "power3.out", delay: i * 0.05,
        scrollTrigger: { trigger: row, start: "top 92%" }
      });
    });


  } else {
    // no-motion fallback: make everything visible
    document.querySelectorAll(".reveal, .work-card, .service").forEach(function (el) {
      el.style.opacity = 1;
      el.style.transform = "none";
    });
    document.querySelectorAll(".split-words").forEach(function (p) {
      p.style.opacity = 1;
    });
  }

  /* ---------- Service hover preview ---------- */
  var preview = document.getElementById("servicePreview");
  var previewImg = preview ? preview.querySelector("img") : null;
  if (preview && finePointer && hasGsap && !reduceMotion) {
    var px = gsap.quickTo(preview, "x", { duration: 0.5, ease: "power3" });
    var py = gsap.quickTo(preview, "y", { duration: 0.5, ease: "power3" });
    var list = document.getElementById("servicesList");
    list.addEventListener("mousemove", function (e) {
      px(e.clientX - 150);
      py(e.clientY - 320);
    });
    list.querySelectorAll(".service").forEach(function (row) {
      row.addEventListener("mouseenter", function (e) {
        if (row.classList.contains("is-open")) return;
        gsap.set(preview, { x: e.clientX - 150, y: e.clientY - 320 });
        previewImg.src = row.getAttribute("data-img");
        preview.classList.add("is-active");
      });
      row.addEventListener("mouseleave", function () {
        preview.classList.remove("is-active");
      });
    });
  }

  /* ---------- Video lightbox (self-hosted, YouTube fallback) ---------- */
  /* Local mp4s play natively in the lightbox on any protocol (including
     file://, where YouTube embeds are rejected with error 153/154).
     If a local file is missing: embed YouTube on http(s), else open YouTube. */
  var canEmbed = location.protocol === "http:" || location.protocol === "https:";
  var lightbox = document.getElementById("lightbox");
  var lightboxFrame = document.getElementById("lightboxFrame");

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.classList.remove("lightbox--review");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxFrame.innerHTML = "";
    if (lenis) lenis.start();
  }
  function showLightbox() {
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    if (lenis) lenis.stop();
  }
  function embedYouTube(id, title) {
    var iframe = document.createElement("iframe");
    iframe.src = "https://www.youtube.com/embed/" + id + "?autoplay=1&rel=0&playsinline=1";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.allow = "autoplay; encrypted-media; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.title = title || "je.design video";
    lightboxFrame.innerHTML = "";
    lightboxFrame.appendChild(iframe);
  }
  function openVideo(id, title, src) {
    if (src) {
      var direct = document.createElement("video");
      direct.src = src;
      direct.controls = true;
      direct.autoplay = true;
      direct.playsInline = true;
      direct.title = title || "je.design video";
      lightboxFrame.appendChild(direct);
      showLightbox();
      return;
    }
    var video = document.createElement("video");
    video.src = "/assets/video/" + id + ".mp4";
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    video.title = title || "je.design video";
    video.addEventListener("error", function () {
      if (canEmbed) embedYouTube(id, title);
      else {
        closeLightbox();
        window.open("https://www.youtube.com/watch?v=" + id, "_blank", "noopener");
      }
    });
    lightboxFrame.appendChild(video);
    showLightbox();
  }
  if (lightbox) {
    document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
    document.getElementById("lightboxBackdrop").addEventListener("click", closeLightbox);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lightbox.classList.contains("is-open")) closeLightbox();
    });
  }
  document.querySelectorAll(".video-card").forEach(function (card) {
    card.addEventListener("click", function () {
      var id = card.getAttribute("data-video");
      var src = card.getAttribute("data-video-src");
      var h3 = card.querySelector("h3");
      openVideo(id, h3 ? h3.textContent : "", src);
    });
  });

  /* ---------- Team polaroid pop ---------- */
  var teamTrackEl = document.querySelector(".team__track");
  if (teamTrackEl && finePointer && hasGsap && !reduceMotion) {
    var teamCards = Array.prototype.slice.call(teamTrackEl.querySelectorAll(".team-card"));
    teamCards.forEach(function (c, i) {
      c.addEventListener("mouseenter", function () {
        gsap.to(c, {
          scale: 1.16, rotate: i % 2 ? 3.5 : -3.5, y: -18, zIndex: 30,
          duration: 0.55, ease: "back.out(2.2)", overwrite: "auto"
        });
        var prev = teamCards[i - 1], next = teamCards[i + 1];
        if (prev) gsap.to(prev, { rotate: -4, x: -14, scale: 0.95, duration: 0.5, ease: "power3.out", overwrite: "auto" });
        if (next) gsap.to(next, { rotate: 4, x: 14, scale: 0.95, duration: 0.5, ease: "power3.out", overwrite: "auto" });
      });
      c.addEventListener("mouseleave", function () {
        [c, teamCards[i - 1], teamCards[i + 1]].forEach(function (el) {
          if (el) gsap.to(el, { scale: 1, rotate: 0, x: 0, y: 0, zIndex: 0, duration: 0.6, ease: "power3.out", overwrite: "auto" });
        });
      });
    });
  }

  /* ---------- Team strip arrows ---------- */
  var teamStrip = document.querySelector(".team__strip");
  var teamPrev = document.getElementById("teamPrev");
  var teamNext = document.getElementById("teamNext");
  if (teamStrip && teamPrev && teamNext) {
    var step = function () { return Math.min(teamStrip.clientWidth * 0.7, 640); };
    teamPrev.addEventListener("click", function () { teamStrip.scrollBy({ left: -step(), behavior: "smooth" }); });
    teamNext.addEventListener("click", function () { teamStrip.scrollBy({ left: step(), behavior: "smooth" }); });
  }

  /* ---------- Service rows: click to expand related projects ---------- */
  var serviceRows = Array.prototype.slice.call(document.querySelectorAll(".service"));
  function svcClose(row) {
    var panel = row.querySelector(".service__panel");
    row.classList.remove("is-open");
    if (hasGsap && !reduceMotion) {
      gsap.to(panel, { height: 0, duration: 0.55, ease: "power3.inOut" });
    } else {
      panel.style.height = "0px";
    }
  }
  function svcOpen(row) {
    var panel = row.querySelector(".service__panel");
    row.classList.add("is-open");
    var preview = document.getElementById("servicePreview");
    if (preview) preview.classList.remove("is-active");
    if (hasGsap && !reduceMotion) {
      gsap.fromTo(panel, { height: 0 }, {
        height: "auto", duration: 0.7, ease: "power4.inOut"
      });
      gsap.from(panel.querySelectorAll(".service__galleryGroup:first-child img"), {
        x: 80, scale: 0.85, autoAlpha: 0,
        duration: 0.6, stagger: 0.05, ease: "power3.out", delay: 0.25,
        clearProps: "all"
      });
    } else {
      panel.style.height = "auto";
    }
  }
  serviceRows.forEach(function (row) {
    var link = row.querySelector("a");
    if (!row.querySelector(".service__panel")) return;
    link.addEventListener("click", function (e) {
      e.preventDefault();
      if (row.classList.contains("is-open")) { svcClose(row); return; }
      serviceRows.forEach(function (o) { if (o !== row && o.classList.contains("is-open")) svcClose(o); });
      svcOpen(row);
    });
  });

  /* ---------- Service gallery polaroid pop (matches team-card hover) ---------- */
  /* Delegated: the gallery images are wrapped in <a> tags and re-rendered after
     the async projects fetch, so per-element listeners would be lost. mouseover/
     mouseout bubble, so we bind once on document and resolve the hovered image. */
  if (finePointer && hasGsap && !reduceMotion) {
    var galleryNeighbors = function (img) {
      var group = img.closest(".service__galleryGroup");
      var imgs = group ? Array.prototype.slice.call(group.querySelectorAll("img")) : [img];
      var idx = imgs.indexOf(img);
      return { idx: idx, prev: imgs[idx - 1], next: imgs[idx + 1] };
    };
    document.addEventListener("mouseover", function (e) {
      var img = e.target.closest ? e.target.closest(".service__galleryGroup img") : null;
      if (!img) return;
      var n = galleryNeighbors(img);
      gsap.to(img, { scale: 1.16, rotate: n.idx % 2 ? 3.5 : -3.5, y: -18, zIndex: 30, duration: 0.55, ease: "back.out(2.2)", overwrite: "auto" });
      if (n.prev) gsap.to(n.prev, { rotate: -4, x: -14, scale: 0.95, duration: 0.5, ease: "power3.out", overwrite: "auto" });
      if (n.next) gsap.to(n.next, { rotate: 4, x: 14, scale: 0.95, duration: 0.5, ease: "power3.out", overwrite: "auto" });
    });
    document.addEventListener("mouseout", function (e) {
      var img = e.target.closest ? e.target.closest(".service__galleryGroup img") : null;
      if (!img) return;
      var n = galleryNeighbors(img);
      [img, n.prev, n.next].forEach(function (el) {
        if (el) gsap.to(el, { scale: 1, rotate: 0, x: 0, y: 0, zIndex: 0, duration: 0.6, ease: "power3.out", overwrite: "auto" });
      });
    });
  }

  /* ---------- People grid pop ---------- */
  if (finePointer && hasGsap && !reduceMotion) {
    document.querySelectorAll(".person").forEach(function (p, i) {
      p.addEventListener("mouseenter", function () {
        gsap.to(p, { scale: 1.07, rotate: i % 2 ? 2 : -2, y: -8, zIndex: 20, duration: 0.45, ease: "back.out(2)", overwrite: "auto" });
      });
      p.addEventListener("mouseleave", function () {
        gsap.to(p, { scale: 1, rotate: 0, y: 0, zIndex: 0, duration: 0.5, ease: "power3.out", overwrite: "auto" });
      });
    });
  }

  /* ---------- Work listing filters ---------- */
  /* Handled in React on the Work page (pages/Work.jsx) — state-driven so it
     stays in sync with the async-loaded project grid. */

  /* ---------- Services index: active tracking ---------- */
  var svcIndex = document.getElementById("svcIndex");
  if (svcIndex) {
    var svcLinks = Array.prototype.slice.call(svcIndex.querySelectorAll("a"));
    var svcCards = svcLinks
      .map(function (a) { return document.getElementById(a.getAttribute("data-target")); })
      .filter(Boolean);
    var setActive = function () {
      var mid = window.innerHeight * 0.4;
      var current = 0;
      svcCards.forEach(function (c, i) {
        if (c.getBoundingClientRect().top <= mid) current = i;
      });
      svcLinks.forEach(function (a, i) { a.classList.toggle("is-active", i === current); });
    };
    window.addEventListener("scroll", setActive, { passive: true });
    setActive();
  }

  /* ---------- Owner note: tile reveal under cursor ---------- */
  var ownerNote = document.getElementById("ownernote");
  if (ownerNote && finePointer && !reduceMotion) {
    var wallEl = ownerNote.querySelector(".ownernote__wall");
    var wallTiles = Array.prototype.slice.call(wallEl.children);
    var litTiles = [];
    function clearTiles() {
      litTiles.forEach(function (t) { t.style.opacity = 0; });
      litTiles = [];
    }
    ownerNote.addEventListener("mousemove", function (e) {
      var r = wallEl.getBoundingClientRect();
      if (!wallTiles.length) return;
      var tileRect = wallTiles[0].getBoundingClientRect();
      var cols = Math.max(1, Math.round(r.width / tileRect.width));
      var col = Math.floor((e.clientX - r.left) / tileRect.width);
      var row = Math.floor((e.clientY - r.top) / tileRect.height);
      var idx = row * cols + col;
      clearTiles();
      // the exact tile under the cursor, plus the faintest echo on direct neighbors
      var center = wallTiles[idx];
      if (center) { center.style.opacity = 0.3; litTiles.push(center); }
      [idx - 1, idx + 1, idx - cols, idx + cols].forEach(function (n) {
        var sameRow = (n === idx - 1 || n === idx + 1) ? Math.floor(n / cols) === row : true;
        var t = wallTiles[n];
        if (t && n >= 0 && sameRow) { t.style.opacity = 0.07; litTiles.push(t); }
      });
    });
    ownerNote.addEventListener("mouseleave", clearTiles);
  }

  /* ---------- Review lightbox (delegated so async-rendered cards work) ---------- */
  /* Bind on pointerdown, not click: the reviews marquee translates continuously,
     so by the time `click` resolves its target the aimed card has slid away and a
     neighbour gets read. pointerdown captures the exact card under the pointer at
     press time (and works on touch, where there is no hover-pause). */
  document.addEventListener("pointerdown", function (e) {
    if (e.button != null && e.button !== 0) return;
    var card = e.target.closest ? e.target.closest(".review") : null;
    if (!card) return;
    var wrap = document.createElement("div");
    var stars = document.createElement("div"); stars.className = "rlb__stars"; stars.textContent = "★★★★★";
    var text = document.createElement("p"); text.className = "rlb__text";
    text.textContent = "\u201C" + card.getAttribute("data-full") + "\u201D";
    var who = document.createElement("div"); who.className = "rlb__who";
    var av = document.createElement("span"); av.className = "review__avatar";
    av.textContent = (card.getAttribute("data-name") || "?").charAt(0);
    var info = document.createElement("div");
    var nm = document.createElement("strong"); nm.textContent = card.getAttribute("data-name");
    var co = document.createElement("span"); co.textContent = card.getAttribute("data-co");
    info.appendChild(nm); info.appendChild(co);
    who.appendChild(av); who.appendChild(info);
    wrap.appendChild(stars); wrap.appendChild(text); wrap.appendChild(who);
    lightboxFrame.innerHTML = "";
    lightbox.classList.add("lightbox--review");
    lightboxFrame.appendChild(wrap);
    showLightbox();
  });

  /* ---------- Contact drawer (yellow wipe reveal) ---------- */
  var drawerEl = document.getElementById("contactDrawer");
  if (drawerEl) {
    var drawerBackdrop = document.getElementById("drawerBackdrop");
    var drawerPanel = drawerEl.querySelector(".drawer__panel");
    var drawerFields = drawerEl.querySelectorAll(".drawer__form label, .drawer__form .btn, .drawer__title, .drawer__panel .eyebrow");
    var drawerOpen = false;

    function openDrawer() {
      if (window.__jeUIReady && window.__jeOpenDrawer) { window.__jeOpenDrawer(); return; }
      if (drawerOpen) return;
      drawerOpen = true;
      drawerEl.classList.add("is-open");
      drawerEl.setAttribute("aria-hidden", "false");
      if (lenis) lenis.stop();
      if (hasGsap && !reduceMotion) {
        var tl = gsap.timeline();
        tl.to(drawerBackdrop, { opacity: 1, duration: 0.35 }, 0)
          .to(drawerPanel, { y: 0, scale: 1, opacity: 1, duration: 0.55, ease: "power4.out" }, 0.05)
          .from(drawerFields, { y: 18, autoAlpha: 0, duration: 0.45, stagger: 0.045, ease: "power3.out" }, 0.18);
      } else {
        drawerBackdrop.style.opacity = 1;
        drawerPanel.style.transform = "none";
        drawerPanel.style.opacity = 1;
      }
    }
    function closeDrawer() {
      if (window.__jeUIReady && window.__jeCloseDrawer) { window.__jeCloseDrawer(); return; }
      if (!drawerOpen) return;
      drawerOpen = false;
      drawerEl.setAttribute("aria-hidden", "true");
      if (lenis) lenis.start();
      if (hasGsap && !reduceMotion) {
        var tl = gsap.timeline({ onComplete: function () { drawerEl.classList.remove("is-open"); } });
        tl.to(drawerPanel, { y: 26, scale: 0.97, opacity: 0, duration: 0.35, ease: "power3.in" }, 0)
          .to(drawerBackdrop, { opacity: 0, duration: 0.3 }, "-=0.15");
      } else {
        drawerBackdrop.style.opacity = 0;
        drawerPanel.style.transform = "";
        drawerPanel.style.opacity = 0;
        drawerEl.classList.remove("is-open");
      }
    }
    if (!window.__jeUIReady) {
      document.querySelectorAll('[data-drawer], .contact__big').forEach(function (t) {
        t.addEventListener("click", function (e) { e.preventDefault(); openDrawer(); });
      });
      document.getElementById("drawerClose").addEventListener("click", closeDrawer);
      drawerBackdrop.addEventListener("click", closeDrawer);
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && drawerOpen) closeDrawer();
      });
    }

    /* ---------- BAP hero ticket: physics-based paper interaction ----------
       card tilt = damped spring driven by pointer position + velocity
       stub     = spring hinge that sags as the cut frontier advances
       fall     = per-frame gravity + air drag with see-saw paper flutter */
    var bapTicket = document.getElementById("bapTicket");
    if (bapTicket) {
      var bapTear = document.getElementById("bapTear");
      var bapStub = document.getElementById("bapStub");
      if (finePointer && hasGsap && !reduceMotion) {
        gsap.set(bapTicket, { transformPerspective: 900, transformOrigin: "50% 50%" });
        gsap.set(bapStub, { transformOrigin: "100% 0%" });

        var card = { rx: 0, ry: 0, vrx: 0, vry: 0, trx: 0, tryy: 0, hover: false };
        var hinge = { a: 0, v: 0 };
        var fall = { on: false, t: 0, y: 0, vy: 0, opened: false, ended: false };
        var cutL = 0, cutR = 0, cutP = 0, cutDone = false, hingeDir = -1;
        var tickerOn = false;

        function physTick(time, dtMs) {
          var dt = Math.min(dtMs / 1000, 0.05);

          /* card spring (stiffness 130, damping 13) */
          card.vrx += ((card.trx - card.rx) * 130 - card.vrx * 13) * dt;
          card.vry += ((card.tryy - card.ry) * 130 - card.vry * 13) * dt;
          card.rx += card.vrx * dt;
          card.ry += card.vry * dt;
          gsap.set(bapTicket, { rotationX: card.rx, rotationY: card.ry, rotation: 2.5 + card.ry * 0.12 });

          if (!fall.on) {
            /* hinge spring: paper sags from the cut side, springs on every snip */
            var sag = hingeDir * cutP * cutP * 6;
            hinge.v += ((sag - hinge.a) * 110 - hinge.v * 7) * dt;
            hinge.a += hinge.v * dt;
            gsap.set(bapStub, { rotation: hinge.a, y: cutP * 6, skewX: hinge.v * 0.015 });
          } else if (!fall.ended) {
            /* gravity 1500, air drag 2.1 -> floaty terminal velocity */
            fall.t += dt;
            fall.vy += (1500 - 2.1 * fall.vy) * dt;
            fall.y += fall.vy * dt;
            var sway = Math.sin(fall.t * 4.0);
            gsap.set(bapStub, {
              y: fall.y + 8,
              x: Math.sin(fall.t * 2.4) * 48,
              rotation: hinge.a + sway * 13,
              rotationX: Math.sin(fall.t * 3.0) * 36,
              opacity: Math.max(0, 1 - Math.max(0, fall.y - 420) / 240)
            });
            if (!fall.opened && fall.y > 230) { fall.opened = true; openDrawer(); }
            if (fall.y > 740) { fall.ended = true; gsap.set(bapStub, { opacity: 0 }); }
          }

          /* sleep when nothing is moving */
          if (!card.hover && !fall.on &&
              Math.abs(card.vrx) + Math.abs(card.vry) + Math.abs(hinge.v) < 0.05 &&
              Math.abs(card.rx) + Math.abs(card.ry) < 0.05) stopTicker();
          if (fall.ended && !card.hover &&
              Math.abs(card.vrx) + Math.abs(card.vry) < 0.05) stopTicker();
        }
        function startTicker() { if (!tickerOn) { tickerOn = true; gsap.ticker.add(physTick); } }
        function stopTicker() { if (tickerOn) { tickerOn = false; gsap.ticker.remove(physTick); } }
        disposers.push(stopTicker);

        bapTicket.addEventListener("mouseenter", function () {
          card.hover = true;
          if (!cutDone) cursor.classList.add("is-cut");
          startTicker();
        });
        bapTicket.addEventListener("mouseleave", function () {
          card.hover = false;
          card.trx = 0; card.tryy = 0;
          cursor.classList.remove("is-cut");
        });

        bapTicket.addEventListener("mousemove", function (e) {
          var cr = bapTicket.getBoundingClientRect();
          var nx = ((e.clientX - cr.left) / cr.width) * 2 - 1;
          var ny = ((e.clientY - cr.top) / cr.height) * 2 - 1;
          card.trx = -ny * 5.5;
          card.tryy = nx * 7.5;
          /* pointer velocity kicks the sheet */
          card.vry += e.movementX * 0.10;
          card.vrx += -e.movementY * 0.10;
          startTicker();

          if (cutDone) return;
          var r = bapTear.getBoundingClientRect();
          if (e.clientY < r.top - 24 || e.clientY > r.bottom + 24) return;
          var x = Math.min(r.width, Math.max(0, e.clientX - r.left));
          var xr = r.width - x;
          var bite = Math.min(Math.abs(e.movementX) * 0.9 + 2, 20);
          var advanced = false;
          /* scissors bite near either frontier; bite size follows blade speed */
          if (x > cutL - 14 && x < cutL + 80 && x > cutL) {
            cutL = Math.min(x, cutL + bite);
            advanced = true;
          } else if (xr > cutR - 14 && xr < cutR + 80 && xr > cutR) {
            cutR = Math.min(xr, cutR + bite);
            advanced = true;
          }
          if (advanced) {
            cutP = Math.min(1, (cutL + cutR) / r.width);
            bapTicket.style.setProperty("--cut", cutL / r.width);
            bapTicket.style.setProperty("--cutR", cutR / r.width);
            /* the piece hangs from whichever side still holds */
            hingeDir = cutL >= cutR ? -1 : 1;
            gsap.set(bapStub, { transformOrigin: cutL >= cutR ? "100% 0%" : "0% 0%" });
            hinge.v += hingeDir * 11 * cutP; /* each snip jolts the hanging piece */
            if (cutP > 0.93) {
              cutDone = true;
              fall.on = true;
              fall.vy = -70; /* tiny upward pop as the last fiber lets go */
              bapTicket.style.setProperty("--cut", 1 - cutR / r.width);
              cursor.classList.remove("is-cut");
              card.vrx -= 9; /* kept half recoils */
            }
          }
        });
      } else {
        // touch devices: tapping the pass opens the form
        bapTicket.addEventListener("click", openDrawer);
      }
    }

    var contactForm = document.getElementById("contactForm");
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (contactForm.classList.contains("is-sending")) return;
      var d = new FormData(contactForm);
      var submitBtn = contactForm.querySelector('button[type="submit"]');
      var btnLabel = submitBtn ? submitBtn.querySelector("span") : null;
      var original = btnLabel ? btnLabel.textContent : "";
      contactForm.classList.add("is-sending");
      contactForm.classList.remove("is-error");
      if (btnLabel) btnLabel.textContent = "Sending…";
      createInquiry({
        name: d.get("name"),
        email: d.get("email"),
        phone: d.get("phone") || "",
        company: d.get("company") || "",
        budget: d.get("budget") || "",
        message: d.get("message") || "",
        source: "Website contact form",
      })
        .then(function () {
          contactForm.classList.remove("is-sending");
          contactForm.classList.add("is-sent");
          if (btnLabel) btnLabel.textContent = "Inquiry sent ✓";
          contactForm.reset();
        })
        .catch(function () {
          contactForm.classList.remove("is-sending");
          contactForm.classList.add("is-error");
          if (btnLabel) btnLabel.textContent = original || "Send inquiry";
        });
    });
  }

  /* ---------- "Drawn by hand" video preview ---------- */
  var whyPreview = document.getElementById("whyPreview");
  if (whyPreview && finePointer && hasGsap && !reduceMotion) {
    var whyVideo = whyPreview.querySelector("video");
    var whyLine = document.querySelector(".why-line--video");
    var wx = gsap.quickTo(whyPreview, "x", { duration: 0.5, ease: "power3" });
    var wy = gsap.quickTo(whyPreview, "y", { duration: 0.5, ease: "power3" });
    if (whyLine) {
      whyLine.addEventListener("mouseenter", function (e) {
        if (!whyVideo.getAttribute("src")) {
          whyVideo.src = "assets/video/BpuC_iyq0l8.mp4";
        }
        gsap.set(whyPreview, { x: e.clientX - 170, y: e.clientY - 240 });
        whyVideo.play().catch(function () {});
        whyPreview.classList.add("is-active");
      });
      whyLine.addEventListener("mousemove", function (e) {
        wx(e.clientX - 170);
        wy(e.clientY - 240);
      });
      whyLine.addEventListener("mouseleave", function () {
        whyPreview.classList.remove("is-active");
        whyVideo.pause();
      });
    }
  }

  /* ---------- Video carousel: simple slot rotation ---------- */
  var vrow = document.getElementById("vrow");
  if (vrow) {
    var SLOTS = ["vslot--left", "vslot--center", "vslot--right"];
    var vBusy = false;
    function slotOf(el) {
      for (var i = 0; i < SLOTS.length; i++) if (el.classList.contains(SLOTS[i])) return SLOTS[i];
    }
    vrow.querySelectorAll(".vslot").forEach(function (el) {
      el.addEventListener("click", function () {
        var slot = slotOf(el);
        if (slot === "vslot--center" || window.matchMedia("(max-width: 820px)").matches) {
          var h3 = el.querySelector("h3");
          openVideo(el.getAttribute("data-video"), h3 ? h3.textContent : "", el.getAttribute("data-video-src"));
          return;
        }
        if (vBusy || !hasGsap || reduceMotion) {
          if (!vBusy) { // no-animation fallback: instant rotate
            rotate(el, slot, true);
          }
          return;
        }
        rotate(el, slot, false);
      });
    });
    function rotate(clicked, clickedSlot, instant) {
      vBusy = true;
      var els = Array.prototype.slice.call(vrow.querySelectorAll(".vslot"));
      var center = els.filter(function (e) { return slotOf(e) === "vslot--center"; })[0];
      var other = els.filter(function (e) { return e !== clicked && e !== center; })[0];
      var otherSlot = slotOf(other);
      var before = {};
      els.forEach(function (e) { before[slotOf(e)] = e.getBoundingClientRect().left; });
      vrow.classList.add("is-swapping");
      clicked.classList.remove(clickedSlot); clicked.classList.add("vslot--center");
      center.classList.remove("vslot--center"); center.classList.add(otherSlot);
      other.classList.remove(otherSlot); other.classList.add(clickedSlot);
      if (instant) { vrow.classList.remove("is-swapping"); vBusy = false; return; }

      var D = 0.85, E = "power2.inOut";
      var step = Math.abs(before["vslot--center"] - before[clickedSlot]); // one slot distance
      var dir = clickedSlot === "vslot--right" ? -1 : 1; // strip moves left when clicking right
      gsap.set(clicked, { filter: "blur(0px)", zIndex: 4 });
      // clicked slides one slot into center
      gsap.fromTo(clicked, { x: before[clickedSlot] - before["vslot--center"], opacity: 0.45 },
        { x: 0, opacity: 1, duration: D, ease: E });
      // old center slides one slot to the vacated side
      gsap.fromTo(center, { x: before["vslot--center"] - before[otherSlot], opacity: 1 },
        { x: 0, opacity: 0.45, duration: D, ease: E });
      // wrap: same element slides out one more slot, then re-enters from the far edge,
      // always travelling in the same direction as everything else
      var tl = gsap.timeline({
        onComplete: function () {
          gsap.set(els, { clearProps: "transform,zIndex,opacity" });
          vrow.classList.remove("is-swapping");
          requestAnimationFrame(function () { gsap.set(els, { clearProps: "filter" }); });
          vBusy = false;
        }
      });
      tl.fromTo(other,
        { x: before[otherSlot] - before[clickedSlot] },
        { x: before[otherSlot] - before[clickedSlot] + dir * step, duration: D / 2, ease: "power2.in" }, 0)
        .set(other, { x: -dir * step }, D / 2)
        .to(other, { x: 0, duration: D / 2, ease: "power2.out" }, D / 2);
    }
  }

  /* ---------- FAQ: animated accordion, one open at a time ---------- */  /* ---------- FAQ: animated accordion, one open at a time ---------- */  /* ---------- FAQ: animated accordion, one open at a time ---------- */  /* ---------- FAQ: animated accordion, one open at a time ---------- */  /* ---------- FAQ: animated accordion, one open at a time ---------- */
  document.querySelectorAll(".faq, .bap-acc").forEach(function (group) {
    var faqItems = group.querySelectorAll(".faq__item, .bap-acc__item");
    function accBody(item) { return item.querySelector(".faq__body, .bap-acc__body"); }
    function faqClose(item) {
      var body = accBody(item);
      gsap.to(body, {
        height: 0, opacity: 0, duration: 0.38, ease: "power2.inOut",
        onComplete: function () { item.removeAttribute("open"); gsap.set(body, { clearProps: "all" }); }
      });
    }
    faqItems.forEach(function (item) {
      var summary = item.querySelector("summary");
      var body = accBody(item);
      summary.addEventListener("click", function (e) {
        if (!hasGsap || reduceMotion) {
          // native toggle, just enforce one-open
          if (!item.hasAttribute("open")) {
            faqItems.forEach(function (o) { if (o !== item) o.removeAttribute("open"); });
          }
          return;
        }
        e.preventDefault();
        if (item.hasAttribute("open")) {
          faqClose(item);
        } else {
          faqItems.forEach(function (o) { if (o !== item && o.hasAttribute("open")) faqClose(o); });
          item.setAttribute("open", "");
          gsap.fromTo(body,
            { height: 0, opacity: 0 },
            {
              height: "auto", opacity: 1, duration: 0.5, ease: "power3.out",
              onComplete: function () { gsap.set(body, { clearProps: "height,opacity" }); }
            });
        }
      });
    });
  });

  /* ---------- 3D tilt (pricing card + all hoverable imagery) ---------- */
  if (finePointer && hasGsap && !reduceMotion) {
    var tiltEls = document.querySelectorAll(
      "[data-tilt], .work-card, .video-card, .revenue-card, .mascots__track img"
    );
    tiltEls.forEach(function (el) {
      var strength = el.hasAttribute("data-tilt") ? 4 : 7;
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var rx = ((e.clientY - r.top) / r.height - 0.5) * -strength;
        var ry = ((e.clientX - r.left) / r.width - 0.5) * strength;
        gsap.to(el, { rotateX: rx, rotateY: ry, transformPerspective: 900, duration: 0.5, ease: "power2.out" });
      });
      el.addEventListener("mouseleave", function () {
        gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.8, ease: "elastic.out(1, 0.5)" });
      });
    });
  }

  // cleanup for React lifecycles / route changes
  EventTarget.prototype.addEventListener = _nativeAdd;
  function cleanup() {
    ac.abort();
    if (rafId) cancelAnimationFrame(rafId);
    disposers.forEach(function (d) { try { d(); } catch (e) {} });
    ScrollTrigger.getAll().forEach(function (t) { t.kill(); });
    if (lenis) lenis.destroy();
    window.__jeSiteInit = null;
  }
  window.__jeSiteInit = cleanup;
  return cleanup;
}
