/* Shared CMS building blocks — server-renderable, no client JS.
   Inputs are uncontrolled (defaultValue) so they're typeable in the design
   preview; wire onChange/persistence when hooking up a backend. */

import { useRef, useState } from "react";
import { uploadMedia } from "@/lib/contentApi";

function ytId(url) {
  if (!url) return "";
  const m = String(url).match(/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/)([\w-]{6,})/);
  return m ? m[1] : "";
}
function isUploadUrl(v) {
  return typeof v === "string" && v.includes("/storage/v1/object/");
}

export function VideoField({ label, value, hint, onChange }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const upload = isUploadUrl(value);
  const vid = upload ? "" : ytId(value);
  const hasPreview = upload || vid;

  async function pick(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setBusy(true);
    setErr(null);
    try {
      const url = await uploadMedia(file);
      onChange(url);
    } catch (e2) {
      setErr(e2.message || "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <label className="cmsc-field">
      <span className="cmsc-field__label">{label}</span>
      <div className="cmsc-mediafield">
        <div className={"cmsc-mediafield__preview" + (hasPreview ? "" : " is-empty")}>
          {upload
            ? <video src={value} controls preload="metadata" />
            : vid
              ? <span className="cmsc-mediafield__play"><img src={`https://i.ytimg.com/vi/${vid}/hqdefault.jpg`} alt="" loading="lazy" /><i aria-hidden="true">▶</i></span>
              : <span className="cmsc-mediafield__empty">No video yet</span>}
        </div>
        <div className="cmsc-mediafield__row">
          <input
            type="text"
            placeholder="https://www.youtube.com/watch?v=…"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
          <button type="button" className="cms__btn-ghost" disabled={busy} onClick={() => inputRef.current?.click()}>
            {busy ? "Uploading…" : upload ? "Replace" : "Upload"}
          </button>
          {value ? <button type="button" className="cms__btn-ghost cmsm__danger" onClick={() => onChange("")}>Remove</button> : null}
          <input ref={inputRef} type="file" accept="video/*" hidden onChange={pick} />
        </div>
      </div>
      {err ? <span className="cmsc-field__hint" style={{ color: "#c0392b" }}>{err}</span> : null}
      {hint ? <span className="cmsc-field__hint">{hint}</span> : null}
    </label>
  );
}

export function ImageField({ label, value, hint, half, onChange }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  async function pick(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setBusy(true);
    setErr(null);
    try {
      const url = await uploadMedia(file);
      onChange(url);
    } catch (e2) {
      setErr(e2.message || "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <label className={"cmsc-field" + (half ? " cmsc-field--half" : "")}>
      <span className="cmsc-field__label">{label}</span>
      <div className="cmsc-mediafield">
        <div className={"cmsc-mediafield__preview cmsc-mediafield__preview--img" + (value ? "" : " is-empty")}>
          {value
            ? <img src={value} alt="" loading="lazy" />
            : <span className="cmsc-mediafield__empty">No image yet</span>}
        </div>
        <div className="cmsc-mediafield__row">
          <input
            type="text"
            placeholder="/assets/img/… or paste a URL"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
          <button type="button" className="cms__btn-ghost" disabled={busy} onClick={() => inputRef.current?.click()}>
            {busy ? "Uploading…" : value ? "Replace" : "Upload"}
          </button>
          {value ? <button type="button" className="cms__btn-ghost cmsm__danger" onClick={() => onChange("")}>Remove</button> : null}
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={pick} />
        </div>
      </div>
      {err ? <span className="cmsc-field__hint" style={{ color: "#c0392b" }}>{err}</span> : null}
      {hint ? <span className="cmsc-field__hint">{hint}</span> : null}
    </label>
  );
}

export function CmsTopbar({ title, subtitle, action }) {
  return (
    <header className="cms__topbar">
      <div>
        <h1 className="cms__title">{title}</h1>
        {subtitle ? <p className="cms__subtitle">{subtitle}</p> : null}
      </div>
      <div className="cms__topbar-actions">
        {action}
        <span className="cms__avatar" title="Jeremy Ellsworth"><img src="/assets/img/logo-white.webp" alt="JE" width="22" height="21" /></span>
      </div>
    </header>
  );
}

export function Field({ label, value, placeholder, textarea, rows = 3, hint, half, onChange }) {
  const controlled = typeof onChange === "function";
  const bind = controlled
    ? { value: value ?? "", onChange: (e) => onChange(e.target.value) }
    : { defaultValue: value };
  return (
    <label className={"cmsc-field" + (half ? " cmsc-field--half" : "")}>
      <span className="cmsc-field__label">{label}</span>
      {textarea
        ? <textarea rows={rows} placeholder={placeholder} {...bind} />
        : <input type="text" placeholder={placeholder} {...bind} />}
      {hint ? <span className="cmsc-field__hint">{hint}</span> : null}
    </label>
  );
}

export function Select({ label, value, options, hint, half, onChange }) {
  const controlled = typeof onChange === "function";
  const bind = controlled
    ? { value: value ?? "", onChange: (e) => onChange(e.target.value) }
    : { defaultValue: value };
  const normalized = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  return (
    <label className={"cmsc-field" + (half ? " cmsc-field--half" : "")}>
      <span className="cmsc-field__label">{label}</span>
      <select {...bind}>
        {normalized.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {hint ? <span className="cmsc-field__hint">{hint}</span> : null}
    </label>
  );
}

export function ChipPicker({ label, options, picked = [], hint, onToggle }) {
  const controlled = typeof onToggle === "function";
  return (
    <div className="cmsc-field">
      <span className="cmsc-field__label">{label}</span>
      <div className="cmsc-chips">
        {options.map((o) => {
          const isPicked = picked.includes(o);
          const bind = controlled
            ? { checked: isPicked, onChange: () => onToggle(o) }
            : { defaultChecked: isPicked };
          return (
            <label key={o} className="cmsc-chips__chip">
              <input type="checkbox" {...bind} />
              <span>{o}</span>
            </label>
          );
        })}
      </div>
      {hint ? <span className="cmsc-field__hint">{hint}</span> : null}
    </div>
  );
}

export function FieldGrid({ children }) {
  return <div className="cmsc-grid">{children}</div>;
}

export function EditSection({ title, count, children, open }) {
  return (
    <details className="cmsc-section" open={open}>
      <summary>
        <strong>{title}</strong>
        {count ? <em>{count}</em> : null}
        <span className="faq__icon"></span>
      </summary>
      <div className="cmsc-section__body">{children}</div>
    </details>
  );
}

