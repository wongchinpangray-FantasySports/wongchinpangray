import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

const TOC = [
  { id: "login", label: "Sign in & demo users" },
  { id: "cps", label: "CPS types & seeding" },
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
  { name: "Ray", email: "alex@tag.local", role: "Admin" },
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

        <Section id="cps" title="CPS types & seeding" href="/projects">
          <p>
            TAG embeds Ray’s CPS planning workbook (
            <code>CPS_planning-v202609.xlsx</code>). When you create a project,
            pick one of the four CPS types — milestones and checklist steps are
            seeded from that sheet (not invented):
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong className="text-ink">CTMZ (Normal)</strong> — sheet{" "}
              <code>CTMZ (Normal)</code>, grouped by week markers (W-14 → W-3)
            </li>
            <li>
              <strong className="text-ink">CTMZ (Special)</strong> — sheet{" "}
              <code>CTMZ (Special)</code>, week markers (W-10.1 → W-2.1)
            </li>
            <li>
              <strong className="text-ink">POSM (Mock up needed)</strong> — sheet{" "}
              <code>POSM(Mock up needed)</code>
            </li>
            <li>
              <strong className="text-ink">POSM (No Mock up)</strong> — sheet{" "}
              <code>POSM(No Mock up)</code>
            </li>
          </ul>
          <p>
            Set the <strong className="text-ink">Brief in</strong> date on create.
            Step due dates are scheduled forward using each step’s lead time
            (working days, skipping weekends and HK holidays from the workbook).
            Owner roles from the sheet are stored on each step for assignment.
          </p>
          <p>
            Track progress on the project page (current milestone, X/Y, %) and on
            Calendar — same checklist model as day-one milestones.
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
            Use <strong className="text-ink">New CPS project</strong> (or the four
            type cards) to pick a CPS template, name the job, and set Brief in.
            Cards show CPS type, overall progress, and the{" "}
            <strong className="text-ink">current milestone</strong>.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Open a project to work the seeded CPS checklist.</li>
            <li>Assign people to steps — roles from the workbook are in the step notes.</li>
          </ul>
        </Section>

        <Section id="tasks" title="Tasks & due dates" href="/tasks">
          <p>
            Tasks are checklist <strong className="text-ink">steps</strong> under milestones
            (and can also sit unscoped). The Tasks board still shows them by status:
            To do → In progress → Blocked → Done, with priority, assignee, and due date.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Filter by project or assignee at the top of the board.</li>
            <li>Move work with the → status chips, or toggle done on a project checklist.</li>
            <li>
              Due dates drive Calendar and Dashboard “due soon / overdue” — keep them current.
            </li>
          </ul>
        </Section>

        <Section id="milestones" title="Milestones">
          <p>
            Milestones are targets made of many steps. On a project page each milestone
            shows a checklist, <strong className="text-ink">X/Y done</strong>, percent complete,
            and live status (upcoming / reached / missed). The earliest incomplete
            milestone is marked <strong className="text-ink">Current</strong>.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Add steps with assignees and due dates under the milestone.</li>
            <li>Checking steps off updates milestone progress and project progress.</li>
            <li>
              When every step is done, the milestone becomes reached; when every project
              task is done, project status rolls to done.
            </li>
          </ul>
          <p>
            Tip: open any project from{" "}
            <Link href="/projects" className="font-semibold text-verdant-deep">
              Projects
            </Link>{" "}
            and use <strong className="text-ink">Add milestone</strong> /{" "}
            <strong className="text-ink">Add step</strong>.
          </p>
        </Section>

        <Section id="calendar" title="Calendar" href="/calendar">
          <p>
            Month view of milestone due dates and checklist step due dates. The top strip
            shows each project’s <strong className="text-ink">current milestone</strong> with
            progress. Incomplete milestones are marked on the grid; day detail shows
            progress bars and incomplete steps.
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
            <li>Ray (admin) can use <strong className="text-ink">Add member</strong>.</li>
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
