import { generateTentativePlan, listTentativeTypes } from "@/lib/cps-tentative";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/utils";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);
  return Response.json({ types: listTentativeTypes() });
}

export async function POST(request: Request) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  const cpsType = String(body?.cpsType ?? "");
  const sosDate = String(body?.sosDate ?? "");
  const pace = body?.pace === "accelerated" ? "accelerated" : "standard";
  const projectName = body?.projectName ? String(body.projectName) : undefined;

  try {
    const plan = generateTentativePlan({
      cpsType,
      sosDate,
      pace,
      projectName,
    });
    return Response.json({ plan });
  } catch (err) {
    return jsonError(
      err instanceof Error ? err.message : "Failed to generate tentative CPS",
      400,
    );
  }
}
