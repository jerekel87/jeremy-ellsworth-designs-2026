const banners = ["/assets/img/revenue/rev-1.jpg", "/assets/img/revenue/rev-5.jpg", "/assets/img/revenue/rev-3.jpg"];

export default function ResultsStrip() {
  return (
    <section className="section section--panel results">
      <div className="container">
        <div className="section__head section__head--split">
          <div className="section__head-left">
            <span className="eyebrow reveal">Real results</span>
            <h2 className="section__title split-lines"><span>Rebrands that</span> <span className="hero__accent">pay for themselves</span></h2>
          </div>
          <p className="section__sub reveal">Revenue increases reported by owners after rebranding with Jeremy Ellsworth Designs LLC.</p>
        </div>
        <div className="results__grid">
          {banners.map((b, i) => (
            <figure key={i} className="results__card reveal">
              <img src={b} alt="Customer revenue increase since rebranding with je.design" loading="lazy" />
            </figure>
          ))}
          <a href="#" data-drawer className="results__cta reveal" data-cursor="hover">
            <span className="results__cta-title">Your brand<br />next?</span>
            <span className="results__cta-link">Get a Quote →</span>
          </a>
        </div>
      </div>
    </section>
  );
}
