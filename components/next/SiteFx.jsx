"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { usePageTracking } from "@/lib/trackNext";

/* Client-only effects engine for the public site (Next version). The critical,
   first-paint UI (header, mobile menu, switcher, contact drawer, preloader) is
   wired BEFORE hydration by /boot.js (loaded beforeInteractive), so the page is
   tappable instantly even while this heavy tree is still hydrating. Here we only
   load the GSAP/Lenis animation bundle — dynamically imported so it never blocks
   interactivity — and re-run it on every route change. Also drives first-party
   pageview tracking so the server layout stays hook-free. */
export default function SiteFx() {
  const pathname = usePathname();
  usePageTracking();
  useEffect(() => {
    window.scrollTo(0, 0);

    const menu = document.getElementById("mobileMenu");
    const burger = document.getElementById("burger");
    if (menu) { menu.classList.remove("is-open"); menu.setAttribute("aria-hidden", "true"); }
    if (burger) { burger.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); }

    let cleanupFx;
    let cancelled = false;
    import("@/lib/initSite").then((mod) => {
      if (cancelled) return;
      cleanupFx = mod.default();
    });
    return () => {
      cancelled = true;
      if (typeof cleanupFx === "function") cleanupFx();
    };
  }, [pathname]);
  return null;
}
