import Link from "next/link";
import { prisma } from "@/lib/prisma";
import JobCard from "@/components/JobCard";

export const dynamic = "force-dynamic";
export const revalidate = 60;

async function getStats() {
  const [totalJobs, sgJobs, companyCount] = await Promise.all([
    prisma.job.count({ where: { isActive: true } }),
    prisma.job.count({ where: { isActive: true, locationCountry: "Singapore" } }),
    prisma.$queryRaw<[{ count: number }]>`SELECT COUNT(DISTINCT "companySlug")::int as count FROM "Job" WHERE "isActive" = true AND "locationCountry" = 'Singapore'`,
  ]);
  return { totalJobs, sgJobs, companyCount: companyCount[0].count };
}

async function getTopCompanies() {
  return prisma.$queryRaw<{ companyName: string; companySlug: string; count: number }[]>`
    SELECT "companyName", "companySlug", COUNT(*)::int as count
    FROM "Job"
    WHERE "isActive" = true AND "locationCountry" = 'Singapore'
    GROUP BY "companyName", "companySlug"
    ORDER BY count DESC
    LIMIT 10
  `;
}

async function getRecentJobs() {
  return prisma.job.findMany({
    where: { isActive: true, locationCountry: "Singapore" },
    orderBy: { firstSeenAt: "desc" },
    take: 20,
    select: {
      id: true, title: true, companyName: true, companySlug: true,
      locationCity: true, locationCountry: true, experienceLevel: true,
      salaryMin: true, salaryMax: true, salaryCurrency: true, salaryPeriod: true,
      firstSeenAt: true, company: { select: { segment: true } },
    },
  });
}

export default async function HomePage() {
  const [stats, topCompanies, recentJobs] = await Promise.all([
    getStats(), getTopCompanies(), getRecentJobs(),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <section className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-3">Singapore Finance Jobs</h1>
        <p className="text-lg text-slate-500 mb-8">
          {stats.sgJobs.toLocaleString()} open roles from {stats.companyCount.toLocaleString()} companies. Updated daily.
        </p>
        <form action="/jobs" method="GET" className="max-w-xl mx-auto flex gap-2">
          <input type="text" name="q" placeholder="Search job titles, companies..."
            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
          <button type="submit" className="px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors">Search</button>
        </form>
      </section>
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Top Employers in Singapore</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {topCompanies.map((c) => (
            <Link key={c.companySlug} href={`/companies/${c.companySlug}`}
              className="flex flex-col items-center p-4 bg-white border border-slate-200 rounded-lg hover:border-teal-500 hover:shadow-sm transition-colors">
              <span className="font-medium text-slate-800 text-sm text-center leading-tight">{c.companyName}</span>
              <span className="text-xs text-slate-400 mt-1">{c.count} jobs</span>
            </Link>
          ))}
        </div>
      </section>
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-800">Latest Singapore Jobs</h2>
          <Link href="/jobs" className="text-sm text-teal-600 hover:text-teal-700 font-medium">View all &rarr;</Link>
        </div>
        <div className="grid gap-3">
          {recentJobs.map((job) => (
            <JobCard key={job.id} id={job.id} title={job.title} companyName={job.companyName}
              companySlug={job.companySlug} locationCity={job.locationCity} locationCountry={job.locationCountry}
              segment={job.company?.segment || null} experienceLevel={job.experienceLevel}
              salaryMin={job.salaryMin} salaryMax={job.salaryMax} salaryCurrency={job.salaryCurrency}
              salaryPeriod={job.salaryPeriod} firstSeenAt={job.firstSeenAt} />
          ))}
        </div>
      </section>
    </div>
  );
}
