import { useEffect, useState } from "react";
import { fetchGlobalSeo, saveGlobalSeo } from "@/lib/seoApi";
import { Field, FieldGrid, ImageField } from "@/components/cms/Ui";

function StringList({ label, hint, placeholder, items, onChange }) {
  const add = () => onChange([...items, ""]);
  const update = (i, val) => onChange(items.map((x, j) => (j === i ? val : x)));
  const remove = (i) => onChange(items.filter((_, j) => j !== i));
  return (
    <div className="cmsc-field">
      <span className="cmsc-field__label">{label}</span>
      <div className="seoa-list">
        {items.map((val, i) => (
          <div key={i} className="seoa-list__row">
            <input
              type="text"
              placeholder={placeholder}
              value={val}
              onChange={(e) => update(i, e.target.value)}
            />
            <button type="button" className="seoa-list__rm" onClick={() => remove(i)} aria-label="Remove">×</button>
          </div>
        ))}
        <button type="button" className="cmsc-addrow seoa-list__add" onClick={add}>+ Add</button>
      </div>
      {hint ? <span className="cmsc-field__hint">{hint}</span> : null}
    </div>
  );
}

export default function SeoGlobals() {
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let active = true;
    fetchGlobalSeo()
      .then((d) => { if (active) setDraft(d); })
      .catch((e) => { if (active) setError(e.message || "Could not load global settings."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const set = (key) => (val) => { setDraft((d) => ({ ...d, [key]: val })); setSuccess(false); };
  const setNested = (group, key) => (val) => {
    setDraft((d) => ({ ...d, [group]: { ...d[group], [key]: val } }));
    setSuccess(false);
  };

  async function save() {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const clean = {
        ...draft,
        sameAs: draft.sameAs.filter((s) => s.trim()),
        keywords: draft.keywords.filter((s) => s.trim()),
        founder: { ...draft.founder, sameAs: (draft.founder.sameAs || []).filter((s) => s.trim()) },
      };
      await saveGlobalSeo(clean);
      setSuccess(true);
    } catch (e) {
      setError(e.message || "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="cms-panel">
      <header className="cms-panel__head">
        <h2>Global Defaults</h2>
        <span className="cms-panel__meta">Brand identity · powers every page &amp; AI schema</span>
      </header>
      <div className="cmsc-section__body">
        {loading ? <p className="cmsc-note">Loading global settings…</p> : null}
        {!loading && draft ? (
          <>
            <FieldGrid>
              <Field label="Brand Name" half value={draft.brandName} placeholder="je.design" onChange={set("brandName")} hint="Short public name used in title templates." />
              <Field label="Legal Name" half value={draft.legalName} placeholder="Jeremy Ellsworth Designs LLC" onChange={set("legalName")} />
              <Field label="Tagline" value={draft.tagline} placeholder="Building Brands That Empower Growth" onChange={set("tagline")} />
              <Field label="Default Description" value={draft.description} textarea rows={3} placeholder="The fallback meta description for pages without their own." onChange={set("description")} hint="Used when a page has no description of its own." />
              <ImageField label="Default Share Image (1200 × 630)" value={draft.defaultOgImage} onChange={set("defaultOgImage")} hint="Shown when a page has no Open Graph image set." />
            </FieldGrid>

            <h3 className="seoa-subhead">Contact</h3>
            <FieldGrid>
              <Field label="Email" half value={draft.contact.email} placeholder="inquiry@je.design" onChange={setNested("contact", "email")} />
              <Field label="Phone" half value={draft.contact.phone} placeholder="+1XXXXXXXXXX" onChange={setNested("contact", "phone")} hint="E.164 format. Leave blank to omit." />
            </FieldGrid>

            <h3 className="seoa-subhead">Founder</h3>
            <FieldGrid>
              <Field label="Name" half value={draft.founder.name} placeholder="Jeremy Ellsworth" onChange={setNested("founder", "name")} />
              <Field label="Job Title" half value={draft.founder.jobTitle} placeholder="Founder & Creative Director" onChange={setNested("founder", "jobTitle")} />
            </FieldGrid>

            <h3 className="seoa-subhead">Discovery signals</h3>
            <FieldGrid>
              <StringList
                label="Social & Profile URLs (sameAs)"
                placeholder="https://www.behance.net/…"
                items={draft.sameAs}
                onChange={set("sameAs")}
                hint="Public profiles that confirm the same entity to search & AI engines."
              />
              <StringList
                label="Keywords"
                placeholder="brand identity design"
                items={draft.keywords}
                onChange={set("keywords")}
                hint="Topical signals included in structured data."
              />
            </FieldGrid>

            {error ? <p className="cmsc-note" style={{ color: "#c0392b", marginTop: "12px" }}>{error}</p> : null}
            {success ? <p className="cmsc-note" style={{ color: "#27ae60", marginTop: "12px" }}>Saved. The site picks up changes within 5 minutes (ISR).</p> : null}

            <div className="cmsc-savebar">
              <span style={{ fontSize: "12px", opacity: 0.5 }}>These values feed metadata and JSON-LD on every page.</span>
              <button type="button" className="btn btn--sm btn--solid" onClick={save} disabled={saving}>
                <span>{saving ? "Saving…" : "Save defaults"}</span>
              </button>
            </div>
          </>
        ) : null}
        {error && !draft ? <p className="cmsc-note" style={{ color: "#c0392b" }}>{error}</p> : null}
      </div>
    </section>
  );
}
