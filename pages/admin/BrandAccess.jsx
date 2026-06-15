import { Link } from "react-router-dom";
import { CmsTopbar, Field, FieldGrid, EditSection } from "@/components/cms/Ui";
import { useContentDraft } from "@/lib/contentApi";
import { BRAND_ACCESS_DEFAULTS as DEFAULTS, COMPARE_ROWS, DELIVERABLES, STATS } from "@/lib/brandAccessContent";

export default function BrandAccess() {
  const { draft, set, dirty, loading, saving, error, save, discard } = useContentDraft(DEFAULTS);
  const v = (k) => draft[k];

  return (
    <>
      <CmsTopbar
        title="Brand Access"
        subtitle="Everything on /brand-access-program — hero, pass, sections, compare table and stats."
        action={<a href="/brand-access-program" target="_blank" rel="noopener" className="cms__btn-ghost">View page ↗</a>}
      />
      <div className="cms__content cmsc">
        <section className="cms-panel">
          <div className="cmsc-sections">
            <EditSection title="Hero" count="5 fields" open>
              <FieldGrid>
                <Field label="Eyebrow" value={v("ba.hero.eyebrow")} onChange={set("ba.hero.eyebrow")} />
                <Field label="Headline" value={v("ba.hero.headline")} onChange={set("ba.hero.headline")} hint="Second half renders in the italic accent style" />
                <Field label="Subheadline" value={v("ba.hero.sub")} onChange={set("ba.hero.sub")} textarea />
                <Field label="Proof line" value={v("ba.hero.proof")} onChange={set("ba.hero.proof")} />
                <Field label="Quote URL (Get Instant Quote)" value={v("ba.hero.quote_url")} onChange={set("ba.hero.quote_url")} />
              </FieldGrid>
            </EditSection>

            <EditSection title="Access pass (the ticket)" count="5 fields">
              <FieldGrid>
                <Field label="Down payment" value={v("ba.pass.down")} onChange={set("ba.pass.down")} half />
                <Field label="Pass number" value={v("ba.pass.number")} onChange={set("ba.pass.number")} half />
                <Field label="Row — Then" value={v("ba.pass.then")} onChange={set("ba.pass.then")} />
                <Field label="Row — Files" value={v("ba.pass.files")} onChange={set("ba.pass.files")} />
                <Field label="Row — Starts" value={v("ba.pass.starts")} onChange={set("ba.pass.starts")} />
              </FieldGrid>
              <p className="cmsc-note">The scissors-cut interaction and falling stub are part of the design; only the copy is editable here.</p>
            </EditSection>

            <EditSection title="The problem" count="6 fields">
              <FieldGrid>
                <Field label="Headline" value={v("ba.problem.headline")} onChange={set("ba.problem.headline")} />
                <Field label="Subheadline" value={v("ba.problem.sub")} onChange={set("ba.problem.sub")} textarea />
                <Field label="Pain point 1" value={v("ba.problem.p1")} onChange={set("ba.problem.p1")} />
                <Field label="Pain point 2" value={v("ba.problem.p2")} onChange={set("ba.problem.p2")} />
                <Field label="Pain point 3" value={v("ba.problem.p3")} onChange={set("ba.problem.p3")} />
                <Field label="Closing quote" value={v("ba.problem.quote")} onChange={set("ba.problem.quote")} textarea rows={2} />
              </FieldGrid>
            </EditSection>

            <EditSection title="How it works (3 steps)" count="6 fields">
              <FieldGrid>
                {[1, 2, 3].map((i) => (
                  <div className="cmsc-pair" key={i}>
                    <Field label={`Step ${i} title`} value={v(`ba.step${i}_title`)} onChange={set(`ba.step${i}_title`)} />
                    <Field label={`Step ${i} text`} value={v(`ba.step${i}_text`)} onChange={set(`ba.step${i}_text`)} textarea rows={2} />
                  </div>
                ))}
              </FieldGrid>
            </EditSection>

            <EditSection title="Compare table" count={`${COMPARE_ROWS.length} rows`}>
              <FieldGrid>
                <Field label="Headline" value={v("ba.compare.headline")} onChange={set("ba.compare.headline")} />
                <Field label="Left column header" value={v("ba.compare.left")} onChange={set("ba.compare.left")} half />
                <Field label="Right column header" value={v("ba.compare.right")} onChange={set("ba.compare.right")} half />
              </FieldGrid>
              <div className="cmsc-table">
                <div className="cmsc-table__head"><span>Feature</span><span>Brand Access</span><span>Saving up</span></div>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div className="cmsc-table__row" key={i}>
                    <input type="text" value={v(`ba.compare.r${i}_label`)} onChange={(e) => set(`ba.compare.r${i}_label`)(e.target.value)} />
                    <input type="text" value={v(`ba.compare.r${i}_us`)} onChange={(e) => set(`ba.compare.r${i}_us`)(e.target.value)} />
                    <input type="text" value={v(`ba.compare.r${i}_them`)} onChange={(e) => set(`ba.compare.r${i}_them`)(e.target.value)} />
                  </div>
                ))}
              </div>
              <FieldGrid>
                <Field label="Foot line" value={v("ba.compare.foot")} onChange={set("ba.compare.foot")} />
              </FieldGrid>
            </EditSection>

            <EditSection title="What you get" count={`${DELIVERABLES.length} items`}>
              <FieldGrid>
                <Field label="Headline" value={v("ba.get.headline")} onChange={set("ba.get.headline")} />
                <Field label="Subheadline" value={v("ba.get.sub")} onChange={set("ba.get.sub")} textarea rows={2} />
                {[1, 2, 3, 4, 5].map((i) => (
                  <div className="cmsc-pair" key={i}>
                    <Field label={`Item ${i}`} value={v(`ba.get.i${i}_title`)} onChange={set(`ba.get.i${i}_title`)} />
                    <Field label={`Item ${i} details`} value={v(`ba.get.i${i}_text`)} onChange={set(`ba.get.i${i}_text`)} textarea rows={2} />
                  </div>
                ))}
                <Field label="Fine print" value={v("ba.get.fineprint")} onChange={set("ba.get.fineprint")} textarea rows={2} />
              </FieldGrid>
            </EditSection>

            <EditSection title="Testimonial" count="3 fields">
              <FieldGrid>
                <Field label="Quote" value={v("ba.testi.quote")} onChange={set("ba.testi.quote")} textarea />
                <Field label="Name" value={v("ba.testi.name")} onChange={set("ba.testi.name")} half />
                <Field label="Attribution" value={v("ba.testi.attr")} onChange={set("ba.testi.attr")} half />
              </FieldGrid>
            </EditSection>

            <EditSection title="Showcase (Owners who started here)" count="6 projects">
              <FieldGrid>
                <Field label="Headline" value={v("ba.show.headline")} onChange={set("ba.show.headline")} />
                <Field label="Subheadline" value={v("ba.show.sub")} onChange={set("ba.show.sub")} textarea rows={2} />
                <Field label="Projects (slugs, in order)" value={v("ba.show.projects")} onChange={set("ba.show.projects")} hint="Pulled from Projects — first and fifth render large" />
              </FieldGrid>
            </EditSection>

            <EditSection title="Results stats" count="4 stats">
              <div className="cmsc-table">
                <div className="cmsc-table__head"><span>Value</span><span>Label</span><span /></div>
                {[1, 2, 3, 4].map((i) => (
                  <div className="cmsc-table__row cmsc-table__row--two" key={i}>
                    <input type="text" value={v(`ba.stats.s${i}_value`)} onChange={(e) => set(`ba.stats.s${i}_value`)(e.target.value)} />
                    <input type="text" value={v(`ba.stats.s${i}_label`)} onChange={(e) => set(`ba.stats.s${i}_label`)(e.target.value)} />
                  </div>
                ))}
              </div>
            </EditSection>

            <EditSection title="Industries tape" count="18 industries">
              <FieldGrid>
                <Field label="Industries (comma-separated)" value={v("ba.industries")} onChange={set("ba.industries")} textarea rows={2} />
              </FieldGrid>
            </EditSection>
          </div>
        </section>
        <p className="cmsc-note">The Brand Access FAQ is managed in <Link to="/admin/faqs">FAQs</Link>. The home-page program section is in <Link to="/admin/pages">Pages → Home</Link>.</p>

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
    </>
  );
}
