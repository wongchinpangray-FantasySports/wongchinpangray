"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const DEMOS = [
  { email: "alex@tag.local", name: "Alex Chen", role: "Admin" },
  { email: "jordan@tag.local", name: "Jordan Lee", role: "Member" },
  { email: "sam@tag.local", name: "Sam Rivera", role: "Member" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("alex@tag.local");
  const [password, setPassword] = useState("tagdemo");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-5 py-10">
      <div className="grid w-full gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="animate-rise">
          <div className="mb-5 flex items-center gap-2">
            <span className="signal-dot" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
              Work ops
            </span>
          </div>
          <h1 className="brand-mark text-[clamp(3.5rem,10vw,7rem)] leading-[0.88] tracking-tight text-ink">
            TAG
          </h1>
          <p className="mt-5 max-w-xl text-xl text-ink-soft">
            Projects, tasks, milestones, calendar, notes, and a shared asset
            library — built for teams running daily operations.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-muted">
            <span className="pill">Assignees</span>
            <span className="pill">Due dates</span>
            <span className="pill">DAM attachments</span>
            <span className="pill">Local SQLite</span>
          </div>
        </section>

        <section className="animate-rise animate-rise-delay-1 panel rounded-[24px] p-6 shadow-[var(--shadow)]">
          <h2 className="brand-mark mb-1 text-3xl">Sign in</h2>
          <p className="mb-5 text-sm text-muted">
            Demo password for all users: <code>tagdemo</code>
          </p>

          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            {error ? (
              <p className="text-sm font-semibold text-amber">{error}</p>
            ) : null}
            <button className="btn btn-signal w-full" disabled={loading}>
              {loading ? "Signing in…" : "Enter TAG"}
            </button>
          </form>

          <div className="mt-6 space-y-2">
            <div className="label">Quick pick</div>
            {DEMOS.map((d) => (
              <button
                key={d.email}
                type="button"
                className="surface flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition hover:bg-white/80"
                onClick={() => {
                  setEmail(d.email);
                  setPassword("tagdemo");
                }}
              >
                <span className="font-semibold">{d.name}</span>
                <span className="text-sm text-muted">{d.role}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
