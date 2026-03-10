import { StatsGrid } from '@/modules/dashboard/stats-cards';

const placeholderStats = [
  { label: 'Games Played', value: 0 },
  { label: 'Recommendations', value: 0 },
  { label: 'Wishlist', value: 0 },
  { label: 'Match Score', value: '-%' },
];

export default function DashboardPage() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-slate-100">Dashboard</h1>
      <StatsGrid stats={placeholderStats} />
    </div>
  );
}
