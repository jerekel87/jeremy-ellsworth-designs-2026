import Cursor from "@/components/Cursor";
import Header from "@/components/next/Header";
import Footer from "@/components/next/Footer";
import ContactModal from "@/components/ContactModal";
import VideoLightbox from "@/components/VideoLightbox";
import GoogleBadge from "@/components/GoogleBadge";
import SiteFx from "@/components/next/SiteFx";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Cursor />
      <Header />
      {children}
      <Footer />
      <ContactModal />
      <VideoLightbox />
      <GoogleBadge />
      <SiteFx />
    </>
  );
}
