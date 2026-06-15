"use client";
import { useSettings } from "@/lib/settingsContent";
import { Link } from "@/components/next/Link";

export default function Footer() {
  const s = useSettings();
  const year = new Date().getFullYear();
  return (
    <>
  {/* ===== Footer ===== */}
  <footer className="footer">
    <div className="container footer__grid">
      <div className="footer__brand">
        <a href="#top" className="header__brand" data-cursor="hover">
          <img src="/assets/img/logo-white.webp" alt="je.design logo" className="header__logo" width="44" height="42" />
          <span className="header__wordmark">je<em>.</em>design</span>
        </a>
        <p>je.design is a full-service design agency catering to businesses and individuals, with a focus on delivering high-quality, professional design solutions.</p>
        <span className="footer__rating">{s("settings.proof.rating")} ★ · {s("settings.proof.stories")} on Google &amp; Facebook</span>
      </div>
      <nav className="footer__col" aria-label="Footer site links">
        <h4>Site</h4>
        <Link to="/about">About</Link>
        <Link to="/work">Work</Link>
        <Link to="/services">Services</Link>
        <Link to="/brand-access-program">Brand Access Program</Link>
        </nav>
      <nav className="footer__col" aria-label="Footer social links">
        <h4>Social</h4>
        <a href={s("settings.social.instagram")} target="_blank" rel="noopener">Instagram</a>
        <a href={s("settings.social.facebook")} target="_blank" rel="noopener">Facebook</a>
        <a href={s("settings.social.x")} target="_blank" rel="noopener">X / Twitter</a>
        <a href={s("settings.social.youtube")} target="_blank" rel="noopener">YouTube</a>
        <a href="https://g.co/kgs/E6KKgsQ" target="_blank" rel="noopener">Google Business</a>
      </nav>
      <div className="footer__col">
        <h4>Payments</h4>
        <p className="footer__pay">Square · Afterpay · Cashapp · Venmo · PayPal</p>
        <p className="footer__pay footer__pay--crypto">Now accepting <strong>Bitcoin, Litecoin, Solana &amp; XRP</strong></p>
      </div>
    </div>
    <div className="container footer__bottom">
      <span>© {year} {s("settings.business.legal_name")}. All rights reserved.</span>
      <span>Building Brands That Empower Growth — www.je.design</span>
    </div>
  </footer>
    </>
  );
}
