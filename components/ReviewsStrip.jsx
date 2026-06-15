import { useEffect, useState } from "react";
import { reviews as staticReviews } from "@/lib/reviews";
import { fetchReviews } from "@/lib/reviewsApi";

function Card({ r }) {
  const full = r.full || r.short || "";
  return (
    <article className="review" data-cursor="view" data-full={full} data-name={r.name} data-co={r.company}>
      <div className="review__stars">★★★★★ <em>5.0</em></div>
      <p>“{full}”</p>
      <footer>
        <span className="review__avatar">{r.name[0]}</span>
        <div><strong>{r.name}</strong><span>{r.company}</span></div>
      </footer>
    </article>
  );
}

export default function ReviewsStrip() {
  const [reviews, setReviews] = useState(staticReviews);

  useEffect(() => {
    let active = true;
    fetchReviews({ featuredOnly: true })
      .then((rows) => { if (active && rows.length) setReviews(rows); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  return (
    <div className="reviews__rows">
      <div className="reviews__row">
        <div className="reviews__track">
          <div className="reviews__group">
            {reviews.map((r, i) => <Card key={r.id || r.name + i} r={r} />)}
          </div>
          <div className="reviews__group" aria-hidden="true">
            {reviews.map((r, i) => <Card key={(r.id || r.name) + "-dup" + i} r={r} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
