import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchReviews, updateReview, deleteReview } from "@/lib/reviewsApi";
import { CmsTopbar, Field, FieldGrid } from "@/components/cms/Ui";

function ReviewRow({ review, onSaved, onDeleted }) {
  const [draft, setDraft] = useState(review);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState(null);

  const set = (key) => (val) => setDraft((d) => ({ ...d, [key]: val }));
  const dirty =
    draft.name !== review.name ||
    draft.company !== review.company ||
    draft.full !== review.full;

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const text = draft.full;
      const updated = await updateReview(review.id, {
        name: draft.name,
        company: draft.company,
        short: text,
        full: text,
      });
      if (updated) onSaved(updated);
    } catch (e) {
      setError(e.message || "Could not save review.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setRemoving(true);
    setError(null);
    try {
      await deleteReview(review.id);
      onDeleted(review.id);
    } catch (e) {
      setError(e.message || "Could not delete review.");
      setRemoving(false);
    }
  }

  return (
    <details className="cmsc-item">
      <summary>
        <span className="cmsc-item__avatar">{(draft.name || "?")[0]}</span>
        <span className="cmsc-item__title">
          <strong>{draft.name} <em className="cmsc-stars">★★★★★</em></strong>
          <span>{draft.company} — “{(draft.full || "").slice(0, 80)}…”</span>
        </span>
        <span className="cms-chip cms-chip--live">Featured</span>
        <span className="faq__icon"></span>
      </summary>
      <div className="cmsc-section__body">
        <FieldGrid>
          <Field label="Name" value={draft.name} onChange={set("name")} half />
          <Field label="Company" value={draft.company} onChange={set("company")} half />
          <Field label="Review" value={draft.full} onChange={set("full")} textarea rows={5} hint="Shown on the scrolling cards and in full when clicked" />
        </FieldGrid>
        {error ? <p className="cmsc-note" style={{ color: "#c0392b" }}>{error}</p> : null}
        <div className="cmsc-savebar">
          <span>{dirty ? "Unsaved changes" : "Saved"}</span>
          <div>
            <button type="button" className="cms__btn-ghost cmsm__danger" onClick={remove} disabled={removing}>
              {removing ? "Removing…" : "Delete"}
            </button>
            <button type="button" className="btn btn--sm btn--solid" onClick={save} disabled={!dirty || saving}>
              <span>{saving ? "Saving…" : "Save changes"}</span>
            </button>
          </div>
        </div>
      </div>
    </details>
  );
}

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    fetchReviews()
      .then((rows) => { if (active) setReviews(rows); })
      .catch((e) => { if (active) setError(e.message || "Could not load reviews."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <>
      <CmsTopbar
        title="Reviews"
        subtitle={`${reviews.length} featured of 1,800+ collected — home marquee, service pages and lightbox.`}
        action={<Link to="/admin/reviews/new" className="btn btn--sm btn--solid"><span>+ Add review</span></Link>}
      />
      <div className="cms__content cmsc">
        <section className="cms-panel">
          {loading ? <p className="cmsc-note">Loading reviews…</p> : null}
          {error ? <p className="cmsc-note" style={{ color: "#c0392b" }}>{error}</p> : null}
          {!loading && !error && reviews.length === 0 ? <p className="cmsc-note">No reviews yet.</p> : null}
          {reviews.map((r) => (
            <ReviewRow
              key={r.id}
              review={r}
              onSaved={(updated) => setReviews((list) => list.map((x) => (x.id === updated.id ? updated : x)))}
              onDeleted={(id) => setReviews((list) => list.filter((x) => x.id !== id))}
            />
          ))}
        </section>
        <p className="cmsc-note">Only real reviews with real attribution — sourced from Google &amp; Facebook. The aggregate badge (5.0 · 700+ reviews) is configured in <Link to="/admin/settings">Settings</Link>.</p>
      </div>
    </>
  );
}
