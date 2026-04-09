import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { timeAgo, formatSalary, employmentTypeLabel, experienceLevelLabel, employmentTypeJsonLd, countryToIso2 } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const job = await prisma.job.findUnique({ where: { id }, select: { title: true, companyName: true, locationCountry: true } });
  if (!job) return { title: "Job Not Found" };
  return {
    title: `${job.title} at ${job.companyName}`,
    description: `${job.title} position at ${job.companyName} in ${job.locationCountry || "Singapore"}.`,
  };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function sanitizeHtml(html: string): string {
  // Basic server-side sanitization: allow safe tags only
  const allowedTags = new Set(["p", "br", "strong", "b", "em", "i", "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6", "a", "div", "span"]);
  return html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/gi, (match, tag) => {
    const tagLower = tag.toLowerCase();
    if (allowedTags.has(tagLower)) {
      // Strip attributes except href on <a>
      if (tagLower === "a") {
        const href = match.match(/href="([^"]*)"/i);
        if (href) return match.startsWith("</") ? "</a>" : `<a href="${href[1]}" target="_blank" rel="noopener noreferrer">`;
      }
      return match.startsWith("</") ? `</${tagLower}>` : `<${tagLower}>`;
    }
    return "";
  });
}

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id },
    include: { company: { select: { segment: true, name: true, slug: true, atsPlatform: true } } },
  });

  if (!job || !job.isActive) notFound();

  const location = [job.locationCity, job.locationCountry].filter(Boolean).join(", ") || "Location not specified";
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency, job.salaryPeriod);
  const plainDescription = job.description ? stripHtml(job.description) : "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: plainDescription.slice(0, 5000),
    datePosted: job.firstSeenAt.toISOString(),
    validThrough: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    employmentType: employmentTypeJsonLd(job.employmentType),
    hiringOrganization: {
      "@type": "Organization",
      name: job.companyName,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        ...(job.locationCity && { addressLocality: job.locationCity }),
        addressCountry: countryToIso2(job.locationCountry),
      },
    },
    ...(job.salaryMin && {
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: job.salaryCurrency || "SGD",
        value: {
          "@type": "QuantitativeValue",
          minValue: job.salaryMin,
          ...(job.salaryMax && { maxValue: job.salaryMax }),
          unitText: (job.salaryPeriod || "year").toUpperCase(),
        },
      },
    }),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{job.title}</h1>
            <p className="text-lg text-slate-600 mb-1">
              <Link href={`/companies/${job.companySlug}`} className="text-teal-600 hover:underline">{job.companyName}</Link>
            </p>
            <p className="text-sm text-slate-500 mb-4">{location}</p>
            <div className="flex gap-2 text-xs text-slate-400 mb-6">
              <span>Posted {timeAgo(job.firstSeenAt)}</span>
              <span className="text-slate-300">|</span>
              <span>Updated {timeAgo(job.lastSeenAt)}</span>
            </div>

            {job.description ? (
              <div className="prose prose-slate prose-sm max-w-none mb-8"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(job.description) }} />
            ) : (
              <p className="text-slate-400 italic mb-8">No description available. View the full listing on the employer&apos;s site.</p>
            )}

            <a href={job.jobUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors">
              Apply on {job.companyName} &rarr;
            </a>
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
              {job.company?.segment && (
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase mb-1">Segment</p>
                  <span className="inline-flex items-center px-2.5 py-1 text-sm font-medium bg-slate-100 text-slate-700 rounded">{job.company.segment}</span>
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase mb-1">Experience Level</p>
                <p className="text-sm text-slate-700">{experienceLevelLabel(job.experienceLevel)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase mb-1">Employment Type</p>
                <p className="text-sm text-slate-700">{employmentTypeLabel(job.employmentType)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase mb-1">Salary</p>
                <p className="text-sm text-slate-700">{salary}</p>
              </div>
              {job.jobFamily && (
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase mb-1">Job Family</p>
                  <p className="text-sm text-slate-700">{job.jobFamily}</p>
                </div>
              )}
              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-400">Source: {job.sourceAts}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
