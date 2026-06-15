import { useEffect, useRef, useState } from "react";

function fmtSize(bytes) {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return Math.max(1, Math.round(bytes / 1024)) + " KB";
}

export default function MediaLibrary({ items, folders, defaultFolder = "All", onDelete }) {
  const [folder, setFolder] = useState(defaultFolder);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [copied, setCopied] = useState(false);
  const [dims, setDims] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const searchRef = useRef(null);

  async function handleDelete() {
    if (!selected || !onDelete) return;
    setDeleting(true);
    try {
      await onDelete(selected);
      setSelected(null);
    } finally {
      setDeleting(false);
    }
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        searchRef.current && searchRef.current.focus();
      }
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  let visible = folder === "All" ? items : items.filter((i) => i.folder === folder);
  if (query.trim()) {
    const q = query.trim().toLowerCase();
    visible = visible.filter((i) => i.name.toLowerCase().includes(q));
  }

  useEffect(() => { setDims(null); setCopied(false); }, [selected]);

  const copyPath = () => {
    if (!selected) return;
    navigator.clipboard && navigator.clipboard.writeText(selected.path);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="cmsm">
      <div className="cmsm__bar">
        <div className="cmsm__tabs" role="tablist">
          {["All", ...folders.map((f) => f.name)].map((name) => (
            <button
              key={name} type="button" role="tab"
              className={"cmsq__tab" + (folder === name ? " is-active" : "")}
              aria-selected={folder === name}
              onClick={() => { setFolder(name); setSelected(null); }}
            >
              {name}
              <em>{name === "All" ? items.length : folders.find((f) => f.name === name)?.count}</em>
            </button>
          ))}
        </div>
        <label className="cmsm__search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input
            ref={searchRef}
            type="search" placeholder="Search files…"
            value={query} onChange={(e) => setQuery(e.target.value)}
          />
          {query
            ? <button type="button" className="cmsm__search-clear" onClick={() => setQuery("")} aria-label="Clear">✕</button>
            : <kbd>/</kbd>}
        </label>
      </div>

      {query.trim() ? (
        <p className="cmsm__results">{visible.length} result{visible.length === 1 ? "" : "s"} for “{query.trim()}”{folder !== "All" ? ` in ${folder}` : ""}</p>
      ) : null}

      <div className={"cmsm__body" + (selected ? " is-open" : "")}>
        <div className="cmsm__grid">
          {visible.map((it) => (
            <button
              key={it.path} type="button"
              className={"cmsm__cell" + (selected && selected.path === it.path ? " is-selected" : "")}
              onClick={() => setSelected(selected && selected.path === it.path ? null : it)}
              title={it.name}
            >
              {it.type === "video" ? (
                <span className="cmsm__video">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7L8 5Z" /></svg>
                </span>
              ) : (
                <img src={it.path} alt="" loading="lazy" />
              )}
              <figcaption>{it.name}</figcaption>
            </button>
          ))}
          {!visible.length && <p className="cmsq__empty">No files match.</p>}
        </div>

        {selected ? (
          <aside className="cmsm__detail" key={selected.path}>
            <header className="cmsm__detail-head">
              <strong>{selected.name}</strong>
              <button type="button" className="cmsq__iconbtn" onClick={() => setSelected(null)} aria-label="Close">✕</button>
            </header>
            {selected.type === "video" ? (
              <video className="cmsm__detail-preview" src={selected.path} controls preload="metadata" />
            ) : (
              <img
                className="cmsm__detail-preview"
                src={selected.path} alt=""
                onLoad={(e) => setDims([e.target.naturalWidth, e.target.naturalHeight])}
              />
            )}
            <dl className="cmsm__detail-meta">
              <div><dt>Folder</dt><dd>{selected.folder}</dd></div>
              <div><dt>Type</dt><dd>{selected.type === "video" ? "Video" : selected.name.split(".").pop().toUpperCase() + " image"}</dd></div>
              <div><dt>Size</dt><dd>{fmtSize(selected.size)}</dd></div>
              {dims ? <div><dt>Dimensions</dt><dd>{dims[0]} × {dims[1]}px</dd></div> : null}
              {selected.usage ? <div><dt>Used in</dt><dd>{selected.usage}</dd></div> : null}
            </dl>
            <div className="cmsm__detail-path">
              <code>{selected.path}</code>
              <button type="button" className="cms__btn-ghost" onClick={copyPath}>{copied ? "Copied ✓" : "Copy"}</button>
            </div>
            <div className="cmsm__detail-actions">
              {selected.uploaded ? (
                <button
                  type="button"
                  className="cms__btn-ghost cmsm__danger"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              ) : (
                <span className="cmsm__readonly">Bundled asset — read-only. Upload a new file to replace it.</span>
              )}
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}