# Veyra

Premium game discovery and ratings platform.

## Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL

## Quick Start
1. Install Node.js LTS.
2. Copy `.env.example` to `.env` and set values.
3. Install dependencies:
   - `npm install`
4. Run Prisma setup:
   - `npm run prisma:generate`
   - `npm run prisma:migrate`
   - `npm run prisma:seed`
5. Start app (pick one):
   - VS Code terminal: `npm run dev`
   - VS Code shortcut: press `Ctrl+Shift+B` (runs **Run Next.js Dev Server**)
   - Windows launcher app: double-click `start-dev.bat`

## Current Status
- Premium dark UI shell
- Home rails + featured hero (DB-backed with fallback)
- Game details with ratings, reviews, trailer/DLC/news feeds
- Search page with filtering + sorting
- Auth + protected profile
- Admin moderation queue for pending/reported reviews
- Admin moderation analytics (queue stats, top-flagged games, recent actions)
- Prisma schema + seed data

## Moderation Setup
- Default new users are role `USER`.
- To access moderation at `/admin/moderation`, promote a user to `MODERATOR` or `ADMIN` in the database.
- New reviews are now submitted as `PENDING` and can be approved/rejected by moderators.
- Moderation actions are audit-logged in `ModerationLog`.
- Moderation dashboard supports date ranges (`7/14/30/60/90 days`) and CSV export.

Example SQL role promotion:
- `UPDATE "User" SET role='ADMIN' WHERE email='you@example.com';`

## Abuse Protection
- Rate limiting is applied on sign-up, ratings, reviews, reports, and admin moderation actions.
- Rate-limit metadata is exposed via response headers: `X-RateLimit-Remaining` and `X-RateLimit-Reset`.

## Admin Analytics API
- JSON analytics: `/api/admin/analytics?days=30`
- CSV export: `/api/admin/analytics/export?days=30`
- Both routes are role-protected (`MODERATOR` / `ADMIN`).

## Deployment Checklist
1. Set production env vars: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`.
   - Optional: set `APP_ENV=production`.
2. Run migrations and seed (optional):
   - `npm run prisma:migrate`
   - `npm run prisma:seed`
3. Build and start:
   - `npm run build`
   - `npm run start`
4. Verify generated SEO routes:
   - `/sitemap.xml`
   - `/robots.txt`

See `docs/ROADMAP.md` for phased implementation.
