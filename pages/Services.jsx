import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ContactSection from "@/components/ContactSection";
import SpinBadge from "@/components/SpinBadge";
import Faq from "@/components/Faq";
import { services as staticServices } from "@/lib/services";
import { fetchServices } from "@/lib/servicesApi";
import { usePageText } from "@/lib/pageContent";

export default function ServicesPage() {
  const [services, setServices] = useState(staticServices);
  const t = usePageText();

  useEffect(() => {
    let active = true;
    fetchServices()
      .then((rows) => { if (active && rows.length) setServices(rows); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  return (
    <main id="top">
      {/* ===== Page hero ===== */}
      <section className="pagehero">
        <div className="container">
        
          <span className="eyebrow reveal">{t("services.hero.eyebrow")}</span>
          <h1 className="pagehero__title split-lines"><span>{t("services.hero.title")}</span> <span className="hero__accent">{t("services.hero.title_accent")}</span></h1>
          <p className="pagehero__sub reveal">{t("services.hero.sub")}</p>
      </div>
        <SpinBadge />
      </section>

      {/* ===== The difference ===== */}
      <section className="svcdiff section section--panel">
        <div className="container">
          {t.isCustom("services.diff.statement")
            ? <p className="about__statement" key={t("services.diff.statement")}>{t("services.diff.statement")}</p>
            : <p className="about__statement split-words">Most agencies bury you in process, hand you to account managers and disappear for months. We do the opposite — and it shows in the work.</p>}
          <div className="svcdiff__strip">
            <div className="svcdiff__item reveal">
              <strong>{t("services.diff.s1_title")}</strong>
              <span>{t("services.diff.s1_text")}</span>
            </div>
            <div className="svcdiff__item reveal">
              <strong>{t("services.diff.s2_title")}</strong>
              <span>{t("services.diff.s2_text")}</span>
            </div>
            <div className="svcdiff__item reveal">
              <strong>{t("services.diff.s3_title")}</strong>
              <span>{t("services.diff.s3_text")}</span>
            </div>
            <div className="svcdiff__item reveal">
              <strong>{t("services.diff.s4_title")}</strong>
              <span>{t("services.diff.s4_text")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Service index + cards ===== */}
      <section className="svc section section--padless">
        <div className="container svc-layout">
          <nav className="svc-index" id="svcIndex" aria-label="Services index">
            {services.map((s) => (
              <a key={s.slug} href={`#${s.slug}`} data-target={s.slug} data-cursor="hover">
                <em>{s.num}</em><span>{s.short || s.title}</span>
              </a>
            ))}
          </nav>
          <div className="svc-cards">
            {services.map((s, i) => (
              <article key={s.slug} className="svc-card reveal" id={s.slug}>
                <figure className="svc-card__media" data-tilt>
                  <img src={s.img} alt={s.title} loading={i === 0 ? "eager" : "lazy"} />
                </figure>
                <div className="svc-card__body">
                  <h2 className="svc-card__title">{s.title}</h2>
                  <p>{s.desc}</p>
                  <ul className="spec">
                    {s.bullets.map((b, bi) => (
                      <li key={b}><em>{String(bi + 1).padStart(2, "0")}</em>{b}</li>
                    ))}
                  </ul>
                  <p className="svc-card__note">{s.note}</p>
                  <div className="svc-card__foot">
                    <span className="svc-card__industries">{s.industries}</span>
                    <Link to={`/services/${s.slug}`} className="btn btn--solid magnetic" data-cursor="hover">
                      <span>Learn more</span>
                      <svg className="btn__arrow" width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Sprint finale ===== */}
      <section className="sprint section">
        <div className="container">
          <div className="sprintcard reveal" data-tilt>
            <div className="sprintcard__top">
              <span className="sprintcard__kicker">{t("services.finale.kicker")}</span>
              <div className="sprintcard__price"><sup>$</sup>150<span>down · $150/mo until paid off</span></div>
            </div>
            <h2 className="sprintcard__title">Start for <em>$150.</em></h2>
            <ul className="sprintcard__spec">
              {services.map((s, i) => (
                <li key={s.slug}><em>{String(i + 1).padStart(2, "0")}</em>{s.title}</li>
              ))}
            </ul>
            <div className="sprintcard__foot">
              <p className="sprintcard__line">{t("services.finale.line")}</p>
              <div className="sprintcard__actions">
                <a href="https://agreement.je.design/brand-access-program" target="_blank" rel="noopener" className="btn btn--invert magnetic" data-cursor="hover"><span>Get Instant Quote</span></a>
                <Link to="/brand-access-program" className="sprintcard__more" data-cursor="hover">How the program works →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Faq />
      <ContactSection />
    </main>
  );
}
