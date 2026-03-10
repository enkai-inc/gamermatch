import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between">
        <p className="text-sm text-slate-500">
          &copy; {new Date().getFullYear()} GameMatch AI. All rights reserved.
        </p>

        <nav className="flex items-center gap-6">
          <Link href="/about" className="text-sm text-slate-400 transition-colors hover:text-slate-200">
            About
          </Link>
          <Link href="/privacy" className="text-sm text-slate-400 transition-colors hover:text-slate-200">
            Privacy
          </Link>
          <Link href="/terms" className="text-sm text-slate-400 transition-colors hover:text-slate-200">
            Terms
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-600">Social links coming soon</span>
        </div>
      </div>
    </footer>
  );
}
Footer.displayName = 'Footer';
