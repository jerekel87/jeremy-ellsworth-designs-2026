import AdminClient from "../admin/AdminClient";

export const dynamic = "force-dynamic";

export const metadata = { robots: { index: false, follow: false } };

export default function LoginPage() {
  return <AdminClient />;
}
