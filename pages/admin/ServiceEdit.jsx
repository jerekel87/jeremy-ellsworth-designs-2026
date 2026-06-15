import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { fetchService, updateService, deleteService } from "@/lib/servicesApi";
import { fetchProjects } from "@/lib/projectsApi";
import { CmsTopbar, Field, FieldGrid, EditSection, ImageField } from "@/components/cms/Ui";
import NotFound from "@/pages/NotFound";

export default function ServiceEdit() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [draft, setDraft] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    fetchService(slug)
      .then((row) => {
        if (!active) return;
        if (!row) { setNotFound(true); return; }
        setService(row);
        setDraft(row);
        fetchProjects()
          .then((ps) => { if (active) setRelated(ps.filter((p) => (p.services || []).includes(row.slug))); })
          .catch(() => {});
      })
      .catch((e) => { if (active) setError(e.message || "Could not load service."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  if (notFound) return <NotFound />;
  if (loading || !draft) {
    return (
      <>
        <CmsTopbar title="Service" subtitle={<Link to="/admin/services" className="cmsc-back">← Back to services</Link>} />
        <div className="cms__content cmsc">
          <p className="cmsc-note">{error || "Loading service…"}</p>
        </div>
      </>
    );
  }

  const set = (key) => (val) => setDraft((d) => ({ ...d, [key]: val }));
  const setBullet = (i) => (val) =>
    setDraft((d) => ({ ...d, bullets: d.bullets.map((b, idx) => (idx === i ? val : b)) }));
  const addBullet = () => setDraft((d) => ({ ...d, bullets: [...d.bullets, ""] }));
  const removeBullet = (i) => setDraft((d) => ({ ...d, bullets: d.bullets.filter((_, idx) => idx !== i) }));

  const dirty = JSON.stringify(draft) !== JSON.stringify(service);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateService(service.id, {
        title: draft.title,
        slug: draft.slug,
        short: draft.short,
        num: draft.num,
        desc: draft.desc,
        note: draft.note,
        industries: draft.industries,
        bullets: draft.bullets.map((b) => b.trim()).filter(Boolean),
        img: draft.img,
      });
      if (updated) {
        setService(updated);
        setDraft(updated);
        if (updated.slug !== slug) navigate(`/admin/services/${updated.slug}`, { replace: true });
      }
    } catch (e) {
      setError(e.message || "Could not save service.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Delete “${service.title}”? This removes it from the public site.`)) return;
    setRemoving(true);
    setError(null);
    try {
      await deleteService(service.id);
      navigate("/admin/services");
    } catch (e) {
      setError(e.message || "Could not delete service.");
      setRemoving(false);
    }
  }

  return (
    <>
      <CmsTopbar
        title={draft.title}
        subtitle={<Link to="/admin/services" className="cmsc-back">← Back to services</Link>}
        action={
          <>
            <a href={`/services/${service.slug}`} target="_blank" rel="noopener" className="cms__btn-ghost">View page ↗</a>
            <span className="cms-chip cms-chip--live">Published</span>
          </>
        }
      />
      <div className="cms__content cmsc">
        <section className="cms-panel">
          <div className="cmsc-sections">
            <EditSection title="Listing card (services page)" count="6 fields" open>
              <FieldGrid>
                <Field label="Title" value={draft.title} onChange={set("title")} half />
                <Field label="Slug" value={draft.slug} onChange={set("slug")} half hint={`Public URL: /services/${draft.slug}`} />
                <Field label="Short label (sticky index)" value={draft.short} onChange={set("short")} half hint="Falls back to the title if blank" />
                <Field label="Number" value={draft.num} onChange={set("num")} half />
                <Field label="Description" value={draft.desc} onChange={set("desc")} textarea rows={4} hint="Shown on the listing card and the service page hero" />
                <ImageField label="Cover image" value={draft.img} onChange={set("img")} hint="Also the listing card image" />
              </FieldGrid>
            </EditSection>

            <EditSection title="Service page — hero & intro" count="3 fields">
              <FieldGrid>
                <Field label="Eyebrow" value={`Service / ${draft.num} · What we do`} hint="Built automatically from the service number" />
                <Field label="Note (italic aside)" value={draft.note} onChange={set("note")} textarea rows={2} />
                <Field label="Industries line" value={draft.industries} onChange={set("industries")} hint="Dot-separated, under the description" />
              </FieldGrid>
            </EditSection>

            <EditSection title="What's included panel" count={`${draft.bullets.length} items`}>
              <div className="cmsc-gallery">
                <div className="cmsc-grid">
                  {draft.bullets.map((b, i) => (
                    <label key={i} className="cmsc-field cmsc-field--half">
                      <span className="cmsc-field__label">Item {String(i + 1).padStart(2, "0")}</span>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input type="text" value={b} onChange={(e) => setBullet(i)(e.target.value)} style={{ flex: 1 }} />
                        <button type="button" className="cms__btn-ghost" title="Remove" onClick={() => removeBullet(i)}>✕</button>
                      </div>
                    </label>
                  ))}
                </div>
                <button type="button" className="cms__btn-ghost" style={{ marginTop: "10px" }} onClick={addBullet}>＋ Add item</button>
              </div>
              <p className="cmsc-note">The image beside this panel is the latest related project's lead image, linked to its case page — it updates automatically.</p>
            </EditSection>

            <EditSection title="Project gallery (full-bleed scroller)" count={`${related.length} related projects`}>
              {related.length ? (
                <div className="cmsc-gallery__grid">
                  {related.map((p) => (
                    <figure key={p.slug} className="cmsc-gallery__cell" title={p.title}>
                      <img src={p.img} alt={p.title} loading="lazy" />
                    </figure>
                  ))}
                </div>
              ) : (
                <p className="cmsc-note">No projects are tagged with this service yet.</p>
              )}
              <p className="cmsc-note" style={{ marginTop: "12px" }}>Pulled automatically from projects tagged “{draft.title}” — manage tags in each project's <Link to="/admin/projects">Solution panel</Link>.</p>
            </EditSection>

            <EditSection title="Shared sections on this page" count="4 blocks">
              <p className="cmsc-note" style={{ padding: "4px 0 10px" }}>
                These render on every service page and are edited once, site-wide:
              </p>
              <ul className="cmsc-shared">
                <li><strong>From hello to handoff</strong> — the process strip · <Link to="/admin/pages">Pages → Services</Link></li>
                <li><strong>Owner's note</strong> — flashlight wall + signature · <Link to="/admin/pages">Pages → Services</Link></li>
                <li><strong>Five stars, every time</strong> — reviews strip · <Link to="/admin/reviews">Reviews</Link></li>
                <li><strong>FAQ + Let's talk</strong> — <Link to="/admin/faqs">FAQs</Link> · <Link to="/admin/pages">Pages → Home → Contact</Link></li>
              </ul>
            </EditSection>
          </div>
        </section>

        {error ? <p className="cmsc-note" style={{ color: "#c0392b" }}>{error}</p> : null}
        <div className="cmsc-savebar">
          <span>{dirty ? "Unsaved changes" : "All changes saved"}</span>
          <div>
            <button type="button" className="cms__btn-ghost cmsm__danger" onClick={remove} disabled={removing}>
              {removing ? "Deleting…" : "Delete service"}
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
