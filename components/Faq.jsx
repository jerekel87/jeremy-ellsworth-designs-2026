import { useEffect, useState } from "react";
import { fetchFaqs } from "@/lib/faqsApi";

const FALLBACK = [
  { id: "f1", question: "How does payment work?", answer: "We currently offer the following payment options, ensuring a smooth transaction with je.design: Square Invoicing, Afterpay, Cashapp, Venmo, PayPal Invoicing, and crypto such as Bitcoin, Litecoin, Solana and XRP. If there is a payment option you do not see and you'd like to inquire about it, you may reach out to us at inquiry@jeremynellsworth.com." },
  { id: "f2", question: "Which files will I receive?", answer: "You'll receive the final design in the following formats: AI, JPG, PNG, SVG, and PDF. For crisp, high-quality printing, we recommend AI, SVG, or PDF files, while JPG and PNG are best for displaying your logo online." },
  { id: "f3", question: "How long does it take to complete a project?", answer: "On average, it takes 2–3 weeks." },
  { id: "f4", question: "How many revisions do I get?", answer: "This depends on what type of package you're going to get, but it's typically 5 to 7 revisions." },
  { id: "f5", question: "What if I don't like the design?", answer: "Our goal is to ensure you feel confident about your brand's direction from the very first step. We begin every project with a thorough discovery phase, clarifying your vision, objectives, and preferences so we can present a concept that aligns with your goals. If you are not happy and want to pivot or request a different direction, we allow for one concept change early in the process to keep our timeline on track. That way, if something isn't sitting right, we can address it promptly before moving forward with refinements. By staying in close communication throughout, we strive to deliver a final design that meets — and exceeds — your expectations." },
  { id: "f6", question: "How soon before I see the first draft?", answer: "You can typically expect your initial design within 5 to 7 business days after payment is received. This timeframe allows us to conduct thorough research, explore creative options, and present a well-thought-out concept. In certain cases, we can expedite delivery if your project requires a quicker turnaround." },
  { id: "f7", question: "Are your designs 100% original?", answer: "Absolutely. Every concept we create starts with blank pages and fresh ideas — no templates, no recycled elements. We take pride in doing all of our work in-house at je.design, conducting thorough research and brainstorming to ensure each logo is truly unique." },
];

export default function Faq() {
  const [faqs, setFaqs] = useState(FALLBACK);

  useEffect(() => {
    let active = true;
    fetchFaqs("site")
      .then((rows) => { if (active && rows.length) setFaqs(rows); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  return (
    <>
    {/* ===== FAQ ===== */}
    <section className="faq section" id="faq">
      <div className="container faq__layout">
        <div className="faq__head">
          <span className="eyebrow reveal">Answers</span>
          <h2 className="section__title split-lines"><span>FAQ</span></h2>
          <p className="section__sub reveal">Everything you need to know before we start building your brand.</p>
          <a href="#" data-drawer className="btn btn--ghost magnetic reveal" data-cursor="hover"><span>Still curious? Ask us</span></a>
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
    </>
  );
}
