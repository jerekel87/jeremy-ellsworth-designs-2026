import { useEffect, useState } from "react";
import InquiriesBrowser from "@/components/cms/InquiriesBrowser";
import { fetchInquiries, updateInquiry, sendInquiryReply } from "@/lib/inquiriesApi";

export default function Inquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    fetchInquiries()
      .then((rows) => { if (active) setInquiries(rows); })
      .catch((e) => { if (active) setError(e.message || "Failed to load inquiries."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function patch(id, data) {
    const updated = await updateInquiry(id, data);
    if (updated) setInquiries((list) => list.map((q) => (q.id === id ? updated : q)));
    return updated;
  }

  async function reply(id, text) {
    const updated = await sendInquiryReply(id, text);
    if (updated) setInquiries((list) => list.map((q) => (q.id === id ? updated : q)));
    return updated;
  }

  return (
    <InquiriesBrowser
      inquiries={inquiries}
      loading={loading}
      error={error}
      onPatch={patch}
      onReply={reply}
    />
  );
}
