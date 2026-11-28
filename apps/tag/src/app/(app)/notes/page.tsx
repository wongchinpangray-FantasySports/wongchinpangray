"use client";

import { FormEvent, useEffect, useState } from "react";
import { Pin } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Modal } from "@/components/Modal";
import { api } from "@/lib/api-client";

type Note = {
  id: string;
  title: string;
  body: string;
  projectId: string | null;
  projectName: string | null;
  authorName: string | null;
  pinned: boolean;
  updatedAt: string;
};

type Project = { id: string; name: string };

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [form, setForm] = useState({
    title: "",
    body: "",
    projectId: "",
    pinned: false,
  });

  async function load() {
    const [n, p] = await Promise.all([
      api<{ notes: Note[] }>("/api/notes"),
      api<{ projects: Project[] }>("/api/projects"),
    ]);
    setNotes(n.notes);
    setProjects(p.projects);
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ title: "", body: "", projectId: "", pinned: false });
    setOpen(true);
  }

  function openEdit(note: Note) {
    setEditing(note);
    setForm({
      title: note.title,
      body: note.body,
      projectId: note.projectId ?? "",
      pinned: note.pinned,
    });
    setOpen(true);
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      projectId: form.projectId || null,
    };
    if (editing) {
      await api(`/api/notes/${editing.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    } else {
      await api("/api/notes", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }
    setOpen(false);
    await load();
  }

  async function togglePin(note: Note) {
    await api(`/api/notes/${note.id}`, {
      method: "PATCH",
      body: JSON.stringify({ pinned: !note.pinned }),
    });
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this note?")) return;
    await api(`/api/notes/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <PageHeader
        eyebrow="Capture"
        title="Notes"
        description="Team notes and pinned operating guidance."
        actions={
          <button className="btn btn-signal" onClick={openCreate}>
            New note
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {notes.map((n) => (
          <article key={n.id} className="panel rounded-[22px] p-5">
            <div className="mb-3 flex items-start justify-between gap-2">
              <h2 className="brand-mark text-2xl leading-none">{n.title}</h2>
              <button
                className={`rounded-full p-2 ${n.pinned ? "bg-[rgba(184,240,0,0.35)]" : "bg-white/40"}`}
                onClick={() => togglePin(n)}
                title={n.pinned ? "Unpin" : "Pin"}
              >
                <Pin size={16} />
              </button>
            </div>
            <p className="line-clamp-5 whitespace-pre-wrap text-sm text-ink-soft">
              {n.body}
            </p>
            <div className="mt-4 flex items-center justify-between text-xs text-muted">
              <span>
                {n.authorName}
                {n.projectName ? ` · ${n.projectName}` : ""}
              </span>
              <span>{new Date(n.updatedAt).toLocaleDateString()}</span>
            </div>
            <div className="mt-3 flex gap-2">
              <button className="btn btn-ghost px-3 py-1 text-sm" onClick={() => openEdit(n)}>
                Edit
              </button>
              <button
                className="btn btn-ghost px-3 py-1 text-sm text-amber"
                onClick={() => remove(n.id)}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      <Modal
        open={open}
        title={editing ? "Edit note" : "New note"}
        onClose={() => setOpen(false)}
        wide
      >
        <form className="space-y-3" onSubmit={onSave}>
          <div>
            <label className="label">Title</label>
            <input
              className="field"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Body</label>
            <textarea
              className="field min-h-[160px]"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Project</label>
              <select
                className="field"
                value={form.projectId}
                onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              >
                <option value="">None</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 font-semibold">
                <input
                  type="checkbox"
                  checked={form.pinned}
                  onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
                />
                Pin note
              </label>
            </div>
          </div>
          <button className="btn btn-primary w-full" type="submit">
            Save note
          </button>
        </form>
      </Modal>
    </div>
  );
}
