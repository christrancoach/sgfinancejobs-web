import { prisma } from "@/lib/prisma";
import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://sgfinancejobs.com";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/jobs`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  // All active SG jobs
  const jobs = await prisma.job.findMany({
    where: { isActive: true, locationCountry: "Singapore" },
    select: { id: true, lastSeenAt: true },
  });

  const jobPages: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `${baseUrl}/jobs/${job.id}`,
    lastModified: job.lastSeenAt,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  // All companies with SG jobs
  const companies = await prisma.$queryRaw<{ slug: string }[]>`
    SELECT DISTINCT c.slug
    FROM "Company" c
    JOIN "Job" j ON j."companySlug" = c.slug
    WHERE j."isActive" = true AND j."locationCountry" = 'Singapore'
  `;

  const companyPages: MetadataRoute.Sitemap = companies.map((c) => ({
    url: `${baseUrl}/companies/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...companyPages, ...jobPages];
}
