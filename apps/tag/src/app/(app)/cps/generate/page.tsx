"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Download, Sparkles, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api-client";
import type { TentativePlan, TentativeStep } from "@/lib/cps-tentative";

type TypeSummary = {
  id: string;
  name: string;
  sheetName: string;
  stepCount: number;
};

export default function GenerateTentativeCpsPage() {
  const [types, setTypes] = useState<TypeSummary[]>([]);
  const [cpsType, setCpsType] = useState("ctmz-normal");
  const [sosDate, setSosDate] = useState("");
  const [pace, setPace] = useState<"standard" | "accelerated">("standard");
  const [projectName, setProjectName] = useState("");
  const [plan, setPlan] = useState<TentativePlan | null>(null);
  const [steps, setSteps] = useState<TentativeStep[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<{ types: TypeSummary[] }>("/api/cps/tentative")
      .then((r) => {
        setTypes(r.types);
        if (r.types[0]) setCpsType(r.types[0].id);
      })
      .catch((e) => setError(String(e.message || e)));
  }, []);

  const dirty = useMemo(() => {
    if (!plan) return false;
    return JSON.stringify(plan.steps) !== JSON.stringify(steps);
  }, [plan, steps]);

  async function onGenerate(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await api<{ plan: TentativePlan }>("/api/cps/tentative", {
        method: "POST",
        body: JSON.stringify({ cpsType, sosDate, pace, projectName }),
      });
      setPlan(res.plan);
      setSteps(res.plan.steps.map((s) => ({ ...s })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generate failed");
    } finally {
      setBusy(false);
    }
  }

  function updateStep(id: string, patch: Partial<TentativeStep>) {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    );
  }

  function removeStep(id: string) {
    setSteps((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((s) => s.id !== id);
    });
  }

  async function onReschedule() {
    if (!plan) return;
    setBusy(true);
    setError("");
    try {
      const res = await api<{ plan: TentativePlan }>(
        "/api/cps/tentative/reschedule",
        {
          method: "POST",
          body: JSON.stringify({ plan: { ...plan, steps } }),
        },
      );
      setPlan(res.plan);
      setSteps(res.plan.steps.map((s) => ({ ...s })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reschedule failed");
    } finally {
      setBusy(false);
    }
  }

  async function onDownload() {
    if (!plan) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/cps/tentative/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: { ...plan, steps } }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error || "Download failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const cd = res.headers.get("Content-Disposition") || "";
      const match = cd.match(/filename="([^"]+)"/);
      a.href = url;
      a.download = match?.[1] || "tentative-cps.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="CPS"
        title="Generate tentative CPS"
        description="Pick a CPS type and SOS date. TAG back-calculates step end dates from workbook lead times (Standard or Accelerated), then you can edit and download Excel."
        actions={
          <Link href="/projects" className="btn border border-[var(--line)] bg-white/70">
            Back to Projects
          </Link>
        }
      />

      <form
        onSubmit={onGenerate}
        className="panel mb-5 grid gap-4 rounded-[22px] p-5 md:grid-cols-2"
        data-testid="tentative-cps-form"
      >
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-ink">CPS type</span>
          <select
            className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2"
            value={cpsType}
            onChange={(e) => setCpsType(e.target.value)}
            required
          >
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.stepCount} steps)
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-ink">SOS date</span>
          <input
            type="date"
            required
            className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2"
            value={sosDate}
            onChange={(e) => setSosDate(e.target.value)}
            data-testid="tentative-sos-date"
          />
        </label>

        <label className="block text-sm md:col-span-2">
          <span className="mb-1 block font-semibold text-ink">
            Project / file name (optional)
          </span>
          <input
            className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="e.g. Olay Pack Box — Sale 6"
          />
        </label>

        <fieldset className="md:col-span-2">
          <legend className="mb-2 text-sm font-semibold text-ink">Pace</legend>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`btn px-3 py-1.5 ${
                pace === "standard"
                  ? "bg-[var(--ink)] text-[#f4f8fb]"
                  : "border border-[var(--line)] bg-white/70"
              }`}
              onClick={() => setPace("standard")}
            >
              Standard
            </button>
            <button
              type="button"
              className={`btn px-3 py-1.5 ${
                pace === "accelerated"
                  ? "bg-[var(--ink)] text-[#f4f8fb]"
                  : "border border-[var(--line)] bg-white/70"
              }`}
              onClick={() => setPace("accelerated")}
              data-testid="tentative-pace-accelerated"
            >
              Accelerated
            </button>
          </div>
          <p className="mt-2 text-sm text-muted">
            Standard uses Lead Time values from the CPS type sheet. Accelerated
            applies shorter timings defined in the workbook (CTMZ Special leads
            for CTMZ Normal matches; Design Leadtime Urgent for layout/revision/FA
            where listed).
          </p>
        </fieldset>

        <div className="md:col-span-2">
          <button
            type="submit"
            className="btn bg-[var(--ink)] text-[#f4f8fb]"
            disabled={busy || !sosDate}
            data-testid="tentative-generate"
          >
            <Sparkles size={16} />
            {busy ? "Working…" : "Generate preview"}
          </button>
        </div>
      </form>

      {error ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {plan ? (
        <section
          className="panel rounded-[22px] p-5"
          data-testid="tentative-cps-preview"
        >
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
                Preview · editable
              </div>
              <h2 className="brand-mark text-3xl leading-none">
                {plan.projectName}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {plan.cpsName} · {plan.pace} · SOS {plan.sosDate} · Brief≈{" "}
                {steps[0]?.endDate ?? plan.briefDate}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn border border-[var(--line)] bg-white/70"
                onClick={onReschedule}
                disabled={busy}
              >
                Recalc dates from leads
              </button>
              <button
                type="button"
                className="btn bg-[var(--ink)] text-[#f4f8fb]"
                onClick={onDownload}
                disabled={busy}
                data-testid="tentative-download"
              >
                <Download size={16} />
                Download Excel
              </button>
            </div>
          </div>

          {dirty ? (
            <p className="mb-3 text-sm text-amber-800">
              Steps edited or removed — use Recalc dates from leads before
              download if end dates should follow the remaining leads. Removed
              steps stay out of the Excel download.
            </p>
          ) : null}

          <p className="mb-3 text-sm text-muted">
            {steps.length} step{steps.length === 1 ? "" : "s"} in this CPS
            {plan.steps.length !== steps.length
              ? ` (${plan.steps.length - steps.length} removed)`
              : ""}
            .
          </p>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] text-xs uppercase tracking-[0.12em] text-muted">
                  <th className="py-2 pr-2">Step</th>
                  <th className="py-2 pr-2">Lead (WD)</th>
                  <th className="py-2 pr-2">End date</th>
                  <th className="py-2 pr-2">Owner</th>
                  <th className="py-2 pr-2">Notes</th>
                  <th className="py-2 text-right"> </th>
                </tr>
              </thead>
              <tbody>
                {steps.map((s) => (
                  <tr key={s.id} className="border-b border-[var(--line)] align-top">
                    <td className="py-2 pr-2 font-semibold text-ink">
                      {s.title}
                      {s.adjustable ? (
                        <span className="ml-1 text-xs font-normal text-muted">
                          (adjustable)
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        min={0}
                        className="w-20 rounded-lg border border-[var(--line)] bg-white px-2 py-1"
                        value={s.leadTimeApplied}
                        onChange={(e) =>
                          updateStep(s.id, {
                            leadTimeApplied: Number(e.target.value) || 0,
                          })
                        }
                      />
                      {s.acceleratedFrom != null &&
                      s.acceleratedFrom !== s.leadTimeApplied ? (
                        <div className="mt-0.5 text-[11px] text-muted">
                          was {s.acceleratedFrom}
                        </div>
                      ) : null}
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="date"
                        className="rounded-lg border border-[var(--line)] bg-white px-2 py-1"
                        value={s.endDate}
                        onChange={(e) =>
                          updateStep(s.id, { endDate: e.target.value })
                        }
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        className="w-full min-w-[8rem] rounded-lg border border-[var(--line)] bg-white px-2 py-1"
                        value={s.ownerRole ?? ""}
                        onChange={(e) =>
                          updateStep(s.id, { ownerRole: e.target.value || null })
                        }
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        className="w-full min-w-[12rem] rounded-lg border border-[var(--line)] bg-white px-2 py-1"
                        value={s.notes ?? ""}
                        onChange={(e) =>
                          updateStep(s.id, { notes: e.target.value || null })
                        }
                      />
                    </td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        className="btn border border-[var(--line)] bg-white/70 px-2 py-1 text-xs"
                        onClick={() => removeStep(s.id)}
                        disabled={busy || steps.length <= 1}
                        data-testid={`tentative-remove-${s.id}`}
                        aria-label={`Remove step ${s.title}`}
                        title={
                          steps.length <= 1
                            ? "Keep at least one step"
                            : "Remove from CPS"
                        }
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted">{plan.accelerationNote}</p>
        </section>
      ) : null}
    </div>
  );
}
