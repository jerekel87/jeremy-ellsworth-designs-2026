import { useRef, useState } from "react";

export default function SearchExpand() {
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);

  return (
    <label
      className={"cms__search" + (open ? " is-open" : "")}
      onClick={() => {
        if (!open) {
          setOpen(true);
          requestAnimationFrame(() => inputRef.current && inputRef.current.focus());
        }
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
      <input
        ref={inputRef}
        type="search"
        placeholder="Search content…"
        tabIndex={open ? 0 : -1}
        onBlur={(e) => { if (!e.target.value) setOpen(false); }}
        onKeyDown={(e) => { if (e.key === "Escape") { e.target.value = ""; e.target.blur(); } }}
      />
    </label>
  );
}
