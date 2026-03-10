import Link from 'next/link';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { SignOutButton } from '@/modules/auth/sign-out-button';
import { TasteProfileBanner } from '@/components/taste-profile/banner';

const navItems = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/discover', label: 'Discover' },
  { href: '/dashboard/journal', label: 'Journal' },
  { href: '/dashboard/wishlist', label: 'Wishlist' },
  { href: '/dashboard/profile', label: 'Profile' },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  let showProfileBanner = false;
  if (session?.user?.id) {
    const profile = await db.tasteProfile.findUnique({
      where: { userId: session.user.id },
      select: { completedAt: true },
    });
    showProfileBanner = !profile?.completedAt;
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <aside className="w-64 border-r border-slate-800 bg-slate-900 p-4">
        <div className="mb-8 px-2 text-lg font-bold text-emerald-400">
          GameMatch AI
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-emerald-400"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-slate-800 bg-slate-900 px-6">
          <span className="text-sm font-medium text-slate-300">Dashboard</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">
              {session?.user?.name || session?.user?.email || 'User'}
            </span>
            <div className="h-8 w-8 rounded-full bg-slate-700" />
            <SignOutButton />
          </div>
        </header>
        {showProfileBanner && <TasteProfileBanner />}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
