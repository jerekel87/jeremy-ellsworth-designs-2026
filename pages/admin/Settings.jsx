import { CmsTopbar, Field, FieldGrid, Select } from "@/components/cms/Ui";
import { useContentDraft, useIntegrationStatus } from "@/lib/contentApi";
import { SETTINGS_DEFAULTS as DEFAULTS } from "@/lib/settingsContent";

const NAV = [
  ["business", "Business"],
  ["proof", "Social proof"],
  ["booking", "Booking"],
  ["ai", "AI behavior"],
  ["integrations", "Integrations"],
  ["options", "Site options"],
  ["seo", "SEO"],
  ["social", "Social links"],
  ["danger", "Danger zone"],
];

function Toggle({ label, hint, on, onChange }) {
  return (
    <label className="cms-switch">
      <input type="checkbox" checked={on} onChange={(e) => onChange(e.target.checked ? "on" : "off")} />
      <i></i>
      <span>
        <strong>{label}</strong>
        {hint ? <em>{hint}</em> : null}
      </span>
    </label>
  );
}

function Integration({ name, desc, status, children }) {
  return (
    <div className="cmss-integration">
      <header>
        <strong>{name}</strong>
        <span className={"cms-chip " + (status === "Connected" ? "cms-chip--live" : "cms-chip--replied")}>{status}</span>
      </header>
      <p>{desc}</p>
      {children}
    </div>
  );
}

/* Read-only display of a server-held secret. Never shows or accepts the value —
   only whether it's configured on the server. */
function SecretStatus({ label, present, half }) {
  return (
    <div className={"cmsc-secret" + (half ? " cmsc-secret--half" : "")}>
      <span className="cmsc-field__label">{label}</span>
      <div className="cmsc-secret__box">
        <span className="cmsc-secret__dots">{present ? "•••••••••••••••" : "—"}</span>
        <span className={"cmsc-secret__tag " + (present ? "cmsc-secret__tag--on" : "cmsc-secret__tag--off")}>
          {present ? "Configured on server" : "Not set"}
        </span>
      </div>
    </div>
  );
}

