import { useEffect, useRef, useState } from "react";
import { projects } from "@/lib/projects";
import { services } from "@/lib/services";
import { mediaItems, mediaFolders } from "@/lib/mediaManifest";
import { CmsTopbar } from "@/components/cms/Ui";
import MediaLibrary from "@/components/cms/MediaLibrary";
import { uploadMedia, listUploadedMedia, deleteUploadedMedia } from "@/lib/contentApi";

/* Bundled /public/assets — read-only at runtime. Enrich Work covers with the
   project/service that uses them. */
const staticItems = mediaItems.map((e) => {
  const base = { ...e, readOnly: true };
  if (e.folder !== "Work covers") return base;
  const proj = projects.find((p) => p.img === e.path);
  const svc = services.find((s) => s.img === e.path);
  if (proj) return { ...base, usage: `Cover — ${proj.title}` };
  if (svc) return { ...base, usage: `Cover — ${svc.title}` };
  return base;
});

export default function Media() {
  const [uploads, setUploads] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  async function refresh() {
    try {
      setUploads(await listUploadedMedia());
      setError(null);
    } catch (e) {
      setError(e.message || "Could not load uploaded files.");
    }
  }

  useEffect(() => { refresh(); }, []);

  async function onPick(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setError(null);
    try {
      for (const f of files) await uploadMedia(f);
      await refresh();
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onDelete(item) {
    if (!item?.uploaded) return;
    try {
      await deleteUploadedMedia(item.storagePath);
      await refresh();
    } catch (err) {
      setError(err.message || "Could not delete file.");
    }
  }

  const items = [...uploads, ...staticItems];
  const folders = [{ name: "Uploads", count: uploads.length }, ...mediaFolders];
  const totalMB = (items.reduce((s, i) => s + (i.size || 0), 0) / (1024 * 1024)).toFixed(0);

  return (
    <>
      <CmsTopbar
        title="Media"
        subtitle={`${items.length} files · ${totalMB} MB · ${uploads.length} uploaded to your library.`}
        action={
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              multiple
              hidden
              onChange={onPick}
            />
            <button
              type="button"
              className="btn btn--sm btn--solid"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              <span>{uploading ? "Uploading…" : "Upload"}</span>
            </button>
          </>
        }
      />
      <div className="cms__content cmsc cmsc--full">
        {error ? <p className="cmsm__results" style={{ color: "var(--err, #e5484d)" }}>{error}</p> : null}
        <MediaLibrary
          items={items}
          folders={folders}
          defaultFolder={uploads.length ? "Uploads" : "All"}
          onDelete={onDelete}
        />
      </div>
    </>
  );
}
