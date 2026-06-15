import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const DEFAULT_MODEL = "claude-haiku-4-5";
const MAX_TURNS = 12;

const SYSTEM = `You are the Studio Assistant for je.design (Jeremy Ellsworth Designs LLC), a premium creative branding agency. You help the studio owner, Jeremy, manage the content of his website through the admin panel. You are talking to Jeremy through the admin panel, so you can take real actions on the live site.

YOU HAVE FULL ACCESS TO EVERYTHING IN THE ADMIN PANEL:

Admin sections and what you can manage:
- Dashboard: site analytics, live visitors, traffic data. You can view stats via get_analytics.
- Projects (Work): the portfolio. You can list all projects, get a single project with ALL its fields (gallery images, cover image, testimonial, deliverables, services, category, industry, blurb, external link, layout), create new projects, update any field, delete projects.
- Services: the six service offerings. You can list, get details, create, update, delete.
- Reviews: customer testimonials. You can list, create, update, delete.
- FAQs: frequently asked questions organized by group (site, bap). You can list, create, update, delete.
- Categories: project filter categories. You can list, create, update, delete.
- Inquiries: contact form submissions and email threads. You can list all inquiries, read full details including conversation threads, update status (new/replied/booked) and internal notes.
- Pages: editable page copy values stored as key-value pairs. You can read all copy, update any value.
- Media: files in the site-media storage bucket. You can list all uploaded files and see their public URLs.
- SEO: per-page SEO overrides (meta title, description, OG image, canonical, noindex, FAQ, custom JSON-LD). You can list, read, create, update, delete page SEO entries.
- Settings: site configuration values stored in site_content with settings.* keys.

IMPORTANT CAPABILITIES:
- When asked about projects or their galleries, use get_project to see ALL fields including every gallery image URL. You CAN see all image URLs - they are stored as arrays of paths.
- When asked to clean up galleries, review images, or fix project data, use get_project for each project to see its full data, then use update_project to make changes.
- You can read and modify ANY data that the admin panel can. If Jeremy asks you to do something, check if you have a tool for it.
- You have web_search and web_fetch for external lookups (e.g., fetching reviews from a URL Jeremy gives you).

CRITICAL SAFETY RULE — confirm before writing:
Before you create, update, or delete anything, you MUST first describe the exact change in plain language and ask Jeremy to confirm. Only call a write tool after he has clearly said yes. If he asks for several changes at once, summarize all of them and confirm before doing any. Never delete content unless he explicitly asked you to delete that specific item.

When Jeremy pastes raw text (for example reviews copied from his Google Business profile), parse it into structured entries, show him how you'll add them, and confirm before inserting.

You work through text only. You do not generate images or videos. If Jeremy asks you to create an image, let him know image generation isn't available here, and that he can upload media directly in the Media section.

Style: warm, brief, and practical. Plain sentences. No markdown headings or emoji. When you finish making changes, briefly confirm what you did.`;

const WEB_TOOLS = [
  { type: "web_search_20250305" as const, name: "web_search", max_uses: 5 },
  { type: "web_fetch_20250910" as const, name: "web_fetch", max_uses: 5 },
];

function serviceClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey);
}

async function getModel(supabase: any): Promise<string> {
  if (!supabase) return DEFAULT_MODEL;
  try {
    const { data } = await supabase
      .from("site_content")
      .select("value")
      .eq("key", "settings.int.anthropic_model")
      .maybeSingle();
    return (data?.value || "").trim() || DEFAULT_MODEL;
  } catch (_e) {
    return DEFAULT_MODEL;
  }
}

function slugify(s: string): string {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || `item-${Date.now()}`;
}

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

