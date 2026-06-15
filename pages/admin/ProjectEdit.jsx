import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { fetchProject, updateProject, deleteProject } from "@/lib/projectsApi";
import { fetchCategories } from "@/lib/categoriesApi";
import { services } from "@/lib/services";
import { CmsTopbar, Field, FieldGrid, EditSection, ChipPicker, Select } from "@/components/cms/Ui";
import GalleryEditor from "@/components/cms/GalleryEditor";
import NotFound from "@/pages/NotFound";

const serviceTitles = services.map((s) => s.title);
const titleToSlug = Object.fromEntries(services.map((s) => [s.title, s.slug]));
const slugToTitle = Object.fromEntries(services.map((s) => [s.slug, s.title]));

function cleanTestimonial(t) {
  if (!t) return null;
  const quote = (t.quote || "").trim();
  const name = (t.name || "").trim();
  const company = (t.company || "").trim();
  return quote || name || company ? { quote, name, company } : null;
}

export default function ProjectEdit() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [draft, setDraft] = useState(null);
  const [workCats, setWorkCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    fetchProject(slug)
      .then((row) => {
        if (!active) return;
        if (!row) { setNotFound(true); return; }
        setProject(row);
        setDraft(row);
      })
      .catch((e) => { if (active) setError(e.message || "Could not load project."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  useEffect(() => {
    let active = true;
    fetchCategories().then((rows) => { if (active) setWorkCats(rows); }).catch(() => {});
    return () => { active = false; };
  }, []);

  if (notFound) return <NotFound />;
  if (loading || !draft) {
    return (
      <>
        <CmsTopbar title="Project" subtitle={<Link to="/admin/projects" className="cmsc-back">← Back to projects</Link>} />
        <div className="cms__content cmsc">
          <p className="cmsc-note">{error || "Loading project…"}</p>
        </div>
      </>
    );
  }

  const set = (key) => (val) => setDraft((d) => ({ ...d, [key]: val }));
  const setTestimonial = (key) => (val) =>
    setDraft((d) => ({ ...d, testimonial: { ...(d.testimonial || {}), [key]: val } }));

  const dirty = JSON.stringify(draft) !== JSON.stringify(project);
  const pickedServiceTitles = (draft.services || []).map((s) => slugToTitle[s]).filter(Boolean);

  const catOptions = workCats.map((c) => ({ value: c.key, label: c.label }));
  if (draft.cat && !workCats.some((c) => c.key === draft.cat)) {
    catOptions.push({ value: draft.cat, label: `${draft.cat} (removed)` });
  }

  function toggleService(title) {
    const sl = titleToSlug[title];
    if (!sl) return;
    setDraft((d) => {
      const has = (d.services || []).includes(sl);
      return { ...d, services: has ? d.services.filter((x) => x !== sl) : [...(d.services || []), sl] };
    });
  }

  function setGallery(gallery, layout) {
    setDraft((d) => ({ ...d, gallery, layout }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateProject(project.id, {
        title: draft.title,
        slug: draft.slug,
        category: draft.category,
        industry: draft.industry,
        cat: draft.cat,
        blurb: draft.blurb,
        deliverables: draft.deliverables,
        services: draft.services,
        gallery: draft.gallery,
        layout: draft.layout,
        img: draft.gallery[0] || draft.img,
        testimonial: cleanTestimonial(draft.testimonial),
      });
      if (updated) {
        setProject(updated);
        setDraft(updated);
        if (updated.slug !== slug) navigate(`/admin/projects/${updated.slug}`, { replace: true });
      }
    } catch (e) {
      setError(e.message || "Could not save project.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Delete “${project.title}”? This removes it from the public site.`)) return;
    setRemoving(true);
    setError(null);
    try {
      await deleteProject(project.id);
      navigate("/admin/projects");
    } catch (e) {
      setError(e.message || "Could not delete project.");
      setRemoving(false);
    }
  }

  return (
    <>
      <CmsTopbar
        title={draft.title}
        subtitle={<Link to="/admin/projects" className="cmsc-back">← Back to projects</Link>}
        action={
          <>
            <a href={`/work/${project.slug}`} target="_blank" rel="noopener" className="cms__btn-ghost">View page ↗</a>
            <span className="cms-chip cms-chip--live">Published</span>
          </>
        }
      />
      <div className="cms__content cmsc">
        <section className="cms-panel">
          <div className="cmsc-sections">
            <EditSection title="Details" count="6 fields" open>
              <FieldGrid>
                <Field label="Title" value={draft.title} onChange={set("title")} half />
                <Field label="Slug" value={draft.slug} onChange={set("slug")} half hint={`Public URL: /work/${draft.slug}`} />
                <Field label="Category" value={draft.category} onChange={set("category")} half />
                <Field label="Industry" value={draft.industry} onChange={set("industry")} half />
                <Select
                  label="Work filter category"
                  value={draft.cat}
                  onChange={set("cat")}
                  options={catOptions}
                  half
                  hint="Which tab this shows under on the public Work page. Manage tabs in Categories."
                />
                <Field label="Blurb (case hero)" value={draft.blurb} onChange={set("blurb")} textarea rows={3} hint="Shown under the title on the case page hero" />
              </FieldGrid>
            </EditSection>

            <EditSection title="The Solution panel" count={`${draft.deliverables.length + draft.services.length} items`}>
              <FieldGrid>
                <Field
                  label="Deliverables"
                  value={draft.deliverables.join(", ")}
                  onChange={(val) => set("deliverables")(val.split(",").map((x) => x.trim()).filter(Boolean))}
                  hint="Comma-separated — the numbered spec list"
                />
                <ChipPicker
                  label="Services (numbered links to service pages)"
                  options={serviceTitles}
                  picked={pickedServiceTitles}
                  onToggle={toggleService}
                />
              </FieldGrid>
              <p className="cmsc-note">The “Project Approved · Delivered” stamp and JE mark render automatically next to this panel.</p>
            </EditSection>

            <EditSection title="Gallery" count={`${draft.gallery.length} image${draft.gallery.length === 1 ? "" : "s"}`}>
              <GalleryEditor gallery={draft.gallery} layout={draft.layout} onChange={setGallery} />
            </EditSection>

            <EditSection title="Testimonial billboard" count="3 fields">
              <FieldGrid>
                <Field label="Quote" value={draft.testimonial?.quote || ""} onChange={setTestimonial("quote")} textarea rows={2} />
                <Field label="Name" value={draft.testimonial?.name || ""} onChange={setTestimonial("name")} half />
                <Field label="Company" value={draft.testimonial?.company || ""} onChange={setTestimonial("company")} half />
              </FieldGrid>
              <p className="cmsc-note">Optional — leave all three blank and the billboard won't appear on the case page.</p>
            </EditSection>
          </div>
        </section>

        {error ? <p className="cmsc-note" style={{ color: "#c0392b" }}>{error}</p> : null}
        <div className="cmsc-savebar">
          <span>{dirty ? "Unsaved changes" : "All changes saved"}</span>
          <div>
            <button type="button" className="cms__btn-ghost cmsm__danger" onClick={remove} disabled={removing}>
              {removing ? "Deleting…" : "Delete project"}
            </button>
            <button type="button" className="btn btn--sm btn--solid" onClick={save} disabled={!dirty || saving}>
              <span>{saving ? "Saving…" : "Save changes"}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
