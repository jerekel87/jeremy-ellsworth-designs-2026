import { useEffect, useState, useCallback } from "react";
import { fetchPageSeoList, upsertPageSeo, deletePageSeo } from "@/lib/seoApi";
import { CmsTopbar, Field, FieldGrid, ImageField } from "@/components/cms/Ui";
import SeoGlobals from "@/components/cms/SeoGlobals";
import SeoPreview from "@/components/cms/SeoPreview";

const KNOWN_ROUTES = [
  "/",
  "/about",
  "/work",
  "/services",
  "/brand-access-program",
  "/work/boss-hawgs-bbq",
  "/work/stoopid-energy",
  "/work/high-caliber-electric",
  "/work/spartan-hvac",
  "/work/salty-soft-wash",
  "/work/macdavy-heating-air",
  "/work/graybeard-construction",
  "/work/bison-roofing",
  "/work/big-spring-builders",
  "/work/jump-party",
  "/work/zero-gravity-atv",
  "/work/bags",
  "/services/brand-identity",
  "/services/vehicle-wraps",
  "/services/websites",
  "/services/print-collateral",
  "/services/packaging-labels",
  "/services/company-apparel",
];

function CharCount({ value, max }) {
  const len = (value || "").length;
  const over = len > max;
  return (
    <span className="cmsc-field__hint" style={over ? { color: "#c0392b" } : undefined}>
      {len}/{max}
    </span>
  );
}

function FaqEditor({ items, onChange }) {
  const add = () => onChange([...items, { question: "", answer: "" }]);
  const update = (i, key, val) => {
    const next = items.map((f, j) => (j === i ? { ...f, [key]: val } : f));
    onChange(next);
  };
  const remove = (i) => onChange(items.filter((_, j) => j !== i));

  return (
    <div className="cmsc-field">
      <span className="cmsc-field__label">FAQ (generates FAQPage schema)</span>
      <div className="seoa-faq">
        {items.map((f, i) => (
          <div key={i} className="seoa-faq__card">
            <input
              type="text"
              placeholder="Question"
              value={f.question}
              onChange={(e) => update(i, "question", e.target.value)}
            />
            <textarea
              rows={2}
              placeholder="Answer"
              value={f.answer}
              onChange={(e) => update(i, "answer", e.target.value)}
            />
            <button
              type="button"
              className="cms__btn-ghost cmsm__danger seoa-faq__rm"
              onClick={() => remove(i)}
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" className="cmsc-addrow" onClick={add} style={{ alignSelf: "flex-start" }}>
          + Add Q&amp;A
        </button>
      </div>
    </div>
  );
}

function SeoEntry({ entry, onSaved, onDeleted }) {
  const [draft, setDraft] = useState(entry);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const set = useCallback((key) => (val) => {
    setDraft((d) => ({ ...d, [key]: val }));
    setSuccess(false);
  }, []);

  async function save() {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const saved = await upsertPageSeo(draft);
      if (saved) onSaved(saved);
      setSuccess(true);
    } catch (e) {
      setError(e.message || "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm("Delete SEO override for " + entry.path + "? Defaults will take over.")) return;
    setRemoving(true);
    setError(null);
    try {
      await deletePageSeo(entry.id);
      onDeleted(entry.id);
    } catch (e) {
      setError(e.message || "Could not delete.");
      setRemoving(false);
    }
  }

  return (
    <details className="cmsc-item">
      <summary>
        <span className="cmsc-item__num" style={{ fontFamily: "monospace", fontSize: "12px", opacity: 0.6, minWidth: "120px" }}>
          {entry.path}
        </span>
        <span className="cmsc-item__title">
          <strong>{draft.metaTitle || "(using default)"}</strong>
        </span>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginLeft: "auto" }}>
          {draft.robotsNoindex ? (
            <span style={{ fontSize: "10px", background: "rgba(192,57,43,.25)", color: "#e74c3c", padding: "2px 8px", borderRadius: "4px", fontWeight: 600 }}>
              NOINDEX
            </span>
          ) : null}
          <span className="faq__icon"></span>
        </div>
      </summary>
      <div className="cmsc-section__body">
        <FieldGrid>
          <div className="cmsc-field">
            <span className="cmsc-field__label">Meta Title</span>
            <input
              type="text"
              placeholder="Leave blank for default"
              value={draft.metaTitle}
              onChange={(e) => set("metaTitle")(e.target.value)}
            />
            <CharCount value={draft.metaTitle} max={60} />
          </div>

          <div className="cmsc-field">
            <span className="cmsc-field__label">Meta Description</span>
            <textarea
              rows={3}
              placeholder="Leave blank for default"
              value={draft.metaDescription}
              onChange={(e) => set("metaDescription")(e.target.value)}
            />
            <CharCount value={draft.metaDescription} max={155} />
          </div>

          <ImageField
            label="OG Image (1200 x 630)"
            value={draft.ogImage}
            onChange={set("ogImage")}
          />

          <Field
            label="Canonical Override"
            value={draft.canonicalOverride}
            placeholder="Leave blank for self-canonical"
            onChange={set("canonicalOverride")}
            hint="Only set this if the canonical URL differs from the page URL."
          />

          <div className="cmsc-field cmsc-field--half">
            <span className="cmsc-field__label">Robots</span>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "8px 0" }}>
              <input
                type="checkbox"
                checked={draft.robotsNoindex}
                onChange={(e) => set("robotsNoindex")(e.target.checked)}
                style={{ width: "18px", height: "18px", accentColor: "#c0392b" }}
              />
              <span style={{ fontSize: "14px" }}>
                noindex, nofollow (hide from search engines)
              </span>
            </label>
          </div>
        </FieldGrid>

        <div style={{ marginTop: "16px" }}>
          <FaqEditor items={draft.faq} onChange={set("faq")} />
        </div>

        <SeoPreview
          path={draft.path}
          title={draft.metaTitle}
          description={draft.metaDescription}
          image={draft.ogImage}
        />

        {error ? <p className="cmsc-note" style={{ color: "#c0392b", marginTop: "12px" }}>{error}</p> : null}
        {success ? <p className="cmsc-note" style={{ color: "#27ae60", marginTop: "12px" }}>Saved. Changes will appear on the site within 5 minutes (ISR).</p> : null}

        <div className="cmsc-savebar">
          <span style={{ fontSize: "12px", opacity: 0.5 }}>
            {entry.updatedAt ? `Updated ${new Date(entry.updatedAt).toLocaleDateString()}` : "New entry"}
          </span>
          <div>
            {entry.id ? (
              <button type="button" className="cms__btn-ghost cmsm__danger" onClick={remove} disabled={removing}>
                {removing ? "Removing..." : "Delete Override"}
              </button>
            ) : null}
            <button type="button" className="btn btn--sm btn--solid" onClick={save} disabled={saving}>
              <span>{saving ? "Saving..." : "Save"}</span>
            </button>
          </div>
        </div>
      </div>
    </details>
  );
}

