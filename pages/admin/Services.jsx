import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchServices } from "@/lib/servicesApi";
import { CmsTopbar } from "@/components/cms/Ui";

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    fetchServices()
      .then((rows) => { if (active) setServices(rows); })
      .catch((e) => { if (active) setError(e.message || "Could not load services."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <>
      <CmsTopbar
        title="Services"
        subtitle={`${services.length} services — each row opens the full service-page editor.`}
        action={<Link to="/admin/services/new" className="btn btn--sm btn--solid"><span>+ New service</span></Link>}
      />
      <div className="cms__content cmsc">
        <section className="cms-panel">
          {loading ? <p className="cmsc-note">Loading services…</p> : null}
          {error ? <p className="cmsc-note" style={{ color: "#c0392b" }}>{error}</p> : null}
          {!loading && !error && services.length === 0 ? <p className="cmsc-note">No services yet.</p> : null}
          {services.map((s) => (
            <Link className="cmsc-item cmsc-item--link" key={s.slug} to={`/admin/services/${s.slug}`}>
              <img src={s.img} alt="" className="cmsc-item__thumb" loading="lazy" />
              <span className="cmsc-item__title">
                <strong>{s.num} — {s.title}</strong>
                <span>{s.industries} · /services/{s.slug}</span>
              </span>
              <span className="cms-chip cms-chip--live">Published</span>
              <span className="cmsc-item__go">Edit →</span>
            </Link>
          ))}
        </section>
        <p className="cmsc-note">The services <em>listing page</em> (hero, differentiator strip, program finale) is edited in <Link to="/admin/pages">Pages → Services</Link>.</p>
      </div>
    </>
  );
}
