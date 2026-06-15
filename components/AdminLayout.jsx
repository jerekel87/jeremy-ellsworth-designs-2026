import { Link, Outlet } from "react-router-dom";
import { useNewInquiryCount } from "@/lib/dashboardApi";
import { useState } from "react";

const NAV = [
  { group: "Overview", items: [
    { href: "/admin", label: "Dashboard", icon: "M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z" },
    { href: "/admin/assistant", label: "Assistant", icon: "M12 3a4 4 0 0 1 4 4v1a4 4 0 0 1-1 2.6V13a3 3 0 0 1-6 0v-2.4A4 4 0 0 1 8 8V7a4 4 0 0 1 4-4ZM5 13a7 7 0 0 0 14 0M12 20v1" },
    { href: "/admin/inquiries", label: "Inquiries", icon: "M4 5h16v11H8l-4 4V5Z", badgeKey: "newInquiries" },
  ]},
  { group: "Content", items: [
    { href: "/admin/pages", label: "Pages", icon: "M7 3h7l5 5v13H7V3Zm7 0v5h5" },
    { href: "/admin/projects", label: "Projects", icon: "M3 7l9-4 9 4-9 4-9-4Zm0 5l9 4 9-4M3 17l9 4 9-4" },
    { href: "/admin/categories", label: "Categories", icon: "M3 3h8v8H3V3Zm10 0h8v8h-8V3ZM3 13h8v8H3v-8Zm10 0h8v8h-8v-8Z" },
    { href: "/admin/services", label: "Services", icon: "M12 3l2.4 4.8 5.6.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.6-.8L12 3Z" },
    { href: "/admin/reviews", label: "Reviews", icon: "M8 10h8M8 14h5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" },
    { href: "/admin/faqs", label: "FAQs", icon: "M9 9a3 3 0 1 1 4.6 2.5c-1 .7-1.6 1.2-1.6 2.5M12 17.5v.01" },
    { href: "/admin/brand-access", label: "Brand Access", icon: "M4 7h16v10H4V7Zm0 5h16M9 7v10" },
  ]},
  { group: "System", items: [
    { href: "/admin/media", label: "Media", icon: "M4 5h16v14H4V5Zm4 8 3-3 5 5M15 9h.01" },
    { href: "/admin/seo", label: "SEO", icon: "M10 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6h-4ZM14 3v6h6M16 13H8M16 17H8M10 9H8" },
    { href: "/admin/settings", label: "Settings", icon: "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm8 3a8 8 0 0 1-.1 1.2l2 1.5-2 3.4-2.3-.9a8 8 0 0 1-2.1 1.2l-.4 2.6H10l-.4-2.6a8 8 0 0 1-2.1-1.2l-2.3.9-2-3.4 2-1.5A8 8 0 0 1 5 12c0-.4 0-.8.1-1.2l-2-1.5 2-3.4 2.3.9a8 8 0 0 1 2.1-1.2L10 3h4l.4 2.6a8 8 0 0 1 2.1 1.2l2.3-.9 2 3.4-2 1.5c.1.4.2.8.2 1.2Z" },
  ]},
];

const ALL_ITEMS = NAV.flatMap((g) => g.items);
const MOBILE_MAIN = ["/admin", "/admin/inquiries", "/admin/projects", "/admin/pages"].map(
  (href) => ALL_ITEMS.find((it) => it.href === href)
);
const MOBILE_MORE = ALL_ITEMS.filter((it) => !MOBILE_MAIN.includes(it));

export default function AdminLayout() {
  const newInquiries = useNewInquiryCount();
  const badgeFor = (it) => (it.badgeKey === "newInquiries" && newInquiries > 0 ? newInquiries : null);

  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`cms${collapsed ? " cms--collapsed" : ""}`}>
      <aside className="cms__side">
        <Link className="cms__brand" to="/admin">
          <img src="/assets/img/logo-white.webp" alt="je.design" width="34" height="33" />
          <span className="cms__brand-text">Studio <em>CMS</em></span>
        </Link>
        <nav className="cms__nav">
          {NAV.map((g) => (
            <div className="cms__group" key={g.group}>
              <span className="cms__group-label">{g.group}</span>
              {g.items.map((it) => (
                <Link key={it.href} to={it.href} className="cms__link" title={it.label}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={it.icon} /></svg>
                  <span className="cms__link-label">{it.label}</span>
                  {badgeFor(it) ? <em className="cms__badge">{badgeFor(it)}</em> : null}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <a className="cms__viewsite" href="/" target="_blank" rel="noopener">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
          <span className="cms__viewsite-text">View live site</span>
        </a>

        <div className="cms__account">
          <button
            type="button"
            className="cms__collapse-btn"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
            )}
            <span className="cms__collapse-label">{collapsed ? "Expand" : "Collapse"}</span>
          </button>
        </div>
      </aside>
      <div className="cms__main"><Outlet /></div>

      {/* mobile bottom navigation */}
      <nav className="cms__bottomnav" aria-label="CMS navigation">
        {MOBILE_MAIN.map((it) => (
          <Link key={it.href} to={it.href} className="cms__tab">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={it.icon} /></svg>
            <span>{it.label}</span>
            {badgeFor(it) ? <em className="cms__badge cms__tab-badge">{badgeFor(it)}</em> : null}
          </Link>
        ))}
        <details className="cms__morenav">
          <summary className="cms__tab">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></svg>
            <span>More</span>
          </summary>
          <div className="cms__moresheet">
            {MOBILE_MORE.map((it) => (
              <Link key={it.href} to={it.href}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={it.icon} /></svg>
                {it.label}
              </Link>
            ))}
            <a href="/" target="_blank" rel="noopener">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
              View live site
            </a>
          </div>
        </details>
      </nav>
    </div>
  );
}
