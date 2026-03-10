export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-full bg-purple-600" />
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>
  );
}
