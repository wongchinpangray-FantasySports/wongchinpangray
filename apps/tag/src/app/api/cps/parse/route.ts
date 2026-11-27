import { getCurrentUser } from "@/lib/auth";
import { parseCpsWorkbook, suggestBriefDate, suggestSosDate } from "@/lib/cps-parse";
import { jsonError } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return jsonError("Excel file required (.xlsx)");

  const name = file.name || "upload.xlsx";
  if (!/\.xlsx$/i.test(name) && !/\.xls$/i.test(name)) {
    return jsonError("Please upload an Excel .xlsx file");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let parsed;
  try {
    parsed = parseCpsWorkbook(buffer);
  } catch (err) {
    return jsonError(
      err instanceof Error ? err.message : "Failed to parse workbook",
      400,
    );
  }

  if (parsed.templates.length === 0) {
    return jsonError(
      "No CPS sheets found. Need a sheet with Step / Lead Time columns (e.g. CTMZ or POSM templates).",
      422,
    );
  }

  return Response.json({
    fileName: name,
    templates: parsed.templates.map((t) => ({
      ...t,
      suggestedBriefDate: suggestBriefDate(t),
      suggestedSosDate: suggestSosDate(t),
    })),
    skippedSheets: parsed.skippedSheets,
  });
}
