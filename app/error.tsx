'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-6">
      <div className="p-4 rounded-full bg-red-500/10 border border-red-500/30 text-red-400">
        <AlertTriangle className="w-10 h-10" />
      </div>

      <div className="space-y-2 max-w-md">
        <h2 className="text-2xl font-bold font-heading text-white">Something Went Wrong</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          An unexpected error occurred while rendering this page. You can try refreshing or returning to the dashboard.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 rounded-xl font-semibold text-xs bg-indigo-600 text-white hover:bg-indigo-500 flex items-center gap-2 shadow-md shadow-indigo-500/20"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
        <Link
          href="/dashboard"
          className="px-5 py-2.5 rounded-xl font-semibold text-xs glass-panel border border-slate-700 text-slate-300 hover:bg-slate-800 flex items-center gap-2"
        >
          <Home className="w-4 h-4" /> Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
