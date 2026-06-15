import { useRef, useState } from "react";
import { uploadMedia } from "@/lib/contentApi";

const PATTERN = [3, 1, 2];
const clamp = (n) => Math.min(3, Math.max(1, n || 1));

/* Chunk the post-cover images into rows. Provided `sizes` (layout) drive the
   column count per row; any leftover images fall back to the 3 / 1 / 2 rhythm
   so older projects without a saved layout still stack the way they always did. */
function chunk(tail, sizes) {
  const rows = [];
  let i = 0, si = 0, pi = 0;
  while (i < tail.length) {
    let n = si < sizes.length ? clamp(sizes[si]) : PATTERN[pi % PATTERN.length];
    if (si < sizes.length) si += 1; else pi += 1;
    n = Math.min(n, tail.length - i);
    rows.push(tail.slice(i, i + n));
    i += n;
  }
  return rows;
}

function ImgCell({ src, onReplace, onRemove, onLeft, onRight, canLeft, canRight }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  async function pick(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setBusy(true);
    try { onReplace(await uploadMedia(file)); }
    finally { setBusy(false); if (ref.current) ref.current.value = ""; }
  }
  return (
    <figure className="cmsg-cell">
      <img src={src} alt="" loading="lazy" />
      <div className="cmsg-cell__tools">
        <button type="button" title="Move left" onClick={onLeft} disabled={!canLeft}>◀</button>
        <button type="button" title={busy ? "Uploading…" : "Replace"} onClick={() => ref.current?.click()} disabled={busy}>⤢</button>
        <button type="button" title="Move right" onClick={onRight} disabled={!canRight}>▶</button>
        <button type="button" title="Remove" className="cmsg-cell__del" onClick={onRemove}>✕</button>
      </div>
      <input ref={ref} type="file" accept="image/*" hidden onChange={pick} />
    </figure>
  );
}

function AddTile({ label, onAdd }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  async function pick(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setBusy(true);
    try { onAdd(await uploadMedia(file)); }
    finally { setBusy(false); if (ref.current) ref.current.value = ""; }
  }
  function url() {
    const u = window.prompt("Image path or URL (e.g. /assets/img/work/boss-hawgs.jpg)");
    if (u && u.trim()) onAdd(u.trim());
  }
  return (
    <div className="cmsg-add">
      <button type="button" onClick={() => ref.current?.click()} disabled={busy}>{busy ? "Uploading…" : `⬆ Upload ${label}`}</button>
      <button type="button" onClick={url}>Paste URL</button>
      <input ref={ref} type="file" accept="image/*" hidden onChange={pick} />
    </div>
  );
}

export default function GalleryEditor({ gallery = [], layout = [], onChange }) {
  const cover = gallery[0] || "";
  const tail = gallery.slice(1);
  const rows = chunk(tail, Array.isArray(layout) ? layout : []);
  const sizes = rows.map((r) => r.length);

  const coverRef = useRef(null);
  const [coverBusy, setCoverBusy] = useState(false);

  function emit(nextCover, nextTail, nextSizes) {
    const g = nextCover ? [nextCover, ...nextTail] : nextTail;
    onChange(g, chunk(nextTail, nextSizes).map((r) => r.length));
  }

  async function coverPick(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setCoverBusy(true);
    try { emit(await uploadMedia(file), tail, sizes); }
    finally { setCoverBusy(false); if (coverRef.current) coverRef.current.value = ""; }
  }
  function coverUrl() {
    const u = window.prompt("Cover image path or URL");
    if (u && u.trim()) emit(u.trim(), tail, sizes);
  }

  const replaceAt = (i) => (url) => { const t = [...tail]; t[i] = url; emit(cover, t, sizes); };
  const removeAt = (i) => () => emit(cover, tail.filter((_, idx) => idx !== i), sizes);
  const moveAt = (i, dir) => () => {
    const j = i + dir;
    if (j < 0 || j >= tail.length) return;
    const t = [...tail];
    [t[i], t[j]] = [t[j], t[i]];
    emit(cover, t, sizes);
  };
  const setRowCols = (ri, n) => () => { const s = [...sizes]; s[ri] = n; emit(cover, tail, s); };
  const moveRow = (ri, dir) => () => {
    const rj = ri + dir;
    if (rj < 0 || rj >= rows.length) return;
    const r = rows.map((x) => [...x]);
    [r[ri], r[rj]] = [r[rj], r[ri]];
    emit(cover, r.flat(), r.map((x) => x.length));
  };
  const deleteRow = (ri) => () => {
    const r = rows.filter((_, idx) => idx !== ri);
    emit(cover, r.flat(), r.map((x) => x.length));
  };
  const addImage = (url) => emit(cover, [...tail, url], [...sizes, 1]);

  // flat index of the first image in each row, for move bounds + cell handlers
  let flat = 0;

  return (
    <div className="cmsg">
      <div className="cmsg-cover">
        <span className="cmsc-field__label">Cover / lead image — shown on the Work grid and the case-page hero</span>
        <div className="cmsg-cover__row">
          <div className={"cmsg-cover__preview" + (cover ? "" : " is-empty")}>
            {cover ? <img src={cover} alt="" loading="lazy" /> : <span>No cover yet</span>}
          </div>
          <div className="cmsg-cover__actions">
            <button type="button" className="cms__btn-ghost" disabled={coverBusy} onClick={() => coverRef.current?.click()}>
              {coverBusy ? "Uploading…" : cover ? "Replace cover" : "Upload cover"}
            </button>
            <button type="button" className="cms__btn-ghost" onClick={coverUrl}>Paste URL</button>
            <input ref={coverRef} type="file" accept="image/*" hidden onChange={coverPick} />
          </div>
        </div>
      </div>

      <div className="cmsg-rows">
        {rows.map((row, ri) => {
          const start = flat;
          flat += row.length;
          return (
            <div className="cmsg-row" key={ri}>
              <div className="cmsg-row__head">
                <strong>Row {ri + 1}</strong>
                <div className="cmsg-cols" role="group" aria-label="Columns in this row">
                  {[1, 2, 3].map((n) => (
                    <button
                      key={n} type="button"
                      className={"cmsg-cols__btn" + (row.length === n ? " is-active" : "")}
                      onClick={setRowCols(ri, n)}
                    >{n} col</button>
                  ))}
                </div>
                <div className="cmsg-row__move">
                  <button type="button" title="Move row up" onClick={moveRow(ri, -1)} disabled={ri === 0}>↑</button>
                  <button type="button" title="Move row down" onClick={moveRow(ri, 1)} disabled={ri === rows.length - 1}>↓</button>
                  <button type="button" title="Delete row" className="cmsm__danger" onClick={deleteRow(ri)}>Delete</button>
                </div>
              </div>
              <div className="cmsg-row__cells" style={{ gridTemplateColumns: `repeat(${row.length}, 1fr)` }}>
                {row.map((src, ci) => {
                  const idx = start + ci;
                  return (
                    <ImgCell
                      key={idx}
                      src={src}
                      onReplace={replaceAt(idx)}
                      onRemove={removeAt(idx)}
                      onLeft={moveAt(idx, -1)}
                      onRight={moveAt(idx, 1)}
                      canLeft={idx > 0}
                      canRight={idx < tail.length - 1}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <AddTile label="image" onAdd={addImage} />
      <p className="cmsc-note">Set how many columns each row uses, drag order with the ◀ ▶ arrows, and reorder or delete whole rows. The first single-column row becomes the testimonial billboard on the live case page.</p>
    </div>
  );
}
