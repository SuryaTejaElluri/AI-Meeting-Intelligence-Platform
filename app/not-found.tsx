import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-6">
      <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
        <FileQuestion className="w-10 h-10" />
      </div>

      <div className="space-y-2 max-w-md">
        <h2 className="text-2xl font-bold font-heading text-white">404 - Page Not Found</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          The meeting resource or page you are looking for does not exist or has been moved.
        </p>
      </div>

      <Link
        href="/dashboard"
        className="px-6 py-2.5 rounded-xl font-semibold text-xs bg-indigo-600 text-white hover:bg-indigo-500 flex items-center gap-2 shadow-md shadow-indigo-500/20"
      >
        <Home className="w-4 h-4" /> Return to Dashboard
      </Link>
    </div>
  );
}
