'use client';

import { useState } from 'react';
import { TranscriptSegment } from '@/lib/types';
import { Search, User, Clock, MessageSquareQuote } from 'lucide-react';

interface InteractiveTranscriptProps {
  segments: TranscriptSegment[];
  currentTime: number;
  onSeek: (time: number) => void;
}

export default function InteractiveTranscript({
  segments,
  currentTime,
  onSeek,
}: InteractiveTranscriptProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSegments = segments.filter(
    (seg) =>
      seg.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (seg.speaker && seg.speaker.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col h-[520px]">
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <h3 className="text-base font-bold font-heading text-white flex items-center gap-2">
          <MessageSquareQuote className="w-5 h-5 text-indigo-400" />
          Interactive Transcript
          <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            openai/whisper-small
          </span>
        </h3>

        {/* Transcript Search */}
        <div className="relative w-48 sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search transcript..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Transcript Segments List */}
      <div className="flex-1 overflow-y-auto space-y-3 pt-4 pr-1">
        {filteredSegments.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No matching transcript segments found.
          </div>
        ) : (
          filteredSegments.map((seg, idx) => {
            const isActive = currentTime >= seg.start && currentTime <= seg.end;
            return (
              <div
                key={idx}
                onClick={() => onSeek(seg.start)}
                className={`p-3.5 rounded-xl cursor-pointer transition-all border ${
                  isActive
                    ? 'bg-indigo-500/15 border-indigo-500/50 text-white shadow-md shadow-indigo-500/10 translate-x-1'
                    : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    {seg.speaker || 'Speaker'}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {formatTime(seg.start)} - {formatTime(seg.end)}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-slate-200">{seg.text}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
