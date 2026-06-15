import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ContactSection from "@/components/ContactSection";
import ShareButton from "@/components/ShareButton";
import CalPopupButton from "@/components/CalPopupButton";
import { projects as staticProjects } from "@/lib/projects";
import { fetchProjects } from "@/lib/projectsApi";
import { services as allServices } from "@/lib/services";
import NotFound from "@/pages/NotFound";

// after the lead row (image + info panel), stack rows by the saved layout
// (columns per row); any leftover falls back to the 3-up / full / 2-up rhythm
function chunkGallery(images, layout = []) {
  const pattern = [3, 1, 2];
  const rows = [];
  let i = 0, si = 0, pi = 0;
  while (i < images.length) {
    let n = si < layout.length ? Math.min(3, Math.max(1, layout[si] || 1)) : pattern[pi % pattern.length];
    if (si < layout.length) si += 1; else pi += 1;
    n = Math.min(n, images.length - i);
    rows.push(images.slice(i, i + n));
    i += n;
  }
  return rows;
}

export default function ProjectPage() {
  const { slug } = useParams();
  const [projects, setProjects] = useState(staticProjects);

  useEffect(() => {
    let active = true;
    fetchProjects()
      .then((rows) => { if (active && rows.length) setProjects(rows); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const p = projects.find((x) => x.slug === slug);
  if (!p) return <NotFound />;

  const i = projects.findIndex((x) => x.slug === p.slug);
  const prev = projects[(i - 1 + projects.length) % projects.length];
  const next = projects[(i + 1) % projects.length];
  const gallery = p.gallery || [p.img];
  const lead = gallery[0];
  const rows = chunkGallery(gallery.slice(1), p.layout || []);

  return (
    <main id="top">
      {/* ===== Case hero ===== */}
      <section className="pagehero pagehero--case">
        <div className="container">
          <span className="eyebrow reveal">{p.category} · {p.industry}</span>
          <h1 className="pagehero__title split-lines"><span>{p.title}</span></h1>
          <div className="case-hero__row reveal">
            <p className="pagehero__sub">{p.blurb}</p>
            <ShareButton title={`${p.title} — je.design`} />
          </div>
        </div>
      </section>

      {/* ===== Stacked gallery ===== */}
      <section className="case section section--padless">
        <div className="container case-gallery">
          <div className="cg-row cg-row--2">
            <aside className="cg-panel reveal">
              <h3>The Solution</h3>
              <div className="cg-panel__stamp" aria-hidden="true">
                <svg viewBox="0 0 160 160">
                  <defs>
                    <path id="stampArc" d="M80,80 m-53,0 a53,53 0 1,1 106,0 a53,53 0 1,1 -106,0" />
                    {/* rough, inky edges */}
                    <filter id="stampRough" x="-15%" y="-15%" width="130%" height="130%">
                      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="11" result="n" />
                      <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" />
                    </filter>

                    {/* tint the raster logo with stamp ink */}
                    <filter id="stampLogoTint">
                      <feFlood floodColor="#A6A69E" result="flood" />
                      <feComposite in="flood" in2="SourceAlpha" operator="in" />
                    </filter>
                  </defs>
                  <g filter="url(#stampRough)">
                    <circle cx="80" cy="80" r="76" fill="none" stroke="currentColor" strokeWidth="3" />
                    <circle cx="80" cy="80" r="44" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <text fontSize="13.5" fontWeight="800" letterSpacing="3">
                      <textPath href="#stampArc" textLength="332" lengthAdjust="spacingAndGlyphs">PROJECT APPROVED • DELIVERED •</textPath>
                    </text>
                    <image href="/assets/img/logo-white.webp" x="56" y="57" width="48" height="46" filter="url(#stampLogoTint)" />
                  </g>
                </svg>
              </div>
              <ul className="spec spec--links">
                {(p.services || []).map((slug, si) => {
                  const s = allServices.find((x) => x.slug === slug);
                  if (!s) return null;
                  return (
                    <li key={slug}>
                      <Link to={`/services/${slug}`} data-cursor="hover">
                        <em>{String(si + 1).padStart(2, "0")}</em>
                        <span>{s.title}</span>
                        <b aria-hidden="true">↗</b>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="case__meta">
                <div><span>Industry</span><strong>{p.industry}</strong></div>
                <div><span>Timeline</span><strong>2–3 weeks</strong></div>
                <div><span>Made by</span><strong>je.design — in-house, by hand</strong></div>
              </div>
              <div className="case__cta">
                <CalPopupButton className="btn btn--outline magnetic case__cta-call" data-cursor="hover">
                  <span>Schedule Call</span>
                </CalPopupButton>
                <a href="#" data-drawer className="btn btn--solid magnetic" data-cursor="hover">
                  <span>Start a project like this</span>
                </a>
              </div>
            </aside>
            <figure className="cg-item reveal">
              <img src={lead} alt={`${p.title} — ${p.category}`} loading="eager" />
            </figure>
          </div>
          {(() => {
            let quoteUsed = false;
            return rows.map((row, ri) => {
              if (row.length === 1 && !quoteUsed && p.testimonial?.quote) {
                quoteUsed = true;
                return (
                  <div key={ri} className="cg-row cg-row--1">
                    <blockquote className="cg-quote reveal">
                      <span className="cg-quote__mark" aria-hidden="true">“</span>
                      <div className="cg-quote__stars" aria-label="5.0 star review">★★★★★</div>
                      <p>{p.testimonial.quote}</p>
                      <footer>
                        <strong>{p.testimonial.name}</strong>
                        <span>{p.testimonial.company}</span>
                      </footer>
                    </blockquote>
                  </div>
                );
              }
              return (
                <div key={ri} className={`cg-row cg-row--${row.length}`}>
                  {row.map((src, ii) => (
                    <figure key={ii} className="cg-item reveal">
                      <img src={src} alt={`${p.title} — project image ${ri * 3 + ii + 1}`} loading={ri === 0 ? "eager" : "lazy"} />
                    </figure>
                  ))}
                </div>
              );
            });
          })()}
        </div>
      </section>

      {/* ===== Pager with hover thumbnails ===== */}
      <section className="casepager">
        <div className="container casepager__row">
          <Link to={`/work/${prev.slug}`} className="casepager__link" data-cursor="hover">
            <span className="casepager__thumb" aria-hidden="true"><img src={prev.img} alt="" loading="lazy" /></span>
            <span>← Previous</span><strong>{prev.title}</strong>
          </Link>
          <Link to="/work" className="casepager__all" data-cursor="hover">All work</Link>
          <Link to={`/work/${next.slug}`} className="casepager__link casepager__link--next" data-cursor="hover">
            <span className="casepager__thumb casepager__thumb--right" aria-hidden="true"><img src={next.img} alt="" loading="lazy" /></span>
            <span>Next →</span><strong>{next.title}</strong>
          </Link>
        </div>
      </section>

      <ContactSection />
    </main>
  );
}
