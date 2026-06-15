import { useEffect, useRef } from "react";

export default function CalEmbed() {
  const ref = useRef(null);
  useEffect(() => {
    let cancelled = false;
    let loaded = false;
    function load() {
      if (cancelled || loaded) return;
      loaded = true;
      (function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if (typeof namespace === "string") { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ["initNamespace", namespace]); } else p(cal, ar); return; } p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
      window.Cal("init", "design-consultation-a", { origin: "https://app.cal.com" });
      window.Cal.config = window.Cal.config || {};
      window.Cal.config.forwardQueryParams = true;
      window.Cal.ns["design-consultation-a"]("inline", {
        elementOrSelector: "#my-cal-inline-design-consultation-a",
        config: { layout: "month_view", useSlotsViewOnSmallScreen: "true", theme: "dark" },
        calLink: "jeremy-ellsworth-uwa6in/design-consultation-a",
      });
      window.Cal.ns["design-consultation-a"]("ui", { theme: "dark", cssVarsPerTheme: { light: { "cal-brand": "#000000" }, dark: { "cal-brand": "#ffed00" } }, hideEventTypeDetails: true, layout: "month_view" });

      // Fire the Meta Pixel "Schedule" conversion the moment a booking completes
      // inside the embed — no redirect / thank-you URL needed.
      window.Cal.ns["design-consultation-a"]("on", {
        action: "bookingSuccessful",
        callback: () => {
          if (typeof window.fbq === "function") {
            window.fbq("track", "Schedule", { content_name: "design-consultation" });
          }
        },
      });
    }

    // The Cal.com calendar is the single heaviest payload on the page (a full
    // third-party SPA + iframe). Only load it once the booking widget nears the
    // viewport, so it never competes with hydration/critical UI on first load —
    // and never loads at all for visitors who bounce before reaching it. On
    // desktop it's in the hero so it loads almost immediately; on mobile it sits
    // below the headline and waits until the user scrolls toward it.
    const el = ref.current;
    let observer, timeoutId;
    if (el && typeof IntersectionObserver === "function") {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            observer.disconnect();
            load();
          }
        },
        { rootMargin: "400px" }
      );
      observer.observe(el);
    } else {
      timeoutId = setTimeout(load, 1200);
    }
    return () => {
      cancelled = true;
      if (observer) observer.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);
  return <div ref={ref} style={{ width: "100%", height: "100%", overflow: "scroll" }} id="my-cal-inline-design-consultation-a"></div>;
}
