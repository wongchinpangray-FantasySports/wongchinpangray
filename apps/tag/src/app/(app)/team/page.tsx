"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Modal } from "@/components/Modal";
import { Avatar } from "@/components/Avatar";
import { api } from "@/lib/api-client";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarColor: string;
  createdAt: string;
};

type Me = { id: string; role: string };

export default function TeamPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "tagdemo",
    role: "member",
    avatarColor: "#1B7A4E",
  });
  const [error, setError] = useState("");

  async function load() {
    const [u, m] = await Promise.all([
      api<{ users: User[] }>("/api/users"),
      api<{ user: Me }>("/api/auth/me"),
    ]);
    setUsers(u.users);
    setMe(m.user);
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api("/api/users", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setOpen(false);
      setForm({
        name: "",
        email: "",
        password: "tagdemo",
        role: "member",
        avatarColor: "#1B7A4E",
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="People"
        title="Team"
        description="Assignees and members for multi-person daily ops."
        actions={
          me?.role === "admin" ? (
            <button className="btn btn-signal" onClick={() => setOpen(true)}>
              Add member
            </button>
          ) : null
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {users.map((u) => (
          <article key={u.id} className="panel rounded-[22px] p-5">
            <div className="mb-4 flex items-center gap-3">
              <Avatar name={u.name} color={u.avatarColor} size={48} />
              <div>
                <h2 className="brand-mark text-2xl leading-none">{u.name}</h2>
                <div className="mt-1 text-sm text-muted">{u.email}</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="pill capitalize">{u.role}</span>
              <span className="text-xs text-muted">
                Joined {new Date(u.createdAt).toLocaleDateString()}
              </span>
            </div>
          </article>
        ))}
      </div>

      <Modal open={open} title="Add team member" onClose={() => setOpen(false)}>
        <form className="space-y-3" onSubmit={onCreate}>
          <div>
            <label className="label">Name</label>
            <input
              className="field"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              className="field"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Password</label>
              <input
                className="field"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Role</label>
              <select
                className="field"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Avatar color</label>
            <input
              type="color"
              className="field h-[44px] p-1"
              value={form.avatarColor}
              onChange={(e) => setForm({ ...form, avatarColor: e.target.value })}
            />
          </div>
          {error ? <p className="text-sm font-semibold text-amber">{error}</p> : null}
          <button className="btn btn-primary w-full" type="submit">
            Create member
          </button>
        </form>
      </Modal>
    </div>
  );
}
