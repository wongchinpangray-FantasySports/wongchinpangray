# Deploy TAG to Cloudflare (Workers + OpenNext + D1 + R2)

Portfolio **Pages** (`wrangler.toml` at repo root) cannot host TAG — it needs a
Node-compatible Worker runtime, durable SQL, and object storage for DAM/handbook.

## Chosen path

| Concern | Cloudflare binding |
|---|---|
| Next.js App Router | **Workers** via `@opennextjs/cloudflare` |
| SQLite app DB | **D1** (`TAG_DB`) |
| DAM uploads + handbook PDF | **R2** (`TAG_ASSETS`) |
| Next incremental cache | **R2** (`NEXT_INC_CACHE_R2_BUCKET`) |

Local `npm run dev` still uses `better-sqlite3` + `data/uploads/`.

## One-time: Ray’s Cloudflare clicks

1. Create / open a Cloudflare account → enable **Workers**, **D1**, **R2**.
2. Install Wrangler locally and log in:
   ```bash
   cd apps/tag
   npm install
   npx wrangler login
   ```
3. Create resources:
   ```bash
   npm run cf:d1:create
   npm run cf:r2:create
   ```
4. Copy the D1 `database_id` from the create output into `wrangler.jsonc`
   (`REPLACE_WITH_D1_DATABASE_ID`).
5. Apply schema + upload handbook:
   ```bash
   npm run cf:d1:migrate
   npm run cf:handbook:upload
   ```
6. Deploy:
   ```bash
   npm run deploy
   ```
7. Open the printed `*.workers.dev` URL (or attach a custom domain in the Workers dashboard).

First request seeds demo users (`alex@tag.local` / `tagdemo`) into D1.

## CI / token deploy (optional)

Create an API token with **Workers Scripts Edit**, **D1 Edit**, **R2 Edit**, then:

```bash
export CLOUDFLARE_API_TOKEN=…
export CLOUDFLARE_ACCOUNT_ID=…
npm run deploy
```

This cloud agent **does not** have Cloudflare credentials, so it cannot publish a
live URL from here — the wiring above is ready once Ray authenticates Wrangler.

## Verify after deploy

- `/login` → Ray / `tagdemo`
- `/handbook` Topics + Deck (handbook object must exist in R2)
- `/assets` upload (writes to R2)
- Create a CPS project (writes to D1)

## Notes

- Root `wrangler.toml` remains the **portfolio** Pages site; TAG uses
  `apps/tag/wrangler.jsonc` only.
- Do not point portfolio Pages build at `apps/tag` — OpenNext Worker output lives
  under `apps/tag/.open-next/`.
