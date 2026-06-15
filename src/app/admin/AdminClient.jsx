"use client";

import dynamic from "next/dynamic";

const AdminShell = dynamic(() => import("./AdminShell"), { ssr: false });

export default function AdminClient() {
  return <AdminShell />;
}
