const wallImages = Array.from({ length: 132 }, (_, i) => `/assets/img/logodump/logo-${i + 1}.jpg`);

export default function OwnerNote() {
  // enough tiles to blanket any viewport; overflow is clipped by the section
  const tiles = wallImages.concat(wallImages).slice(0, 180);
  return (
    <section className="section ownernote" id="ownernote">
      <div className="ownernote__wall" aria-hidden="true">
        {tiles.map((t, i) => <img key={i} src={t} alt="" loading="lazy" />)}
      </div>
      <div className="container ownernote__inner">
        <span className="ownernote__mark" aria-hidden="true">”</span>
        <span className="eyebrow reveal">A note from the owner</span>
        <p className="ownernote__msg reveal">
          Every project that comes through our shop gets the same treatment — real research, concepts drawn
          by hand, and a team that actually answers when you reach out. If it isn't something we'd proudly
          put our own name on, it doesn't leave the building.
        </p>
        <div className="ownernote__sig reveal">
          <span className="ownernote__name" tabIndex={0}>Jeremy E.</span>
          <img className="ownernote__photo" src="/assets/img/team/jeremy.jpg" alt="Jeremy Ellsworth" loading="lazy" />
          <span className="ownernote__fullname">Jeremy Ellsworth</span>
          <span className="ownernote__role">Owner / Designer</span>
        </div>
      </div>
    </section>
  );
}
