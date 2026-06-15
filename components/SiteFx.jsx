import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import initSite from "@/lib/initSite";

export default function SiteFx() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);

    const menu = document.getElementById("mobileMenu");
    const burger = document.getElementById("burger");
    if (menu) { menu.classList.remove("is-open"); menu.setAttribute("aria-hidden", "true"); }
    if (burger) { burger.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); }

    const cleanup = initSite();
    return cleanup;
  }, [pathname]);
  return null;
}
