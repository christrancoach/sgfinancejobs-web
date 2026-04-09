import Link from "next/link";
import { timeAgo, formatSalary, experienceLevelLabel } from "@/lib/utils";

interface JobCardProps {
  id: string;
  title: string;
  companyName: string;
  companySlug: string;
  locationCity: string | null;
  locationCountry: string | null;
  segment: string | null;
  experienceLevel: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  salaryPeriod: string | null;
  firstSeenAt: Date;
}

export default function JobCard({ id, title, companyName, companySlug, locationCity, locationCountry, segment, experienceLevel, salaryMin, salaryMax, salaryCurrency, salaryPeriod, firstSeenAt }: JobCardProps) {
  const location = [locationCity, locationCountry].filter(Boolean).join(", ") || "Location not specified";
  const salary = formatSalary(salaryMin, salaryMax, salaryCurrency, salaryPeriod);

  return (
    <Link href={`/jobs/${id}`} className="block border border-slate-200 rounded-lg p-4 hover:border-teal-500 hover:shadow-sm transition-colors bg-white">
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold text-slate-900 text-base leading-snug">{title}</h3>
        <p className="text-sm text-slate-600">
          <Link href={`/companies/${companySlug}`} className="hover:text-teal-600 hover:underline" onClick={(e) => e.stopPropagation()}>
            {companyName}
          </Link>
          <span className="mx-1.5 text-slate-300">|</span>
          {location}
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          {segment && (
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded">
              {segment}
            </span>
          )}
          {experienceLevel && (
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-teal-50 text-teal-700 rounded">
              {experienceLevelLabel(experienceLevel)}
            </span>
          )}
          {salaryMin && (
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded">
              {salary}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-2">{timeAgo(firstSeenAt)}</p>
      </div>
    </Link>
  );
}
