import { auth } from '@/lib/auth';
import { DashboardOverview } from '@/components/dashboard/overview';

export default async function DashboardPage() {
  const session = await auth();
  const name = session?.user?.name || 'Gamer';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-100">
          Welcome back, {name}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Here is what is happening with your gaming world.
        </p>
      </div>
      <DashboardOverview />
    </div>
  );
}
