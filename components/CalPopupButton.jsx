import { useEffect, useRef } from "react";
import { getCalApi } from "@calcom/embed-react";

export default function CalPopupButton({ className, children, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let done = false;
    // The Cal.com popup bundle is a heavy third-party payload. Don't load it on
    // mount (it competes with the initial mobile load). Mirror the home-page
    // embed: initialize once the button nears the viewport — the user has to
    // scroll to it, so it's ready well before they can tap, without ever
    // blocking first paint. Hover/focus prime it as a fallback for fast input.
    async function init() {
      if (done) return;
      done = true;
      const cal = await getCalApi({ namespace: "design-consultation" });
      cal("ui", {
        theme: "dark",
        cssVarsPerTheme: { light: { "cal-brand": "#000000" }, dark: { "cal-brand": "#ffed00" } },
        hideEventTypeDetails: true,
        layout: "month_view",
      });
    }

    let observer;
    if (typeof IntersectionObserver === "function") {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            observer.disconnect();
            init();
          }
        },
        { rootMargin: "400px" }
      );
      observer.observe(el);
    } else {
      init();
    }

    const opts = { once: true, passive: true };
    el.addEventListener("pointerenter", init, opts);
    el.addEventListener("focus", init, opts);
    return () => {
      if (observer) observer.disconnect();
      el.removeEventListener("pointerenter", init);
      el.removeEventListener("focus", init);
    };
  }, []);

  return (
    <button
      ref={ref}
      type="button"
      className={className}
      data-cal-namespace="design-consultation"
      data-cal-link="jeremy-ellsworth-uwa6in/design-consultation"
      data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true","theme":"dark"}'
      {...rest}
    >
      {children}
    </button>
  );
}
