import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ContactSection from "@/components/ContactSection";
import { projects } from "@/lib/projects";
import { fetchFaqs } from "@/lib/faqsApi";
import { useContentMap } from "@/lib/contentApi";
import { BRAND_ACCESS_DEFAULTS } from "@/lib/brandAccessContent";

const STEP_ICONS = [
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v10M15 9.5c-.6-1-1.7-1.5-3-1.5-1.7 0-3 .9-3 2.25S10.3 12 12 12s3 .9 3 2.25-1.3 2.25-3 2.25c-1.3 0-2.4-.5-3-1.5" /></svg>,
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3v18l15-9L5 3Z" /></svg>,
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 7.7-1.5" /></svg>,
];

const FALLBACK_FAQS = [
  { id: "b1", question: "Is this a subscription?", answer: "No. It's a fixed payment plan — $150 down, then $150/month until your project balance is paid off. Once it's paid, you're done. No recurring fees, no renewals." },
  { id: "b2", question: "Do I get my files right away?", answer: "Yes — full file access from day one. We never hold your assets hostage while you're paying. Every client, no exceptions." },
  { id: "b3", question: "How fast do we start?", answer: "Immediately. The moment you activate for $150, your project goes into production — no waiting weeks for deposits to clear or approval rounds to schedule." },
  { id: "b4", question: "What if I already have a logo?", answer: "Perfect — the program covers rebrands and refreshes too. We'll take what's working, fix what isn't, and deliver a brand system you can actually grow with." },
  { id: "b5", question: "Is this only for new businesses?", answer: "Not at all. We work with new launches and established companies that have outgrown their DIY branding alike." },
  { id: "b6", question: "What types of businesses do you work with?", answer: "Service-based businesses — trades, contractors and companies that build things: roofing, HVAC, plumbing, electrical, landscaping and beyond." },
  { id: "b7", question: "How do revisions work?", answer: "They're included. We work through revision rounds collaboratively until you love it — no per-round fees, no scope creep." },
  { id: "b8", question: "How do I get an instant quote?", answer: "Click any \"Get Instant Quote\" button on this page — it takes about 60 seconds and there's no obligation." },
];

