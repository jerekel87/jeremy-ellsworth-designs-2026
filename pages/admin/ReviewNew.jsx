import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createReview } from "@/lib/reviewsApi";
import { CmsTopbar, Field, FieldGrid, Select } from "@/components/cms/Ui";

const RATINGS = { "★★★★★ (5)": 5, "★★★★ (4)": 4 };

export default function ReviewNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    company: "",
    source: "Google",
    rating: "★★★★★ (5)",
    review: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));
  const valid = form.name.trim() && form.company.trim() && form.review.trim();

  async function publish() {
    if (!valid) {
      setError("Name, company and the review text are all required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const text = form.review.trim();
      await createReview({
        name: form.name.trim(),
        company: form.company.trim(),
        short: text,
        full: text,
        source: form.source,
        rating: RATINGS[form.rating] ?? 5,
      });
      navigate("/admin/reviews");
    } catch (e) {
      setError(e.message || "Could not save review.");
      setSaving(false);
    }
  }

  return (
    <>
      <CmsTopbar
        title="New review"
        subtitle={<Link to="/admin/reviews" className="cmsc-back">← Back to reviews</Link>}
        action={<span className="cms-chip cms-chip--replied">Draft</span>}
      />
      <div className="cms__content cmsc">
        <section className="cms-panel">
          <header className="cms-panel__head"><h2>Review</h2></header>
          <div className="cmsc-section__body">
            <FieldGrid>
              <Field label="Name" placeholder="e.g. Dale Hutchins" value={form.name} onChange={set("name")} half />
              <Field label="Company" placeholder="e.g. Hutchins Roofing" value={form.company} onChange={set("company")} half />
              <Select label="Source" value={form.source} onChange={set("source")} options={["Google", "Facebook"]} half hint="Only real, verifiable reviews" />
              <Select label="Rating" value={form.rating} onChange={set("rating")} options={["★★★★★ (5)", "★★★★ (4)"]} half />
              <Field label="Review" placeholder="The complete review, word for word as posted. This is shown on the scrolling cards and in full when clicked." value={form.review} onChange={set("review")} textarea rows={5} />
            </FieldGrid>
          </div>
        </section>

        {error ? <p className="cmsc-note" style={{ color: "#c0392b" }}>{error}</p> : null}
        <p className="cmsc-note">House rule: no fabricated testimonials — name, company and wording must match the original post.</p>
        <div className="cmsc-savebar">
          <span>Saved straight to the live reviews.</span>
          <div>
            <Link to="/admin/reviews" className="cms__btn-ghost">Cancel</Link>
            <button type="button" className="btn btn--sm btn--solid" onClick={publish} disabled={saving}>
              <span>{saving ? "Saving…" : "Feature review"}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
