import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProjects } from "@/lib/projectsApi";
import { CmsTopbar } from "@/components/cms/Ui";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    fetchProjects()
      .then((rows) => { if (active) setProjects(rows); })
      .catch((e) => { if (active) setError(e.message || "Could not load projects."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <>
      <CmsTopbar
        title="Projects"
        subtitle={`${projects.length} published — each row opens the full case-page editor.`}
        action={<Link to="/admin/projects/new" className="btn btn--sm btn--solid"><span>+ New project</span></Link>}
      />
      <div className="cms__content cmsc">
        <section className="cms-panel">
          {loading ? <p className="cmsc-note">Loading projects…</p> : null}
          {error ? <p className="cmsc-note" style={{ color: "#c0392b" }}>{error}</p> : null}
          {!loading && !error && projects.length === 0 ? <p className="cmsc-note">No projects yet.</p> : null}
          {projects.map((p) => (
            <Link className="cmsc-item cmsc-item--link" key={p.slug} to={`/admin/projects/${p.slug}`}>
              <img src={p.img} alt="" className="cmsc-item__thumb" loading="lazy" />
              <span className="cmsc-item__title">
                <strong>{p.title}</strong>
                <span>{p.category} · {p.industry} · /work/{p.slug}</span>
              </span>
              <span className="cms-chip cms-chip--live">Published</span>
              <span className="cmsc-item__go">Edit →</span>
            </Link>
          ))}
        </section>
      </div>
    </>
  );
}
