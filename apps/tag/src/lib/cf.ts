export type TagBindings = {
  TAG_DB?: D1Database;
  TAG_ASSETS?: R2Bucket;
  ASSETS?: Fetcher;
  NEXT_INC_CACHE_R2_BUCKET?: R2Bucket;
};

export async function getCloudflareEnv(): Promise<TagBindings | null> {
  // Plain `next dev` / `next start` should use local SQLite + disk uploads.
  // OpenNext Worker / `wrangler` preview sets TAG_RUNTIME=cloudflare via wrangler vars.
  if (process.env.TAG_RUNTIME !== "cloudflare") {
    return null;
  }
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    return (ctx?.env as TagBindings) ?? null;
  } catch {
    return null;
  }
}