export default function Seo() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addPath, setAddPath] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let active = true;
    fetchPageSeoList()
      .then((rows) => { if (active) setEntries(rows); })
      .catch((e) => { if (active) setError(e.message || "Could not load SEO entries."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const existingPaths = new Set(entries.map((e) => e.path));
  const availableRoutes = KNOWN_ROUTES.filter((r) => !existingPaths.has(r));

  async function addEntry() {
    if (!addPath) return;
    setAdding(true);
    setError(null);
    try {
      const saved = await upsertPageSeo({ path: addPath, metaTitle: "", metaDescription: "" });
      if (saved) setEntries((list) => [...list, saved]);
      setAddPath("");
    } catch (e) {
      setError(e.message || "Could not add entry.");
    } finally {
      setAdding(false);
    }
  }

  return (
    <>
      <CmsTopbar
        title="SEO & AI Visibility"
        subtitle="Per-page meta overrides. Blank fields use best-practice defaults."
      />
      <div className="cms__content cmsc">
        {loading ? <p className="cmsc-note">Loading SEO entries...</p> : null}
        {error ? <p className="cmsc-note" style={{ color: "#c0392b" }}>{error}</p> : null}

        {!loading && !error ? (
          <>
          <SeoGlobals />

          <section className="cms-panel" style={{ marginTop: "24px" }}>
            <header className="cms-panel__head">
              <h2>Page Overrides</h2>
              <span className="cms-panel__meta">{entries.length} {entries.length === 1 ? "page" : "pages"} configured</span>
            </header>

            {entries.length === 0 ? (
              <p className="cmsc-note" style={{ padding: "16px 20px" }}>
                No overrides yet. All pages use defaults from config. Add a page below to customize its SEO.
              </p>
            ) : null}

            {entries.map((entry) => (
              <SeoEntry
                key={entry.id || entry.path}
                entry={entry}
                onSaved={(updated) => setEntries((list) => list.map((x) => (x.id === updated.id || x.path === updated.path ? updated : x)))}
                onDeleted={(id) => setEntries((list) => list.filter((x) => x.id !== id))}
              />
            ))}

            <div className="seoa-addbar">
              {availableRoutes.length > 0 ? (
                <label className="cmsc-field seoa-addbar__field">
                  <span className="cmsc-field__label">Pick a page</span>
                  <select value={addPath} onChange={(e) => setAddPath(e.target.value)}>
                    <option value="">Select a page…</option>
                    {availableRoutes.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </label>
              ) : null}
              <label className="cmsc-field seoa-addbar__field">
                <span className="cmsc-field__label">{availableRoutes.length > 0 ? "Or custom path" : "Page path"}</span>
                <input
                  type="text"
                  placeholder="/work/new-project"
                  value={addPath}
                  onChange={(e) => setAddPath(e.target.value)}
                />
              </label>
              <button
                type="button"
                className="btn btn--sm btn--solid seoa-addbar__btn"
                onClick={addEntry}
                disabled={!addPath || adding}
              >
                <span>{adding ? "Adding…" : "Add Page"}</span>
              </button>
            </div>
          </section>
          </>
        ) : null}

        {!loading && !error ? (
          <section className="cms-panel" style={{ marginTop: "24px" }}>
            <header className="cms-panel__head">
              <h2>Machine Routes</h2>
              <span className="cms-panel__meta">Auto-generated from your content</span>
            </header>
            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { path: "/robots.txt", desc: "Tells search engines which pages to crawl. Blocks /admin, /login, /api." },
                { path: "/sitemap.xml", desc: "Lists all public URLs with priorities. Revalidates every 5 minutes." },
                { path: "/llms.txt", desc: "Machine-readable studio summary for AI crawlers (ChatGPT, Claude, etc.)." },
              ].map((r) => (
                <div key={r.path} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                  <code style={{ fontFamily: "monospace", fontSize: "13px", color: "#3498db", minWidth: "120px" }}>{r.path}</code>
                  <span style={{ fontSize: "13px", opacity: 0.6 }}>{r.desc}</span>
                  <a
                    href={r.path}
                    target="_blank"
                    rel="noopener"
                    style={{ marginLeft: "auto", fontSize: "12px", color: "#3498db", textDecoration: "none", whiteSpace: "nowrap" }}
                  >
                    View &rarr;
                  </a>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}
