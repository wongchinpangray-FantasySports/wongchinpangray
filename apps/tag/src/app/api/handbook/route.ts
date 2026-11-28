import { getCurrentUser } from "@/lib/auth";
import { HANDBOOK } from "@/lib/handbook";
import { getHandbookBytes } from "@/lib/storage";
import { jsonError } from "@/lib/utils";

export async function GET(req: Request) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);

  const buf = await getHandbookBytes();
  if (!buf) return jsonError("Handbook file missing", 404);

  const url = new URL(req.url);
  const download = url.searchParams.get("download") === "1";

  return new Response(Buffer.from(buf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(buf.byteLength),
      "Cache-Control": "private, max-age=3600",
      "Content-Disposition": download
        ? `attachment; filename="${HANDBOOK.filename}"`
        : `inline; filename="${HANDBOOK.filename}"`,
    },
  });
}
