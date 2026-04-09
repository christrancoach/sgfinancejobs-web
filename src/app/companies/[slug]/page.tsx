import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import JobCard from "@/components/JobCard";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = await prisma.company.findUnique({ where: { slug }, select: { name: true, segment: true } });
  if (!company) return { title: "Company Not Found" };
  return {
    title: `${company.name} Jobs in Singapore`,
    description: `Browse open positions at ${company.name} (${company.segment}) in Singapore.`,
  };
}

export default async function CompanyPage({ params }: Props) {
  const { slug } = await params;
  const company = await prisma.company.findUnique({ where: { slug } });
  if (!company) notFound();

  const jobs = await prisma.job.findMany({
    where: { companySlug: slug, isActive: true, locationCountry: "Singapore" },
    orderBy: { firstSeenAt: "desc" },
    select: {
      id: true, title: true, companyName: true, companySlug: true,
      locationCity: true, locationCountry: true, experienceLevel: true,
      salaryMin: true, salaryMax: true, salaryCurrency: true, salaryPeriod: true,
      firstSeenAt: true,
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{company.name}</h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="inline-flex items-center px-2.5 py-1 font-medium bg-slate-100 text-slate-700 rounded">{company.segment}</span>
          <span className="text-slate-500">{jobs.length} Singapore {jobs.length === 1 ? "role" : "roles"}</span>
        </div>
      </div>

      {jobs.length === 0 ? (
        <p className="text-slate-400 py-8 text-center">No active Singapore positions right now.</p>
      ) : (
        <div className="grid gap-3">
          {jobs.map((job) => (
            <JobCard key={job.id} id={job.id} title={job.title} companyName={job.companyName}
              companySlug={job.companySlug} locationCity={job.locationCity} locationCountry={job.locationCountry}
              segment={company.segment} experienceLevel={job.experienceLevel}
              salaryMin={job.salaryMin} salaryMax={job.salaryMax} salaryCurrency={job.salaryCurrency}
              salaryPeriod={job.salaryPeriod} firstSeenAt={job.firstSeenAt} />
          ))}
        </div>
      )}

      <p className="text-xs text-slate-400 mt-8">Data sourced from {company.atsPlatform}</p>
    </div>
  );
}
