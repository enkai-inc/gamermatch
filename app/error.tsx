'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="text-center">
        <h2 className="mb-4 text-2xl font-bold text-white">
          Something went wrong
        </h2>
        <p className="mb-6 text-gray-400">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={() => reset()}
          className="rounded-lg bg-purple-600 px-6 py-3 text-white transition-colors hover:bg-purple-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
