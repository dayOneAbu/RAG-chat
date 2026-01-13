# RAG Chat

RAG Chat is a Next.js 14/15 application scaffolded from the T3 stack. It provides an authenticated chat interface with message persistence (Prisma + PostgreSQL), text-to-speech / speech-to-text utilities, and tRPC API routes for client-server communication.

**Tech stack:** Next.js, React, TypeScript, tRPC, Prisma, PostgreSQL, NextAuth, Tailwind CSS

**Quick links:**
- **Schema:** [prisma/schema.prisma](prisma/schema.prisma)
- **Entry (app):** [src/app/page.tsx](src/app/page.tsx)
- **API root (server):** [server/api/root.ts](server/api/root.ts)
- **TTS helper:** [src/lib/useTTS.ts](src/lib/useTTS.ts)
- **Start DB script:** [start-database.sh](start-database.sh)

**What this README covers:** setup, environment variables, database, development workflow, architecture overview, and useful scripts.

**Note:** The repository uses `pnpm` as the package manager (see `packageManager` in `package.json`).

**Prerequisites**
- Node.js (v18+ recommended)
- pnpm (see https://pnpm.io)
- PostgreSQL (local or remote)

**Recommended:** install `pnpm` and have a running PostgreSQL instance or use the provided `start-database.sh` for local setup.

**Quick Start**
1. Install dependencies:

```bash
pnpm install
```

2. Create a `.env` file at the project root (see Environment section below).

3. Run Prisma migrations / generate client (first time):

```bash
pnpm db:generate
```

4. Start the dev server:

```bash
pnpm dev
```

Open http://localhost:3000 in your browser.

**Environment variables**
Create a `.env` (or set env variables in your environment) with at least the following keys:

- `DATABASE_URL` : PostgreSQL connection string (used by Prisma)
- `NEXTAUTH_URL` : Base URL for NextAuth (e.g. http://localhost:3000)
- `NEXTAUTH_SECRET` : A random secret for NextAuth
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` : For email (password reset / verification)
- `RESEND_API_KEY` : (optional) if using Resend for emails

There may be additional keys read by utilities in `src/env.js` or server code—search for `process.env` if you need to confirm every variable.

**Database / Prisma**
- Schema: [prisma/schema.prisma](prisma/schema.prisma)
- Migrations are stored under `prisma/migrations`.
- Common commands:

```bash
pnpm db:generate   # runs `prisma migrate dev` (development)
pnpm db:migrate    # runs `prisma migrate deploy` (apply to production)
pnpm db:push       # push schema without migrations
pnpm db:studio     # open Prisma Studio
```

This project uses PostgreSQL (see `datasource db` in the Prisma schema). A helper script to start a local DB is included: [start-database.sh](start-database.sh).

**Scripts**
- `pnpm dev` — run Next.js dev server
- `pnpm build` — build for production
- `pnpm start` — run production server
- `pnpm check` — lint + typecheck
- `pnpm format:write` / `pnpm format:check` — Prettier

All scripts are defined in `package.json`.

**Project layout (high-level)**
- `app/` — Next.js app routes and UI components ([src/app](src/app))
- `src/lib/` — client/server helpers (TTS, STT hooks and utils)
- `server/` — server-side API root and tRPC router setup ([server/api/root.ts](server/api/root.ts))
- `prisma/` — database schema and migrations
- `public/tts/` — static TTS assets
- `scripts/` — helper scripts (e.g. [scripts/create-test-user.ts](scripts/create-test-user.ts))

Key files:
- [src/app/page.tsx](src/app/page.tsx) — main entry page
- [prisma/schema.prisma](prisma/schema.prisma) — DB models (User, Session, Message, ChatHistory, PasswordResetToken)
- [src/lib/useTTS.ts](src/lib/useTTS.ts) — TTS helper
- [server/api/root.ts](server/api/root.ts) — server API entry / tRPC router

**Authentication & Email**
This app uses NextAuth (see `next-auth` dependency) with Prisma as the adapter. Email verification and password reset use tokens stored in the database (`PasswordResetToken` model).

**Development notes**
- The codebase includes utilities for TTS and STT in `src/lib`.
- UI components live in `src/_components/ui/` and app-level components in `src/_components/layout/`.
- tRPC is used for client-server RPC; see `trpc/` for client/server setup.

**Testing / Local helpers**
- `scripts/create-test-user.ts` — create a test user quickly (edit the script to change credentials)

**Deployment**
Standard Next.js deployment flows apply (Vercel, Docker, etc.). Ensure environment variables and database migrations are applied in the target environment. Use `pnpm db:migrate` during deploy to run migrations in production.

**Useful tips**
- Run `pnpm postinstall` (or `pnpm install`) to generate the Prisma client.
- Use `pnpm db:studio` to inspect DB records during development.
- Check `public/tts/` if you need to inspect generated or static TTS files.

**Contributing**
- Fork, create a feature branch, run `pnpm install`, make changes, add tests if applicable, and open a PR.

**License**
Specify the project license here (e.g., MIT) or add a `LICENSE` file.

---

If you'd like, I can also:
- add a small `CONTRIBUTING.md` and `ISSUE_TEMPLATE.md`,
- generate a minimal `.env.example` file with the common env keys,
- or run the dev server and verify routes locally.
