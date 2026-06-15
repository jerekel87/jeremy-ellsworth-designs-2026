/* je.design — critical UI boot.
   Loaded with next/script strategy="beforeInteractive", so it runs and binds the
   header, mobile menu, sister-company switcher and contact drawer the instant the
   HTML is parsed — BEFORE React hydrates the (heavy) page tree. This is what keeps
   the mobile header tappable without waiting several seconds for hydration to
   finish. Drawer triggers and in-page anchors use event delegation so they keep
   working across client-side route changes without re-binding. initSite (the
   animation layer) checks window.__jeUIReady and skips re-binding anything here. */
(function () {
  if (window.__jeUIReady) return;

  function boot() {
    if (window.__jeUIReady) return;
    window.__jeUIReady = true;

    var body = document.body;

    /* ---------- Animation gate ----------
       Below-the-fold content (.reveal, statement words) is CSS-hidden ONLY while
       html.je-anim is set, so the GSAP/Lenis layer can animate it in. We add the
       class here (pre-hydration) and remove it as a failsafe if initSite hasn't
       booted shortly after load, so content can never get stuck invisible. */
    var docEl = document.documentElement;
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceMotion) {
      docEl.classList.add("je-anim");
      setTimeout(function () {
        if (!window.__jeSiteInit) docEl.classList.remove("je-anim");
      }, 1500);
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
    }
    if (burger && mobileMenu) {
      burger.addEventListener("click", function () {
        var open = mobileMenu.classList.toggle("is-open");
        burger.classList.toggle("is-open", open);
        burger.setAttribute("aria-expanded", String(open));
        mobileMenu.setAttribute("aria-hidden", String(!open));
      });
    }

    /* ---------- Sister companies switcher ---------- */
    var switcher = document.getElementById("switcher");
    var switcherBtn = document.getElementById("switcherBtn");
    var switcherMenu = document.getElementById("switcherMenu");
    if (switcher && switcherBtn) {
      switcherBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        var open = switcher.classList.toggle("is-open");
        switcherBtn.setAttribute("aria-expanded", String(open));
        if (switcherMenu) switcherMenu.setAttribute("aria-hidden", String(!open));
      });
      document.addEventListener("click", function (e) {
        if (switcher.classList.contains("is-open") && !switcher.contains(e.target)) {
          switcher.classList.remove("is-open");
          switcherBtn.setAttribute("aria-expanded", "false");
          if (switcherMenu) switcherMenu.setAttribute("aria-hidden", "true");
        }
      });
    }

    /* ---------- Header scroll state ---------- */
    var header = document.getElementById("header");
    var lastY = 0;
    if (header) {
      window.addEventListener("scroll", function () {
        var y = window.scrollY;
        header.classList.toggle("is-scrolled", y > 40);
        header.classList.toggle("is-hidden", y > 400 && y > lastY);
        lastY = y;
      }, { passive: true });
    }

    /* ---------- Contact drawer (CSS-animated) ---------- */
    var drawerEl = document.getElementById("contactDrawer");
    if (drawerEl) {
      var drawerBackdrop = document.getElementById("drawerBackdrop");
      var drawerOpen = false;
      var openDrawer = function () {
        if (drawerOpen) return;
        drawerOpen = true;
        drawerEl.classList.add("is-open");
        drawerEl.setAttribute("aria-hidden", "false");
        body.style.overflow = "hidden";
      };
      var closeDrawer = function () {
        if (!drawerOpen) return;
        drawerOpen = false;
        drawerEl.classList.remove("is-open");
        drawerEl.setAttribute("aria-hidden", "true");
        body.style.overflow = "";
      };
      window.__jeOpenDrawer = openDrawer;
      window.__jeCloseDrawer = closeDrawer;
      /* Delegated: CTA triggers live inside route-swapped page content. */
      document.addEventListener("click", function (e) {
        var t = e.target.closest && e.target.closest("[data-drawer], .contact__big");
        if (t) { e.preventDefault(); openDrawer(); return; }
        if (e.target.closest && e.target.closest("#drawerClose")) { closeDrawer(); return; }
        if (drawerBackdrop && e.target === drawerBackdrop) closeDrawer();
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && drawerOpen) closeDrawer();
      });
    }

    /* ---------- In-page anchors (native smooth scroll), delegated ---------- */
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      if (a.closest(".service")) return; // service rows expand instead
      var hash = a.getAttribute("href");
      if (hash && hash.length > 1 && document.querySelector(hash)) {
        e.preventDefault();
        closeMenu();
        var el = document.querySelector(hash);
        var top = el.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top: top, behavior: "smooth" });
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
