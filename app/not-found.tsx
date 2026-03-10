import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950">
      <h1 className="text-6xl font-bold text-slate-100">404</h1>
      <p className="mt-4 text-lg text-slate-400">Page not found</p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-500"
      >
        Back to Home
      </Link>
    </div>
  );
}
