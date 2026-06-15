import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";

const FALLBACKS = [
  "Here's the honest version: most businesses don't lose customers because their work is bad — they lose them because nobody remembers their name. That's fixable in 2–3 weeks. Click \"Get a Quote\" in the header and tell us about your business.",
  "Fair enough — but think about the last contractor truck you actually remembered. That's what a real brand buys you, and it's exactly what we've done for 8,000+ businesses over 20 years. The quote form takes two minutes.",
  "I'll leave you with this: your competitors are getting calls today because they look established — not because they're better. When you're ready, the free consultation calendar on the homepage has open slots this week.",
];

const CONCIERGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/concierge`;
const AUTH_HEADERS = {
  "content-type": "application/json",
  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

// Turn any URLs in a message into clickable links. Trailing punctuation is
// kept out of the href so links like "...get-started." still work.
function linkify(text) {
  const str = String(text || "");
  const re = /https?:\/\/[^\s]+/g;
  const out = [];
  let last = 0;
  let key = 0;
  let m;
  while ((m = re.exec(str)) !== null) {
    if (m.index > last) out.push(str.slice(last, m.index));
    let url = m[0];
    let trail = "";
    const tm = url.match(/[.,!?;:)\]]+$/);
    if (tm) { trail = tm[0]; url = url.slice(0, -trail.length); }
    out.push(
      <a key={key++} href={url} target="_blank" rel="noopener noreferrer" className="letter__link">{url}</a>,
    );
    if (trail) out.push(trail);
    last = m.index + m[0].length;
  }
  if (last < str.length) out.push(str.slice(last));
  return out;
}

function getVisitorId() {
  try {
    let id = localStorage.getItem("je-visitor-id");
    if (!id) {
      id = (crypto.randomUUID && crypto.randomUUID()) || `v-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem("je-visitor-id", id);
    }
    return id;
  } catch (e) {
    return `v-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

export default function Concierge() {
  const [mounted, setMounted] = useState(false);
  const [hasNotif, setHasNotif] = useState(false);
  const [newReply, setNewReply] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [letterOpen, setLetterOpen] = useState(false);
  const [thread, setThread] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [agent, setAgent] = useState(null);
  const fallbackIdx = useRef(0);
  const wrapRef = useRef(null);
  const threadRef = useRef(null);
  const visitorId = useRef(null);

  useEffect(() => {
    setMounted(true);
    visitorId.current = getVisitorId();

    let active = true;
    (async () => {
      try {
        const res = await fetch(CONCIERGE_URL, {
          method: "POST",
          headers: AUTH_HEADERS,
          body: JSON.stringify({ action: "load", visitorId: visitorId.current }),
        });
        const data = await res.json();
        if (!active) return;
        if (Array.isArray(data.thread) && data.thread.length) {
          setThread(data.thread);
          if (data.agent) setAgent(data.agent);
          // They have an unanswered reply waiting — light up the bell as new.
          if (data.hasUnseen) { setHasNotif(true); setNewReply(true); }
          return;
        }
      } catch (e) { /* fall through to first-visit behavior */ }
      // No saved conversation: keep the original first-visit letter prompt.
      if (!active) return;
      try {
        if (!sessionStorage.getItem("je-letter-seen")) setHasNotif(true);
      } catch (e) { setHasNotif(true); }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!dropOpen) return;
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [dropOpen]);

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [thread, busy, connecting]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setLetterOpen(false); };
    if (letterOpen) {
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }
  }, [letterOpen]);

  function openLetter() {
    setDropOpen(false);
    setLetterOpen(true);
    setHasNotif(false);
    setNewReply(false);
    try { sessionStorage.setItem("je-letter-seen", "1"); } catch (e) {}
    markSeen();
  }

  async function markSeen() {
    if (!visitorId.current) return;
    try {
      await fetch(CONCIERGE_URL, {
        method: "POST",
        headers: AUTH_HEADERS,
        body: JSON.stringify({ action: "seen", visitorId: visitorId.current }),
      });
    } catch (e) { /* non-critical */ }
  }

  async function send(e, preset) {
    if (e) e.preventDefault();
    const text = (preset || input).trim();
    if (!text || busy || connecting) return;
    const next = [...thread, { role: "user", text }];
    setThread(next);
    setInput("");

    const isFirst = !agent;
    const who = agent || "Robert";

    // Fetch the reply immediately, in parallel with the human-like pacing below.
    const replyPromise = (async () => {
      try {
        const res = await fetch(CONCIERGE_URL, {
          method: "POST",
          headers: AUTH_HEADERS,
          body: JSON.stringify({ messages: next, visitorId: visitorId.current, agent: who }),
        });
        const data = await res.json();
        return data.reply || null;
      } catch (err) {
        return null;
      }
    })();

    if (isFirst) {
      // First message: 5s "connecting" before Robert joins the chat.
      setConnecting(true);
      await new Promise((r) => setTimeout(r, 5000));
      setAgent(who);
      setThread((t) => [...t, { role: "system", text: `${who} has joined the chat` }]);
      setConnecting(false);
    }
    // Wait ~5s before Robert starts typing (every message).
    await new Promise((r) => setTimeout(r, 5000));

    // Typing bubble shows for ~10s before the reply lands.
    setBusy(true);
    const [fetched] = await Promise.all([replyPromise, new Promise((r) => setTimeout(r, 10000))]);

    let reply = fetched;
    if (!reply) {
      reply = FALLBACKS[Math.min(fallbackIdx.current, FALLBACKS.length - 1)];
      fallbackIdx.current += 1;
    }
    setThread((t) => [...t, { role: "assistant", text: reply, agent: who }]);
    setBusy(false);
    // The reply is on screen now, so clear the unseen flag server-side.
    markSeen();
  }

  return (
    <>
      {/* profile icon -> future customer portal */}
      <Link className="hicon" to="/login" aria-label="Client portal sign in" data-cursor="hover">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-3.6 4.5-5.5 8-5.5s6.5 1.9 8 5.5" /></svg>
      </Link>

      {/* notification bell */}
      <div className="notif" ref={wrapRef}>
        <button
          className={"hicon" + (dropOpen ? " is-open" : "")}
          aria-label={hasNotif ? "Notifications (1 unread)" : "Notifications"}
          aria-expanded={dropOpen}
          onClick={(e) => { e.stopPropagation(); setDropOpen(!dropOpen); }}
          data-cursor="hover"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 9a6 6 0 1 0-12 0c0 6-2.5 7-2.5 7h17S18 15 18 9" /><path d="M10.3 20a2 2 0 0 0 3.4 0" /></svg>
          {hasNotif && <span className="hicon__badge">1</span>}
        </button>
        <div className={"notif__menu" + (dropOpen ? " is-open" : "")} aria-hidden={!dropOpen}>
          <span className="notif__label">Notifications</span>
          <button className="notif__item" onClick={openLetter}>
            <span className="notif__dot" aria-hidden="true"></span>
            <span className="notif__body">
              {newReply ? (
                <>
                  <strong>{agent ? `${agent} replied` : "New reply"}</strong>
                  <em>Pick up where you left off · just now</em>
                </>
              ) : (
                <>
                  <strong>Are you ready?</strong>
                  <em>A letter from je.design · just now</em>
                </>
              )}
            </span>
          </button>
        </div>
      </div>

      {/* the letter — portaled to body so the fixed header's backdrop-filter can't trap it */}
      {mounted && letterOpen && createPortal(
        <div className="letter" role="dialog" aria-modal="true" aria-label="A letter from je.design">
          <div className="letter__backdrop" onClick={() => setLetterOpen(false)} />
          <div className="letter__card">
            <div className="letter__bar">
              <span className="letter__avatar"><img src="/assets/img/logo-white.webp" alt="" width="20" height="19" /></span>
              <strong className="letter__title">Inbox</strong>
              <button className="letter__close" onClick={() => setLetterOpen(false)} aria-label="Close letter">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
              </button>
            </div>
            <div className="letter__status"><i></i>{agent ? `${agent} · brand consultant` : "Online — usually replies in seconds"}</div>
            <div className="letter__scroll" ref={threadRef} data-lenis-prevent="true">
              <div className="letter__letterbody">
                <p className="letter__greeting">Are you ready?</p>
                <p>You found your way here, which tells me something: you already suspect your business deserves to look better than it does.</p>
                <p>Twenty years has taught us this — businesses rarely fail because the work is bad. They fail because nobody <i>remembers</i> them. The competitor with the sharper truck and the cleaner logo gets the call first, every time.</p>
                <p>So this is the fork in the road. Close this letter and nothing changes — or write back, tell us what you're building, and find out what happens when your brand works as hard as you do.</p>
                <p className="letter__sign">— je.design</p>
              </div>
              {thread.map((m, i) =>
                m.role === "system" ? (
                  <div key={i} className="letter__sys"><span>{m.text}</span></div>
                ) : (
                  <div key={i} className={"letter__msg" + (m.role === "user" ? " letter__msg--user" : "")}>{linkify(m.text)}</div>
                )
              )}
              {connecting && <div className="letter__sys letter__sys--live"><span>Hang tight while we connect you with the team…</span></div>}
              {busy && (
                <div className="letter__typingwrap">
                  {agent && <span className="letter__typinglabel">{agent} is typing</span>}
                  <div className="letter__msg letter__typing"><span></span><span></span><span></span></div>
                </div>
              )}
            </div>
            {thread.length === 0 && !busy && !connecting && (
              <div className="letter__chips">
                <button onClick={(e) => send(null, "I need a logo for my business.")}>I need a logo</button>
                <button onClick={(e) => send(null, "I want my truck wrapped.")}>Wrap my truck</button>
                <button onClick={(e) => send(null, "I need the whole brand — logo, wrap, website.")}>The whole brand</button>
                <button onClick={(e) => send(null, "Honestly, I'm just browsing.")}>Just browsing 👀</button>
              </div>
            )}
            <form className="letter__form" onSubmit={send}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Write back…"
                aria-label="Your reply"
              />
              <button type="submit" className="letter__send" aria-label="Send reply" disabled={busy || connecting}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
