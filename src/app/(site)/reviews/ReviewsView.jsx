"use client";
import ContactSection from "@/components/ContactSection";
import SpinBadge from "@/components/SpinBadge";

export default function ReviewsView({ reviews = [] }) {
  const count = reviews.length;

  return (
    <>
  <main id="top">

    {/* ===== Page hero ===== */}
    <section className="pagehero">
      <div className="container">
        <span className="eyebrow reveal">Client Reviews</span>
        <h1 className="pagehero__title"><span>Real words from real</span> <span className="hero__accent">clients</span></h1>
        <p className="pagehero__sub reveal">Every project ships with a partner who sweats the details. Here's what business owners say after working with the studio.</p>
        <div className="review-proof reveal">
          <span className="review-proof__score">5.0</span>
          <span className="review-proof__stars" aria-hidden="true">★★★★★</span>
          <span className="review-proof__meta">Averaged across {count}+ verified reviews on Google &amp; Facebook.</span>
        </div>
      </div>
      <SpinBadge />
    </section>

    {/* ===== Reviews grid ===== */}
    <section className="section section--padless" id="reviews">
      <div className="container">
        <div className="reviewgrid">
          {reviews.map((r, i) => {
            const name = r.name || "";
            const co = r.company || "";
            const text = r.full || r.short || "";
            return (
              <article key={r.id || name + i} className="review">
                <div className="review__stars">★★★★★ <em>5.0</em></div>
                <p>{`\u201c${text}\u201d`}</p>
                <footer>
                  <span className="review__avatar">{name.charAt(0)}</span>
                  <div><strong>{name}</strong><span>{co}</span></div>
                </footer>
              </article>
            );
          })}
        </div>
      </div>

      <div className="container reviews__foot reveal">
        <div className="reviews__badges">
          <span className="reviews__rating">5.0 Google rating</span>
          <span className="reviews__sep">·</span>
          <span>Featured on</span>
          <a href="https://99designs.com/blog/designers/designer-profile-jeremy-ellsworth-jerekel/" target="_blank" rel="noopener" data-cursor="hover"><img src="/assets/img/99designs.webp" alt="99designs" height="26" /></a>
        </div>
        <a href="#" data-drawer className="btn btn--solid magnetic" data-cursor="hover"><span>Start your project</span><svg className="btn__arrow" width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></a>
      </div>
    </section>

    <ContactSection />
  </main>
    </>
  );
}
