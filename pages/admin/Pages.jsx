import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CmsTopbar, Field, FieldGrid, EditSection, VideoField, ImageField } from "@/components/cms/Ui";
import { fetchContent, saveContent } from "@/lib/contentApi";
import { PAGE_CONTENT, CONTENT_DEFAULTS } from "@/lib/pageContent";

const ALL_KEYS = Object.keys(CONTENT_DEFAULTS);

export default function Pages() {
  const [draft, setDraft] = useState(CONTENT_DEFAULTS);
  const [saved, setSaved] = useState(CONTENT_DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    fetchContent()
      .then((c) => {
        if (!active) return;
        const next = { ...CONTENT_DEFAULTS };
        for (const key of ALL_KEYS) if (c[key]) next[key] = c[key];
        setDraft(next);
        setSaved(next);
      })
      .catch((e) => { if (active) setError(e.message || "Could not load page content."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const set = (key) => (val) => setDraft((d) => ({ ...d, [key]: val }));
  const dirty = ALL_KEYS.some((k) => draft[k] !== saved[k]);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const changed = Object.fromEntries(ALL_KEYS.filter((k) => draft[k] !== saved[k]).map((k) => [k, draft[k]]));
      await saveContent(changed);
      setSaved(draft);
    } catch (e) {
      setError(e.message || "Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <CmsTopbar title="Pages" subtitle="Every headline, subtitle and call-to-action on the site." />
      <div className="cms__content cmsc">
        {PAGE_CONTENT.map((p) => (
          <section className="cms-panel" key={p.path}>
            <header className="cms-panel__head">
              <h2>{p.title} <span className="cmsc-path">{p.path}</span></h2>
              <span className="cms-panel__meta">{p.sections.reduce((n, s) => n + s.fields.length, 0)} fields</span>
            </header>
            <div className="cmsc-sections">
              {p.sections.map((s) => (
                <EditSection key={s.name} title={s.name} count={`${s.fields.length} field${s.fields.length > 1 ? "s" : ""}`}>
                  {s.note ? (
                    <p className="cmsc-note" style={{ marginBottom: "12px" }}>
                      {s.note.text}{" "}
                      {s.note.link ? <Link to={s.note.link}>{s.note.linkLabel || "Open"}</Link> : null}
                    </p>
                  ) : null}
                  <FieldGrid>
                    {s.fields.map((f) => (
                      f.kind === "video"
                        ? <VideoField
                            key={f.key}
                            label={f.label}
                            value={draft[f.key]}
                            onChange={set(f.key)}
                            hint={f.hint}
                          />
                        : f.kind === "image"
                        ? <ImageField
                            key={f.key}
                            label={f.label}
                            value={draft[f.key]}
                            onChange={set(f.key)}
                            half={f.half}
                            hint={f.hint}
                          />
                        : <Field
                            key={f.key}
                            label={f.label}
                            value={draft[f.key]}
                            onChange={set(f.key)}
                            textarea={f.textarea}
                            rows={f.rows}
                            half={f.half}
                          />
                    ))}
                  </FieldGrid>
                </EditSection>
              ))}
            </div>
          </section>
        ))}

        <section className="cms-panel">
          <header className="cms-panel__head">
            <h2>Brand Access Program <span className="cmsc-path">/brand-access-program</span></h2>
          </header>
          <div className="cmsc-managed">
            <p>Has its own editor — every section, the access pass, compare table and FAQs.</p>
            <Link to="/admin/brand-access" className="cms__btn-ghost">Open editor</Link>
          </div>
        </section>

        {error ? <p className="cmsc-note" style={{ color: "#c0392b" }}>{error}</p> : null}
        <div className="cmsc-savebar">
          <span>{loading ? "Loading…" : saving ? "Saving…" : dirty ? "Unsaved changes — saving publishes to the live site." : "All changes saved."}</span>
          <div>
            <button type="button" className="cms__btn-ghost" onClick={() => setDraft(saved)} disabled={!dirty || saving}>Discard</button>
            <button type="button" className="btn btn--sm btn--solid" onClick={save} disabled={!dirty || saving}>
              <span>{saving ? "Saving…" : "Save changes"}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
