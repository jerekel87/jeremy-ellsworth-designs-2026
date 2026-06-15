import { useEffect, useState, Fragment } from "react";
import { Link } from "react-router-dom";
import CalEmbed from "@/components/CalEmbed";
import Faq from "@/components/Faq";
import ContactSection from "@/components/ContactSection";
import { usePageText } from "@/lib/pageContent";
import { projects as staticProjects } from "@/lib/projects";
import { fetchProjects } from "@/lib/projectsApi";
import { fetchReviews } from "@/lib/reviewsApi";

/* When a title is left at its default it renders the original multi-span markup
   (preserving the accent colour + line animation). Once edited in the CMS it
   falls back to a single span carrying the custom text. */
function EditableTitle({ t, k, className, children }) {
  if (t.isCustom(k)) return <h2 className={className}><span>{t(k)}</span></h2>;
  return children;
}

/* Splits a comma-separated content value into trimmed phrases. */
function items(value) {
  return String(value || "").split(",").map((s) => s.trim()).filter(Boolean);
}

const LG_INDICES = [0, 4];

/* Maps each "What we do" service item to its slug + hover-preview image.
   Galleries below pull live projects related to each slug. */
const SERVICES = [
  { num: "01", k: "s1", slug: "brand-identity", img: "/assets/img/work/boss-hawgs.jpg" },
  { num: "02", k: "s2", slug: "vehicle-wraps", img: "/assets/img/work/high-caliber.jpg" },
  { num: "03", k: "s3", slug: "websites", img: "/assets/img/work/zero-gravity.jpg" },
  { num: "04", k: "s4", slug: "print-collateral", img: "/assets/img/work/macdavy.jpg" },
  { num: "05", k: "s5", slug: "packaging-labels", img: "/assets/img/work/stoopid-energy.jpg" },
  { num: "06", k: "s6", slug: "company-apparel", img: "/assets/img/work/graybeard.jpg" },
];

function ServiceGalleryGroup({ items, phCount, hidden }) {
  return (
    <div className="service__galleryGroup" aria-hidden={hidden || undefined}>
      {items.map((p) => (
        <Link key={p.slug} to={`/work/${p.slug}`} data-cursor="view" tabIndex={hidden ? -1 : undefined}>
          <img src={p.img} alt={hidden ? "" : p.title} loading="lazy" />
        </Link>
      ))}
      {Array.from({ length: phCount }).map((_, k) => (
        <div key={`ph${k}`} className="service__ph" aria-hidden="true"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg></div>
      ))}
    </div>
  );
}

const TEAM = Array.from({ length: 10 });

function ytId(url) {
  if (!url) return "";
  const m = String(url).match(/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/)([\w-]{6,})/);
  return m ? m[1] : String(url).trim();
}

/* A video card whose source can be left as the in-code default, swapped to a
   different YouTube link, or replaced with an uploaded file (played directly).
   data-video carries a YouTube id; data-video-src carries a direct media URL. */
