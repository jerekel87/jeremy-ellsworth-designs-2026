import { useEffect, useRef, useState } from "react";

export default function ShareButton({ title }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrap = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (wrap.current && !wrap.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("click", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const url = typeof window !== "undefined" ? window.location.href : "";
  const enc = encodeURIComponent;

  async function copyLink(e) {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {}
  }

  return (
    <div className={"share" + (open ? " is-open" : "")} ref={wrap}>
      <a
        className="share__item share__item--1"
        href={`https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}`}
        target="_blank" rel="noopener noreferrer" aria-label="Share on X" tabIndex={open ? 0 : -1}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 1.2h3.7l-8.1 9.3L24 22.8h-7.5l-5.9-7.7-6.7 7.7H.2l8.7-9.9L0 1.2h7.7l5.3 7 6-7Zm-1.3 19.4h2L7.6 3.3H5.4l12.2 17.3Z"/></svg>
      </a>
      <a
        className="share__item share__item--2"
        href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`}
        target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" tabIndex={open ? 0 : -1}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21.9v-9h3l.5-3.5h-3.5V7.2c0-1 .3-1.7 1.7-1.7H17V2.4c-.3 0-1.4-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.5v2.6H7v3.5h3v9h3.5Z"/></svg>
      </a>
      <a
        className="share__item share__item--3"
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`}
        target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" tabIndex={open ? 0 : -1}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.2 8.2h4.6V23H.2V8.2Zm7.6 0h4.4v2h.1c.6-1.2 2.1-2.4 4.4-2.4 4.7 0 5.6 3.1 5.6 7.1V23h-4.6v-7.2c0-1.7 0-3.9-2.4-3.9s-2.8 1.9-2.8 3.8V23H7.8V8.2Z"/></svg>
      </a>
      <button
        className="share__item share__item--4"
        onClick={copyLink} aria-label="Copy link" tabIndex={open ? 0 : -1}
      >
        {copied ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="m4 12.5 5 5L20 6.5"/></svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>
        )}
      </button>
      <button
        className="share__main"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close share menu" : "Share this project"}
        aria-expanded={open}
        data-cursor="hover"
      >
        <svg className="share__icon share__icon--share" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>
        <svg className="share__icon share__icon--close" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
      </button>
    </div>
  );
}
