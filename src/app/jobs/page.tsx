import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import JobCard from "@/components/JobCard";
import Pagination from "@/components/Pagination";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Jobs",
  description: "Browse Singapore finance jobs from top employers. Filter by company, segment, and experience level.",
};

const PER_PAGE = 25;

interface Props {
  searchParams: Promise<{
    q?: string;
    company?: string;
    country?: string;
    segment?: string;
    experience?: string;
    page?: string;
  }>;
}

export default async function JobsPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q || "";
  const company = params.company || "";
  const country = params.country || "Singapore";
  const segment = params.segment || "";
  const experience = params.experience || "";
  const page = Math.max(1, parseInt(params.page || "1", 10));

  const where: Prisma.JobWhereInput = { isActive: true };
  if (country) where.locationCountry = country;
  if (company) where.companySlug = company;
  if (experience) where.experienceLevel = experience;
  if (segment) where.company = { segment };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { companyName: { contains: q, mode: "insensitive" } },
    ];
  }

  const [totalCount, jobs, segments, countries, experienceLevels] = await Promise.all([
    prisma.job.count({ where }),
    prisma.job.findMany({
      where,
      orderBy: { firstSeenAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: {
        id: true, title: true, companyName: true, companySlug: true,
        locationCity: true, locationCountry: true, experienceLevel: true,
        salaryMin: true, salaryMax: true, salaryCurrency: true, salaryPeriod: true,
        firstSeenAt: true, company: { select: { segment: true } },
      },
    }),
    prisma.$queryRaw<{ segment: string; count: number }[]>`
      SELECT c.segment, COUNT(j.id)::int as count
      FROM "Job" j JOIN "Company" c ON j."companySlug" = c.slug
      WHERE j."isActive" = true AND j."locationCountry" = 'Singapore'
      GROUP BY c.segment ORDER BY count DESC
    `,
    prisma.$queryRaw<{ country: string; count: number }[]>`
      SELECT "locationCountry" as country, COUNT(*)::int as count
      FROM "Job" WHERE "isActive" = true AND "locationCountry" IS NOT NULL
      GROUP BY "locationCountry" ORDER BY count DESC LIMIT 15
    `,
    prisma.$queryRaw<{ level: string; count: number }[]>`
      SELECT "experienceLevel" as level, COUNT(*)::int as count
      FROM "Job" WHERE "isActive" = true AND "locationCountry" = 'Singapore' AND "experienceLevel" IS NOT NULL
      GROUP BY "experienceLevel" ORDER BY count DESC
    `,
  ]);

  const totalPages = Math.ceil(totalCount / PER_PAGE);
  const currentParams: Record<string, string> = {};
  if (q) currentParams.q = q;
  if (company) currentParams.company = company;
  if (country) currentParams.country = country;
  if (segment) currentParams.segment = segment;
  if (experience) currentParams.experience = experience;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="w-full md:w-56 shrink-0">
          <h2 className="font-semibold text-sm text-slate-700 mb-3">Filters</h2>

          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-500 mb-1">Country</label>
            <div className="flex flex-col gap-1">
              {countries.map((c) => (
                <Link key={c.country} href={`/jobs?${new URLSearchParams({ ...currentParams, country: c.country, page: "1" }).toString()}`}
                  className={`text-sm px-2 py-1 rounded ${country === c.country ? "bg-teal-50 text-teal-700 font-medium" : "text-slate-600 hover:bg-slate-100"}`}>
                  {c.country} ({c.count.toLocaleString()})
                </Link>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-500 mb-1">Segment</label>
            <div className="flex flex-col gap-1">
              <Link href={`/jobs?${new URLSearchParams({ ...currentParams, segment: "", page: "1" }).toString()}`}
                className={`text-sm px-2 py-1 rounded ${!segment ? "bg-teal-50 text-teal-700 font-medium" : "text-slate-600 hover:bg-slate-100"}`}>
                All segments
              </Link>
              {segments.map((s) => (
                <Link key={s.segment} href={`/jobs?${new URLSearchParams({ ...currentParams, segment: s.segment, page: "1" }).toString()}`}
                  className={`text-sm px-2 py-1 rounded ${segment === s.segment ? "bg-teal-50 text-teal-700 font-medium" : "text-slate-600 hover:bg-slate-100"}`}>
                  {s.segment} ({s.count})
                </Link>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-500 mb-1">Experience</label>
            <div className="flex flex-col gap-1">
              <Link href={`/jobs?${new URLSearchParams({ ...currentParams, experience: "", page: "1" }).toString()}`}
                className={`text-sm px-2 py-1 rounded ${!experience ? "bg-teal-50 text-teal-700 font-medium" : "text-slate-600 hover:bg-slate-100"}`}>
                All levels
              </Link>
              {experienceLevels.map((e) => (
                <Link key={e.level} href={`/jobs?${new URLSearchParams({ ...currentParams, experience: e.level, page: "1" }).toString()}`}
                  className={`text-sm px-2 py-1 rounded ${experience === e.level ? "bg-teal-50 text-teal-700 font-medium" : "text-slate-600 hover:bg-slate-100"}`}>
                  {e.level} ({e.count})
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">
              Showing {((page - 1) * PER_PAGE + 1).toLocaleString()}–{Math.min(page * PER_PAGE, totalCount).toLocaleString()} of {totalCount.toLocaleString()} jobs
              {q && <> matching <strong>&ldquo;{q}&rdquo;</strong></>}
            </p>
          </div>

          {jobs.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-lg mb-2">No jobs match your filters.</p>
              <Link href="/jobs" className="text-teal-600 hover:underline text-sm">Clear all filters</Link>
            </div>
          ) : (
            <div className="grid gap-3">
              {jobs.map((job) => (
                <JobCard key={job.id} id={job.id} title={job.title} companyName={job.companyName}
                  companySlug={job.companySlug} locationCity={job.locationCity} locationCountry={job.locationCountry}
                  segment={job.company?.segment || null} experienceLevel={job.experienceLevel}
                  salaryMin={job.salaryMin} salaryMax={job.salaryMax} salaryCurrency={job.salaryCurrency}
                  salaryPeriod={job.salaryPeriod} firstSeenAt={job.firstSeenAt} />
              ))}
            </div>
          )}

          <Pagination currentPage={page} totalPages={totalPages} baseUrl="/jobs" searchParams={currentParams} />
        </div>
      </div>
    </div>
  );
}