const TOOLS = [
  // ---- read: projects ----
  { name: "list_projects", description: "List all portfolio projects with ALL fields (id, slug, title, category, industry, cat, img, blurb, gallery, services, deliverables, testimonial, layout, external, sort_order).", input_schema: { type: "object" as const, properties: {} } },
  { name: "get_project", description: "Get a single project by id or slug with all fields including gallery image URLs.", input_schema: { type: "object" as const, properties: { id: { type: "string", description: "Project UUID." }, slug: { type: "string", description: "Project slug. Use this OR id." } } } },
  // ---- read: services ----
  { name: "list_services", description: "List all services with all fields.", input_schema: { type: "object" as const, properties: {} } },
  { name: "get_service", description: "Get a single service by id or slug.", input_schema: { type: "object" as const, properties: { id: { type: "string" }, slug: { type: "string" } } } },
  // ---- read: reviews ----
  { name: "list_reviews", description: "List all customer reviews.", input_schema: { type: "object" as const, properties: {} } },
  // ---- read: faqs ----
  { name: "list_faqs", description: "List all FAQs, optionally filtered by group.", input_schema: { type: "object" as const, properties: { group: { type: "string", description: "Optional group filter (site, bap)." } } } },
  // ---- read: categories ----
  { name: "list_categories", description: "List all project categories.", input_schema: { type: "object" as const, properties: {} } },
  // ---- read: inquiries ----
  { name: "list_inquiries", description: "List all contact form inquiries with name, email, phone, business, service, budget, message, status, date.", input_schema: { type: "object" as const, properties: {} } },
  { name: "get_inquiry", description: "Get a single inquiry with full details including conversation thread.", input_schema: { type: "object" as const, properties: { id: { type: "string" } }, required: ["id"] as const } },
  // ---- read: page content ----
  { name: "get_page_content", description: "Read editable page copy values. Pass a key prefix to filter (e.g. 'home.' or 'settings.'), or omit for all.", input_schema: { type: "object" as const, properties: { prefix: { type: "string" } } } },
  // ---- read: media ----
  { name: "list_media", description: "List all files in the site-media storage bucket with their public URLs.", input_schema: { type: "object" as const, properties: {} } },
  // ---- read: SEO ----
  { name: "list_page_seo", description: "List all page SEO override entries.", input_schema: { type: "object" as const, properties: {} } },
  { name: "get_page_seo", description: "Get the SEO override for a specific page path.", input_schema: { type: "object" as const, properties: { path: { type: "string" } }, required: ["path"] as const } },
  // ---- read: analytics ----
  { name: "get_analytics", description: "Get recent page view analytics (last 7 days of page_events).", input_schema: { type: "object" as const, properties: {} } },

  // ---- writes: reviews ----
  {
    name: "create_review",
    description: "Add a new customer review.",
    input_schema: {
      type: "object" as const,
      properties: {
        name: { type: "string", description: "Reviewer's name (required)." },
        company: { type: "string" }, short: { type: "string", description: "Punchy excerpt." },
        full: { type: "string", description: "Full review text." },
        source: { type: "string", description: "Google or Facebook. Defaults to Google." },
        rating: { type: "integer", description: "1-5 stars. Defaults to 5." },
        featured: { type: "boolean", description: "Show on public site. Defaults to true." },
      },
      required: ["name", "short"] as const,
    },
  },
  {
    name: "update_review",
    description: "Update an existing review by its id.",
    input_schema: {
      type: "object" as const,
      properties: {
        id: { type: "string" }, name: { type: "string" }, company: { type: "string" },
        short: { type: "string" }, full: { type: "string" }, source: { type: "string" },
        rating: { type: "integer" }, featured: { type: "boolean" },
      },
      required: ["id"] as const,
    },
  },
  { name: "delete_review", description: "Delete a review by id.", input_schema: { type: "object" as const, properties: { id: { type: "string" } }, required: ["id"] as const } },

  // ---- writes: projects ----
  {
    name: "create_project",
    description: "Add a portfolio project. slug auto-generates from title if omitted.",
    input_schema: {
      type: "object" as const,
      properties: {
        title: { type: "string" }, slug: { type: "string" },
        category: { type: "string" }, industry: { type: "string" }, cat: { type: "string" },
        img: { type: "string", description: "Cover image URL." }, blurb: { type: "string" },
        gallery: { type: "array", items: { type: "string" }, description: "Array of image URLs." },
        layout: { type: "array", items: { type: "object" }, description: "Layout blocks." },
        services: { type: "array", items: { type: "string" } },
        deliverables: { type: "array", items: { type: "string" } },
        testimonial: { type: "object", properties: { quote: { type: "string" }, name: { type: "string" }, company: { type: "string" } }, description: "Client testimonial." },
        external: { type: "string" },
      },
      required: ["title"] as const,
    },
  },
  {
    name: "update_project",
    description: "Update a project by its id. You can update any field: title, slug, category, industry, cat, img, blurb, gallery (array of image URLs), layout, services, deliverables, testimonial, external.",
    input_schema: {
      type: "object" as const,
      properties: {
        id: { type: "string" }, title: { type: "string" }, slug: { type: "string" },
        category: { type: "string" }, industry: { type: "string" }, cat: { type: "string" },
        img: { type: "string" }, blurb: { type: "string" },
        gallery: { type: "array", items: { type: "string" } },
        layout: { type: "array", items: { type: "object" } },
        services: { type: "array", items: { type: "string" } },
        deliverables: { type: "array", items: { type: "string" } },
        testimonial: { type: "object", properties: { quote: { type: "string" }, name: { type: "string" }, company: { type: "string" } } },
        external: { type: "string" },
      },
      required: ["id"] as const,
    },
  },
  { name: "delete_project", description: "Delete a project by id.", input_schema: { type: "object" as const, properties: { id: { type: "string" } }, required: ["id"] as const } },

  // ---- writes: services ----
  {
    name: "create_service",
    description: "Add a service.",
    input_schema: {
      type: "object" as const,
      properties: {
        title: { type: "string" }, slug: { type: "string" }, num: { type: "string" },
        short: { type: "string" }, note: { type: "string" }, industries: { type: "string" },
        desc: { type: "string" }, bullets: { type: "array", items: { type: "string" } },
        img: { type: "string" },
      },
      required: ["title"] as const,
    },
  },
  {
    name: "update_service",
    description: "Update a service by id.",
    input_schema: {
      type: "object" as const,
      properties: {
        id: { type: "string" }, title: { type: "string" }, slug: { type: "string" }, num: { type: "string" },
        short: { type: "string" }, note: { type: "string" }, industries: { type: "string" },
        desc: { type: "string" }, bullets: { type: "array", items: { type: "string" } }, img: { type: "string" },
      },
      required: ["id"] as const,
    },
  },
  { name: "delete_service", description: "Delete a service by id.", input_schema: { type: "object" as const, properties: { id: { type: "string" } }, required: ["id"] as const } },

  // ---- writes: faqs ----
  {
    name: "create_faq",
    description: "Add an FAQ.",
    input_schema: { type: "object" as const, properties: { question: { type: "string" }, answer: { type: "string" }, group: { type: "string", description: "FAQ group (site or bap). Defaults to site." } }, required: ["question", "answer"] as const },
  },
  {
    name: "update_faq",
    description: "Update an FAQ by id.",
    input_schema: { type: "object" as const, properties: { id: { type: "string" }, question: { type: "string" }, answer: { type: "string" }, group: { type: "string" } }, required: ["id"] as const },
  },
  { name: "delete_faq", description: "Delete an FAQ by id.", input_schema: { type: "object" as const, properties: { id: { type: "string" } }, required: ["id"] as const } },

  // ---- writes: categories ----
  {
    name: "create_category",
    description: "Add a project category.",
    input_schema: { type: "object" as const, properties: { key: { type: "string", description: "URL-safe key." }, label: { type: "string", description: "Display label." }, sortOrder: { type: "integer" } }, required: ["key", "label"] as const },
  },
  {
    name: "update_category",
    description: "Update a category by id.",
    input_schema: { type: "object" as const, properties: { id: { type: "string" }, key: { type: "string" }, label: { type: "string" }, sortOrder: { type: "integer" } }, required: ["id"] as const },
  },
  { name: "delete_category", description: "Delete a category by id.", input_schema: { type: "object" as const, properties: { id: { type: "string" } }, required: ["id"] as const } },

  // ---- writes: inquiries ----
  {
    name: "update_inquiry",
    description: "Update an inquiry's status or internal note.",
    input_schema: { type: "object" as const, properties: { id: { type: "string" }, status: { type: "string", description: "new, replied, or booked." }, note: { type: "string", description: "Internal note." } }, required: ["id"] as const },
  },

  // ---- writes: page content ----
  {
    name: "set_page_content",
    description: "Set the value of an editable page-copy key in site_content (upsert).",
    input_schema: { type: "object" as const, properties: { key: { type: "string" }, value: { type: "string" } }, required: ["key", "value"] as const },
  },

  // ---- writes: SEO ----
  {
    name: "set_page_seo",
    description: "Create or update the SEO override for a page path (upsert). Fields: meta_title, meta_description, og_image, canonical_override, robots_noindex, faq (JSON array of {question,answer}), custom_jsonld.",
    input_schema: {
      type: "object" as const,
      properties: {
        path: { type: "string", description: "Route path, e.g. / or /about or /work/boss-hawgs-bbq" },
        meta_title: { type: "string" }, meta_description: { type: "string" },
        og_image: { type: "string" }, canonical_override: { type: "string" },
        robots_noindex: { type: "boolean" },
        faq: { type: "array", items: { type: "object", properties: { question: { type: "string" }, answer: { type: "string" } } } },
        custom_jsonld: { type: "object" },
      },
      required: ["path"] as const,
    },
  },
  { name: "delete_page_seo", description: "Delete the SEO override for a page path.", input_schema: { type: "object" as const, properties: { path: { type: "string" } }, required: ["path"] as const } },
];

