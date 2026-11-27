# TAG — Daily Ops

Multi-person project management for day-to-day work: **projects**, **tasks**, **milestones**, **calendar**, **notes**, **team assignees**, and a **DAM** (digital asset library attached to projects/tasks).

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind CSS
- **SQLite** via `better-sqlite3` + Drizzle ORM
- Cookie sessions (simple local multi-user auth)
- File uploads stored under `data/uploads/`

## Quick start

```bash
cd apps/tag
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo users

| Name         | Email             | Password | Role   |
|--------------|-------------------|----------|--------|
| Ray          | alex@tag.local    | tagdemo  | admin  |
| Jordan Lee   | jordan@tag.local  | tagdemo  | member |
| Sam Rivera   | sam@tag.local     | tagdemo  | member |

The SQLite database is created automatically at `data/tag.db` on first request and seeded with sample projects, tasks, milestones, and notes.

## Features (day one)

- **Dashboard** — active work, due soon, overdue, blocked, team load, pinned notes
- **Projects** — create/list/detail with owner, status, color, due date, live progress
- **Tasks** — checklist steps under milestones (also status board), assignees, priorities, due dates
- **Milestones** — nested step checklists with X/Y done, %, current milestone, live status
- **Calendar** — month view with current milestones, incomplete state, step due dates
- **Notes** — create/edit/pin/delete, optional project link
- **Assets (DAM)** — upload files/media, attach to project and/or task, preview images
- **Team** — member list; admins can add users
- **Guide** — in-app how-to (login, CPS types, dashboard, projects, tasks, milestones, calendar, notes, DAM, team)
- **CPS** — four workbook templates (CTMZ Normal/Special, POSM Mock up / No Mock up) seed project milestone checklists from `CPS_planning-v202609.xlsx`

## Scripts

```bash
npm run dev      # local development
npm run build    # production build
npm run start    # run production server
npm run lint     # eslint
```

## Data & persistence

- DB: `apps/tag/data/tag.db`
- Uploads: `apps/tag/data/uploads/`
- Both are gitignored; recreate by starting the app (seed runs when the DB is empty)

## Design

Visual direction: **Signal Desk** — ink navy sidebar, mist/atmosphere backgrounds, verdant + chartreuse signal accents, Syne + Manrope typography. Brand-first login and shell; operational panels (not a card-heavy marketing hero).
