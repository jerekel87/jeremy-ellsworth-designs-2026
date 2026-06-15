import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { services } from "@/lib/services";
import { createProject, fetchProjects } from "@/lib/projectsApi";
import { fetchCategories } from "@/lib/categoriesApi";
import { CmsTopbar, Field, FieldGrid, Select, ChipPicker } from "@/components/cms/Ui";
import GalleryEditor from "@/components/cms/GalleryEditor";

const titleToSlug = Object.fromEntries(services.map((s) => [s.title, s.slug]));
const slugToTitle = Object.fromEntries(services.map((s) => [s.slug, s.title]));
const serviceTitles = services.map((s) => s.title);

const categoryOptions = ["Brand Identity", "Brand Identity + Product Design", "Vehicle Wrap", "Website", "Mascot Design", "Print & Collateral"];
const industryOptions = ["Home Service", "Construction", "Food & Beverage", "Recreation", "Retail", "Other"];

function slugify(s) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function ProjectNew() {
  const navigate = useNavigate();
  const [workCats, setWorkCats] = useState([]);
  const [draft, setDraft] = useState({
    title: "",
    slug: "",
    category: categoryOptions[0],
    industry: industryOptions[0],
    cat: "",
    blurb: "",
    deliverables: [],
    services: [],
    testimonial: { quote: "", name: "", company: "" },
    gallery: [],
    layout: [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    fetchCategories()
      .then((rows) => {
        if (!alive) return;
        setWorkCats(rows);
        if (rows.length) setDraft((d) => (d.cat ? d : { ...d, cat: rows[0].key }));
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const set = (key) => (val) => setDraft((d) => ({ ...d, [key]: val }));
  const setTestimonial = (key) => (val) =>
    setDraft((d) => ({ ...d, testimonial: { ...d.testimonial, [key]: val } }));

  const pickedServiceTitles = draft.services.map((s) => slugToTitle[s]).filter(Boolean);
  function toggleService(title) {
    const sl = titleToSlug[title];
    if (!sl) return;
    setDraft((d) => {
      const has = d.services.includes(sl);
      return { ...d, services: has ? d.services.filter((x) => x !== sl) : [...d.services, sl] };
    });
  }

  function setGallery(gallery, layout) {
    setDraft((d) => ({ ...d, gallery, layout }));
  }

  const canPublish = draft.title.trim() && !saving;

  async function publish() {
    setSaving(true);
    setError(null);
    try {
      const slug = (draft.slug.trim() || slugify(draft.title)) || slugify(draft.title);
      const existing = await fetchProjects();
      const nextOrder = existing.reduce((m, p) => Math.max(m, p.sortOrder || 0), 0) + 1;
      const cover = draft.gallery[0] || "/assets/img/work/boss-hawgs.jpg";
      const t = draft.testimonial;
      const created = await createProject({
        slug,
        title: draft.title.trim(),
        category: draft.category,
        industry: draft.industry,
        cat: draft.cat || (workCats[0] && workCats[0].key) || "",
        img: cover,
        blurb: draft.blurb,
        deliverables: draft.deliverables,
        services: draft.services,
        gallery: draft.gallery,
        layout: draft.layout,
        testimonial: t.quote || t.name || t.company ? t : null,
        sortOrder: nextOrder,
      });
      if (created) navigate(`/admin/projects/${created.slug}`, { replace: true });
    } catch (e) {
      setError(e.message || "Could not create project.");
      setSaving(false);
    }
  }

  return (
    <>
      <CmsTopbar
        title="New project"
        subtitle={<Link to="/admin/projects" className="cmsc-back">← Back to projects</Link>}
        action={<span className="cms-chip cms-chip--replied">Draft</span>}
      />
      <div className="cms__content cmsc">
        <section className="cms-panel">
          <header className="cms-panel__head"><h2>Details</h2></header>
          <div className="cmsc-section__body">
            <FieldGrid>
              <Field label="Title" value={draft.title} onChange={set("title")} placeholder="e.g. Hutchins Roofing" half />
              <Field label="Slug" value={draft.slug} onChange={set("slug")} placeholder="hutchins-roofing" half hint="Public URL: /work/<slug> — leave blank to generate from the title" />
              <Select label="Category" value={draft.category} onChange={set("category")} options={categoryOptions} half />
              <Select label="Industry" value={draft.industry} onChange={set("industry")} options={industryOptions} half />
              <Select
                label="Work filter category"
                value={draft.cat}
                onChange={set("cat")}
                options={workCats.map((c) => ({ value: c.key, label: c.label }))}
                half
                hint="Which tab this shows under on the public Work page. Manage tabs in Categories."
              />
              <Field label="Blurb" value={draft.blurb} onChange={set("blurb")} placeholder="One or two sentences for the case page hero — what was built and why it works." textarea rows={3} />
              <Field label="Deliverables" value={draft.deliverables.join(", ")} onChange={(val) => set("deliverables")(val.split(",").map((x) => x.trim()).filter(Boolean))} placeholder="Logo design, Five-page style guide, Business cards…" hint="Comma-separated — shown in The Solution panel" />
              <ChipPicker label="Services (links to service pages)" options={serviceTitles} picked={pickedServiceTitles} onToggle={toggleService} hint="Each picked service renders as a numbered link on the case page" />
            </FieldGrid>
          </div>
        </section>

        <section className="cms-panel">
          <header className="cms-panel__head"><h2>Testimonial</h2></header>
          <div className="cmsc-section__body">
            <FieldGrid>
              <Field label="Quote" value={draft.testimonial.quote} onChange={setTestimonial("quote")} placeholder="What the client said — real reviews only, with real attribution." textarea rows={2} />
              <Field label="Name" value={draft.testimonial.name} onChange={setTestimonial("name")} placeholder="e.g. Dale H." half />
              <Field label="Company" value={draft.testimonial.company} onChange={setTestimonial("company")} placeholder="e.g. Hutchins Roofing" half />
            </FieldGrid>
            <p className="cmsc-note">Optional — leave blank and no testimonial billboard shows on the case page.</p>
          </div>
        </section>

        <section className="cms-panel">
          <header className="cms-panel__head">
            <h2>Gallery</h2>
            <span className="cms-panel__meta">First image becomes the cover and case-page lead</span>
          </header>
          <div className="cmsc-section__body">
            <GalleryEditor gallery={draft.gallery} layout={draft.layout} onChange={setGallery} />
          </div>
        </section>

        {error ? <p className="cmsc-note" style={{ color: "#c0392b" }}>{error}</p> : null}
        <div className="cmsc-savebar">
          <span>{saving ? "Publishing…" : "Publishing adds this to the public site immediately."}</span>
          <div>
            <Link to="/admin/projects" className="cms__btn-ghost">Cancel</Link>
            <button type="button" className="btn btn--sm btn--solid" onClick={publish} disabled={!canPublish}>
              <span>{saving ? "Publishing…" : "Publish project"}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
