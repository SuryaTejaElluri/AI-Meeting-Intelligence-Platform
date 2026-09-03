'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Error:', error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-2xl font-bold text-white">Critical Application Error</h2>
          <p className="text-xs text-slate-400">An error occurred at the root level of the app.</p>
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-xl font-semibold text-xs bg-indigo-600 text-white hover:bg-indigo-500"
          >
            Reset Application
          </button>
        </div>
      </body>
    </html>
  );
}
