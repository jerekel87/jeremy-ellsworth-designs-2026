import { useEffect, useState } from "react";
import { fetchCategories, createCategory, updateCategory, deleteCategory, slugifyKey } from "@/lib/categoriesApi";
import { fetchProjects } from "@/lib/projectsApi";
import { CmsTopbar, Field, FieldGrid } from "@/components/cms/Ui";

function CategoryItem({ category, index, count, onSaved, onDeleted }) {
  const [draft, setDraft] = useState(category);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState(null);

  const set = (key) => (val) => setDraft((d) => ({ ...d, [key]: val }));
  const dirty = draft.label !== category.label || draft.key !== category.key;

  async function save() {
    const key = slugifyKey(draft.key || draft.label);
    const label = (draft.label || "").trim();
    if (!key || !label) { setError("Label and key are both required."); return; }
    setSaving(true);
    setError(null);
    try {
      const updated = await updateCategory(category.id, { label, key });
      if (updated) onSaved(updated);
    } catch (e) {
      setError(e.message?.includes("duplicate") ? "That key is already used by another category." : (e.message || "Could not save."));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (count > 0 && !window.confirm(`${count} project${count === 1 ? " is" : "s are"} tagged "${category.label}". Deleting the category won't delete those projects, but they'll no longer match a filter tab until re-tagged. Continue?`)) return;
    setRemoving(true);
    setError(null);
    try {
      await deleteCategory(category.id);
      onDeleted(category.id);
    } catch (e) {
      setError(e.message || "Could not delete.");
      setRemoving(false);
    }
  }

  return (
    <details className="cmsc-item">
      <summary>
        <span className="cmsc-item__num">{String(index + 1).padStart(2, "0")}</span>
        <span className="cmsc-item__title">
          <strong>{draft.label || "Untitled category"}</strong>
          <span>filter key: {draft.key || "—"} · {count} project{count === 1 ? "" : "s"}</span>
        </span>
        <span className="faq__icon"></span>
      </summary>
      <div className="cmsc-section__body">
        <FieldGrid>
          <Field label="Label (shown on the filter tab)" value={draft.label} onChange={set("label")} half />
          <Field label="Filter key" value={draft.key} onChange={set("key")} half hint="Lowercase slug stored on each project — change with care, projects keep their old key until re-saved." />
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

export default function Categories() {
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([fetchCategories(), fetchProjects()])
      .then(([cats, projects]) => {
        if (!alive) return;
        setItems(cats);
        const tally = {};
        projects.forEach((p) => { if (p.cat) tally[p.cat] = (tally[p.cat] || 0) + 1; });
        setCounts(tally);
      })
      .catch((e) => { if (alive) setError(e.message || "Could not load categories."); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  async function add() {
    setAdding(true);
    setError(null);
    try {
      const nextOrder = items.reduce((m, x) => Math.max(m, x.sortOrder), 0) + 1;
      const base = "new-category";
      let key = base;
      let n = 2;
      const used = new Set(items.map((x) => x.key));
      while (used.has(key)) key = `${base}-${n++}`;
      const created = await createCategory({ key, label: "New category", sortOrder: nextOrder });
      if (created) setItems((list) => [...list, created]);
    } catch (e) {
      setError(e.message || "Could not add category.");
    } finally {
      setAdding(false);
    }
  }

  return (
    <>
      <CmsTopbar
        title="Work categories"
        subtitle="These are the filter tabs on the public Work page. Assign a category to each project in its editor."
      />
      <div className="cms__content cmsc">
        {loading ? <p className="cmsc-note">Loading categories…</p> : null}
        {error ? <p className="cmsc-note" style={{ color: "#c0392b" }}>{error}</p> : null}
        {!loading && !error ? (
          <section className="cms-panel">
            <header className="cms-panel__head">
              <h2>Categories</h2>
              <span className="cms-panel__meta">An "All" tab is always shown first on the public page.</span>
            </header>
            {items.length === 0 ? <p className="cmsc-note">No categories yet — add one below.</p> : null}
            {items.map((c, i) => (
              <CategoryItem
                key={c.id}
                category={c}
                index={i}
                count={counts[c.key] || 0}
                onSaved={(updated) => setItems((list) => list.map((x) => (x.id === updated.id ? updated : x)))}
                onDeleted={(id) => setItems((list) => list.filter((x) => x.id !== id))}
              />
            ))}
            <button type="button" className="cmsc-addrow" onClick={add} disabled={adding}>
              {adding ? "Adding…" : "＋ Add category"}
            </button>
          </section>
        ) : null}
      </div>
    </>
  );
}
