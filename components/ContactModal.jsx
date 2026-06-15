export default function ContactModal() {
  return (
    <>
  {/* ===== Contact drawer ===== */}
  <div className="drawer" id="contactDrawer" aria-hidden="true">
    <div className="drawer__backdrop" id="drawerBackdrop"></div>
    <div className="drawer__zone">
      <aside className="drawer__panel" role="dialog" aria-modal="true" aria-label="Contact form">
        <button className="drawer__close" id="drawerClose" aria-label="Close contact form">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
        </button>
        <span className="drawer__avail"><i></i>Available for work</span>
        <h3 className="drawer__title">Let's <em>talk</em></h3>
        <p className="drawer__desc">Tell us a little about your business — we'll come back within one business day with next steps and honest advice.</p>
        <form className="drawer__form" id="contactForm">
          <label><span>Name</span><input type="text" name="name" required placeholder="Your name" /></label>
          <div className="drawer__row">
            <label><span>Email</span><input type="email" name="email" required placeholder="you@company.com" /></label>
            <label><span>Phone</span><input type="tel" name="phone" placeholder="(555) 555-5555" /></label>
          </div>
          <label><span>Business name</span><input type="text" name="company" placeholder="e.g. Spartan HVAC" /></label>
          <label><span>Budget range</span>
            <select name="budget">
              <option>Not sure yet</option>
              <option>Under $1,000</option>
              <option>$1,000 – $5,000</option>
              <option>$5,000 – $10,000</option>
              <option>$10,000+</option>
            </select>
          </label>
          <label><span>Project details</span><textarea name="message" rows="3" placeholder="What are you building, and when do you want to launch?"></textarea></label>
          <label className="drawer__check"><input type="checkbox" name="terms" required /><span>I have read and agree to the <a href="#" target="_blank">Terms &amp; Conditions</a> and <a href="#" target="_blank">Privacy Policy</a>, and consent to being contacted about my inquiry.</span></label>
          <button className="btn btn--solid" type="submit"><span>Send inquiry</span><svg className="btn__arrow" width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
          <p className="drawer__status drawer__status--ok">Thanks — your inquiry is in. We'll be in touch within one business day.</p>
          <p className="drawer__status drawer__status--err">Something went wrong sending that. Please try again or email us directly.</p>
        </form>
      </aside>
    </div>
  </div>
    </>
  );
}
