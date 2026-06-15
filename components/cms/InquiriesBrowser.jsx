import { useEffect, useRef, useState } from "react";

const STATUS_LABEL = { new: "New", replied: "Replied", booked: "Booked", archived: "Archived" };
const TABS = ["all", "new", "replied", "booked"];

function initials(name) {
  return (name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}
function ticketNo(id) {
  return "#" + String(id).replace(/-/g, "").slice(0, 5).toUpperCase();
}

function Toolbar({ editorRef }) {
  const exec = (cmd, arg) => (e) => {
    e.preventDefault();
    editorRef.current && editorRef.current.focus();
    document.execCommand(cmd, false, arg);
  };
  const addLink = (e) => {
    e.preventDefault();
    const url = window.prompt("Link URL");
    if (url) { editorRef.current && editorRef.current.focus(); document.execCommand("createLink", false, url); }
  };
  return (
    <div className="cmsq__toolbar" role="toolbar" aria-label="Formatting">
      <button type="button" onMouseDown={exec("bold")} title="Bold"><b>B</b></button>
      <button type="button" onMouseDown={exec("italic")} title="Italic"><i>I</i></button>
      <button type="button" onMouseDown={exec("underline")} title="Underline"><u>U</u></button>
      <button type="button" onMouseDown={exec("strikeThrough")} title="Strikethrough"><s>S</s></button>
      <i className="cmsq__toolbar-sep" />
      <button type="button" onMouseDown={exec("insertUnorderedList")} title="Bulleted list">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 6h12M9 12h12M9 18h12" /><circle cx="4" cy="6" r="1.2" fill="currentColor" stroke="none" /><circle cx="4" cy="12" r="1.2" fill="currentColor" stroke="none" /><circle cx="4" cy="18" r="1.2" fill="currentColor" stroke="none" /></svg>
      </button>
      <button type="button" onMouseDown={exec("insertOrderedList")} title="Numbered list">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 6h11M10 12h11M10 18h11M4 5l1.5-1v5M3.8 11.6a1.5 1.5 0 0 1 2.7.9c0 .8-.7 1.2-2.7 2.5h3M3.5 16.5h2a1.25 1.25 0 0 1 0 2.5h-1 1a1.25 1.25 0 0 1 0 2.5h-2" /></svg>
      </button>
      <button type="button" onMouseDown={exec("formatBlock", "blockquote")} title="Quote">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M7.2 6C5 7.5 3.6 9.6 3.6 12.4c0 3 1.8 4.9 4 4.9 1.9 0 3.3-1.4 3.3-3.2 0-1.8-1.3-3-3-3-.3 0-.7 0-.8.1.3-1.6 1.6-3.2 3-4L7.2 6Zm9 0c-2.2 1.5-3.6 3.6-3.6 6.4 0 3 1.8 4.9 4 4.9 1.9 0 3.3-1.4 3.3-3.2 0-1.8-1.3-3-3-3-.3 0-.7 0-.8.1.3-1.6 1.6-3.2 3-4L16.2 6Z" /></svg>
      </button>
      <button type="button" onMouseDown={addLink} title="Insert link">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.1M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.1" /></svg>
      </button>
      <i className="cmsq__toolbar-sep" />
      <button type="button" onMouseDown={exec("removeFormat")} title="Clear formatting">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 5h12M9 5l3.5 14M7 19h6" /><path d="m16 14 5 5M21 14l-5 5" /></svg>
      </button>
    </div>
  );
}

export default function InquiriesBrowser({ inquiries, loading = false, error = null, onPatch, onReply }) {
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [mobileDetail, setMobileDetail] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [busy, setBusy] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [replyError, setReplyError] = useState(false);
  const editorRef = useRef(null);
  const noteRef = useRef(null);

  useEffect(() => {
    setShowInfo(window.matchMedia("(min-width: 1400px)").matches);
  }, []);

  useEffect(() => {
    if (!inquiries.length) { setSelectedId(null); return; }
    setSelectedId((cur) => (inquiries.some((q) => q.id === cur) ? cur : inquiries[0].id));
  }, [inquiries]);

  const counts = { all: 0 };
  for (const t of [...TABS.slice(1), "archived"]) counts[t] = inquiries.filter((q) => q.status === t).length;
  counts.all = inquiries.length - counts.archived;

  let visible = tab === "all"
    ? inquiries.filter((q) => q.status !== "archived")
    : inquiries.filter((q) => q.status === tab);
  if (query.trim()) {
    const q = query.trim().toLowerCase();
    visible = visible.filter((x) =>
      x.name.toLowerCase().includes(q) || x.business.toLowerCase().includes(q) || x.service.toLowerCase().includes(q)
    );
  }
  const selected = inquiries.find((q) => q.id === selectedId) || null;

  const emptyMsg = loading ? "Loading inquiries…" : error ? error : "No tickets yet.";

  async function setStatus(status) {
    if (!selected || busy) return;
    setBusy(true);
    try { await onPatch(selected.id, { status }); } finally { setBusy(false); }
  }

  async function saveNote() {
    if (!selected || busy) return;
    setBusy(true);
    try {
      await onPatch(selected.id, { note: noteRef.current ? noteRef.current.value : "" });
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2000);
    } finally { setBusy(false); }
  }

  async function sendReply() {
    if (!selected || busy) return;
    const text = (editorRef.current ? editorRef.current.innerText : "").trim();
    if (!text) return;
    setReplyError(false);
    setBusy(true);
    try {
      await onReply(selected.id, text);
      if (editorRef.current) editorRef.current.innerHTML = "";
    } catch (_e) {
      setReplyError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={"cmsq-app" + (mobileDetail ? " is-detail" : "") + (showInfo ? " has-info" : "")}>
      {/* ===== tickets column (fused to the nav rail) ===== */}
      <div className="cmsq__list-pane">
        <header className="cmsq__list-head">
          <h1>Inquiries</h1>
          <span>{counts.new} new · {counts.all} total</span>
        </header>
        <div className="cmsq__filter">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input
            type="search" placeholder="Filter tickets…"
            value={query} onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="cmsq__tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t} type="button" role="tab"
              className={"cmsq__tab" + (tab === t ? " is-active" : "")}
              aria-selected={tab === t}
              onClick={() => setTab(t)}
            >
              {t === "all" ? "All" : STATUS_LABEL[t]}
              <em>{counts[t]}</em>
            </button>
          ))}
        </div>
        <ul className="cmsq__list" data-lenis-prevent>
          {visible.map((q) => (
            <li key={q.id}>
              <button
                type="button"
                className={"cmsq__row" + (selected && q.id === selected.id ? " is-active" : "") + (q.status === "new" ? " is-new" : "")}
                onClick={() => { setSelectedId(q.id); setMobileDetail(true); }}
              >
                <span className="cmsq__row-avatar">{initials(q.name)}</span>
                <span className="cmsq__row-main">
                  <span className="cmsq__row-top">
                    <strong>{q.name}</strong>
                    <time>{q.date}</time>
                  </span>
                  <span className="cmsq__row-biz">{q.business} · {q.service}</span>
                  <span className="cmsq__row-preview">{q.message}</span>
                </span>
              </button>
            </li>
          ))}
          {!visible.length && <li className="cmsq__empty">{tab === "all" && !query.trim() ? emptyMsg : "No matching tickets."}</li>}
        </ul>
        <button
          type="button"
          className={"cmsq__archived" + (tab === "archived" ? " is-active" : "")}
          onClick={() => setTab(tab === "archived" ? "all" : "archived")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5h18v4H3V5Zm1 4h16v10H4V9Zm6 4h4" /></svg>
          {tab === "archived" ? "Back to inbox" : `Archived`}
          <em>{counts.archived}</em>
        </button>
      </div>

      {/* ===== ticket workspace ===== */}
      {selected ? (
        <article className="cmsq__detail" key={selected.id} data-lenis-prevent>
          <header className="cmsq__head">
            <button type="button" className="cmsq__back" onClick={() => setMobileDetail(false)} aria-label="Back to tickets">←</button>
            <span className="cmsq__row-avatar cmsq__head-avatar">{initials(selected.name)}</span>
            <div className="cmsq__head-title">
              <h2>{selected.name} <em>{ticketNo(selected.id)}</em></h2>
              <p>{selected.business} · via {selected.source}</p>
            </div>
            <div className="cmsq__head-actions">
              <button type="button" className="cms__btn-ghost cmsq__action" onClick={() => setStatus("booked")} disabled={busy || selected.status === "booked"}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 13 4 4L19 7" /></svg>
                {selected.status === "booked" ? "Booked" : "Mark booked"}
              </button>
              <button type="button" className="cms__btn-ghost cmsq__action" onClick={() => setStatus(selected.status === "archived" ? "new" : "archived")} disabled={busy}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5h18v4H3V5Zm1 4h16v10H4V9Zm6 4h4" /></svg>
                {selected.status === "archived" ? "Unarchive" : "Archive"}
              </button>
              <button
                type="button"
                className={"cmsq__iconbtn" + (showInfo ? " is-on" : "")}
                title="Details"
                aria-pressed={showInfo}
                onClick={() => setShowInfo(!showInfo)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8v.01" /></svg>
              </button>
            </div>
          </header>

          <div className="cmsq__work">
            <div className="cmsq__thread">
              {(() => {
                const msgs = selected.thread || [{ from: "customer", date: selected.date, time: selected.time, text: selected.message }];
                const out = [];
                let lastDate = null;
                msgs.forEach((m, i) => {
                  if (m.date !== lastDate) {
                    out.push(<div className="cmsq__daysep" key={`d${i}`}><span>{m.date}</span></div>);
                    lastDate = m.date;
                  }
                  const prev = msgs[i - 1];
                  const cont = prev && prev.from === m.from && prev.date === m.date;
                  const team = m.from === "team";
                  out.push(
                    <div className={"cmsq__msg" + (team ? " cmsq__msg--team" : "") + (cont ? " is-cont" : "")} key={i}>
                      <div className="cmsq__msg-aside">
                        {!cont && (team
                          ? <span className="cmsq__row-avatar cmsq__row-avatar--je"><img src="/assets/img/logo-white.webp" alt="JE" width="17" height="16" /></span>
                          : <span className="cmsq__row-avatar">{initials(selected.name)}</span>)}
                      </div>
                      <div className="cmsq__msg-body">
                        {!cont && (
                          <header>
                            <strong>{team ? (m.agent || "Jeremy Ellsworth") : selected.name}</strong>
                            {team && m.auto && <span className="cmsq__ai-badge">AI</span>}
                          </header>
                        )}
                        <div className="cmsq__bubble" style={{ animationDelay: `${Math.min(i, 10) * 0.03}s` }}>
                          {m.text}
                          <span className="cmsq__msg-stamp">{m.time}</span>
                        </div>
                      </div>
                    </div>
                  );
                });
                const last = msgs[msgs.length - 1];
                if (last && last.from === "team") {
                  out.push(
                    <div className="cmsq__status" key="status">
                      Sent · {last.time}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m2 13 4 4 8-9" /><path d="m13 17 8-9" /></svg>
                    </div>
                  );
                }
                return out;
              })()}
            </div>
          </div>

          <div className="cmsq__dock">
            <div className="cmsq__composer">
              <div className="cmsq__composer-to">
                <span>Reply to</span>
                <em>{selected.email}</em>
              </div>
              <Toolbar editorRef={editorRef} />
              <div
                ref={editorRef}
                className="cmsq__editor"
                contentEditable
                suppressContentEditableWarning
                data-lenis-prevent
                role="textbox"
                aria-multiline="true"
                data-placeholder={`Hi ${selected.name.split(" ")[0]},`}
              />
              <footer className="cmsq__composer-foot">
                <div className="cmsq__composer-left">
                  <span className={"cmsq__draft-hint" + (replyError ? " is-error" : "")}>
                    {replyError ? "Couldn't send — check the email setup and try again." : "Sends an email to the customer and logs it here"}
                  </span>
                </div>
                <div className="cmsq__composer-right">
                  <button type="button" className="btn btn--sm btn--solid" onClick={sendReply} disabled={busy}><span>{busy ? "Sending…" : "Send reply"}</span></button>
                </div>
              </footer>
            </div>
          </div>
        </article>
      ) : (
        <div className="cmsq__detail cmsq__detail--empty">
          <p>{loading ? "Loading inquiries…" : error ? error : inquiries.length ? "Select a ticket to open it here." : "No inquiries yet. Submissions from the website contact form will appear here."}</p>
        </div>
      )}

      {selected && showInfo ? (
        <aside className="cmsq__info" data-lenis-prevent>
          <header className="cmsq__info-head">
            <span>Details</span>
            <button type="button" className="cmsq__iconbtn" onClick={() => setShowInfo(false)} aria-label="Close details">✕</button>
          </header>

          <div className="cmsq__info-person">
            <span className="cmsq__row-avatar">{initials(selected.name)}</span>
            <strong>{selected.name}</strong>
            <span>{selected.business}</span>
          </div>

          <div className="cmsq__info-group">
            <span className="cms-geo__label">Contact</span>
            <dl>
              <div><dt>Email</dt><dd><a href={`mailto:${selected.email}`}>{selected.email}</a></dd></div>
              <div><dt>Phone</dt><dd><a href={`tel:${selected.phone}`}>{selected.phone}</a></dd></div>
            </dl>
          </div>

          <div className="cmsq__info-group">
            <span className="cms-geo__label">Inquiry</span>
            <dl>
              <div><dt>Interested in</dt><dd>{selected.service}</dd></div>
              <div><dt>Budget</dt><dd>{selected.budget}</dd></div>
              <div><dt>Received</dt><dd>{selected.date} · {selected.time}</dd></div>
              <div><dt>Source</dt><dd>{selected.source}</dd></div>
              <div><dt>Status</dt><dd><span className={"cms-chip cms-chip--" + selected.status}>{STATUS_LABEL[selected.status]}</span></dd></div>
            </dl>
          </div>

          <div className="cmsq__info-group">
            <span className="cms-geo__label">Internal note</span>
            <textarea key={selected.id} ref={noteRef} rows={4} placeholder="Notes only your team can see…" defaultValue={selected.note || ""} />
            <button type="button" className="cms__btn-ghost cmsq__info-save" onClick={saveNote} disabled={busy}>{noteSaved ? "Saved ✓" : "Save note"}</button>
          </div>
        </aside>
      ) : null}
    </div>
  );
}