const READ_TOOLS = new Set([
  "list_reviews", "list_projects", "get_project", "list_services", "get_service",
  "list_faqs", "list_categories", "list_inquiries", "get_inquiry",
  "get_page_content", "list_media", "list_page_seo", "get_page_seo", "get_analytics",
]);

type Action = { action: string; entity: string; entity_id: string; summary: string; detail: unknown };

// ---------------------------------------------------------------------------
// Tool execution
// ---------------------------------------------------------------------------

async function runTool(sb: any, name: string, input: any, actions: Action[]): Promise<unknown> {
  switch (name) {
    // -- reads --
    case "list_reviews": {
      const { data, error } = await sb.from("reviews").select("*").order("sort_order");
      if (error) throw error;
      return data;
    }
    case "list_projects": {
      const { data, error } = await sb.from("projects").select("*").order("sort_order");
      if (error) throw error;
      return data;
    }
    case "get_project": {
      let q = sb.from("projects").select("*");
      if (input.id) q = q.eq("id", input.id);
      else if (input.slug) q = q.eq("slug", input.slug);
      else throw new Error("Provide id or slug.");
      const { data, error } = await q.maybeSingle();
      if (error) throw error;
      if (!data) return { error: "Project not found." };
      return data;
    }
    case "list_services": {
      const { data, error } = await sb.from("services").select("*").order("sort_order");
      if (error) throw error;
      return data;
    }
    case "get_service": {
      let q = sb.from("services").select("*");
      if (input.id) q = q.eq("id", input.id);
      else if (input.slug) q = q.eq("slug", input.slug);
      else throw new Error("Provide id or slug.");
      const { data, error } = await q.maybeSingle();
      if (error) throw error;
      if (!data) return { error: "Service not found." };
      return data;
    }
    case "list_faqs": {
      let q = sb.from("faqs").select("*").order("sort_order");
      if (input.group) q = q.eq("faq_group", input.group);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    }
    case "list_categories": {
      const { data, error } = await sb.from("project_categories").select("*").order("sort_order");
      if (error) throw error;
      return data;
    }
    case "list_inquiries": {
      const { data, error } = await sb.from("inquiries").select("*").order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data;
    }
    case "get_inquiry": {
      const { data, error } = await sb.from("inquiries").select("*").eq("id", input.id).maybeSingle();
      if (error) throw error;
      if (!data) return { error: "Inquiry not found." };
      return data;
    }
    case "get_page_content": {
      let q = sb.from("site_content").select("key, value");
      if (input?.prefix) q = q.like("key", `${input.prefix}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    }
    case "list_media": {
      const { data, error } = await sb.storage.from("site-media").list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
      if (error) throw error;
      const url = Deno.env.get("SUPABASE_URL");
      return (data || []).map((f: any) => ({
        name: f.name,
        size: f.metadata?.size,
        type: f.metadata?.mimetype,
        created: f.created_at,
        url: `${url}/storage/v1/object/public/site-media/${f.name}`,
      }));
    }
    case "list_page_seo": {
      const { data, error } = await sb.from("page_seo").select("*").order("path");
      if (error) throw error;
      return data;
    }
    case "get_page_seo": {
      const { data, error } = await sb.from("page_seo").select("*").eq("path", input.path).maybeSingle();
      if (error) throw error;
      return data || { path: input.path, note: "No SEO override exists for this path yet." };
    }
    case "get_analytics": {
      const since = new Date(Date.now() - 7 * 86400000).toISOString();
      const { data, error } = await sb.from("page_events").select("page, event_type, created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(500);
      if (error) throw error;
      const pages: Record<string, number> = {};
      for (const r of data || []) pages[r.page] = (pages[r.page] || 0) + 1;
      return { since, total: (data || []).length, byPage: pages };
    }

    // -- writes: reviews --
    case "create_review": {
      const row = {
        name: input.name, company: input.company ?? "", short: input.short,
        full_text: input.full ?? input.short, source: input.source ?? "Google",
        rating: input.rating ?? 5, featured: input.featured ?? true,
      };
      const { data, error } = await sb.from("reviews").insert(row).select().maybeSingle();
      if (error) throw error;
      actions.push({ action: name, entity: "review", entity_id: data?.id || "", summary: `Added review from ${row.name}`, detail: row });
      return data;
    }
    case "update_review": {
      const patch: any = {};
      for (const [k, dbk] of [["name", "name"], ["company", "company"], ["short", "short"], ["full", "full_text"], ["source", "source"], ["rating", "rating"], ["featured", "featured"]])
        if (input[k] !== undefined) patch[dbk] = input[k];
      const { data, error } = await sb.from("reviews").update(patch).eq("id", input.id).select().maybeSingle();
      if (error) throw error;
      actions.push({ action: name, entity: "review", entity_id: input.id, summary: `Updated review ${data?.name || input.id}`, detail: patch });
      return data;
    }
    case "delete_review": {
      const { error } = await sb.from("reviews").delete().eq("id", input.id);
      if (error) throw error;
      actions.push({ action: name, entity: "review", entity_id: input.id, summary: `Deleted review ${input.id}`, detail: { id: input.id } });
      return { deleted: true };
    }

    // -- writes: projects --
    case "create_project": {
      const row = {
        slug: input.slug ? slugify(input.slug) : slugify(input.title),
        title: input.title, category: input.category ?? "", industry: input.industry ?? "",
        cat: input.cat ?? "", img: input.img ?? "", blurb: input.blurb ?? "",
        gallery: input.gallery ?? [], layout: input.layout ?? [], services: input.services ?? [],
        deliverables: input.deliverables ?? [], testimonial: input.testimonial ?? null,
        external: input.external ?? null,
      };
      const { data, error } = await sb.from("projects").insert(row).select().maybeSingle();
      if (error) throw error;
      actions.push({ action: name, entity: "project", entity_id: data?.id || "", summary: `Added project "${row.title}"`, detail: row });
      return data;
    }
    case "update_project": {
      const patch: any = {};
      for (const k of ["title", "category", "industry", "cat", "img", "blurb", "gallery", "layout", "services", "deliverables", "testimonial", "external"])
        if (input[k] !== undefined) patch[k] = input[k];
      if (input.slug !== undefined) patch.slug = slugify(input.slug);
      const { data, error } = await sb.from("projects").update(patch).eq("id", input.id).select().maybeSingle();
      if (error) throw error;
      actions.push({ action: name, entity: "project", entity_id: input.id, summary: `Updated project ${data?.title || input.id}`, detail: patch });
      return data;
    }
    case "delete_project": {
      const { error } = await sb.from("projects").delete().eq("id", input.id);
      if (error) throw error;
      actions.push({ action: name, entity: "project", entity_id: input.id, summary: `Deleted project ${input.id}`, detail: { id: input.id } });
      return { deleted: true };
    }

    // -- writes: services --
    case "create_service": {
      const row = {
        slug: input.slug ? slugify(input.slug) : slugify(input.title),
        title: input.title, num: input.num ?? "", short: input.short ?? "", note: input.note ?? "",
        industries: input.industries ?? "", description: input.desc ?? "", bullets: input.bullets ?? [], img: input.img ?? "",
      };
      const { data, error } = await sb.from("services").insert(row).select().maybeSingle();
      if (error) throw error;
      actions.push({ action: name, entity: "service", entity_id: data?.id || "", summary: `Added service "${row.title}"`, detail: row });
      return data;
    }
    case "update_service": {
      const patch: any = {};
      for (const [k, dbk] of [["title", "title"], ["num", "num"], ["short", "short"], ["note", "note"], ["industries", "industries"], ["desc", "description"], ["bullets", "bullets"], ["img", "img"]])
        if (input[k] !== undefined) patch[dbk] = input[k];
      if (input.slug !== undefined) patch.slug = slugify(input.slug);
      const { data, error } = await sb.from("services").update(patch).eq("id", input.id).select().maybeSingle();
      if (error) throw error;
      actions.push({ action: name, entity: "service", entity_id: input.id, summary: `Updated service ${data?.title || input.id}`, detail: patch });
      return data;
    }
    case "delete_service": {
      const { error } = await sb.from("services").delete().eq("id", input.id);
      if (error) throw error;
      actions.push({ action: name, entity: "service", entity_id: input.id, summary: `Deleted service ${input.id}`, detail: { id: input.id } });
      return { deleted: true };
    }

    // -- writes: faqs --
    case "create_faq": {
      const row = { faq_group: input.group ?? "site", question: input.question, answer: input.answer };
      const { data, error } = await sb.from("faqs").insert(row).select().maybeSingle();
      if (error) throw error;
      actions.push({ action: name, entity: "faq", entity_id: data?.id || "", summary: `Added FAQ "${row.question.slice(0, 60)}"`, detail: row });
      return data;
    }
    case "update_faq": {
      const patch: any = {};
      if (input.question !== undefined) patch.question = input.question;
      if (input.answer !== undefined) patch.answer = input.answer;
      if (input.group !== undefined) patch.faq_group = input.group;
      const { data, error } = await sb.from("faqs").update(patch).eq("id", input.id).select().maybeSingle();
      if (error) throw error;
      actions.push({ action: name, entity: "faq", entity_id: input.id, summary: `Updated FAQ ${input.id}`, detail: patch });
      return data;
    }
    case "delete_faq": {
      const { error } = await sb.from("faqs").delete().eq("id", input.id);
      if (error) throw error;
      actions.push({ action: name, entity: "faq", entity_id: input.id, summary: `Deleted FAQ ${input.id}`, detail: { id: input.id } });
      return { deleted: true };
    }

    // -- writes: categories --
    case "create_category": {
      const row = { key: slugify(input.key), label: input.label, sort_order: input.sortOrder ?? 0 };
      const { data, error } = await sb.from("project_categories").insert(row).select().maybeSingle();
      if (error) throw error;
      actions.push({ action: name, entity: "category", entity_id: data?.id || "", summary: `Added category "${row.label}"`, detail: row });
      return data;
    }
    case "update_category": {
      const patch: any = {};
      if (input.key !== undefined) patch.key = slugify(input.key);
      if (input.label !== undefined) patch.label = input.label;
      if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder;
      const { data, error } = await sb.from("project_categories").update(patch).eq("id", input.id).select().maybeSingle();
      if (error) throw error;
      actions.push({ action: name, entity: "category", entity_id: input.id, summary: `Updated category ${data?.label || input.id}`, detail: patch });
      return data;
    }
    case "delete_category": {
      const { error } = await sb.from("project_categories").delete().eq("id", input.id);
      if (error) throw error;
      actions.push({ action: name, entity: "category", entity_id: input.id, summary: `Deleted category ${input.id}`, detail: { id: input.id } });
      return { deleted: true };
    }

    // -- writes: inquiries --
    case "update_inquiry": {
      const patch: any = { updated_at: new Date().toISOString() };
      if (input.status !== undefined) patch.status = input.status;
      if (input.note !== undefined) patch.note = input.note;
      const { data, error } = await sb.from("inquiries").update(patch).eq("id", input.id).select().maybeSingle();
      if (error) throw error;
      actions.push({ action: name, entity: "inquiry", entity_id: input.id, summary: `Updated inquiry ${input.id} status=${input.status || "unchanged"}`, detail: patch });
      return data;
    }

    // -- writes: page content --
    case "set_page_content": {
      const row = { key: input.key, value: input.value ?? "", updated_at: new Date().toISOString() };
      const { error } = await sb.from("site_content").upsert(row, { onConflict: "key" });
      if (error) throw error;
      actions.push({ action: name, entity: "page_content", entity_id: input.key, summary: `Set page copy "${input.key}"`, detail: { key: input.key } });
      return { ok: true };
    }

    // -- writes: SEO --
    case "set_page_seo": {
      const row: any = { path: input.path, updated_at: new Date().toISOString() };
      if (input.meta_title !== undefined) row.meta_title = input.meta_title;
      if (input.meta_description !== undefined) row.meta_description = input.meta_description;
      if (input.og_image !== undefined) row.og_image = input.og_image;
      if (input.canonical_override !== undefined) row.canonical_override = input.canonical_override;
      if (input.robots_noindex !== undefined) row.robots_noindex = input.robots_noindex;
      if (input.faq !== undefined) row.faq = input.faq;
      if (input.custom_jsonld !== undefined) row.custom_jsonld = input.custom_jsonld;
      const { data, error } = await sb.from("page_seo").upsert(row, { onConflict: "path" }).select().maybeSingle();
      if (error) throw error;
      actions.push({ action: name, entity: "page_seo", entity_id: input.path, summary: `Set SEO for ${input.path}`, detail: row });
      return data;
    }
    case "delete_page_seo": {
      const { error } = await sb.from("page_seo").delete().eq("path", input.path);
      if (error) throw error;
      actions.push({ action: name, entity: "page_seo", entity_id: input.path, summary: `Deleted SEO override for ${input.path}`, detail: { path: input.path } });
      return { deleted: true };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// ---------------------------------------------------------------------------
// Claude API call
// ---------------------------------------------------------------------------

async function callClaude(key: string, model: string, messages: any[]) {
  return await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "web-fetch-2025-09-10",
    },
    body: JSON.stringify({ model, max_tokens: 4096, system: SYSTEM, tools: [...WEB_TOOLS, ...TOOLS], messages }),
  });
}

// ---------------------------------------------------------------------------
// Serve
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) return json({ error: "The assistant isn't configured yet (missing API key)." }, 200);

  const sb = serviceClient();
  if (!sb) return json({ error: "Server not configured." }, 200);

  let messages: any[];
  try {
    const body = await req.json();
    messages = Array.isArray(body.messages) ? body.messages : [];
  } catch (_e) {
    return json({ error: "Bad request." }, 200);
  }
  if (!messages.length) return json({ error: "No message." }, 200);

  let model = await getModel(sb);
  const actions: Action[] = [];

  try {
    for (let turn = 0; turn < MAX_TURNS; turn++) {
      let res = await callClaude(key, model, messages);
      if (!res.ok && model !== DEFAULT_MODEL && (res.status === 404 || res.status === 400)) {
        model = DEFAULT_MODEL;
        res = await callClaude(key, model, messages);
      }
      if (!res.ok) {
        const txt = await res.text();
        return json({ error: "The assistant couldn't respond just now.", detail: txt.slice(0, 300), messages, actions }, 200);
      }

      const data = await res.json();
      messages.push({ role: "assistant", content: data.content });

      if (data.stop_reason !== "tool_use") break;

      const toolResults: any[] = [];
      for (const block of data.content) {
        if (block.type !== "tool_use") continue;
        try {
          const out = await runTool(sb, block.name, block.input || {}, actions);
          toolResults.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify(out ?? null).slice(0, 12000) });
        } catch (e) {
          toolResults.push({ type: "tool_result", tool_use_id: block.id, is_error: true, content: String((e as Error)?.message || e).slice(0, 500) });
        }
      }
      messages.push({ role: "user", content: toolResults });
    }

    if (actions.length) {
      await sb.from("assistant_actions").insert(
        actions.map((a) => ({ action: a.action, entity: a.entity, entity_id: a.entity_id, summary: a.summary, detail: a.detail })),
      );
    }

    return json({ messages, actions });
  } catch (e) {
    return json({ error: String((e as Error)?.message || e).slice(0, 300), messages, actions }, 200);
  }
});
