import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ContactSection from "@/components/ContactSection";
import SpinBadge from "@/components/SpinBadge";
import { fetchProjects } from "@/lib/projectsApi";
import { fetchCategories } from "@/lib/categoriesApi";
import { usePageText } from "@/lib/pageContent";

export default function WorkPage() {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [active, setActive] = useState("all");
  const t = usePageText();

  useEffect(() => {
    let alive = true;
    fetchProjects()
      .then((rows) => { if (alive) setProjects(rows); })
      .catch(() => {});
    fetchCategories()
      .then((rows) => { if (alive) setCategories(rows); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const tabs = useMemo(() => [{ key: "all", label: "All" }, ...categories], [categories]);
  const visible = active === "all" ? projects : projects.filter((p) => p.cat === active);

  return (
    <>
  <main id="top">

    {/* ===== Page hero ===== */}
    <section className="pagehero">
      <div className="container">
        
        <span className="eyebrow reveal">{t("work.hero.eyebrow")}</span>
        <h1 className="pagehero__title split-lines"><span>{t("work.hero.title")}</span> <span className="hero__accent">{t("work.hero.title_accent")}</span></h1>
        <p className="pagehero__sub reveal">{t("work.hero.sub")}</p>
      </div>
      <SpinBadge />
    </section>

    {/* ===== Listing ===== */}
    <section className="worklist section section--padless" id="worklist">
      <div className="container">
        <div className="filters reveal" id="workFilter" role="tablist" aria-label="Filter projects">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active === tab.key}
              className={"filter" + (active === tab.key ? " is-active" : "")}
              onClick={() => setActive(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="worklist__grid" id="workGrid">
          {visible.map((p) => (
            <Link key={p.slug} to={`/work/${p.slug}`} className="work-card wcard" data-cat={p.cat} data-cursor="view">
              <div className="work-card__media"><img src={p.img} alt={`${p.title} — ${p.category}`} loading="lazy" /></div>
              <div className="work-card__meta"><h3>{p.title}</h3><span>{p.category} · {p.industry}</span></div>
            </Link>
          ))}
          {visible.length === 0 ? (
            <p className="worklist__empty">No projects in this category yet.</p>
          ) : null}
        </div>
      </div>
    </section>

    <ContactSection />
  </main>
    </>
  );
}
