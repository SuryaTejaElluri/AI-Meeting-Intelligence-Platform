import FileUploader from '@/components/upload/FileUploader';
import { Mic, Zap, Shield, Clock } from 'lucide-react';

export default function UploadPage() {
  return (
    <div className="overflow-hidden">
      {/* Page header */}
      <div className="relative pt-12 pb-6 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-indigo-600/8 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <span className="section-label inline-flex mb-4">
            <Mic className="w-3 h-3" /> Upload Center
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
            Upload Meeting Recording
          </h1>
          <p className="mt-3 text-slate-400 text-sm max-w-md mx-auto">
            Drop your audio or video file and let AI extract transcripts, summaries, action items & more.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            {[
              { icon: <Zap className="w-3 h-3" />, text: 'Under 60s processing' },
              { icon: <Shield className="w-3 h-3" />, text: 'Secure & private' },
              { icon: <Clock className="w-3 h-3" />, text: 'MP3, WAV, MP4, M4A, WebM' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-white/[0.07] text-xs text-slate-400">
                <span className="text-indigo-400">{icon}</span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Uploader */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <FileUploader />
      </div>
    </div>
  );
}
