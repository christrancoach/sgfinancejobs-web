import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Singapore Finance Jobs | sgfinancejobs.com",
    template: "%s | sgfinancejobs.com",
  },
  description: "The most comprehensive Singapore finance job board. Updated daily from public employer ATS platforms.",
  metadataBase: new URL("https://sgfinancejobs.com"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="text-lg font-bold text-teal-700 hover:text-teal-800">
              sgfinancejobs.com
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/jobs" className="text-slate-600 hover:text-teal-700">Jobs</Link>
              <Link href="/about" className="text-slate-600 hover:text-teal-700">About</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="bg-white border-t border-slate-200 mt-12">
          <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>Data from public employer ATS. Updated daily.</p>
            <div className="flex gap-4">
              <Link href="/about" className="hover:text-teal-600">About</Link>
              <Link href="/jobs" className="hover:text-teal-600">Browse Jobs</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
