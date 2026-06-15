"use client";
import { Link } from "@/components/next/Link";
import ContactSection from "@/components/ContactSection";
import Faq from "@/components/Faq";
import ReviewsStrip from "@/components/ReviewsStrip";
import OwnerNote from "@/components/OwnerNote";
import ResultsStrip from "@/components/ResultsStrip";

// related portfolio picks per service
const relatedMap = {
  "brand-identity": ["boss-hawgs-bbq", "high-caliber-electric", "graybeard-construction"],
  "vehicle-wraps": ["salty-soft-wash", "big-spring-builders", "spartan-hvac"],
  "websites": ["zero-gravity-atv", "bags", "high-caliber-electric"],
  "print-collateral": ["macdavy-heating-air", "bison-roofing", "jump-party"],
  "packaging-labels": ["stoopid-energy", "boss-hawgs-bbq", "jump-party"],
  "company-apparel": ["graybeard-construction", "spartan-hvac", "jump-party"],
};

export default function ServiceDetailView({ service: s, services = [], projects = [] }) {
  const i = services.findIndex((x) => x.slug === s.slug);
  const prev = services[(i - 1 + services.length) % services.length];
  const next = services[(i + 1) % services.length];
  const related = (relatedMap[s.slug] || [])
    .map((ps) => projects.find((p) => p.slug === ps))
    .filter(Boolean);
  const latest = related[0];
  const galleryProjects = projects.filter((p) => Array.isArray(p.services) && p.services.includes(s.slug));
  const phCount = Math.max(0, 8 - galleryProjects.length);

  return (
    <main id="top">
      {/* ===== Hero ===== */}
      <section className="pagehero pagehero--case">
        <div className="container">
          <span className="eyebrow reveal">Service / {s.num} · What we do</span>
          <h1 className="pagehero__title split-lines"><span>{s.title}</span></h1>
          <p className="pagehero__sub reveal">{s.desc}</p>
        </div>
      </section>

      {/* ===== Lead: image + included panel ===== */}
      <section className="case section section--padless">
        <div className="container case-gallery">
          <div className="cg-row cg-row--2">
            <aside className="cg-panel reveal">
              <h3>What's included</h3>
              <ul className="spec">
                {s.bullets.map((b, bi) => (
                  <li key={b}><em>{String(bi + 1).padStart(2, "0")}</em>{b}</li>
                ))}
              </ul>
              <p className="svc-card__note">{s.note}</p>
              <div className="case__meta">
                <div><span>Good for</span><strong>{s.industries}</strong></div>
                <div><span>Timeline</span><strong>2–3 weeks</strong></div>
                <div><span>Made by</span><strong>je.design — in-house, by hand</strong></div>
              </div>
              <a href="#" data-drawer className="btn btn--solid magnetic" data-cursor="hover">
                <span>Get a Quote</span>
                <svg className="btn__arrow" width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
            </aside>
            <Link to={latest ? `/work/${latest.slug}` : "/work"} className="cg-item cg-item--latest reveal" data-cursor="view">
              <img src={latest ? latest.img : s.img} alt={latest ? latest.title : s.title} loading="eager" />
              {latest && <span className="cg-item__tag">Latest — {latest.title} ↗</span>}
            </Link>
          </div>
        </div>

        {/* full-bleed scrolling related projects */}
        <div className="svcdetail-scroller" aria-label="Related project gallery">
          <div className="service__gallery">
            <div className="service__galleryTrack">
              <div className="service__galleryGroup">
                {galleryProjects.map((p) => (
                  <Link key={p.slug} to={`/work/${p.slug}`} data-cursor="view">
                    <img src={p.img} alt={p.title} loading="lazy" />
                  </Link>
                ))}
                {Array.from({ length: phCount }).map((_, k) => (
                  <div key={`ph${k}`} className="service__ph" aria-hidden="true">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                  </div>
                ))}
              </div>
              <div className="service__galleryGroup" aria-hidden="true">
                {galleryProjects.map((p) => (
                  <Link key={p.slug} to={`/work/${p.slug}`} data-cursor="view" tabIndex={-1}>
                    <img src={p.img} alt="" loading="lazy" />
                  </Link>
                ))}
                {Array.from({ length: phCount }).map((_, k) => (
                  <div key={`ph${k}`} className="service__ph" aria-hidden="true">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="svcdetail-foot reveal">
            <p>Every one of these started the same way yours will — a blank page, a real conversation, and a designer who gives a damn.</p>
            <a href="#" data-drawer className="btn btn--solid magnetic" data-cursor="hover">
              <span>Get a Quote</span>
              <svg className="btn__arrow" width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
          </div>
        </div>
      </section>

      {/* ===== How it goes ===== */}
      <section className="section section--panel">
        <div className="container">
          <div className="section__head section__head--split">
            <div className="section__head-left">
              <span className="eyebrow reveal">How it goes</span>
              <h2 className="section__title split-lines"><span>From hello to</span> <span className="hero__accent">handoff</span></h2>
            </div>
            <p className="section__sub reveal">Four steps, a couple of weeks, zero runaround — here's exactly what happens after you reach out.</p>
          </div>
          <div className="svcdiff__strip" style={{ borderTop: "1px solid var(--line)" }}>
            <div className="svcdiff__item reveal">
              <strong>01 — Discovery</strong>
              <span>A free consultation to understand your business, your market and what you actually need.</span>
            </div>
            <div className="svcdiff__item reveal">
              <strong>02 — Concepts</strong>
              <span>Original concepts drawn by hand — first draft in 5–7 business days.</span>
            </div>
            <div className="svcdiff__item reveal">
              <strong>03 — Refine</strong>
              <span>A private channel with your team. Typically 5–7 revision rounds until it's right.</span>
            </div>
            <div className="svcdiff__item reveal">
              <strong>04 — Deliver</strong>
              <span>Final files in AI, SVG, PDF, JPG and PNG — yours to own forever.</span>
            </div>
          </div>
        </div>
      </section>

      <OwnerNote />

      <ResultsStrip />

      {/* ===== Reviews ===== */}
      <section className="section section--padless">
        <div className="container">
          <div className="section__head section__head--split">
            <div className="section__head-left">
              <span className="eyebrow reveal">Reviews</span>
              <h2 className="section__title split-lines"><span>Five stars,</span> <span className="hero__accent">every time</span></h2>
            </div>
            <p className="section__sub reveal">1,800+ success stories across Google and Facebook — here's what owners say about working with us.</p>
          </div>
        </div>
        <ReviewsStrip />
      </section>

      {/* ===== Pager ===== */}
      <section className="casepager">
        <div className="container casepager__row">
          <Link to={`/services/${prev.slug}`} className="casepager__link" data-cursor="hover">
            <span className="casepager__thumb" aria-hidden="true"><img src={prev.img} alt="" loading="lazy" /></span>
            <span>← Previous</span><strong>{prev.title}</strong>
          </Link>
          <Link to="/services" className="casepager__all" data-cursor="hover">All services</Link>
          <Link to={`/services/${next.slug}`} className="casepager__link casepager__link--next" data-cursor="hover">
            <span className="casepager__thumb casepager__thumb--right" aria-hidden="true"><img src={next.img} alt="" loading="lazy" /></span>
            <span>Next →</span><strong>{next.title}</strong>
          </Link>
        </div>
      </section>

      <Faq />
      <ContactSection />
    </main>
  );
}
