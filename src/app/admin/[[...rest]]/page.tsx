import AdminClient from "../AdminClient";

export const dynamic = "force-dynamic";

export const metadata = { robots: { index: false, follow: false } };

export default function AdminCatchAll() {
  return <AdminClient />;
}
