import Concierge from "@/components/Concierge";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <>
  {/* ===== Header ===== */}
  <header className="header" id="header">
    <div className="header__inner">
      <div className="header__left">
        <Link to="/" className="header__brand" data-cursor="hover" aria-label="je.design home">
          <img src="/assets/img/logo-white.webp" alt="je.design logo" className="header__logo" width="44" height="42" />
        </Link>
        <div className="switcher" id="switcher">
          <button className="switcher__btn" id="switcherBtn" aria-label="Sister companies" aria-expanded="false" data-cursor="hover">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="8" cy="8" r="2.4"/><circle cx="16" cy="8" r="2.4"/><circle cx="8" cy="16" r="2.4"/><circle cx="16" cy="16" r="2.4"/></svg>
          </button>
          <div className="switcher__menu" id="switcherMenu" aria-hidden="true">
            <span className="switcher__label">Sister companies</span>
            <a href="https://vectify.com" target="_blank" rel="noopener"><strong>Vectify</strong><span>vectify.com</span></a>
            <a href="https://onsitecall.com" target="_blank" rel="noopener"><strong>OnSiteCall</strong><span>onsitecall.com</span></a>
            <a href="https://urler.co" target="_blank" rel="noopener"><strong>Urler</strong><span>urler.co</span></a>
          </div>
        </div>
      </div>
      <nav className="header__nav" id="nav" aria-label="Primary">
        <Link to="/" data-cursor="hover">Home</Link>
        <Link to="/about" data-cursor="hover">About</Link>
        <Link to="/work" data-cursor="hover">Work</Link>
        <Link to="/services" data-cursor="hover">Services</Link>
        <a href="#reviews" data-cursor="hover">Reviews</a>
      </nav>
      <div className="header__actions">
        <Concierge />
        <a href="#" data-drawer className="btn btn--solid btn--sm magnetic" data-cursor="hover"><span>Get a Quote</span><svg className="btn__arrow" width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></a>
        <button className="header__burger" id="burger" aria-label="Open menu" aria-expanded="false">
          <span></span><span></span>
        </button>
      </div>
    </div>
  </header>

  {/* ===== Mobile menu ===== */}
  <div className="mobile-menu" id="mobileMenu" aria-hidden="true">
    <nav className="mobile-menu__nav" aria-label="Mobile">
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
      <Link to="/work">Work</Link>
      <Link to="/services">Services</Link>
      <a href="#reviews">Reviews</a>
      <a href="#" data-drawer className="mobile-menu__cta">Get a Quote →</a>
    </nav>
    <div className="mobile-menu__foot">
      <a href="https://www.instagram.com/jnellsworth" target="_blank" rel="noopener">Instagram</a>
      <a href="https://web.facebook.com/jnellsworth" target="_blank" rel="noopener">Facebook</a>
      <a href="https://www.x.com/jnellsworth_" target="_blank" rel="noopener">X</a>
    </div>
  </div>
    </>
  );
}
