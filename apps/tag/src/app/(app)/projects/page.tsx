"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Sparkles, Upload } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Modal } from "@/components/Modal";
import { StatusPill } from "@/components/StatusPill";
import { ProgressBar } from "@/components/ProgressBar";
import { api } from "@/lib/api-client";

type Project = {
  id: string;
  name: string;
  description: string;
  status: string;
  color: string;
  ownerName: string | null;
  dueDate: string | null;
  cpsType?: string | null;
  cpsName?: string | null;
  briefDate?: string | null;
  progress?: { done: number; total: number; percent: number };
  currentMilestone?: {
    id: string;
    title: string;
    percent: number;
    overdue: boolean;
  } | null;
};

type User = { id: string; name: string };

type CpsTemplateSummary = {
  id: string;
  name: string;
  sheetName: string;
  milestoneCount: number;
  stepCount: number;
};

type ParsedTemplate = CpsTemplateSummary & {
  milestones: unknown[];
  metaFields: Record<string, string | null>;
  suggestedBriefDate?: string | null;
  suggestedSosDate?: string | null;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [templates, setTemplates] = useState<CpsTemplateSummary[]>([]);
  const [open, setOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [parsedTemplates, setParsedTemplates] = useState<ParsedTemplate[]>([]);
  const [selectedUpload, setSelectedUpload] = useState<ParsedTemplate | null>(
    null,
  );
  const [form, setForm] = useState({
    name: "",
    description: "",
    color: "#1B7A4E",
    ownerId: "",
    cpsType: "ctmz-normal",
    briefDate: new Date().toISOString().slice(0, 10),
  });

  async function load() {
    const [p, u, t] = await Promise.all([
      api<{ projects: Project[] }>("/api/projects"),
      api<{ users: User[] }>("/api/users"),
      api<{ templates: CpsTemplateSummary[] }>("/api/cps/templates"),
    ]);
    setProjects(p.projects);
    setUsers(u.users);
    setTemplates(t.templates);
    if (!form.ownerId && u.users[0]) {
      setForm((f) => ({ ...f, ownerId: u.users[0].id }));
    }
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  async function onCreateBuiltIn(e: FormEvent) {
    e.preventDefault();
    const res = await api<{ project: { id: string } }>("/api/projects", {
      method: "POST",
      body: JSON.stringify(form),
    });
    setOpen(false);
    setForm((f) => ({
      ...f,
      name: "",
      description: "",
      briefDate: new Date().toISOString().slice(0, 10),
    }));
    await load();
    window.location.href = `/projects/${res.project.id}`;
  }

  async function onParseFile(file: File | null) {
    if (!file) return;
    setParsing(true);
    setParseError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await api<{
        fileName: string;
        templates: ParsedTemplate[];
        skippedSheets: string[];
      }>("/api/cps/parse", { method: "POST", body });
      setUploadedFileName(res.fileName);
      setParsedTemplates(res.templates);
      const first = res.templates[0];
      setSelectedUpload(first);
      setForm((f) => ({
        ...f,
        name: f.name || `${first.name} — ${res.fileName.replace(/\.xlsx$/i, "")}`,
        briefDate:
          first.suggestedBriefDate ||
          f.briefDate ||
          new Date().toISOString().slice(0, 10),
        cpsType: first.id,
      }));
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Parse failed");
      setParsedTemplates([]);
      setSelectedUpload(null);
    } finally {
      setParsing(false);
    }
  }

  async function onCreateFromUpload(e: FormEvent) {
    e.preventDefault();
    if (!selectedUpload) return;
    const res = await api<{ project: { id: string } }>("/api/projects", {
      method: "POST",
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        ownerId: form.ownerId,
        color: form.color,
        briefDate: form.briefDate,
        cpsType: selectedUpload.id,
        cpsTemplate: selectedUpload,
      }),
    });
    setUploadOpen(false);
    setParsedTemplates([]);
    setSelectedUpload(null);
    setUploadedFileName("");
    await load();
    window.location.href = `/projects/${res.project.id}`;
  }

  const selectedBuiltIn = templates.find((t) => t.id === form.cpsType);

  return (
    <div>
      <PageHeader
        eyebrow="Portfolio"
        title="Projects"
        description="Create CPS projects from built-in templates or upload a CPS Excel workbook."
      />

      <div className="panel mb-5 flex flex-col gap-3 rounded-[22px] p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
            Create project
          </div>
          <p className="mt-1 text-sm text-muted">
            Upload your CPS .xlsx, generate a tentative CPS from SOS, or start
            from a built-in type below.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/cps/generate"
            className="btn btn-signal"
            data-testid="generate-tentative-cps"
          >
            <Sparkles size={16} />
            Generate tentative CPS
          </Link>
          <button
            type="button"
            className="btn border border-[var(--line)] bg-white/70"
            data-testid="upload-cps-excel"
            onClick={() => {
              setParseError("");
              setUploadOpen(true);
            }}
          >
            <Upload size={16} />
            Upload CPS Excel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            data-testid="new-cps-project"
            onClick={() => setOpen(true)}
          >
            New CPS project
          </button>
        </div>
      </div>

      <div className="mb-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        <button
          type="button"
          className="upload-cps-card rounded-2xl p-4 text-left transition hover:-translate-y-0.5"
          data-testid="upload-cps-card"
          onClick={() => {
            setParseError("");
            setUploadOpen(true);
          }}
        >
          <div className="text-xs font-bold uppercase tracking-[0.14em] text-verdant-deep">
            Upload
          </div>
          <div className="brand-mark mt-1 flex items-center gap-2 text-xl leading-none">
            <Upload size={20} />
            CPS Excel
          </div>
          <div className="mt-2 text-sm text-muted">
            Drop in a workbook like CPS_planning-v202609.xlsx
          </div>
        </button>
        {templates.map((t) => (
          <button
            key={t.id}
            type="button"
            className="panel rounded-2xl p-4 text-left transition hover:-translate-y-0.5"
            onClick={() => {
              setForm((f) => ({
                ...f,
                cpsType: t.id,
                name: f.name || `${t.name} job`,
              }));
              setOpen(true);
            }}
          >
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
              Built-in CPS
            </div>
            <div className="brand-mark mt-1 text-xl leading-none">{t.name}</div>
            <div className="mt-2 text-sm text-muted">
              {t.milestoneCount} milestones · {t.stepCount} steps
            </div>
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((p, i) => (
          <Link
            key={p.id}
            href={`/projects/${p.id}`}
            className={`panel animate-rise animate-rise-delay-${Math.min(i, 3)} group rounded-[22px] p-5 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow)]`}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <span
                className="mt-1 h-3 w-3 rounded-full"
                style={{ background: p.color }}
              />
              <div className="flex flex-wrap justify-end gap-1">
                {p.cpsName ? (
                  <span className="pill bg-[rgba(184,240,0,0.28)] text-ink">
                    {p.cpsName}
                  </span>
                ) : null}
                <StatusPill value={p.status} />
              </div>
            </div>
            <h2 className="brand-mark text-3xl leading-none group-hover:text-verdant-deep">
              {p.name}
            </h2>
            <p className="mt-3 line-clamp-3 text-sm text-muted">{p.description}</p>
            {p.progress ? (
              <div className="mt-4">
                <ProgressBar
                  compact
                  done={p.progress.done}
                  total={p.progress.total}
                  percent={p.progress.percent}
                />
              </div>
            ) : null}
            {p.currentMilestone ? (
              <div className="mt-3 text-sm">
                <span className="font-semibold text-ink">Current: </span>
                <span className="text-muted">
                  {p.currentMilestone.title}
                  {p.currentMilestone.overdue ? " · overdue" : ""}
                </span>
              </div>
            ) : (
              <div className="mt-3 text-sm text-muted">No open milestone</div>
            )}
            <div className="mt-4 flex items-center justify-between text-sm text-muted">
              <span>{p.ownerName ?? "Unassigned"}</span>
              <span>
                {p.briefDate ? `Brief ${p.briefDate}` : p.dueDate ?? "No due date"}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <Modal open={open} title="New CPS project" onClose={() => setOpen(false)} wide>
        <form className="space-y-3" onSubmit={onCreateBuiltIn}>
          <div>
            <label className="label">CPS type (built-in)</label>
            <select
              className="field"
              required
              value={form.cpsType}
              onChange={(e) => setForm({ ...form, cpsType: e.target.value })}
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.milestoneCount} milestones / {t.stepCount} steps)
                </option>
              ))}
            </select>
            {selectedBuiltIn ? (
              <p className="mt-2 text-sm text-muted">
                From workbook sheet <code>{selectedBuiltIn.sheetName.trim()}</code>.
                Prefer a custom file?{" "}
                <button
                  type="button"
                  className="font-semibold text-verdant-deep"
                  onClick={() => {
                    setOpen(false);
                    setUploadOpen(true);
                  }}
                >
                  Upload CPS Excel
                </button>
              </p>
            ) : null}
          </div>
          <div>
            <label className="label">Project name</label>
            <input
              className="field"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="field min-h-[80px]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Brief in date</label>
              <input
                type="date"
                className="field"
                required
                value={form.briefDate}
                onChange={(e) => setForm({ ...form, briefDate: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Owner</label>
              <select
                className="field"
                value={form.ownerId}
                onChange={(e) => setForm({ ...form, ownerId: e.target.value })}
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button className="btn btn-primary w-full" type="submit">
            Create & seed CPS checklist
          </button>
        </form>
      </Modal>

      <Modal
        open={uploadOpen}
        title="Upload CPS Excel"
        onClose={() => setUploadOpen(false)}
        wide
      >
        <form className="space-y-3" onSubmit={onCreateFromUpload}>
          <div>
            <label className="label">CPS workbook (.xlsx)</label>
            <input
              type="file"
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="field"
              onChange={(e) => onParseFile(e.target.files?.[0] ?? null)}
            />
            <p className="mt-2 text-sm text-muted">
              Accepts full workbooks like <code>CPS_planning-v202609.xlsx</code> or
              a single sheet with Step / Lead Time / End Date / Task Owner columns.
            </p>
            {parsing ? (
              <p className="mt-2 text-sm font-semibold">Parsing workbook…</p>
            ) : null}
            {parseError ? (
              <p className="mt-2 text-sm font-semibold text-amber">{parseError}</p>
            ) : null}
            {uploadedFileName ? (
              <p className="mt-2 text-sm text-muted">
                Parsed <code>{uploadedFileName}</code> — {parsedTemplates.length}{" "}
                CPS sheet(s) found.
              </p>
            ) : null}
          </div>

          {parsedTemplates.length > 0 ? (
            <>
              <div>
                <label className="label">CPS sheet / type</label>
                <select
                  className="field"
                  value={selectedUpload?.id ?? ""}
                  onChange={(e) => {
                    const next =
                      parsedTemplates.find((t) => t.id === e.target.value) ??
                      null;
                    setSelectedUpload(next);
                    if (next) {
                      setForm((f) => ({
                        ...f,
                        cpsType: next.id,
                        briefDate:
                          next.suggestedBriefDate ||
                          f.briefDate ||
                          new Date().toISOString().slice(0, 10),
                      }));
                    }
                  }}
                >
                  {parsedTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} — {t.sheetName.trim()} ({t.milestoneCount}m /{" "}
                      {t.stepCount}s)
                    </option>
                  ))}
                </select>
                {selectedUpload?.suggestedSosDate ? (
                  <p className="mt-2 text-sm text-muted">
                    Workbook Target SOS: {selectedUpload.suggestedSosDate}
                  </p>
                ) : null}
              </div>
              <div>
                <label className="label">Project name</label>
                <input
                  className="field"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  className="field min-h-[70px]"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Brief in date</label>
                  <input
                    type="date"
                    className="field"
                    required
                    value={form.briefDate}
                    onChange={(e) =>
                      setForm({ ...form, briefDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="label">Owner</label>
                  <select
                    className="field"
                    value={form.ownerId}
                    onChange={(e) =>
                      setForm({ ...form, ownerId: e.target.value })
                    }
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                className="btn btn-primary w-full"
                type="submit"
                disabled={!selectedUpload}
              >
                Create project from upload
              </button>
            </>
          ) : null}
        </form>
      </Modal>
    </div>
  );
}
