'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function TasteProfileBanner() {
  const pathname = usePathname();

  // Don't show banner if already on the profile page
  if (pathname === '/dashboard/profile') {
    return null;
  }

  return (
    <div className="border-b border-emerald-500/20 bg-emerald-950/50 px-6 py-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-emerald-300">
          Complete your taste profile to get personalized recommendations.
        </p>
        <Link
          href="/dashboard/profile"
          className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
        >
          Set Up Profile
        </Link>
      </div>
    </div>
  );
}
