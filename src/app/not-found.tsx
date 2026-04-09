import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl font-bold text-slate-900 mb-4">404</h1>
      <p className="text-lg text-slate-500 mb-6">This page doesn&apos;t exist.</p>
      <Link href="/" className="text-teal-600 hover:underline">Back to homepage</Link>
    </div>
  );
}
