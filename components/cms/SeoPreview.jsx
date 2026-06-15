/* Live SEO previews — how a page renders in Google search and as a social
   share card. Purely presentational; fed the same effective values (override
   or default) the site will emit. */

const DOMAIN = "je.design";

function clamp(str, max) {
  const s = (str || "").trim();
  return s.length > max ? s.slice(0, max - 1).trimEnd() + "…" : s;
}

function crumb(path) {
  const parts = (path || "/").split("/").filter(Boolean);
  return [DOMAIN, ...parts].join(" › ");
}

export default function SeoPreview({ path, title, description, image, brandName }) {
  const t = clamp(title || `${brandName || DOMAIN}`, 60);
  const d = clamp(
    description || "Add a meta description to control the snippet shown here.",
    155
  );

  return (
    <div className="seoa-preview">
      <div className="seoa-preview__card seoa-serp">
        <span className="seoa-preview__tag">Google result</span>
        <div className="seoa-serp__head">
          <span className="seoa-serp__favicon">je</span>
          <div>
            <div className="seoa-serp__site">{brandName || DOMAIN}</div>
            <div className="seoa-serp__url">{crumb(path)}</div>
          </div>
        </div>
        <div className="seoa-serp__title">{t}</div>
        <p className="seoa-serp__desc">{d}</p>
      </div>

      <div className="seoa-preview__card seoa-social">
        <span className="seoa-preview__tag">Social share card</span>
        <div className="seoa-social__img">
          {image ? <img src={image} alt="" loading="lazy" /> : <span>No share image</span>}
        </div>
        <div className="seoa-social__body">
          <div className="seoa-social__domain">{DOMAIN}</div>
          <div className="seoa-social__title">{t}</div>
          <p className="seoa-social__desc">{clamp(d, 110)}</p>
        </div>
      </div>
    </div>
  );
}
