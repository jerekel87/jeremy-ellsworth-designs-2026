"use client";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import RequireAuth from "@/components/RequireAuth";
import { AuthProvider } from "@/lib/auth";
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
import Seo from "@/pages/admin/Seo";
import Settings from "@/pages/admin/Settings";

export default function AdminShell() {
  return (
    <BrowserRouter>
      <AuthProvider>
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

          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
