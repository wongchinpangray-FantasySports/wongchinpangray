import fs from "fs";
import path from "path";
import { eq } from "drizzle-orm";
import { getDb, getUploadsDir } from "@/db";
import { assets } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/utils";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);
  const { id } = await ctx.params;

  const asset = getDb().select().from(assets).where(eq(assets.id, id)).get();
  if (!asset) return jsonError("Not found", 404);

  const filePath = path.join(getUploadsDir(), asset.filename);
  if (!fs.existsSync(filePath)) return jsonError("File missing", 404);

  const buf = fs.readFileSync(filePath);
  return new Response(buf, {
    headers: {
      "Content-Type": asset.mimeType,
      "Content-Disposition": `inline; filename="${asset.originalName.replace(/"/g, "")}"`,
      "Content-Length": String(buf.length),
    },
  });
}
