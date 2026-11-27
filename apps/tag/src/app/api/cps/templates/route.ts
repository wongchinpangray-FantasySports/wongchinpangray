import { getCurrentUser } from "@/lib/auth";
import { listCpsTemplates } from "@/lib/cps";
import { jsonError } from "@/lib/utils";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);
  return Response.json({ templates: listCpsTemplates() });
}