export default function Settings() {
  const { draft, set, dirty, loading, saving, error, save, discard } = useContentDraft(DEFAULTS);
  const { status: srv, models } = useIntegrationStatus();
  const v = (k) => draft[k];

  const modelValue = v("settings.int.anthropic_model");
  const modelOptions = (() => {
    const ids = models.map((m) => m.id);
    if (modelValue && !ids.includes(modelValue)) return [modelValue, ...ids];
    return ids;
  })();

  return (
    <>
      <CmsTopbar title="Settings" subtitle="Business details, integrations and site-wide defaults." />
      <div className="cms__content cmss">
        <nav className="cmss__nav" aria-label="Settings sections">
          {NAV.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
        </nav>

        <div className="cmss__sections">
          <section className="cms-panel cmss__panel" id="business">
            <header className="cms-panel__head"><h2>Business</h2></header>
            <div className="cmsc-section__body">
              <FieldGrid>
                <Field label="Legal name" value={v("settings.business.legal_name")} onChange={set("settings.business.legal_name")} half />
                <Field label="Brand name" value={v("settings.business.brand_name")} onChange={set("settings.business.brand_name")} half />
                <Field label="Inquiry email" value={v("settings.business.inquiry_email")} onChange={set("settings.business.inquiry_email")} half />
                <Field label="Reply-from email (Resend)" value={v("settings.business.reply_email")} onChange={set("settings.business.reply_email")} half />
                <Field label="Team size (shown in copy)" value={v("settings.business.team_size")} onChange={set("settings.business.team_size")} half />
                <Field label="Years in business (shown in copy)" value={v("settings.business.years")} onChange={set("settings.business.years")} half />
              </FieldGrid>
            </div>
          </section>

          <section className="cms-panel cmss__panel" id="proof">
            <header className="cms-panel__head"><h2>Social proof</h2></header>
            <div className="cmsc-section__body">
              <FieldGrid>
                <Field label="Aggregate rating" value={v("settings.proof.rating")} onChange={set("settings.proof.rating")} half />
                <Field label="Review badge text" value={v("settings.proof.badge")} onChange={set("settings.proof.badge")} half />
                <Field label="Success stories line" value={v("settings.proof.stories")} onChange={set("settings.proof.stories")} half />
                <Field label="Five-star brands (Brand Access)" value={v("settings.proof.brands")} onChange={set("settings.proof.brands")} half />
              </FieldGrid>
              <p className="cmsc-note">These numbers appear in the hero, the Google badge, the reviews section and the Brand Access page. Keep them honest — they're claims.</p>
            </div>
          </section>

          <section className="cms-panel cmss__panel" id="booking">
            <header className="cms-panel__head"><h2>Booking</h2></header>
            <div className="cmsc-section__body">
              <FieldGrid>
                <Field label="Cal.com link" value={v("settings.booking.cal_link")} onChange={set("settings.booking.cal_link")} hint="Powers the hero booking embed" />
                <Field label="Booking heading" value={v("settings.booking.heading")} onChange={set("settings.booking.heading")} />
                <Field label="Marker note" value={v("settings.booking.marker")} onChange={set("settings.booking.marker")} half />
              </FieldGrid>
            </div>
          </section>

          <section className="cms-panel cmss__panel" id="ai">
            <header className="cms-panel__head"><h2>AI behavior</h2></header>
            <div className="cmsc-section__body">
              <Field
                label="What Claude knows (knowledge base)"
                value={v("settings.ai.knowledge")}
                onChange={set("settings.ai.knowledge")}
                textarea
                rows={12}
                hint="The facts Claude is allowed to use — pricing, timelines, the quote/get-started link, the Brand Access payment plan, anything else. Update this whenever your business details change and the chat, auto-replies and email replies all stay in sync. Keep one fact per line so it's easy to add to later."
              />
              <p className="cmsc-note">Tip: put your get-a-quote link here (currently agreement.je.design/get-started). Claude will only share facts written in this box.</p>
              <Field
                label="Custom instructions for Claude"
                value={v("settings.ai.instructions")}
                onChange={set("settings.ai.instructions")}
                textarea
                rows={8}
                hint="Plain-language guidance on how Claude should act when replying — tone, what to emphasize, things to avoid, what to push toward. Applied on top of the built-in role across the inbox chat, the auto-reply to new inquiries, and ongoing email replies."
              />
              <p className="cmsc-note">Example: “Be warmer and less formal. Always ask what city they operate in. Never quote a price before they've described their business. Nudge toward booking a quick call once they show interest.”</p>
            </div>
          </section>

          <section className="cms-panel cmss__panel" id="integrations">
            <header className="cms-panel__head"><h2>Integrations</h2></header>
            <div className="cmsc-section__body cmss__integrations">
              <Integration name="Anthropic (Claude)" status={srv?.anthropic_key ? "Connected" : "Not connected"} desc="Powers the concierge chat and the AI email replies to inquiries.">
                <FieldGrid>
                  <SecretStatus label="API key" present={srv?.anthropic_key} half />
                  {modelOptions.length ? (
                    <Select
                      label="Model"
                      value={modelValue}
                      options={modelOptions}
                      onChange={set("settings.int.anthropic_model")}
                      half
                      hint="Pulled live from your Anthropic account. Used by the concierge chat and inquiry email replies."
                    />
                  ) : (
                    <Field
                      label="Model"
                      value={modelValue}
                      onChange={set("settings.int.anthropic_model")}
                      half
                      hint={srv?.anthropic_key ? "Could not load the model list — type a model ID, e.g. claude-sonnet-4-5." : "Add an Anthropic API key on the server to auto-load available models."}
                    />
                  )}
                </FieldGrid>
              </Integration>
              <Integration name="Resend" status={srv?.resend_key ? "Connected" : "Not connected"} desc="Sends inquiry email replies from the Inquiries workspace.">
                <FieldGrid>
                  <SecretStatus label="API key" present={srv?.resend_key} half />
                  <SecretStatus label="From address" present={srv?.resend_from} half />
                </FieldGrid>
                <p className="cmsc-note">
                  Reply-to: {srv?.resend_reply_to ? "configured" : "not set"} · Inbound webhook secret: {srv?.inbound_secret ? "configured" : "not set"}.
                  These keys live securely on the server and are never sent to the browser. To change them, update the project's server secrets.
                </p>
              </Integration>
              <Integration name="Cal.com" status="Connected" desc="The booking calendar embedded in the home hero.">
                <p className="cmsc-note">The booking link is configured in the site code (Cal.com embed). This field is informational only.</p>
                <FieldGrid>
                  <Field label="Username / event" value={v("settings.int.cal_user")} onChange={set("settings.int.cal_user")} half />
                </FieldGrid>
              </Integration>
              <Integration name="Analytics" status={v("settings.int.analytics_provider") ? "Configured" : "Not configured"} desc="Reference for the analytics provider used on the dashboard.">
                <p className="cmsc-note">Stored for reference. Dashboard analytics are not yet wired to a live provider.</p>
                <FieldGrid>
                  <Field label="Provider" value={v("settings.int.analytics_provider")} onChange={set("settings.int.analytics_provider")} half hint="e.g. Plausible, GA4, Vercel Analytics" />
                  <Field label="Site ID / key" value={v("settings.int.analytics_id")} onChange={set("settings.int.analytics_id")} half />
                </FieldGrid>
              </Integration>
              <Integration name="Quote form" status="Connected" desc="The external Brand Access instant-quote flow.">
                <p className="cmsc-note">The live quote button uses the URL set on the Brand Access page editor.</p>
                <FieldGrid>
                  <Field label="URL" value={v("settings.int.quote_url")} onChange={set("settings.int.quote_url")} />
                </FieldGrid>
              </Integration>
            </div>
          </section>

          <section className="cms-panel cmss__panel" id="options">
            <header className="cms-panel__head"><h2>Site options</h2></header>
            <div className="cmsc-section__body cmss__toggles">
              <Toggle on={v("settings.opt.preloader") === "on"} onChange={set("settings.opt.preloader")} label="Preloader" hint="The JE intro animation on first load" />
              <Toggle on={v("settings.opt.smooth_scroll") === "on"} onChange={set("settings.opt.smooth_scroll")} label="Smooth scrolling" hint="Lenis-powered inertia scroll" />
              <Toggle on={v("settings.opt.custom_cursor") === "on"} onChange={set("settings.opt.custom_cursor")} label="Custom cursor" hint="Yellow ring cursor on fine pointers" />
              <Toggle on={v("settings.opt.concierge") === "on"} onChange={set("settings.opt.concierge")} label="Concierge letter" hint="Notification bell + AI chat in the header" />
              <Toggle on={v("settings.opt.rating_badge") === "on"} onChange={set("settings.opt.rating_badge")} label="Google rating badge" hint="Floating 5.0 badge (desktop only)" />
              <Toggle on={v("settings.opt.ticket_cut") === "on"} onChange={set("settings.opt.ticket_cut")} label="Ticket cut interaction" hint="Scissors cut on the Brand Access pass" />
              <Toggle on={v("settings.opt.maintenance") === "on"} onChange={set("settings.opt.maintenance")} label="Maintenance mode" hint="Shows a holding page to visitors" />
            </div>
          </section>

          <section className="cms-panel cmss__panel" id="seo">
            <header className="cms-panel__head"><h2>SEO</h2></header>
            <div className="cmsc-section__body">
              <FieldGrid>
                <Field label="Title template" value={v("settings.seo.title_template")} onChange={set("settings.seo.title_template")} half />
                <Field label="Default title" value={v("settings.seo.default_title")} onChange={set("settings.seo.default_title")} half />
                <Field label="Default description" value={v("settings.seo.default_desc")} onChange={set("settings.seo.default_desc")} textarea rows={2} />
                <Field label="Social share image" value={v("settings.seo.share_image")} onChange={set("settings.seo.share_image")} hint="Pick from Media" />
              </FieldGrid>
            </div>
          </section>

          <section className="cms-panel cmss__panel" id="social">
            <header className="cms-panel__head"><h2>Social links</h2></header>
            <div className="cmsc-section__body">
              <FieldGrid>
                <Field label="Instagram" value={v("settings.social.instagram")} onChange={set("settings.social.instagram")} half />
                <Field label="Facebook" value={v("settings.social.facebook")} onChange={set("settings.social.facebook")} half />
                <Field label="YouTube" value={v("settings.social.youtube")} onChange={set("settings.social.youtube")} half />
                <Field label="X / Twitter" value={v("settings.social.x")} onChange={set("settings.social.x")} half />
              </FieldGrid>
            </div>
          </section>

          <section className="cms-panel cmss__panel cmss__panel--danger" id="danger">
            <header className="cms-panel__head"><h2>Danger zone</h2></header>
            <div className="cmsc-section__body cmss__danger">
              <div>
                <strong>Export all content</strong>
                <span>Download projects, services, reviews, FAQs and page copy as JSON.</span>
                <button type="button" className="cms__btn-ghost">Export</button>
              </div>
              <div>
                <strong>Purge image cache</strong>
                <span>Force-regenerate optimized images after replacing files.</span>
                <button type="button" className="cms__btn-ghost">Purge</button>
              </div>
              <div>
                <strong>Reset CMS data</strong>
                <span>Restore all content to the last published state. Cannot be undone.</span>
                <button type="button" className="cms__btn-ghost cmsm__danger">Reset</button>
              </div>
            </div>
          </section>

          {error ? <p className="cmsc-note" style={{ color: "#c0392b" }}>{error}</p> : null}
          <div className="cmsc-savebar">
            <span>{loading ? "Loading…" : saving ? "Saving…" : dirty ? "Unsaved changes" : "All changes saved"}</span>
            <div>
              <button type="button" className="cms__btn-ghost" onClick={discard} disabled={!dirty || saving}>Discard</button>
              <button type="button" className="btn btn--sm btn--solid" onClick={save} disabled={!dirty || saving}>
                <span>{saving ? "Saving…" : "Save changes"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
