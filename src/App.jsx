import { BrowserRouter, Routes, Route } from "react-router-dom";
import Cursor from "@/components/Cursor";
import SiteFx from "@/components/SiteFx";
import SiteLayout from "@/components/SiteLayout";
import AdminLayout from "@/components/AdminLayout";
import RequireAuth from "@/components/RequireAuth";
import { AuthProvider } from "@/lib/auth";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Services from "@/pages/Services";
import ServiceDetail from "@/pages/ServiceDetail";
import Work from "@/pages/Work";
import WorkDetail from "@/pages/WorkDetail";
import BrandAccess from "@/pages/BrandAccess";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import Dashboard from "@/pages/admin/Dashboard";
import Assistant from "@/pages/admin/Assistant";
import Inquiries from "@/pages/admin/Inquiries";
import AdminPages from "@/pages/admin/Pages";
import AdminProjects from "@/pages/admin/Projects";
import ProjectNew from "@/pages/admin/ProjectNew";
import ProjectEdit from "@/pages/admin/ProjectEdit";
import Categories from "@/pages/admin/Categories";
import AdminServices from "@/pages/admin/Services";
import ServiceNew from "@/pages/admin/ServiceNew";
import ServiceEdit from "@/pages/admin/ServiceEdit";
import AdminReviews from "@/pages/admin/Reviews";
import ReviewNew from "@/pages/admin/ReviewNew";
import Faqs from "@/pages/admin/Faqs";
import AdminBrandAccess from "@/pages/admin/BrandAccess";
import Media from "@/pages/admin/Media";
import Settings from "@/pages/admin/Settings";
import Seo from "@/pages/admin/Seo";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Cursor />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<RequireAuth />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="assistant" element={<Assistant />} />
              <Route path="inquiries" element={<Inquiries />} />
              <Route path="pages" element={<AdminPages />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="projects/new" element={<ProjectNew />} />
              <Route path="projects/:slug" element={<ProjectEdit />} />
              <Route path="categories" element={<Categories />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="services/new" element={<ServiceNew />} />
              <Route path="services/:slug" element={<ServiceEdit />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="reviews/new" element={<ReviewNew />} />
              <Route path="faqs" element={<Faqs />} />
              <Route path="brand-access" element={<AdminBrandAccess />} />
              <Route path="media" element={<Media />} />
              <Route path="seo" element={<Seo />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>

          <Route element={<SiteLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:slug" element={<ServiceDetail />} />
            <Route path="/work" element={<Work />} />
            <Route path="/work/:slug" element={<WorkDetail />} />
            <Route path="/brand-access-program" element={<BrandAccess />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <SiteFx />
      </AuthProvider>
    </BrowserRouter>
  );
}