function VideoCard({ t, kt, ks, ku, defId, defThumb, defAlt, className, lazy = true }) {
  const custom = t.isCustom(ku);
  const url = t(ku);
  const isUpload = custom && /\/storage\/v1\/object\//.test(url);
  const id = isUpload ? "" : custom ? ytId(url) : defId;
  const thumb = !custom || isUpload ? defThumb : `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  const attrs = isUpload ? { "data-video-src": url } : { "data-video": id };
  return (
    <div className={className} {...attrs} data-cursor="view">
      <div className="video-card__media">
        <img src={thumb} alt={defAlt} loading={lazy ? "lazy" : undefined} />
        <span className="video-card__play" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>
      </div>
      <div className="video-card__meta"><h3>{t(kt)}</h3><span>{t(ks)}</span></div>
    </div>
  );
}

export default function HomePage() {
  const t = usePageText();
  const [projects, setProjects] = useState(staticProjects);
  const [showPreloader] = useState(() => {
    try { return localStorage.getItem("je_preloader_seen") !== "1"; } catch (e) { return true; }
  });
  useEffect(() => {
    let active = true;
    fetchProjects()
      .then((rows) => { if (active && rows.length) setProjects(rows); })
      .catch(() => {});
    return () => { active = false; };
  }, []);
  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    let active = true;
    fetchReviews({ featuredOnly: true })
      .then((rows) => { if (active) setReviews(rows); })
      .catch(() => {});
    return () => { active = false; };
  }, []);
  const reviewGroup = (hidden) => (
    <div className="reviews__group" aria-hidden={hidden ? "true" : undefined}>
      {reviews.map((r) => {
        const name = r.name || "";
        const co = r.company || "";
        const full = r.full || r.short || "";
        const visible = full;
        return (
          <article key={r.id} className="review" data-cursor="view" data-full={full} data-name={name} data-co={co}>
            <div className="review__stars">★★★★★ <em>5.0</em></div>
            <p>{`\u201c${visible}\u201d`}</p>
            <footer>
              <span className="review__avatar">{name.charAt(0)}</span>
              <div><strong>{name}</strong><span>{co}</span></div>
            </footer>
          </article>
        );
      })}
    </div>
  );
  return (
    <>
  {/* ===== Preloader (first visit only) ===== */}
  {showPreloader ? (
    <div className="preloader" id="preloader" aria-hidden="true">
      <div className="preloader__inner">
        <img className="preloader__logo-img" src="/assets/img/logo-white.webp" alt="je.design" width="110" height="105" />
        <div className="preloader__count" id="preCount">0</div>
      </div>
    </div>
  ) : null}

  <main id="top">

    {/* ===== Hero ===== */}
    <section className="heroB" id="hero">
      <div className="heroB__bg" aria-hidden="true">
        <div className="heroB__glow heroB__glow--a"></div>
        <div className="heroB__glow heroB__glow--b"></div>
        <div className="heroB__dots"></div>
        <div className="heroB__beam"></div>
        <div className="heroB__grain"></div>
      </div>
      <div className="container heroB__layout">

        <div className="heroB__left">
          <div className="heroB__rating">
            {t.isCustom("home.hero.proof")
              ? t("home.hero.proof")
              : <><span className="stars">★★★★★</span> <strong>5.0</strong> — 1,800+ success stories</>}
          </div>
          <h1 className="heroB__title">
            {t.isCustom("home.hero.title")
              ? <span className="b-line"><span>{t("home.hero.title")}</span></span>
              : <>
                  <span className="b-line"><span>Brands</span></span>
                  <span className="b-line"><span>built to</span></span>
                  <span className="b-line"><span><em>empower</em> growth</span></span>
                </>}
          </h1>
          <p className="heroB__sub">{t("home.hero.sub")}</p>
          <div className="heroB__cta">
            <a href="#" className="btn btn--solid magnetic" data-drawer data-cursor="hover"><span>{t("home.hero.btn_primary")}</span><svg className="btn__arrow" width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></a>
            <a href="#results" className="btn btn--ghost magnetic" data-cursor="hover"><span>{t("home.hero.btn_secondary")}</span></a>
          </div>
        </div>

        <div className="heroB__right" id="book">
          <div className="heroB__offset" aria-hidden="true"></div>
          <div className="heroB__note" aria-hidden="true">
            <span className="heroB__note-text">{t.isCustom("home.hero.note") ? t("home.hero.note") : <>it's free —<br/>grab a slot!</>}</span>
            <svg className="heroB__note-arrow" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M64 4 C84 28 76 50 34 62" stroke="#FFF600" strokeWidth="3.5" strokeLinecap="round"/>
              <path d="M48 52 L30 64 L50 70" stroke="#FFF600" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="heroB__booking">
            <div className="heroB__booking-head">
              <span className="heroB__booking-dot"></span>
              <span>{t.isCustom("home.hero.booking") ? t("home.hero.booking") : <>Book your <em>free</em> design consultation</>}</span>
            </div>
            <CalEmbed />

          </div>
        </div>
      </div>
    </section>

    {/* ===== Marquee ===== */}
    <div className="tape" aria-hidden="true">
    <div className="marquee marquee--yellow">
      <div className="marquee__track">
        <div className="marquee__group">
          {items(t("home.marquee1.items")).map((p, i) => <Fragment key={i}><span>{p}</span><i>✦</i></Fragment>)}
        </div>
        <div className="marquee__group">
          {items(t("home.marquee1.items")).map((p, i) => <Fragment key={i}><span>{p}</span><i>✦</i></Fragment>)}
        </div>
      </div>
    </div>
    </div>

    {/* ===== About ===== */}
    <section className="about section" id="about">
      <div className="container">
        <div className="section__head">
          <span className="eyebrow reveal">{t("home.about.eyebrow")}</span>
        </div>
        {t.isCustom("home.about.statement")
          ? <p className="about__statement" key={t("home.about.statement")}>{t("home.about.statement")}</p>
          : <p className="about__statement split-words statement-zoom">We solve brand challenges through distinctive design — from bold logos to eye-catching vehicle wraps, strategic websites and more.</p>}

        <div className="about__row">
          <p className="about__copy reveal">{t("home.about.copy")}</p>
          <div className="about__cta reveal">
            <a href="#" data-drawer className="btn btn--solid magnetic" data-cursor="hover"><span>{t("home.about.cta_primary")}</span><svg className="btn__arrow" width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></a>
            <a href="#team" className="btn btn--ghost magnetic" data-cursor="hover"><span>{t("home.about.cta_secondary")}</span></a>
          </div>
        </div>

        <div className="about__stats">
          <div className="about-stat reveal"><strong><span data-count={t("home.about.stat1_value")}>0</span>+</strong><span>{t("home.about.stat1_label")}</span></div>
          <div className="about-stat reveal"><strong>{t("home.about.stat2_value")}</strong><span>{t("home.about.stat2_label")}</span></div>
          <div className="about-stat reveal"><strong><span data-count={t("home.about.stat3_value")}>0</span>+</strong><span>{t("home.about.stat3_label")}</span></div>
          <div className="about-stat reveal"><strong><span data-count={t("home.about.stat4_value")}>0</span>+</strong><span>{t("home.about.stat4_label")}</span></div>
        </div>
      </div>
    </section>

    {/* ===== Work ===== */}
    <section className="work section section--padless section--panel" id="work">
      <div className="container">
        <div className="section__head section__head--split">
          <div className="section__head-left"><span className="eyebrow reveal">{t("home.work.eyebrow")}</span>
            <EditableTitle t={t} k="home.work.title" className="section__title split-lines">
              <h2 className="section__title split-lines"><span>Brand</span> <span className="hero__accent">projects</span></h2>
            </EditableTitle>
          </div>
          <p className="section__sub reveal">{t("home.work.sub")}</p>
        </div>
      </div>

      <div className="container work__grid">
        {projects.map((p, i) => (
          <Link key={p.slug} to={`/work/${p.slug}`} className={"work-card" + (LG_INDICES.includes(i) ? " work-card--lg" : "")} data-cursor="view">
            <div className="work-card__media"><img src={p.img} alt={`${p.title} — ${p.category}`} loading="lazy" /></div>
            <div className="work-card__meta"><h3>{p.title}</h3><span>{p.category} · {p.industry}</span></div>
          </Link>
        ))}
      </div>

      <div className="container work__foot reveal">
        <p>{t("home.work.foot")}</p>
        <a href="#" data-drawer className="btn btn--ghost magnetic" data-cursor="hover"><span>{t("home.work.foot_btn")}</span></a>
      </div>
    </section>

    {/* ===== Mascot divider ===== */}
    <div className="tape" aria-hidden="true">
    <div className="marquee marquee--yellow marquee--tiltUp">
      <div className="marquee__track">
        <div className="marquee__group">
          {items(t("home.marquee2.items")).map((p, i) => <Fragment key={i}><span>{p}</span><i>✦</i></Fragment>)}
        </div>
        <div className="marquee__group">
          {items(t("home.marquee2.items")).map((p, i) => <Fragment key={i}><span>{p}</span><i>✦</i></Fragment>)}
        </div>
      </div>
    </div>
    </div>

    {/* ===== Mascots ===== */}
    <section className="mascots section" id="mascots">
      <div className="container">
        <div className="section__head section__head--split">
          <div className="section__head-left"><span className="eyebrow reveal">{t("home.mascots.eyebrow")}</span>
            <EditableTitle t={t} k="home.mascots.title" className="section__title split-lines">
              <h2 className="section__title split-lines"><span>Mascots they</span> <span className="hero__accent">remember</span></h2>
            </EditableTitle>
          </div>
          <p className="section__sub reveal">{t("home.mascots.sub")}</p>
        </div>
      </div>

      <div className="mascots__rows" aria-label="Mascot logo showcase">
        <div className="mascots__row">
          <div className="mascots__track">
            <img src="/assets/img/mascots/layer-7.jpg" alt="Mascot logo design by je.design" loading="lazy" />
            <img src="/assets/img/mascots/layer-8.jpg" alt="Mascot logo design by je.design" loading="lazy" />
            <img src="/assets/img/mascots/layer-9.jpg" alt="Mascot logo design by je.design" loading="lazy" />
            <img src="/assets/img/mascots/layer-10.jpg" alt="Mascot logo design by je.design" loading="lazy" />
            <img src="/assets/img/mascots/layer-11.jpg" alt="Mascot logo design by je.design" loading="lazy" />
            <img src="/assets/img/mascots/layer-12.jpg" alt="Mascot logo design by je.design" loading="lazy" />
            <img src="/assets/img/mascots/layer-13.jpg" alt="Mascot logo design by je.design" loading="lazy" />
            <img src="/assets/img/mascots/layer-14.jpg" alt="Mascot logo design by je.design" loading="lazy" />
            <img src="/assets/img/mascots/layer-7.jpg" alt="Mascot logo design by je.design" loading="lazy" />
            <img src="/assets/img/mascots/layer-8.jpg" alt="Mascot logo design by je.design" loading="lazy" />
            <img src="/assets/img/mascots/layer-9.jpg" alt="Mascot logo design by je.design" loading="lazy" />
            <img src="/assets/img/mascots/layer-10.jpg" alt="Mascot logo design by je.design" loading="lazy" />
            <img src="/assets/img/mascots/layer-11.jpg" alt="Mascot logo design by je.design" loading="lazy" />
            <img src="/assets/img/mascots/layer-12.jpg" alt="Mascot logo design by je.design" loading="lazy" />
            <img src="/assets/img/mascots/layer-13.jpg" alt="Mascot logo design by je.design" loading="lazy" />
            <img src="/assets/img/mascots/layer-14.jpg" alt="Mascot logo design by je.design" loading="lazy" />
          </div>
        </div>
        <div className="mascots__row">
          <div className="mascots__track mascots__track--reverse">
            <img src="/assets/img/mascots/layer-15.jpg" alt="Mascot logo design by je.design" loading="lazy" />
            <img src="/assets/img/mascots/layer-16.jpg" alt="Mascot logo design by je.design" loading="lazy" />
            <img src="/assets/img/mascots/layer-17.jpg" alt="Mascot logo design by je.design" loading="lazy" />
            <img src="/assets/img/mascots/layer-18.jpg" alt="Mascot logo design by je.design" loading="lazy" />
            <img src="/assets/img/mascots/layer-19.jpg" alt="Mascot logo design by je.design" loading="lazy" />
            <img src="/assets/img/mascots/layer-20.jpg" alt="Mascot logo design by je.design" loading="lazy" />
            <img src="/assets/img/mascots/layer-21.jpg" alt="Mascot logo design by je.design" loading="lazy" />
            <img src="/assets/img/mascots/layer-7.jpg" alt="Mascot logo design by je.design" loading="lazy" />
            <img src="/assets/img/mascots/layer-15.jpg" alt="Mascot logo design by je.design" loading="lazy" />
            <img src="/assets/img/mascots/layer-16.jpg" alt="Mascot logo design by je.design" loading="lazy" />
            <img src="/assets/img/mascots/layer-17.jpg" alt="Mascot logo design by je.design" loading="lazy" />
            <img src="/assets/img/mascots/layer-18.jpg" alt="Mascot logo design by je.design" loading="lazy" />
            <img src="/assets/img/mascots/layer-19.jpg" alt="Mascot logo design by je.design" loading="lazy" />
            <img src="/assets/img/mascots/layer-20.jpg" alt="Mascot logo design by je.design" loading="lazy" />
            <img src="/assets/img/mascots/layer-21.jpg" alt="Mascot logo design by je.design" loading="lazy" />
            <img src="/assets/img/mascots/layer-7.jpg" alt="Mascot logo design by je.design" loading="lazy" />
          </div>
        </div>
      </div>

      <div className="container mascots__foot reveal">
        <div className="mascots__uses">
          <span className="mascots__uses-label">{t("home.mascots.uses_label")}</span>
          <div className="mascots__chips">
            {items(t("home.mascots.chips")).map((c, i) => <span key={i}>{c}</span>)}
          </div>
        </div>
        <a href="#" data-drawer className="btn btn--ghost magnetic" data-cursor="hover"><span>{t("home.mascots.btn")}</span></a>
      </div>
    </section>

    {/* ===== Services ===== */}
    <section className="services section section--panel" id="services">
      <div className="container">
        <div className="section__head section__head--split">
          <div className="section__head-left"><span className="eyebrow reveal">{t("home.services.eyebrow")}</span>
            <EditableTitle t={t} k="home.services.title" className="section__title split-lines">
              <h2 className="section__title split-lines"><span>Creative</span> <span className="hero__accent">solutions</span></h2>
            </EditableTitle>
          </div>
          <p className="section__sub reveal">{t("home.services.sub")}</p>
        </div>

        <ul className="services__list" id="servicesList">
          {SERVICES.map((sv) => {
            const rel = projects.filter((p) => Array.isArray(p.services) && p.services.includes(sv.slug));
            const ph = Math.max(0, 8 - rel.length);
            return (
              <li className="service" data-img={sv.img} key={sv.slug}>
                <a href="#" role="button" data-cursor="hover">
                  <span className="service__num">{sv.num}</span>
                  <h3 className="service__name">{t(`home.services.${sv.k}_name`)}</h3>
                  <span className="service__desc">{t(`home.services.${sv.k}_desc`)}</span>
                  <span className="service__arrow">→</span>
                </a>
                <div className="service__panel">
                  <div className="service__gallery">
                    <div className="service__galleryTrack">
                      <ServiceGalleryGroup items={rel} phCount={ph} />
                      <ServiceGalleryGroup items={rel} phCount={ph} hidden />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="service-preview" id="servicePreview" aria-hidden="true"><img src="/assets/img/work/boss-hawgs.jpg" alt="" /></div>
    </section>

    {/* ===== Process ===== */}
    <section className="process section" id="process">
      <div className="container">
        <div className="section__head section__head--split">
          <div className="section__head-left"><span className="eyebrow reveal">{t("home.process.eyebrow")}</span>
            <EditableTitle t={t} k="home.process.title" className="section__title split-lines">
              <h2 className="section__title split-lines"><span>How we</span> <span className="hero__accent">work</span></h2>
            </EditableTitle>
          </div>
          <p className="section__sub reveal">{t("home.process.sub")}</p>
        </div>

        <div className="process__stack">
          <article className="pstep" style={{ '--i': '0' }}>
            <div className="pstep__body">
              <h3>{t("home.process.p1_title")}</h3>
              <p>{t("home.process.p1_text")}</p>
              <span className="pstep__meta">{t("home.process.p1_meta")}</span>
            </div>
            <span className="pstep__num" aria-hidden="true">01</span>
          </article>
          <article className="pstep" style={{ '--i': '1' }}>
            <div className="pstep__body">
              <h3>{t("home.process.p2_title")}</h3>
              <p>{t("home.process.p2_text")}</p>
              <span className="pstep__meta">{t("home.process.p2_meta")}</span>
            </div>
            <span className="pstep__num" aria-hidden="true">02</span>
          </article>
          <article className="pstep" style={{ '--i': '2' }}>
            <div className="pstep__body">
              <h3>{t("home.process.p3_title")}</h3>
              <p>{t("home.process.p3_text")}</p>
              <span className="pstep__meta">{t("home.process.p3_meta")}</span>
            </div>
            <span className="pstep__num" aria-hidden="true">03</span>
          </article>
          <article className="pstep pstep--yellow" style={{ '--i': '3' }}>
            <div className="pstep__body">
              <h3>{t("home.process.p4_title")}</h3>
              <p>{t("home.process.p4_text")}</p>
              <span className="pstep__meta">{t("home.process.p4_meta")}</span>
            </div>
            <span className="pstep__num" aria-hidden="true">04</span>
          </article>
        </div>
      </div>
    </section>

    {/* ===== Videos ===== */}
    <section className="videos section section--panel" id="videos">
      <div className="container">
        <div className="section__head section__head--split">
          <div className="section__head-left"><span className="eyebrow reveal">{t("home.videos.eyebrow")}</span>
            <EditableTitle t={t} k="home.videos.title" className="section__title split-lines">
              <h2 className="section__title split-lines"><span>Sketch to</span> <span className="hero__accent">sizzle</span></h2>
            </EditableTitle>
          </div>
          <p className="section__sub reveal">{t("home.videos.sub")}</p>
        </div>

        <div className="vrow" id="vrow">
          <VideoCard t={t} kt="home.videos.v1_title" ks="home.videos.v1_sub" ku="home.videos.v1_url" defId="-BNnw0WfyjM" defThumb="https://i.ytimg.com/vi/-BNnw0WfyjM/hqdefault.jpg" defAlt="Vector logo timelapse — Pōlani Poised" className="vslot vslot--left" />
          <VideoCard t={t} kt="home.videos.v2_title" ks="home.videos.v2_sub" ku="home.videos.v2_url" defId="BpuC_iyq0l8" defThumb="https://i.ytimg.com/vi/BpuC_iyq0l8/maxresdefault.jpg" defAlt="Igniting Creativity. Fueling Brands. — je.design brand reel" className="vslot vslot--center" />
          <VideoCard t={t} kt="home.videos.v3_title" ks="home.videos.v3_sub" ku="home.videos.v3_url" defId="P-Zq6cjDuuE" defThumb="https://i.ytimg.com/vi/P-Zq6cjDuuE/hqdefault.jpg" defAlt="Sketch logo timelapse — Computer Wiz" className="vslot vslot--right" />
        </div>

        <div className="videos__grid">
          <VideoCard t={t} kt="home.videos.v4_title" ks="home.videos.v4_sub" ku="home.videos.v4_url" defId="PXyjsFFNHAs" defThumb="https://i.ytimg.com/vi/PXyjsFFNHAs/hqdefault.jpg" defAlt="From Sketch to Sizzle: Suegra's Pika-Pika logo journey" className="video-card" />
          <VideoCard t={t} kt="home.videos.v5_title" ks="home.videos.v5_sub" ku="home.videos.v5_url" defId="3IjRK4f669A" defThumb="https://i.ytimg.com/vi/3IjRK4f669A/hqdefault.jpg" defAlt="Vector logo timelapse — Boss Hogg BBQ" className="video-card" />
          <VideoCard t={t} kt="home.videos.v6_title" ks="home.videos.v6_sub" ku="home.videos.v6_url" defId="0_NqkhfwIHI" defThumb="https://i.ytimg.com/vi/0_NqkhfwIHI/hqdefault.jpg" defAlt="Sketch logo timelapse — FP Outfitters" className="video-card" />
        </div>

        <div className="videos__foot reveal">
          <p>{t("home.videos.foot")}</p>
          <a href={t("home.videos.foot_href")} target="_blank" rel="noopener" className="btn btn--ghost magnetic" data-cursor="hover"><span>{t("home.videos.foot_btn")}</span></a>
        </div>
      </div>
    </section>

    {/* ===== Why je.design ===== */}
    <section className="why section" id="why">
      <div className="container">
        <div className="section__head section__head--split">
          <div className="section__head-left"><span className="eyebrow reveal">{t("home.why.eyebrow")}</span>
            <EditableTitle t={t} k="home.why.title" className="section__title split-lines">
              <h2 className="section__title split-lines"><span>Why brands</span> <span className="hero__accent">pick us</span></h2>
            </EditableTitle>
          </div>
          <p className="section__sub reveal">{t("home.why.note")}</p>
        </div>

        <div className="why__manifesto">
          <p className="why-line"><span className="why-line__big">{t.isCustom("home.why.l1_big") ? t("home.why.l1_big") : <>Real humans, <em>real answers</em>.</>}</span><span className="why-line__small">{t("home.why.l1_small")}</span></p>
          <p className="why-line"><span className="why-line__big">{t.isCustom("home.why.l2_big") ? t("home.why.l2_big") : <>Flat pricing, <em>no surprises</em>.</>}</span><span className="why-line__small">{t("home.why.l2_small")}</span></p>
          <p className="why-line"><span className="why-line__big">{t.isCustom("home.why.l3_big") ? t("home.why.l3_big") : <>Days, <em>not months</em>.</>}</span><span className="why-line__small">{t("home.why.l3_small")}</span></p>
          <p className="why-line why-line--video"><span className="why-line__big">{t.isCustom("home.why.l4_big") ? t("home.why.l4_big") : <>Drawn by hand, <em>never AI</em>.</>}</span><span className="why-line__small">{t("home.why.l4_small")} <a className="why-line__link" href={t("home.why.l4_href")} target="_blank" rel="noopener">{t("home.why.l4_link")}</a></span></p>
          <p className="why-line"><span className="why-line__big">{t.isCustom("home.why.l5_big") ? t("home.why.l5_big") : <>Your brand, <em>your files</em>.</>}</span><span className="why-line__small">{t("home.why.l5_small")}</span></p>
        </div>
      </div>
    </section>

    <div className="why-preview" id="whyPreview" aria-hidden="true"><video muted loop playsInline preload="none"></video></div>

    {/* ===== Revenue results ===== */}
    <section className="revenue section" id="results">
      <div className="revenue__bg" aria-hidden="true">
        <div className="revenue__glow revenue__glow--b"></div>
        <div className="revenue__dots"></div>
        <div className="revenue__beam"></div>
        <div className="revenue__grain"></div>
      </div>
      <div className="container">
        <div className="section__head section__head--split">
          <div className="section__head-left"><span className="eyebrow reveal">{t("home.results.eyebrow")}</span>
            <EditableTitle t={t} k="home.results.title" className="section__title split-lines">
              <h2 className="section__title split-lines"><span>Rebrands that</span> <span className="hero__accent">pay for themselves</span></h2>
            </EditableTitle>
          </div>
          <p className="section__sub reveal">{t("home.results.sub")}</p>
        </div>

        <div className="revenue__grid">
          <figure className="revenue-card reveal"><img src="/assets/img/revenue/rev-1.jpg" alt="200% revenue increase since rebranding with Jeremy Ellsworth Designs LLC" loading="lazy" /></figure>
          <figure className="revenue-card reveal"><img src="/assets/img/revenue/rev-5.jpg" alt="150% revenue increase since rebranding with Jeremy Ellsworth Designs LLC" loading="lazy" /></figure>
          <figure className="revenue-card reveal"><img src="/assets/img/revenue/rev-3.jpg" alt="Revenue increase since rebranding with Jeremy Ellsworth Designs LLC" loading="lazy" /></figure>
          <figure className="revenue-card reveal"><img src="/assets/img/revenue/rev-4.jpg" alt="Revenue increase since rebranding with Jeremy Ellsworth Designs LLC" loading="lazy" /></figure>
          <figure className="revenue-card reveal"><img src="/assets/img/revenue/rev-6.jpg" alt="Revenue increase since rebranding with Jeremy Ellsworth Designs LLC" loading="lazy" /></figure>
          <figure className="revenue-card reveal"><img src="/assets/img/revenue/rev-8.jpg" alt="Revenue increase since rebranding with Jeremy Ellsworth Designs LLC" loading="lazy" /></figure>
        </div>

        <div className="revenue__foot reveal">
          <p>{t("home.results.foot")}</p>
          <a href="#" data-drawer className="btn btn--solid magnetic" data-cursor="hover"><span>{t("home.results.foot_btn")}</span><svg className="btn__arrow" width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></a>
        </div>
      </div>
    </section>

    {/* ===== Pricing: Brand Access Program ===== */}
    <section className="pricing section" id="pricing">
      <div className="pricing__bg" aria-hidden="true"></div>
      <div className="container">
        <div className="section__head section__head--center">
          <span className="eyebrow eyebrow--dark reveal">{t("home.bap.eyebrow")}</span>
          {t.isCustom("home.bap.title")
            ? <h2 className="section__title section__title--dark split-lines"><span>{t("home.bap.title")}</span></h2>
            : <h2 className="section__title section__title--dark split-lines"><span>Brand Access</span> <span className="pricing__accent">Program</span></h2>}
          <p className="section__sub section__sub--dark reveal">{t.isCustom("home.bap.sub")
            ? t("home.bap.sub")
            : <>Get branded now and pay as you grow — $150 down, then $150 a month until paid off.<br />Your capital stays in your business, your files are yours from day one.</>}</p>
        </div>

        <div className="pricing__card reveal" data-tilt>
          <div className="pricing__left">
            <ul className="pricing__list">
              <li><strong>{t("home.bap.f1_title")}</strong><span>{t("home.bap.f1_sub")}</span></li>
              <li><strong>{t("home.bap.f2_title")}</strong><span>{t("home.bap.f2_sub")}</span></li>
              <li><strong>{t("home.bap.f3_title")}</strong><span>{t("home.bap.f3_sub")}</span></li>
              <li><strong>{t("home.bap.f4_title")}</strong><span>{t("home.bap.f4_sub")}</span></li>
              <li><strong>{t("home.bap.f5_title")}</strong><span>{t("home.bap.f5_sub")}</span></li>
              <li><strong>{t("home.bap.f6_title")}</strong></li>
            </ul>
          </div>
          <div className="pricing__right">
            <div className="payplan">
              <div className="payplan__today">
                <div className="pricing__price"><sup>$</sup>{t("home.bap.price")}</div>
                <span className="payplan__label">{t("home.bap.price_label")}</span>
              </div>
              <div className="payplan__tear" aria-hidden="true"></div>
              <div className="payplan__months" aria-label="Then $150 per month until paid off">
                <em>{t("home.bap.then_label")}</em>
                <i>{t("home.bap.month_amount")}</i><i>{t("home.bap.month_amount")}</i><i>{t("home.bap.month_amount")}</i><i className="payplan__more">…</i>
                <em>{t("home.bap.month_label")}</em>
              </div>
            </div>
            <a href={t("home.bap.btn_primary_href")} target="_blank" rel="noopener" className="btn btn--invert magnetic" data-cursor="hover"><span>{t("home.bap.btn_primary")}</span></a>
            <Link to="/brand-access-program" className="pricing__custom" data-cursor="hover">{t("home.bap.btn_secondary")}</Link>
          </div>
        </div>

        <p className="pricing__files reveal">{t.isCustom("home.bap.fineprint")
          ? t("home.bap.fineprint")
          : <>No hidden fees · no hostage files · <strong>cancel anytime after completion</strong>.</>}</p>
      </div>
    </section>

    {/* ===== Testimonials ===== */}
    <section className="reviews section section--padless" id="reviews">
      <div className="container">
        <div className="section__head section__head--split">
          <div className="section__head-left"><span className="eyebrow reveal">{t("home.reviews.eyebrow")}</span>
            <EditableTitle t={t} k="home.reviews.title" className="section__title split-lines">
              <h2 className="section__title split-lines"><span>1.8k success</span> <span className="hero__accent">stories</span></h2>
            </EditableTitle>
          </div>
          <p className="section__sub reveal">{t("home.reviews.sub")}</p>
        </div>
      </div>

      <div className="reviews__rows">
        <div className="reviews__row" data-speed="1">
          <div className="reviews__track">
            {reviewGroup(false)}
            {reviewGroup(true)}
          </div>
        </div>
      </div>

      <div className="container reviews__foot reveal">
        <div className="reviews__badges">
          <span className="reviews__rating">{t("home.reviews.rating")}</span>
          <span className="reviews__sep">·</span>
          <span>Featured on</span>
          <a href="https://99designs.com/blog/designers/designer-profile-jeremy-ellsworth-jerekel/" target="_blank" rel="noopener" data-cursor="hover"><img src="/assets/img/99designs.webp" alt="99designs" height="26" /></a>
        </div>
        <a href="#" data-drawer className="btn btn--solid magnetic" data-cursor="hover"><span>{t("home.reviews.foot_btn")}</span><svg className="btn__arrow" width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></a>
      </div>
    </section>

    {/* ===== Team ===== */}
    <section className="team section section--panel" id="team">
      <div className="container">
        <div className="section__head section__head--split">
          <div className="section__head-left"><span className="eyebrow reveal">{t("home.team.eyebrow")}</span>
            <EditableTitle t={t} k="home.team.title" className="section__title split-lines">
              <h2 className="section__title split-lines"><span>Team</span> <span className="hero__accent">je.design</span></h2>
            </EditableTitle>
          </div>
          <div className="team__headRight">
            <p className="section__sub reveal">{t("home.team.sub")}</p>
            <div className="team__controls reveal">
              <button className="team-nav" id="teamPrev" aria-label="Scroll team left" data-cursor="hover"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5m6-6-6 6 6 6"/></svg></button>
              <button className="team-nav" id="teamNext" aria-label="Scroll team right" data-cursor="hover"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></button>
            </div>
          </div>
        </div>
      </div>
      <div className="team__strip" id="teamStrip">
        <div className="team__track">
          {TEAM.map((_, i) => {
            const n = i + 1;
            const name = t(`home.team.m${n}_name`);
            const photo = t(`home.team.m${n}_photo`);
            return (
              <figure className="team-card" key={n}>
                {photo
                  ? <img src={photo} alt={name} loading="lazy" />
                  : <span className="team-card__ph" aria-hidden="true">{name.charAt(0)}</span>}
                <figcaption><strong>{name}</strong><span>{t(`home.team.m${n}_role`)}</span></figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>

    <Faq />

    <ContactSection />
  </main>
    </>
  );
}
