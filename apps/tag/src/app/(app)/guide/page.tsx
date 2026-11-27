import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

const TOC = [
  { id: "login", label: "Sign in & demo users" },
  { id: "dashboard", label: "Dashboard" },
  { id: "projects", label: "Projects" },
  { id: "tasks", label: "Tasks & due dates" },
  { id: "milestones", label: "Milestones" },
  { id: "calendar", label: "Calendar" },
  { id: "notes", label: "Notes" },
  { id: "dam", label: "Assets (DAM)" },
  { id: "team", label: "Team & assignees" },
];

const DEMOS = [
  { name: "Alex Chen", email: "alex@tag.local", role: "Admin" },
  { name: "Jordan Lee", email: "jordan@tag.local", role: "Member" },
  { name: "Sam Rivera", email: "sam@tag.local", role: "Member" },
];

function Section({
  id,
  title,
  href,
  children,
}: {
  id: string;
  title: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="panel scroll-mt-6 rounded-[22px] p-5 md:p-6">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <h2 className="brand-mark text-3xl leading-none">{title}</h2>
        {href ? (
          <Link href={href} className="text-sm font-semibold text-verdant-deep">
            Open →
          </Link>
        ) : null}
      </div>
      <div className="space-y-3 text-[1.02rem] leading-relaxed text-ink-soft">
        {children}
      </div>
    </section>
  );
}

export default function GuidePage() {
  return (
    <div>
      <PageHeader
        eyebrow="Help"
        title="Guide"
        description="How to run daily ops in TAG — from sign-in through projects, tasks, calendar, notes, and assets."
      />

      <nav className="panel mb-6 animate-rise rounded-[22px] p-4">
        <div className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted">
          On this page
        </div>
        <div className="flex flex-wrap gap-2">
          {TOC.map((item) => (
            <a key={item.id} href={`#${item.id}`} className="pill hover:bg-white/80">
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="space-y-4">
        <Section id="login" title="Sign in & demo users">
          <p>
            TAG uses simple local accounts with cookie sessions. On first launch
            the database seeds three demo people. Password for every demo user:
          </p>
          <p>
            <code className="rounded-md bg-[rgba(12,27,42,0.06)] px-2 py-1 font-semibold text-ink">
              tagdemo
            </code>
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] text-xs uppercase tracking-[0.12em] text-muted">
                  <th className="py-2 pr-3 font-bold">Name</th>
                  <th className="py-2 pr-3 font-bold">Email</th>
                  <th className="py-2 font-bold">Role</th>
                </tr>
              </thead>
              <tbody>
                {DEMOS.map((d) => (
                  <tr key={d.email} className="border-b border-[var(--line)]">
                    <td className="py-2.5 pr-3 font-semibold text-ink">{d.name}</td>
                    <td className="py-2.5 pr-3">
                      <code>{d.email}</code>
                    </td>
                    <td className="py-2.5">{d.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            The login screen also has a <strong className="text-ink">Quick pick</strong> list —
            tap a name to fill the form, then Enter TAG.
          </p>
        </Section>

        <Section id="dashboard" title="Dashboard" href="/dashboard">
          <p>
            The ops board is your morning snapshot: active projects, open tasks,
            overdue and blocked counts, what’s due in the next week, your own open
            work, upcoming milestones, pinned notes, and team load.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Use it to spot blockers and due-date pressure first.</li>
            <li>
              Jump to Calendar or Tasks from the section links when you need detail.
            </li>
          </ul>
        </Section>

        <Section id="projects" title="Projects" href="/projects">
          <p>
            Projects are the containers for work. Each has a name, description,
            status (active / on hold / done / archived), color, owner, and optional
            due date.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong className="text-ink">New project</strong> opens a form for the basics.
            </li>
            <li>
              Open a project card to see its tasks and milestones, and to add more
              of either.
            </li>
          </ul>
        </Section>

        <Section id="tasks" title="Tasks & due dates" href="/tasks">
          <p>
            Tasks live on a status board: To do → In progress → Blocked → Done.
            Each task can have a priority, assignee, due date, and optional
            milestone.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Filter by project or assignee at the top of the board.
            </li>
            <li>
              Move work with the small → status chips on each card.
            </li>
            <li>
              Due dates drive the Calendar and the Dashboard “due soon / overdue”
              lists — keep them current.
            </li>
          </ul>
        </Section>

        <Section id="milestones" title="Milestones">
          <p>
            Milestones mark project targets (walkthroughs, freezes, sign-offs).
            Create them from a project’s detail page. Statuses: upcoming, reached,
            missed.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Link tasks to a milestone when they belong to that target.</li>
            <li>
              Milestone due dates also appear on the Calendar (diamond-style markers).
            </li>
          </ul>
          <p>
            Tip: open any project from{" "}
            <Link href="/projects" className="font-semibold text-verdant-deep">
              Projects
            </Link>{" "}
            and use <strong className="text-ink">Add milestone</strong>.
          </p>
        </Section>

        <Section id="calendar" title="Calendar" href="/calendar">
          <p>
            Month view of task due dates and milestone dates. Click a day to see
            that day’s detail in the side panel. Use Prev / Today / Next to move
            months.
          </p>
        </Section>

        <Section id="notes" title="Notes" href="/notes">
          <p>
            Lightweight team notes — standup cadence, vendor lead times, ingest
            rules, and so on. Optionally link a note to a project and pin it so it
            shows on the Dashboard.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Pin with the pin control on each note.</li>
            <li>Edit or delete from the note card.</li>
          </ul>
        </Section>

        <Section id="dam" title="Assets (DAM)" href="/assets">
          <p>
            Digital asset management for day one: upload files and media, then
            attach them to a project and/or a task. Images preview in the library;
            other types open via the file link.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong className="text-ink">Upload</strong> — choose a file and optional
              project/task attachment.
            </li>
            <li>
              <strong className="text-ink">Attach</strong> — change which project or task
              an existing file belongs to.
            </li>
            <li>Filter the library by project when you need a focused set.</li>
          </ul>
        </Section>

        <Section id="team" title="Team & assignees" href="/team">
          <p>
            Team members are the people you assign work to. Admins can add members
            (email, password, role, avatar color). Members appear as assignees on
            tasks and as owners on projects.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Alex (admin) can use <strong className="text-ink">Add member</strong>.</li>
            <li>
              Dashboard <em>Team load</em> counts open tasks per person so you can
              balance work.
            </li>
          </ul>
        </Section>
      </div>

      <p className="mt-8 text-sm text-muted">
        Need a refresher later? This Guide stays in the sidebar under Help.
      </p>
    </div>
  );
}
