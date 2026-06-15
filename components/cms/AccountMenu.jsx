import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

export default function AccountMenu() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onOut(e) {
      if (!ref.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onOut);
    return () => document.removeEventListener("mousedown", onOut);
  }, [open]);

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div className="cms-acct" ref={ref}>
      <button
        type="button"
        className="cms__avatar cms-acct__btn"
        title="Account"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <img src="/assets/img/logo-white.webp" alt="JE" width="22" height="21" />
      </button>
      {open && (
        <div className="cms-acct__menu" role="menu">
          {user?.email && (
            <div className="cms-acct__head">
              <span className="cms-acct__role">Signed in as</span>
              <span className="cms-acct__email" title={user.email}>{user.email}</span>
            </div>
          )}
          <button type="button" className="cms-acct__signout" onClick={handleSignOut} role="menuitem">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
