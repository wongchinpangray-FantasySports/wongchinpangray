import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { dbGet } from "@/db/query";
import { assets } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { getUploadObject } from "@/lib/storage";
import { jsonError } from "@/lib/utils";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);
  const { id } = await ctx.params;

  const asset = await dbGet(
    (await getDb()).select().from(assets).where(eq(assets.id, id)),
  );
  if (!asset) return jsonError("Not found", 404);

  const file = await getUploadObject(asset.filename);
  if (!file) return jsonError("File missing", 404);

  return new Response(Buffer.from(file.body), {
    headers: {
      "Content-Type": file.contentType || asset.mimeType,
      "Content-Disposition": `inline; filename="${asset.originalName.replace(/"/g, "")}"`,
      "Content-Length": String(file.body.byteLength),
    },
  });
}
