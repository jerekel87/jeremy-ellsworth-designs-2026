import { useEffect, useState } from "react";

export default function CaseInfo({ deliverables, industry }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        className={"case-fab" + (open ? " is-open" : "")}
        aria-label={open ? "Close project details" : "Project details"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        data-cursor="hover"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="9.5" /><path d="M12 11v6" /><circle cx="12" cy="7.6" r="0.6" fill="currentColor" /></svg>
        )}
      </button>
      {open && <div className="case-pop__backdrop" onClick={() => setOpen(false)} />}
      <aside className={"case-pop" + (open ? " is-open" : "")} role="dialog" aria-label="Project deliverables" aria-hidden={!open}>
        <h3>Deliverables</h3>
        <ul className="case__list">
          {deliverables.map((d) => <li key={d}>{d}</li>)}
        </ul>
        <div className="case__meta">
          <div><span>Industry</span><strong>{industry}</strong></div>
          <div><span>Timeline</span><strong>2–3 weeks</strong></div>
          <div><span>Made by</span><strong>je.design — in-house, by hand</strong></div>
        </div>
        <a href="#" data-drawer className="btn btn--solid" onClick={() => setOpen(false)}>
          <span>Start a project like this</span>
        </a>
      </aside>
    </>
  );
}
