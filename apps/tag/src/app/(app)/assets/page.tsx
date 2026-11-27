"use client";

import { FormEvent, useEffect, useState } from "react";
import { FileImage, FileText, Film, Upload } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Modal } from "@/components/Modal";
import { api } from "@/lib/api-client";
import { formatBytes } from "@/lib/utils";

type Asset = {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  projectId: string | null;
  projectName: string | null;
  taskId: string | null;
  taskTitle: string | null;
  uploadedByName: string | null;
  createdAt: string;
};

type Project = { id: string; name: string };
type Task = { id: string; title: string; projectId: string };

function iconFor(mime: string) {
  if (mime.startsWith("image/")) return FileImage;
  if (mime.startsWith("video/")) return Film;
  return FileText;
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filterProject, setFilterProject] = useState("");
  const [open, setOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState<Asset | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({ projectId: "", taskId: "" });
  const [attachForm, setAttachForm] = useState({ projectId: "", taskId: "" });
  const [busy, setBusy] = useState(false);

  async function load() {
    const qs = filterProject ? `?projectId=${filterProject}` : "";
    const [a, p, t] = await Promise.all([
      api<{ assets: Asset[] }>(`/api/assets${qs}`),
      api<{ projects: Project[] }>("/api/projects"),
      api<{ tasks: Task[] }>("/api/tasks"),
    ]);
    setAssets(a.assets);
    setProjects(p.projects);
    setTasks(t.tasks);
  }

  useEffect(() => {
    load().catch(console.error);
  }, [filterProject]);

  async function onUpload(e: FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      if (form.projectId) body.append("projectId", form.projectId);
      if (form.taskId) body.append("taskId", form.taskId);
      await api("/api/assets", { method: "POST", body });
      setOpen(false);
      setFile(null);
      setForm({ projectId: "", taskId: "" });
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function saveAttach(e: FormEvent) {
    e.preventDefault();
    if (!attachOpen) return;
    await api(`/api/assets/${attachOpen.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        projectId: attachForm.projectId || null,
        taskId: attachForm.taskId || null,
      }),
    });
    setAttachOpen(null);
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this asset?")) return;
    await api(`/api/assets/${id}`, { method: "DELETE" });
    await load();
  }

  const filteredTasks = tasks.filter(
    (t) => !form.projectId || t.projectId === form.projectId,
  );
  const attachTasks = tasks.filter(
    (t) => !attachForm.projectId || t.projectId === attachForm.projectId,
  );

  return (
    <div>
      <PageHeader
        eyebrow="DAM"
        title="Assets"
        description="Upload and organize files & media, then attach them to projects or tasks."
        actions={
          <button className="btn btn-signal" onClick={() => setOpen(true)}>
            <Upload size={16} />
            Upload
          </button>
        }
      />

      <div className="mb-5">
        <select
          className="field max-w-[260px]"
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
        >
          <option value="">All projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3">
        {assets.length === 0 ? (
          <div className="panel rounded-[22px] p-8 text-center text-muted">
            No assets yet. Upload files to start the library.
          </div>
        ) : (
          assets.map((a) => {
            const Icon = iconFor(a.mimeType);
            const isImage = a.mimeType.startsWith("image/");
            return (
              <article
                key={a.id}
                className="panel flex flex-col gap-4 rounded-[18px] p-4 sm:flex-row sm:items-center"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/60">
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/assets/${a.id}/file`}
                      alt={a.originalName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Icon size={28} className="text-ink-soft" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-bold">{a.originalName}</div>
                  <div className="mt-1 text-sm text-muted">
                    {formatBytes(a.size)} · {a.mimeType}
                  </div>
                  <div className="mt-1 text-sm text-muted">
                    {a.projectName ? `Project: ${a.projectName}` : "No project"}
                    {a.taskTitle ? ` · Task: ${a.taskTitle}` : ""}
                    {a.uploadedByName ? ` · by ${a.uploadedByName}` : ""}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    className="btn btn-ghost px-3 py-1 text-sm"
                    href={`/api/assets/${a.id}/file`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open
                  </a>
                  <button
                    className="btn btn-ghost px-3 py-1 text-sm"
                    onClick={() => {
                      setAttachOpen(a);
                      setAttachForm({
                        projectId: a.projectId ?? "",
                        taskId: a.taskId ?? "",
                      });
                    }}
                  >
                    Attach
                  </button>
                  <button
                    className="btn btn-ghost px-3 py-1 text-sm text-amber"
                    onClick={() => remove(a.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>

      <Modal open={open} title="Upload asset" onClose={() => setOpen(false)}>
        <form className="space-y-3" onSubmit={onUpload}>
          <div>
            <label className="label">File</label>
            <input
              type="file"
              className="field"
              required
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div>
            <label className="label">Attach to project</label>
            <select
              className="field"
              value={form.projectId}
              onChange={(e) =>
                setForm({ projectId: e.target.value, taskId: "" })
              }
            >
              <option value="">None</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Attach to task</label>
            <select
              className="field"
              value={form.taskId}
              onChange={(e) => setForm({ ...form, taskId: e.target.value })}
            >
              <option value="">None</option>
              {filteredTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary w-full" disabled={busy}>
            {busy ? "Uploading…" : "Upload"}
          </button>
        </form>
      </Modal>

      <Modal
        open={Boolean(attachOpen)}
        title="Attach asset"
        onClose={() => setAttachOpen(null)}
      >
        <form className="space-y-3" onSubmit={saveAttach}>
          <div>
            <label className="label">Project</label>
            <select
              className="field"
              value={attachForm.projectId}
              onChange={(e) =>
                setAttachForm({ projectId: e.target.value, taskId: "" })
              }
            >
              <option value="">None</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Task</label>
            <select
              className="field"
              value={attachForm.taskId}
              onChange={(e) =>
                setAttachForm({ ...attachForm, taskId: e.target.value })
              }
            >
              <option value="">None</option>
              {attachTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary w-full" type="submit">
            Save attachments
          </button>
        </form>
      </Modal>
    </div>
  );
}
