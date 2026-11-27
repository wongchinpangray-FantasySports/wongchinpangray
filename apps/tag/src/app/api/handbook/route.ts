import fs from "fs";
import { getCurrentUser } from "@/lib/auth";
import { HANDBOOK } from "@/lib/handbook";
import { getHandbookFilePath } from "@/lib/handbook-path";
import { jsonError } from "@/lib/utils";

export async function GET(req: Request) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);

  const filePath = getHandbookFilePath();
  if (!fs.existsSync(filePath)) {
    return jsonError("Handbook file missing", 404);
  }

  const buf = fs.readFileSync(filePath);
  const url = new URL(req.url);
  const download = url.searchParams.get("download") === "1";

  return new Response(buf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(buf.length),
      "Cache-Control": "private, max-age=3600",
      "Content-Disposition": download
        ? `attachment; filename="${HANDBOOK.filename}"`
        : `inline; filename="${HANDBOOK.filename}"`,
    },
  });
}
