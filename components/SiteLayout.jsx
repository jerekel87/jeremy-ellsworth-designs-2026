import { Outlet } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactModal from "@/components/ContactModal";
import VideoLightbox from "@/components/VideoLightbox";
import GoogleBadge from "@/components/GoogleBadge";
import { usePageTracking } from "@/lib/track";

export default function SiteLayout() {
  usePageTracking();
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
      <ContactModal />
      <VideoLightbox />
      <GoogleBadge />
    </>
  );
}
