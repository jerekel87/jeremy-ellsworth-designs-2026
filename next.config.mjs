/** @type {import('next').NextConfig} */
const nextConfig = {
  // The legacy Vite route components live in /pages as .jsx. Limiting Next's
  // route extensions to ts/tsx keeps those files from being claimed by the
  // Pages Router during the migration — the App Router under /src/app owns
  // every real route.
  pageExtensions: ["tsx", "ts"],
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  // Vercel still carries the original Vite-named secrets (VITE_SUPABASE_*).
  // Bridge them to the NEXT_PUBLIC_* names the client reads so the same env
  // vars feed both bundlers without re-adding them in the Vercel dashboard.
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY,
  },
};

export default nextConfig;
