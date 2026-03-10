import Link from 'next/link';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { WishlistList } from '@/components/wishlist/wishlist-list';

export default async function WishlistPage() {
  const session = await auth();
  const userId = session?.user?.id;

  let count = 0;
  if (userId) {
    count = await db.wishlistItem.count({ where: { userId } });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Wishlist</h1>
          <p className="mt-1 text-sm text-slate-400">
            {count > 0
              ? `${count} game${count === 1 ? '' : 's'} tracked`
              : 'Track games and get price drop notifications.'}
          </p>
        </div>
        {count === 0 && (
          <Link
            href="/dashboard/discover"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Discover Games
          </Link>
        )}
      </div>
      <WishlistList />
    </div>
  );
}
