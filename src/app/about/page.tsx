import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About sgfinancejobs.com — the most comprehensive Singapore finance job board.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">About sgfinancejobs.com</h1>

      <div className="prose prose-slate max-w-none">
        <p>
          <strong>sgfinancejobs.com</strong> is the most comprehensive Singapore finance job board.
          We aggregate open positions directly from public employer ATS (Applicant Tracking System)
          platforms, covering banks, insurance, asset management, fintech, crypto, and more.
        </p>

        <h2>Where does the data come from?</h2>
        <p>
          Every job listing on this site is sourced directly from employer career pages. We scrape
          6 major ATS platforms &mdash; Workday, Greenhouse, Lever, Ashby, SmartRecruiters, and
          Workable &mdash; covering 60+ companies in the Singapore financial services ecosystem.
        </p>
        <p>
          This means we capture roles that never appear on traditional job boards, including
          positions posted exclusively on company career pages that require employer-paid listings
          on other platforms.
        </p>

        <h2>How often is it updated?</h2>
        <p>
          The scraper runs daily at approximately 02:00 SGT (18:00 UTC). Jobs are added, updated,
          or marked as closed based on whether they still appear on the employer&apos;s career site.
        </p>

        <h2>Early preview</h2>
        <p>
          This site is currently in early preview. We&apos;re actively expanding employer coverage,
          improving location data quality, and adding features like salary insights and job alerts.
          If you notice any issues or have feedback, please reach out.
        </p>

        <h2>Contact</h2>
        <p>
          Email: <a href="mailto:hello@sgfinancejobs.com" className="text-teal-600 hover:underline">hello@sgfinancejobs.com</a>
        </p>
      </div>
    </div>
  );
}
