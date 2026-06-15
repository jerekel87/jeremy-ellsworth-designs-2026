import { useEffect, useState } from "react";
import { fetchFaqs, createFaq, updateFaq, deleteFaq } from "@/lib/faqsApi";
import { CmsTopbar, Field, FieldGrid } from "@/components/cms/Ui";

function FaqItem({ faq, index, onSaved, onDeleted }) {
  const [draft, setDraft] = useState(faq);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState(null);

  const set = (key) => (val) => setDraft((d) => ({ ...d, [key]: val }));
  const dirty = draft.question !== faq.question || draft.answer !== faq.answer;

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateFaq(faq.id, { question: draft.question, answer: draft.answer });
      if (updated) onSaved(updated);
    } catch (e) {
      setError(e.message || "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setRemoving(true);
    setError(null);
    try {
      await deleteFaq(faq.id);
      onDeleted(faq.id);
    } catch (e) {
      setError(e.message || "Could not delete.");
      setRemoving(false);
    }
  }

  return (
    <details className="cmsc-item">
      <summary>
        <span className="cmsc-item__num">{String(index + 1).padStart(2, "0")}</span>
        <span className="cmsc-item__title"><strong>{draft.question || "Untitled question"}</strong></span>
        <span className="faq__icon"></span>
      </summary>
      <div className="cmsc-section__body">
        <FieldGrid>
          <Field label="Question" value={draft.question} onChange={set("question")} />
          <Field label="Answer" value={draft.answer} onChange={set("answer")} textarea rows={4} />
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

function FaqGroup({ title, where, group, items, setItems }) {
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);

  async function add() {
    setAdding(true);
    setError(null);
    try {
      const nextOrder = items.reduce((m, x) => Math.max(m, x.sortOrder), 0) + 1;
      const created = await createFaq({ group, question: "New question", answer: "", sortOrder: nextOrder });
      if (created) setItems((list) => [...list, created]);
    } catch (e) {
      setError(e.message || "Could not add question.");
    } finally {
      setAdding(false);
    }
  }

  return (
    <section className="cms-panel">
      <header className="cms-panel__head">
        <h2>{title}</h2>
        <span className="cms-panel__meta">{where}</span>
      </header>
      {items.map((faq, i) => (
        <FaqItem
          key={faq.id}
          faq={faq}
          index={i}
          onSaved={(updated) => setItems((list) => list.map((x) => (x.id === updated.id ? updated : x)))}
          onDeleted={(id) => setItems((list) => list.filter((x) => x.id !== id))}
        />
      ))}
      {error ? <p className="cmsc-note" style={{ color: "#c0392b" }}>{error}</p> : null}
      <button type="button" className="cmsc-addrow" onClick={add} disabled={adding}>
        {adding ? "Adding…" : "＋ Add question"}
      </button>
    </section>
  );
}

export default function Faqs() {
  const [site, setSite] = useState([]);
  const [bap, setBap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    fetchFaqs()
      .then((rows) => {
        if (!active) return;
        setSite(rows.filter((r) => r.group === "site"));
        setBap(rows.filter((r) => r.group === "bap"));
      })
      .catch((e) => { if (active) setError(e.message || "Could not load FAQs."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <>
      <CmsTopbar title="FAQs" subtitle="Two sets — the site-wide FAQ and the Brand Access Program FAQ." />
      <div className="cms__content cmsc">
        {loading ? <p className="cmsc-note">Loading FAQs…</p> : null}
        {error ? <p className="cmsc-note" style={{ color: "#c0392b" }}>{error}</p> : null}
        {!loading && !error ? (
          <>
            <FaqGroup title="Site FAQ" where="Home · About · Service pages" group="site" items={site} setItems={setSite} />
            <FaqGroup title="Brand Access FAQ" where="/brand-access-program" group="bap" items={bap} setItems={setBap} />
          </>
        ) : null}
      </div>
    </>
  );
}
