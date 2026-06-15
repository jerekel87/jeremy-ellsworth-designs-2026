import ContactSection from "@/components/ContactSection";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main id="top">
      <section className="pagehero pagehero--case">
        <div className="container">
          <span className="eyebrow reveal">Error 404</span>
          <h1 className="pagehero__title split-lines"><span>Page not found</span></h1>
          <p className="pagehero__sub reveal">
            The page you're looking for doesn't exist or has moved.{" "}
            <Link to="/" data-cursor="hover">Back to home</Link>.
          </p>
        </div>
      </section>
      <ContactSection />
    </main>
  );
}
