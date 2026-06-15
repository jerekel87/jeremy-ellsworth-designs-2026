export default function VideoLightbox() {
  return (
    <>
  {/* ===== Video lightbox ===== */}
  <div className="lightbox" id="lightbox" aria-hidden="true">
    <div className="lightbox__backdrop" id="lightboxBackdrop"></div>
    <div className="lightbox__inner">
      <button className="lightbox__close" id="lightboxClose" aria-label="Close video">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
      </button>
      <div className="lightbox__frame" id="lightboxFrame"></div>
    </div>
  </div>
    </>
  );
}
