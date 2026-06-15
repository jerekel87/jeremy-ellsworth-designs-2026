import { usePageText } from "@/lib/pageContent";

export default function ContactSection() {
  const t = usePageText();
  return (
    <>
    {/* ===== Contact / CTA ===== */}
    <section className="contact" id="contact">
      <div className="contact__marquee" aria-hidden="true">
        <div className="marquee__track marquee__track--slow">
          <div className="marquee__group"><span>{t("home.contact.marquee")}</span><i>✦</i><span>{t("home.contact.marquee")}</span><i>✦</i></div>
          <div className="marquee__group"><span>{t("home.contact.marquee")}</span><i>✦</i><span>{t("home.contact.marquee")}</span><i>✦</i></div>
        </div>
      </div>
      <div className="container contact__inner">
        <a href="mailto:inquiry@jeremynellsworth.com?subject=Project%20inquiry%20—%20je.design" className="contact__big magnetic" data-cursor="hover">
          <span className="contact__big-text">{t.isCustom("home.contact.bigline") ? t("home.contact.bigline") : <>Let's <em>talk</em></>}</span>
          <span className="contact__big-arrow">→</span>
        </a>
        <div className="contact__meta">
          <a href={`mailto:${t("home.contact.email")}`} data-cursor="hover">{t("home.contact.email")}</a>
          <p>{t("home.contact.para")}</p>
        </div>
      </div>
    </section>
    </>
  );
}
