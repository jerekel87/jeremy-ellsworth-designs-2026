import Faq from "@/components/Faq";
import ContactSection from "@/components/ContactSection";
import SpinBadge from "@/components/SpinBadge";
import { usePageText } from "@/lib/pageContent";

export default function AboutPage() {
  const t = usePageText();
  return (
    <>
  <main id="top">

    {/* ===== Page hero ===== */}
    <section className="pagehero">
      <div className="container">
        
        <span className="eyebrow reveal">{t("about.hero.eyebrow")}</span>
        <h1 className="pagehero__title split-lines"><span>{t("about.hero.title")}</span> <span className="hero__accent">{t("about.hero.title_accent")}</span></h1>
        <p className="pagehero__sub reveal">{t("about.hero.sub")}</p>
      </div>
      <SpinBadge />
    </section>

    {/* ===== Story ===== */}
    <section className="story section section--panel">
      <div className="container story__grid">

        <div className="story__stick">
          <figure className="story__card" data-tilt>
            <img src={t("home.team.m1_photo")} alt={`${t("home.team.m1_name")}, ${t("home.team.m1_role")}`} loading="lazy" />
            <figcaption><strong>{t("home.team.m1_name")}</strong><span>{t("home.team.m1_role")}</span></figcaption>
          </figure>
          <div className="story__note" aria-hidden="true">
            <svg className="story__note-arrow" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M64 84 C84 60 76 38 34 26" stroke="#FFF600" strokeWidth="3.5" strokeLinecap="round"/>
              <path d="M48 36 L30 24 L50 18" stroke="#FFF600" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="story__note-text">the guy who<br/>started it all</span>
          </div>
        </div>

        <div className="story__copy">
          <h2 className="story__statement split-words">From one designer's craft to a 10-person creative force — built on 20 years of doing it the hard way.</h2>
          <p className="reveal">{t("about.story.p1")}</p>
          <p className="reveal">{t("about.story.p2")}</p>
          <ul className="spec reveal">
            <li><em>01</em>Home service specialists</li>
            <li><em>02</em>100% in-house</li>
            <li><em>03</em>Drawn by hand — never AI</li>
            <li><em>04</em>US-wide</li>
          </ul>
          <blockquote className="about__quote reveal">
            {t("about.story.quote")}
            <cite>{t("about.story.quote_cite")}</cite>
          </blockquote>
          <div className="story__cta reveal">
            <a href="#" data-drawer className="btn btn--solid magnetic" data-cursor="hover"><span>Work with us</span><svg className="btn__arrow" width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></a>
          </div>
        </div>
      </div>
    </section>

    {/* ===== Stats tape ===== */}
    <div className="tape" aria-hidden="true">
      <div className="marquee marquee--yellow">
        <div className="marquee__track">
          <div className="marquee__group">
            <span>20+ Years of craft</span><i>✦</i><span>10 In-house creatives</span><i>✦</i><span>1,800+ Five-star reviews</span><i>✦</i><span>8,000+ Startups served</span><i>✦</i>
          </div>
          <div className="marquee__group">
            <span>20+ Years of craft</span><i>✦</i><span>10 In-house creatives</span><i>✦</i><span>1,800+ Five-star reviews</span><i>✦</i><span>8,000+ Startups served</span><i>✦</i>
          </div>
        </div>
      </div>
    </div>

    {/* ===== People ===== */}
    <section className="people section" id="people">
      <div className="container">
        <div className="section__head section__head--split">
          <div className="section__head-left"><span className="eyebrow reveal">{t("about.people.eyebrow")}</span><h2 className="section__title split-lines"><span>{t("about.people.title")}</span> <span className="hero__accent">{t("about.people.title_accent")}</span></h2></div>
          <p className="section__sub reveal">{t("about.people.sub")}</p>
        </div>
        <div className="people__grid">
          {Array.from({ length: 10 }).map((_, i) => {
            const n = i + 1;
            const name = t(`home.team.m${n}_name`);
            const role = t(`home.team.m${n}_role`);
            const photo = t(`home.team.m${n}_photo`);
            return (
              <figure className="person reveal" key={n}>
                {photo
                  ? <img src={photo} alt={`${name}, ${role} at je.design`} loading="lazy" />
                  : <span className="person__avatar" aria-hidden="true">{(name || "?").charAt(0)}</span>}
                <figcaption><strong>{name}</strong><span>{role}</span></figcaption>
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
