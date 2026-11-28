import type { NextConfig } from "next";

// Note: do not call initOpenNextCloudflareForDev() here — it injects stub D1/R2
// bindings into `next dev` and would bypass local better-sqlite3. Use
// `npm run preview` (OpenNext + Wrangler) to exercise Cloudflare bindings.

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  transpilePackages: ["react-pdf", "pdfjs-dist"],
  // Try Live / cloud desktop often opens via 127.0.0.1 while Next binds localhost
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  turbopack: {
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
