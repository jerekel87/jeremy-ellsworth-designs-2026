import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TrafficChart, LiveSpark } from "@/components/cms/Charts";
import UsLiveMap from "@/components/cms/UsLiveMap";
import SearchExpand from "@/components/cms/SearchExpand";
import AccountMenu from "@/components/cms/AccountMenu";
import { fetchDashboard } from "@/lib/dashboardApi";
import { useAnalytics } from "@/lib/analyticsApi";

const STATUS_LABEL = { new: "New", replied: "Replied", booked: "Booked" };
const DEV_CLASS = ["cms-live__dev--1", "cms-live__dev--2", "cms-live__dev--3"];

function LivePages({ rows }) {
  const max = rows.reduce((m, r) => Math.max(m, r.count), 0) || 1;
  return (
    <ul className="cms-live__pages">
      {rows.map((r) => (
        <li key={r.label}>
          <span>{r.label}</span>
          <i style={{ width: `${(r.count / max) * 100}%` }}></i>
          <strong>{r.count}</strong>
        </li>
      ))}
    </ul>
  );
}

function GeoGroup({ label, rows }) {
  if (!rows || !rows.length) return null;
  return (
    <div className="cms-geo__group">
      <span className="cms-geo__label">{label}</span>
      <ul>
        {rows.map(([name, p]) => (
          <li key={name}>
            <span>{name}</span>
            <i><b style={{ width: `${p}%` }}></b></i>
            <strong>{p}%</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: analytics, loading: aLoading } = useAnalytics();

  useEffect(() => {
    let active = true;
    fetchDashboard()
      .then((d) => { if (active) setData(d); })
      .catch((e) => { if (active) setError(e.message || "Could not load dashboard data."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const c = data?.counts;
  const recent = data?.recent || [];

  const live = analytics?.live;
  const traffic = analytics?.traffic || [];
  const geo = analytics?.geo;
  const liveCount = live?.count || 0;
  const devices = live?.devices || [];
  const hasTraffic = traffic.some((t) => t.visitors > 0);

  const stats = [
    {
      label: "New inquiries",
      value: c ? c.newInquiries : "—",
      delta: c ? (c.weekInquiries > 0 ? `+${c.weekInquiries} this week` : "None this week") : "",
      up: c ? c.weekInquiries > 0 : false,
      href: "/admin/inquiries",
    },
    { label: "Published projects", value: c ? c.projects : "—", delta: "Live on site", up: false, href: "/admin/projects" },
    { label: "Active services", value: c ? c.services : "—", delta: "Published", up: false, href: "/admin/services" },
    { label: "Reviews", value: c ? c.reviews : "—", delta: "On the site", up: false, href: "/admin/reviews" },
  ];

  return (
    <>
      <header className="cms__topbar">
        <div>
          <h1 className="cms__title">Dashboard</h1>
          <p className="cms__subtitle">Welcome back, Jeremy. Here&rsquo;s what&rsquo;s happening at je.design.</p>
        </div>
        <div className="cms__topbar-actions">
          <SearchExpand />
          <Link to="/admin/projects/new" className="btn btn--sm btn--solid"><span>+ New project</span></Link>
          <AccountMenu />
        </div>
      </header>

      <div className="cms__content">
        {error ? <p className="cmsc-note" style={{ color: "#c0392b" }}>{error}</p> : null}

        <section className="cms__stats">
          {stats.map((s) => (
            <Link className="cms-stat" to={s.href} key={s.label}>
              <span className="cms-stat__label">{s.label}</span>
              <strong className="cms-stat__value">{loading ? "…" : s.value}</strong>
              {s.delta ? <span className={"cms-stat__delta" + (s.up ? " is-up" : "")}>{s.up ? "↑ " : ""}{s.delta}</span> : <span className="cms-stat__delta">&nbsp;</span>}
            </Link>
          ))}
        </section>

        {/* ---- recent inquiries ---- */}
        <section className="cms-panel cms-panel--table">
          <header className="cms-panel__head">
            <h2>Recent inquiries</h2>
            <Link to="/admin/inquiries" className="cms__more">View all →</Link>
          </header>
          {loading ? (
            <p className="cms-dash__empty">Loading inquiries…</p>
          ) : recent.length === 0 ? (
            <p className="cms-dash__empty">No inquiries yet. When someone submits the contact form, they&rsquo;ll show up right here.</p>
          ) : (
            <table className="cms-table">
              <thead>
                <tr><th>Name</th><th>Business</th><th>Interested in</th><th>Budget</th><th>Date</th><th>Status</th></tr>
              </thead>
              <tbody>
                {recent.map((q) => (
                  <tr key={q.id}>
                    <td><strong>{q.name}</strong></td>
                    <td>{q.business || "—"}</td>
                    <td>{q.service || "—"}</td>
                    <td>{q.budget || "—"}</td>
                    <td className="cms-table__dim">{q.date}</td>
                    <td><span className={"cms-chip cms-chip--" + q.status}>{STATUS_LABEL[q.status] || q.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* ---- visitor traffic + quick actions ---- */}
        <div className="cms__grid-a">
          <section className="cms-panel">
            <header className="cms-panel__head">
              <h2>Traffic — last 30 days</h2>
              <span className="cms-panel__meta"><i className="cms-dot cms-dot--yellow"></i><strong>{(analytics?.totalViews || 0).toLocaleString()}</strong> views</span>
            </header>
            {aLoading && !analytics ? (
              <p className="cms-dash__empty">Loading…</p>
            ) : hasTraffic ? (
              <TrafficChart data={traffic} dataKey="visitors" suffix=" visitors" />
            ) : (
              <p className="cms-dash__empty">No visits recorded yet. This chart fills in as people browse the public site.</p>
            )}
          </section>

          <section className="cms-panel">
            <header className="cms-panel__head"><h2>Quick actions</h2></header>
            <div className="cms-actions">
              <Link to="/admin/projects/new" className="cms-action"><i>＋</i>Add a project</Link>
              <Link to="/admin/reviews" className="cms-action"><i>★</i>Manage reviews</Link>
              <Link to="/admin/brand-access" className="cms-action"><i>✂</i>Edit Brand Access page</Link>
              <Link to="/admin/media" className="cms-action"><i>▦</i>Upload media</Link>
              <Link to="/admin/pages" className="cms-action"><i>✎</i>Edit page copy</Link>
            </div>
          </section>
        </div>

        {/* ---- live: right now / where visitors are / US map ---- */}
        <div className="cms__grid-b">
          <section className="cms-panel cms-live">
            <header className="cms-panel__head">
              <h2>Right now</h2>
              <span className="cms-live__badge"><i></i>Live</span>
            </header>
            <div className="cms-live__count">
              <strong>{aLoading && !analytics ? "…" : liveCount}</strong>
              <span>{liveCount === 1 ? "visitor" : "visitors"} on the site</span>
            </div>
            <span className="cms-live__spark-label">Active visitors · past hour</span>
            <LiveSpark data={live?.spark || []} />
            {live?.pages?.length > 0 && (
              <div className="cms-live__group">
                <span className="cms-geo__label">Active pages</span>
                <LivePages rows={live.pages} />
              </div>
            )}
            {live?.sources?.length > 0 && (
              <div className="cms-live__group">
                <span className="cms-geo__label">Coming from</span>
                <LivePages rows={live.sources} />
              </div>
            )}
            {devices.length > 0 && (
              <div className="cms-live__group">
                <span className="cms-geo__label">Devices</span>
                <div className="cms-live__devbar">
                  {devices.slice(0, 3).map(([label, p], i) => (
                    <i key={label} className={DEV_CLASS[i]} style={{ width: `${p}%` }} title={`${label} ${p}%`}></i>
                  ))}
                </div>
                <div className="cms-live__devlegend">
                  {devices.slice(0, 3).map(([label, p], i) => (
                    <span key={label}><i className={DEV_CLASS[i]}></i>{label} {p}%</span>
                  ))}
                </div>
              </div>
            )}
            {!aLoading && liveCount === 0 && (
              <p className="cms-dash__empty">No one&rsquo;s on the site this moment. This lights up in real time as visitors arrive.</p>
            )}
          </section>

          <section className="cms-panel cms-geo">
            <header className="cms-panel__head"><h2>Where visitors are</h2></header>
            {aLoading && !analytics ? (
              <p className="cms-dash__empty">Loading…</p>
            ) : geo && (geo.Countries?.length || geo.States?.length || geo.Cities?.length) ? (
              <>
                <GeoGroup label="Countries" rows={geo.Countries} />
                <GeoGroup label="States" rows={geo.States} />
                <GeoGroup label="Cities" rows={geo.Cities} />
              </>
            ) : (
              <p className="cms-dash__empty">No location data yet. This fills in as visitors browse the site.</p>
            )}
          </section>

          <section className="cms-panel">
            <header className="cms-panel__head">
              <h2>Live visitors — USA</h2>
              <span className="cms-panel__meta"><i className="cms-dot cms-dot--green"></i>{liveCount} active</span>
            </header>
            <UsLiveMap pins={live?.pins || []} />
          </section>
        </div>
      </div>
    </>
  );
}
