"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  FolderKanban,
  Images,
  LayoutDashboard,
  ListTodo,
  LogOut,
  StickyNote,
  Users,
} from "lucide-react";
import { Avatar } from "./Avatar";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/assets", label: "Assets", icon: Images },
  { href: "/team", label: "Team", icon: Users },
];

export function AppShell({
  user,
  children,
}: {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarColor: string;
  };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="app-shell mx-auto grid min-h-screen max-w-[1440px] grid-cols-[260px_1fr] gap-0 md:gap-5 md:p-5">
      <aside className="app-sidebar flex h-[calc(100vh-2.5rem)] min-h-[640px] flex-col overflow-hidden rounded-[22px] p-4 shadow-[var(--shadow)]">
        <div className="mb-6 px-2 pt-2">
          <div className="mb-1 flex items-center gap-2">
            <span className="signal-dot" />
            <span className="brand-mark text-4xl text-[#f4f8fb]">TAG</span>
          </div>
          <p className="text-sm text-[#f4f8fb]/70">Daily ops for multi-person work.</p>
        </div>

        <nav className="app-nav flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                data-active={active}
                className="nav-link"
              >
                <Icon size={18} />
                <span className="hide-mobile">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 rounded-2xl border border-white/15 bg-white/8 p-3">
          <div className="mb-3 flex items-center gap-3">
            <Avatar name={user.name} color={user.avatarColor} size={40} />
            <div className="min-w-0">
              <div className="truncate font-semibold text-[#f4f8fb]">{user.name}</div>
              <div className="truncate text-xs capitalize text-[#f4f8fb]/60">{user.role}</div>
            </div>
          </div>
          <button
            className="btn btn-ghost w-full border-white/20 text-[#f4f8fb]"
            onClick={logout}
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="min-w-0 pb-8 pt-2 md:pt-0">{children}</main>
    </div>
  );
}
