import { useEffect, useRef, useState } from "react";
import {
  sendAssistant, fetchAssistantActions, threadToBubbles,
  listConversations, loadConversation, createConversation, saveConversation,
  deleteConversation, titleFromMessages,
} from "@/lib/assistantApi";

const SUGGESTIONS = [
  { text: "Read the reviews at this URL and add them: (paste your Google Business profile link)" },
  { text: "Add a new service for vehicle wraps" },
  { text: "Update the home page hero headline" },
  { text: "Write an FAQ about turnaround times" },
];

const ENTITY_LABEL = {
  review: "Review", project: "Project", service: "Service", faq: "FAQ",
  page_content: "Page copy", media: "Media",
};

function timeAgo(iso) {
  const d = new Date(iso).getTime();
  const s = Math.round((Date.now() - d) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(iso).toLocaleDateString();
}

function ChatIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 10h8M8 14h5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}
function IconClose() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>;
}
function IconActivity() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>;
}
function IconPlus() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>;
}
function IconTrash() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></svg>;
}

export default function Assistant() {
  const [messages, setMessages] = useState([]);
  const [actions, setActions] = useState([]);
  const [log, setLog] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const [conversations, setConversations] = useState([]);
  const [currentConvId, setCurrentConvId] = useState(null);

  const scrollRef = useRef(null);
  const taRef = useRef(null);

  const bubbles = threadToBubbles(messages);

  function autoGrow() {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }

  function refreshConversations() {
    listConversations().then(setConversations).catch(() => {});
  }

  useEffect(() => {
    let active = true;
    fetchAssistantActions(20).then((rows) => { if (active) setLog(rows); }).catch(() => {});
    refreshConversations();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [bubbles.length, sending]);

  async function send(text) {
    const t = text.trim();
    if (!t || sending) return;
    setError(null);
    setInput("");
    if (taRef.current) taRef.current.style.height = "auto";
    const next = [...messages, { role: "user", content: [{ type: "text", text: t }] }];
    setMessages(next);
    setSending(true);
    try {
      const res = await sendAssistant(next);
      setMessages(res.messages);
      if (res.actions.length) {
        setActions((a) => [...a, ...res.actions]);
        fetchAssistantActions(20).then(setLog).catch(() => {});
      }
      if (res.error) setError(res.error);

      const title = titleFromMessages(res.messages);
      try {
        if (currentConvId) {
          await saveConversation(currentConvId, res.messages, title);
        } else {
          const conv = await createConversation(res.messages, title);
          setCurrentConvId(conv.id);
        }
        refreshConversations();
      } catch { /* persistence is best-effort */ }
    } catch (e) {
      setError(e.message || "Something went wrong reaching the assistant.");
    } finally {
      setSending(false);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    send(input);
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  function newChat() {
    setCurrentConvId(null);
    setMessages([]);
    setActions([]);
    setInput("");
    setError(null);
  }

  async function openConversation(id) {
    try {
      const conv = await loadConversation(id);
      if (!conv) { refreshConversations(); return; }
      setCurrentConvId(id);
      setMessages(Array.isArray(conv.messages) ? conv.messages : []);
      setActions([]);
      setError(null);
    } catch (e) {
      setError(e.message || "Could not open that chat.");
    }
  }

  async function removeConversation(id) {
    try {
      await deleteConversation(id);
      setConversations((c) => c.filter((x) => x.id !== id));
      if (id === currentConvId) newChat();
    } catch (e) {
      setError(e.message || "Could not delete that chat.");
    }
  }

  const canSend = !sending && input.trim();

  return (
    <div className="cms-asst">
      <div className="cms-asst__bar">
        <div className="cms-asst__bar-id">
          <span className="cms-asst__eyebrow">Studio Assistant</span>
          <span className="cms-asst__live" title="Connected to your site"><i></i></span>
        </div>
        <button
          type="button"
          className={"cms-asst__activity-btn" + (panelOpen ? " is-active" : "")}
          onClick={() => setPanelOpen((o) => !o)}
          aria-pressed={panelOpen}
        >
          <IconActivity />
          <span>Activity</span>
          {actions.length > 0 && <em>{actions.length}</em>}
        </button>
      </div>

      <div className="cms-asst__body">
        <aside className="cms-asst__tools">
          <div className="cms-asst__convos">
            <button type="button" className="cms-asst__newchat" onClick={newChat}>
              <IconPlus /><span>New chat</span>
            </button>
            <span className="cms-asst__convo-label">Conversations</span>
            <div className="cms-asst__convo-list">
              {conversations.length === 0 ? (
                <p className="cms-asst__convo-empty">No saved chats yet. Start a conversation and it'll appear here.</p>
              ) : (
                conversations.map((c) => (
                  <div key={c.id} className={"cms-asst__convo" + (c.id === currentConvId ? " is-active" : "")}>
                    <button type="button" className="cms-asst__convo-open" onClick={() => openConversation(c.id)}>
                      <span className="cms-asst__convo-title">{c.title}</span>
                      <em>{timeAgo(c.updated_at)}</em>
                    </button>
                    <button type="button" className="cms-asst__convo-del" onClick={() => removeConversation(c.id)} aria-label="Delete chat"><IconTrash /></button>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        <div className="cms-asst__main">
          <div className="cms-asst__scroll" ref={scrollRef}>
            <div className="cms-asst__feed">
              {bubbles.length === 0 ? (
                <div className="cms-asst__intro">
                  <div className="cms-asst__intro-badge"><ChatIcon size={22} /></div>
                  <h2>What can I help you build?</h2>
                  <p>I can add and edit reviews, projects, services, FAQs and page copy, and read reviews from a URL you paste. I always confirm before saving anything.</p>
                  <div className="cms-asst__chips">
                    {SUGGESTIONS.map((s) => (
                      <button key={s.text} type="button" className="cms-asst__chip" onClick={() => setInput(s.text)}>
                        <span className="cms-asst__chip-ic"><ChatIcon size={14} /></span>
                        <span>{s.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                bubbles.map((b, i) => (
                  <div key={i} className={"cms-asst__msg cms-asst__msg--" + b.role}>
                    <span className="cms-asst__who">{b.role === "user" ? "You" : "Assistant"}</span>
                    {b.text?.trim() ? <div className="cms-asst__bubble">{b.text}</div> : null}
                  </div>
                ))
              )}
              {sending && (
                <div className="cms-asst__msg cms-asst__msg--assistant">
                  <span className="cms-asst__who">Assistant</span>
                  <div className="cms-asst__bubble cms-asst__typing"><i></i><i></i><i></i></div>
                </div>
              )}
            </div>
          </div>

          <div className="cms-asst__floater">
            <div className="cms-asst__floater-inner">
              {error ? <p className="cms-asst__error">{error}</p> : null}
              <form className="cms-asst__composer" onSubmit={onSubmit}>
                <div className="cms-asst__inputwrap">
                  <textarea
                    className="cms-asst__input"
                    ref={taRef}
                    placeholder="Ask me to add or edit content…"
                    value={input}
                    rows={1}
                    onChange={(e) => { setInput(e.target.value); autoGrow(); }}
                    onKeyDown={onKeyDown}
                    disabled={sending}
                  />
                </div>
                <div className="cms-asst__composer-foot">
                  <span className="cms-asst__mode-tag"><ChatIcon size={13} />Text</span>
                  <button type="submit" className="cms-asst__round cms-asst__round--send" disabled={!canSend} aria-label="Send">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 2 11 13" /><path d="M22 2 15 22 11 13 2 9l20-7Z" />
                    </svg>
                  </button>
                </div>
              </form>
              <p className="cms-asst__hint">Enter to send · Shift + Enter for a new line</p>
            </div>
          </div>
        </div>
      </div>

      {panelOpen && <button type="button" className="cms-asst__scrim" aria-label="Close panel" onClick={() => setPanelOpen(false)} />}
      <aside className={"cms-asst__panel" + (panelOpen ? " is-open" : "")}>
        <header className="cms-asst__panel-head">
          <h2>Activity</h2>
          <button type="button" className="cms-asst__panel-close" onClick={() => setPanelOpen(false)} aria-label="Close"><IconClose /></button>
        </header>
        <div className="cms-asst__panel-body">
          {actions.length > 0 && (
            <div className="cms-asst__session">
              <span className="cms-asst__session-label">This conversation</span>
              <ul className="cms-asst__actions">
                {actions.map((a, i) => (
                  <li key={i}>
                    <span className={"cms-asst__tag cms-asst__tag--" + a.entity}>{ENTITY_LABEL[a.entity] || a.entity}</span>
                    <span>{a.summary}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <span className="cms-asst__session-label">Recent activity</span>
          {log.length === 0 ? (
            <p className="cms-dash__empty">Nothing yet. Changes the assistant makes will be logged here.</p>
          ) : (
            <ul className="cms-asst__actions">
              {log.map((a) => (
                <li key={a.id}>
                  <span className={"cms-asst__tag cms-asst__tag--" + a.entity}>{ENTITY_LABEL[a.entity] || a.entity}</span>
                  <span>{a.summary}</span>
                  <em className="cms-asst__when">{timeAgo(a.created_at)}</em>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
