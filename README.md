# sgfinancejobs.com

The most comprehensive Singapore finance job board. Aggregates open positions directly from public employer ATS platforms.

## Stack

- **Next.js 15** with App Router + TypeScript
- **Tailwind CSS** for styling
- **Prisma** for read-only database access
- **PostgreSQL** on Render (shared with the scraper)

## Local Development

```bash
# 1. Clone
git clone https://github.com/christrancoach/sgfinancejobs-web.git
cd sgfinancejobs-web

# 2. Install
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL (Render External DB URL)

# 4. Generate Prisma client
npx prisma generate

# 5. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Render

1. Create a **Web Service** on Render
2. Connect this GitHub repo
3. Set environment variables:
   - `DATABASE_URL` = your Render Postgres External URL
   - `NODE_ENV` = `production`
4. Build command: `npm install && npx prisma generate && npm run build`
5. Start command: `npm start`
6. Region: Oregon (US West) — same as the database

## Routes

| Route | Description |
|---|---|
| `/` | Homepage with search, top employers, recent jobs |
| `/jobs` | Filterable job listing with pagination |
| `/jobs/:id` | Job detail with JSON-LD structured data |
| `/companies/:slug` | Company page with all SG jobs |
| `/about` | About page |
| `/sitemap.xml` | Dynamic sitemap for SEO |
| `/robots.txt` | Crawler directives |

## Database

This app has **read-only** access to the same PostgreSQL database as the [sg-finance-job-tracker](https://github.com/christrancoach/sg-finance-job-tracker) scraper. The schema is copied here for Prisma type generation but migrations are owned by the scraper repo. **Never** run `prisma migrate` or `prisma db push` from this repo.

## Architecture Notes

- All pages are server-rendered (SSR) — no client-side data fetching or loading spinners
- Homepage caches top companies and recent jobs for 60 seconds via `revalidate`
- Job detail pages include `application/ld+json` JobPosting structured data for Google for Jobs
- Sitemap includes all active Singapore jobs and companies
- Search uses Postgres `ILIKE` — no external search service needed at this scale
