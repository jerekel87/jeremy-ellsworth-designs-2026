import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createService, fetchServices } from "@/lib/servicesApi";
import { CmsTopbar, Field, FieldGrid, ImageField } from "@/components/cms/Ui";

function slugify(s) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function ServiceNew() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState({
    title: "",
    slug: "",
    short: "",
    num: "",
    desc: "",
    note: "",
    industries: "",
    img: "",
    bullets: ["", "", "", ""],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (key) => (val) => setDraft((d) => ({ ...d, [key]: val }));
  const setBullet = (i) => (val) =>
    setDraft((d) => ({ ...d, bullets: d.bullets.map((b, idx) => (idx === i ? val : b)) }));

  const canPublish = draft.title.trim() && !saving;

  async function publish() {
    setSaving(true);
    setError(null);
    try {
      const slug = draft.slug.trim() || slugify(draft.title);
      const existing = await fetchServices();
      const nextOrder = existing.reduce((m, s) => Math.max(m, s.sortOrder || 0), 0) + 1;
      const num = draft.num.trim() || String(nextOrder).padStart(2, "0");
      const created = await createService({
        slug,
        title: draft.title.trim(),
        short: draft.short,
        num,
        desc: draft.desc,
        note: draft.note,
        industries: draft.industries,
        img: draft.img || "/assets/img/work/boss-hawgs.jpg",
        bullets: draft.bullets.map((b) => b.trim()).filter(Boolean),
        sortOrder: nextOrder,
      });
      if (created) navigate(`/admin/services/${created.slug}`, { replace: true });
    } catch (e) {
      setError(e.message || "Could not create service.");
      setSaving(false);
    }
  }

  return (
    <>
      <CmsTopbar
        title="New service"
        subtitle={<Link to="/admin/services" className="cmsc-back">← Back to services</Link>}
        action={<span className="cms-chip cms-chip--replied">Draft</span>}
      />
      <div className="cms__content cmsc">
        <section className="cms-panel">
          <header className="cms-panel__head"><h2>Details</h2></header>
          <div className="cmsc-section__body">
            <FieldGrid>
              <Field label="Title" value={draft.title} onChange={set("title")} placeholder="e.g. Sign Design" half />
              <Field label="Slug" value={draft.slug} onChange={set("slug")} placeholder="sign-design" half hint="Public URL: /services/<slug> — leave blank to generate from the title" />
              <Field label="Short label (sticky index)" value={draft.short} onChange={set("short")} placeholder="Signs" half hint="Used in the services page side index" />
              <Field label="Number" value={draft.num} onChange={set("num")} placeholder="07" half hint="Leave blank to auto-number" />
              <Field label="Description" value={draft.desc} onChange={set("desc")} placeholder="Two or three sentences — what it is, how it's made, why it wins work." textarea rows={4} />
              <Field label="Note (italic aside)" value={draft.note} onChange={set("note")} placeholder="A one-line aside in the brand voice — the wink under the description." textarea rows={2} />
              <Field label="Industries line" value={draft.industries} onChange={set("industries")} placeholder="Storefronts · Job sites · Trade shows" hint="Dot-separated, shown under the description" />
              <ImageField label="Cover image" value={draft.img} onChange={set("img")} hint="Listing card + service page hero" />
              {draft.bullets.map((b, i) => (
                <Field key={i} label={`What's included ${i + 1}`} value={b} onChange={setBullet(i)} placeholder="e.g. Concept & design" half />
              ))}
            </FieldGrid>
          </div>
        </section>

        {error ? <p className="cmsc-note" style={{ color: "#c0392b" }}>{error}</p> : null}
        <div className="cmsc-savebar">
          <span>{saving ? "Publishing…" : "Publishing adds this to the public site immediately."}</span>
          <div>
            <Link to="/admin/services" className="cms__btn-ghost">Cancel</Link>
            <button type="button" className="btn btn--sm btn--solid" onClick={publish} disabled={!canPublish}>
              <span>{saving ? "Publishing…" : "Publish service"}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
