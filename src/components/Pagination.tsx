import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams: Record<string, string>;
}

export default function Pagination({ currentPage, totalPages, baseUrl, searchParams }: PaginationProps) {
  if (totalPages <= 1) return null;

  function pageUrl(page: number): string {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    return `${baseUrl}?${params.toString()}`;
  }

  return (
    <nav className="flex items-center justify-center gap-4 mt-8" aria-label="Pagination">
      {currentPage > 1 ? (
        <Link href={pageUrl(currentPage - 1)} className="px-4 py-2 text-sm font-medium text-teal-700 bg-white border border-slate-200 rounded hover:bg-slate-50">
          Previous
        </Link>
      ) : (
        <span className="px-4 py-2 text-sm font-medium text-slate-300 bg-white border border-slate-100 rounded cursor-not-allowed">
          Previous
        </span>
      )}
      <span className="text-sm text-slate-500">
        Page {currentPage} of {totalPages}
      </span>
      {currentPage < totalPages ? (
        <Link href={pageUrl(currentPage + 1)} className="px-4 py-2 text-sm font-medium text-teal-700 bg-white border border-slate-200 rounded hover:bg-slate-50">
          Next
        </Link>
      ) : (
        <span className="px-4 py-2 text-sm font-medium text-slate-300 bg-white border border-slate-100 rounded cursor-not-allowed">
          Next
        </span>
      )}
    </nav>
  );
}
