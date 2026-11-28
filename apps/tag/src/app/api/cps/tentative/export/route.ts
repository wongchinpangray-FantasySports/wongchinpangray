import * as XLSX from "xlsx";
import { getCurrentUser } from "@/lib/auth";
import {
  tentativeToWorkbook,
  type TentativePlan,
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

  // Export uses the edited preview as-is (user may have hand-tuned dates).
  const finalPlan: TentativePlan = {
    ...plan,
    briefDate: plan.steps[0]?.endDate ?? plan.sosDate,
  };

  const rows = tentativeToWorkbook(finalPlan);
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, "Tentative CPS");
  const out = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;

  const safeName = (finalPlan.projectName || "tentative-cps")
    .replace(/[^\w\-]+/g, "_")
    .slice(0, 60);
  const filename = `${safeName}-${finalPlan.sosDate}.xlsx`;

  return new Response(out, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(out.byteLength),
    },
  });
}
