export default function SpinBadge() {
  return (
    <div className="spinbadge" aria-hidden="true">
      <svg className="spinbadge__text" viewBox="0 0 200 200">
        <defs>
          <path id="spinArc" d="M100,100 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0" />
        </defs>
        <text fontSize="16.5" fontWeight="600" letterSpacing="1.5" fill="#000">
          <textPath href="#spinArc" textLength="450" lengthAdjust="spacingAndGlyphs">your five-star creative design agency! ✦ </textPath>
        </text>
      </svg>
      <svg className="spinbadge__arrow" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 4v16m0 0-6-6m6 6 6-6" />
      </svg>
    </div>
  );
}
