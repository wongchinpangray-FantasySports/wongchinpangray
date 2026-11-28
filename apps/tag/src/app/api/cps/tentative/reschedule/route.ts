import { getCurrentUser } from "@/lib/auth";
import {
  rescheduleFromSos,
  type TentativePlan,
  type TentativeStep,
} from "@/lib/cps-tentative";
import { jsonError } from "@/lib/utils";

export async function POST(request: Request) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  const plan = body?.plan as TentativePlan | undefined;
  if (!plan?.steps?.length || !plan.sosDate || !plan.cpsType) {
    return jsonError("plan with steps, cpsType, and sosDate required");
  }

  const steps = rescheduleFromSos(plan, plan.steps as TentativeStep[]);
  const next: TentativePlan = {
    ...plan,
    steps,
    briefDate: steps[0]?.endDate ?? plan.sosDate,
  };
  return Response.json({ plan: next });
}
