export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r p-4">
        <nav>
          <a href="/dashboard" className="block py-2">Overview</a>
          <a href="/dashboard/data" className="block py-2">Data</a>
          <a href="/dashboard/settings" className="block py-2">Settings</a>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