export default function BrandAccessPage() {
  const [faqs, setFaqs] = useState(FALLBACK_FAQS);
  const content = useContentMap();
  const v = (k) => (content[k] != null ? content[k] : (BRAND_ACCESS_DEFAULTS[k] ?? ""));
  const isCustom = (k) => content[k] != null && content[k] !== BRAND_ACCESS_DEFAULTS[k];

  useEffect(() => {
    let active = true;
    fetchFaqs("bap")
      .then((rows) => { if (active && rows.length) setFaqs(rows); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const quoteUrl = v("ba.hero.quote_url");
  const passDown = v("ba.pass.down").replace(/^\$/, "");
  const showcase = v("ba.show.projects").split(",").map((s) => s.trim()).filter(Boolean);
  const industriesList = v("ba.industries").split(",").map((s) => s.trim()).filter(Boolean);

  const industryGroup = (hidden) => (
    <div className="marquee__group" aria-hidden={hidden || undefined}>
      {industriesList.map((name, i) => (
        <Fragment key={`${hidden ? "h" : ""}${name}${i}`}>
          <span>{name}</span>
          <i>✦</i>
        </Fragment>
      ))}
    </div>
  );

  return (
    <main id="top">
      {/* ===== Hero: headline + access pass ticket ===== */}
      <section className="pagehero bap-hero">
        <div className="container bap-hero__grid">
          <div>
            <span className="eyebrow reveal">{v("ba.hero.eyebrow")}</span>
            {isCustom("ba.hero.headline")
              ? <h1 className="pagehero__title split-lines"><span>{v("ba.hero.headline")}</span></h1>
              : <h1 className="pagehero__title split-lines"><span>Get branded now,</span> <span className="hero__accent">pay as you grow</span></h1>}
            <p className="pagehero__sub reveal">{v("ba.hero.sub")}</p>
            <div className="bap__heroCta reveal">
              <a href={quoteUrl} target="_blank" rel="noopener" className="btn btn--solid magnetic" data-cursor="hover">
                <span>Get Instant Quote</span>
                <svg className="btn__arrow" width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
              <a href="#included" className="btn btn--ghost magnetic" data-cursor="hover"><span>See what's included</span></a>
            </div>
            <p className="bap-hero__proof reveal">{v("ba.hero.proof")}</p>
          </div>

          <div className="bap-ticket reveal" id="bapTicket">
            <div className="bap-ticket__keep">
              <div className="bap-ticket__top">
                <img src="/assets/img/logo-white.webp" alt="" width="30" height="29" />
                <span>Brand Access Pass</span>
                <em>{v("ba.pass.number")}</em>
              </div>
              <div className="bap-ticket__price"><sup>$</sup>{passDown}<span>down today</span></div>
              <div className="bap-ticket__tear" id="bapTear" aria-hidden="true">
                <i className="bap-ticket__cutline"></i>
                <i className="bap-ticket__cutline bap-ticket__cutline--r"></i>
              </div>
            </div>
            <div className="bap-ticket__stub" id="bapStub">
              <div className="bap-ticket__rows">
                <div><em>Then</em><strong>{v("ba.pass.then")}</strong></div>
                <div><em>Files</em><strong>{v("ba.pass.files")}</strong></div>
                <div><em>Starts</em><strong>{v("ba.pass.starts")}</strong></div>
              </div>
              <div className="bap-ticket__barcode" aria-hidden="true">
                {Array.from({ length: 32 }).map((_, i) => <i key={i} />)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== The problem ===== */}
      <section className="section section--panel bap-problem">
        <div className="container bap-problem__grid">
          <div className="bap-invoices" aria-hidden="true">
            <div className="bap-invoice bap-invoice--back reveal">
              <header><span>BRANDING QUOTE</span><em>#0042</em></header>
              <div className="bap-invoice__row"><span>Logo &amp; brand identity</span><strong>$5,200</strong></div>
              <div className="bap-invoice__row"><span>Brand guidelines</span><strong>$2,300</strong></div>
              <div className="bap-invoice__total"><span>DUE BEFORE WORK</span><strong>$7,500</strong></div>
            </div>
            <div className="bap-invoice reveal">
              <header><span>BRANDING QUOTE</span><em>#0117</em></header>
              <div className="bap-invoice__row"><span>Full brand identity</span><strong>$6,400</strong></div>
              <div className="bap-invoice__row"><span>Vehicle wrap design</span><strong>$2,200</strong></div>
              <div className="bap-invoice__row"><span>Collateral design</span><strong>$1,200</strong></div>
              <div className="bap-invoice__total"><span>DUE UPFRONT</span><strong>$9,800</strong></div>
              <span className="bap-invoice__stamp">DUE IN FULL — BEFORE WORK STARTS</span>
            </div>
          </div>
          <div className="bap-problem__copy">
            <span className="eyebrow reveal">The problem</span>
            {isCustom("ba.problem.headline")
              ? <h2 className="section__title split-lines"><span>{v("ba.problem.headline")}</span></h2>
              : <h2 className="section__title split-lines"><span>Real branding</span> <span className="hero__accent">costs real money</span></h2>}
            <p className="bap-problem__sub reveal">{v("ba.problem.sub")}</p>
            <ul className="bap-problem__list reveal">
              <li><i>✕</i>{v("ba.problem.p1")}</li>
              <li><i>✕</i>{v("ba.problem.p2")}</li>
              <li><i>✕</i>{v("ba.problem.p3")}</li>
            </ul>
            <p className="svc-card__note reveal">{v("ba.problem.quote")}</p>
          </div>
        </div>
      </section>

      {/* ===== How it works: staircase ===== */}
      <section className="section bap-how">
        <div className="container">
          <div className="section__head section__head--split">
            <div className="section__head-left">
              <span className="eyebrow reveal">How it works</span>
              <h2 className="section__title split-lines"><span>Three steps.</span> <span className="hero__accent">No risk.</span></h2>
            </div>
            <p className="section__sub reveal">Simple, predictable and built for businesses that need to keep moving.</p>
          </div>
          <div className="bap-stairs">
            <svg className="bap-stairs__path" viewBox="0 0 1200 420" preserveAspectRatio="none" aria-hidden="true">
              <path d="M120 90 C 350 90, 380 210, 600 210 S 880 330, 1080 330" fill="none" stroke="rgba(255,246,0,0.35)" strokeWidth="2" strokeDasharray="7 9" />
            </svg>
            {[1, 2, 3].map((i) => (
              <div className={`bap-stair bap-stair--${i} reveal`} key={i}>
                <span className="bap-stair__num" aria-hidden="true">{i}</span>
                <div className="bap-stair__card" data-tilt>
                  <span className="bap-step__icon">{STEP_ICONS[i - 1]}</span>
                  <h3>{v(`ba.step${i}_title`)}</h3>
                  <p>{v(`ba.step${i}_text`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Compare: center ledger ===== */}
      <section className="section section--panel">
        <div className="container">
          <div className="section__head section__head--split">
            <div className="section__head-left">
              <span className="eyebrow reveal">Compare</span>
              {isCustom("ba.compare.headline")
                ? <h2 className="section__title split-lines"><span>{v("ba.compare.headline")}</span></h2>
                : <h2 className="section__title split-lines"><span>Start now,</span> <span className="hero__accent">not someday</span></h2>}
            </div>
          </div>
          <div className="vsl">
            <div className="vsl__head reveal">
              <span className="vsl__crown">{v("ba.compare.left")}</span>
              <span className="vsl__mid">Feature</span>
              <span className="vsl__old">{v("ba.compare.right")}</span>
            </div>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div className="vsl__row reveal" key={i}>
                <div className="vsl__us"><i>✓</i>{v(`ba.compare.r${i}_us`)}</div>
                <span className="vsl__label">{v(`ba.compare.r${i}_label`)}</span>
                <div className="vsl__them"><i>✕</i>{v(`ba.compare.r${i}_them`)}</div>
              </div>
            ))}
            <div className="vsl__foot reveal">
              <a href={quoteUrl} target="_blank" rel="noopener" className="btn btn--solid magnetic" data-cursor="hover"><span>Get Instant Quote</span></a>
              <p>{v("ba.compare.foot")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== What you get: orbit + accordion ===== */}
      <section className="section" id="included">
        <div className="container bap-files__grid">
          <div className="bap-orbit reveal" aria-hidden="true">
            <span className="bap-orbit__ring bap-orbit__ring--1"></span>
            <span className="bap-orbit__ring bap-orbit__ring--2"></span>
            <span className="bap-orbit__ring bap-orbit__ring--3"></span>
            <div className="bap-orbit__stack">
              <div className="bap-file bap-file--1"><em>.AI</em><span>vector source</span></div>
              <div className="bap-file bap-file--2"><em>.SVG</em><span>web-ready</span></div>
              <div className="bap-file bap-file--3"><em>.PDF</em><span>print-crisp</span></div>
              <div className="bap-file bap-file--4"><em>.PNG</em><span>everywhere else</span></div>
              <div className="bap-file bap-file--5"><em>.EPS</em><span>vendor-proof</span></div>
            </div>
          </div>
          <div>
            <span className="eyebrow reveal">What you get</span>
            {isCustom("ba.get.headline")
              ? <h2 className="section__title split-lines"><span>{v("ba.get.headline")}</span></h2>
              : <h2 className="section__title split-lines"><span>Everything you need</span> <span className="hero__accent">to look professional</span></h2>}
            <p className="section__sub reveal" style={{ marginTop: "18px", maxWidth: "52ch" }}>{v("ba.get.sub")}</p>
            <div className="bap-acc">
              {[1, 2, 3, 4, 5].map((i) => (
                <details className="bap-acc__item reveal" key={i}>
                  <summary data-cursor="hover"><em>{String(i).padStart(2, "0")}</em>{v(`ba.get.i${i}_title`)}<span className="faq__icon"></span></summary>
                  <div className="bap-acc__body"><p>{v(`ba.get.i${i}_text`)}</p></div>
                </details>
              ))}
            </div>
            <p className="bap__fineprint reveal">{v("ba.get.fineprint")}</p>
          </div>
        </div>
      </section>

      {/* ===== Testimonial ===== */}
      <section className="section section--padless">
        <div className="container">
          <blockquote className="cg-quote reveal">
            <span className="cg-quote__mark" aria-hidden="true">“</span>
            <div className="cg-quote__stars" aria-label="5.0 star review">★★★★★</div>
            <p>{v("ba.testi.quote")}</p>
            <footer>
              <strong>{v("ba.testi.name")}</strong>
              <span>{v("ba.testi.attr")}</span>
            </footer>
          </blockquote>
        </div>
      </section>

      {/* ===== Showcase: owners who used the program ===== */}
      <section className="section bap-showcase">
        <div className="container">
          <div className="section__head section__head--split">
            <div className="section__head-left">
              <span className="eyebrow reveal">The proof</span>
              {isCustom("ba.show.headline")
                ? <h2 className="section__title split-lines"><span>{v("ba.show.headline")}</span></h2>
                : <h2 className="section__title split-lines"><span>Owners who</span> <span className="hero__accent">started here</span></h2>}
            </div>
            <p className="section__sub reveal">{v("ba.show.sub")}</p>
          </div>
        </div>
        <div className="container work__grid">
          {showcase.map(function (slug, i) {
            var p = projects.find(function (x) { return x.slug === slug; });
            if (!p) return null;
            return (
              <Link key={p.slug} to={"/work/" + p.slug} className={"work-card" + (i === 0 || i === 4 ? " work-card--lg" : "")} data-cursor="view">
                <div className="work-card__media"><img src={p.img} alt={p.title + " brand identity"} loading="lazy" /></div>
                <div className="work-card__meta"><h3>{p.title}</h3><span>{p.category} · {p.industry}</span></div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ===== Results + industry tape ===== */}
      <section className="section bap-results">
        <div className="container">
          <div className="section__head section__head--split">
            <div className="section__head-left">
              <span className="eyebrow reveal">Results</span>
              <h2 className="section__title split-lines"><span>Built for businesses</span> <span className="hero__accent">that build things</span></h2>
            </div>
            <p className="section__sub reveal">We work exclusively with service businesses — trades, contractors and companies that need branding that works as hard as they do.</p>
          </div>
          <div className="about__stats" style={{ marginTop: 0 }}>
            {[1, 2, 3, 4].map((i) => (
              <div className="about-stat reveal" key={i}><strong>{v(`ba.stats.s${i}_value`)}</strong><span>{v(`ba.stats.s${i}_label`)}</span></div>
            ))}
          </div>
        </div>
        <div className="tape" aria-label="Industries we serve" style={{ marginTop: "clamp(48px, 7vw, 80px)" }}>
          <div className="marquee marquee--yellow">
            <div className="marquee__track">
              {industryGroup(false)}
              {industryGroup(true)}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="faq section section--panel" id="faq">
        <div className="container faq__layout">
          <div className="faq__head">
            <span className="eyebrow reveal">Answers</span>
            <h2 className="section__title split-lines"><span>FAQ</span></h2>
            <p className="section__sub reveal">Common questions, straight answers.</p>
            <a href={quoteUrl} target="_blank" rel="noopener" className="btn btn--ghost magnetic reveal" data-cursor="hover"><span>Get Instant Quote</span></a>
          </div>
          <div className="faq__list">
            {faqs.map((f) => (
              <details className="faq__item" key={f.id}>
                <summary data-cursor="hover">{f.question}<span className="faq__icon"></span></summary>
                <div className="faq__body"><p>{f.answer}</p></div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <ContactSection />
    </main>
  );
}
