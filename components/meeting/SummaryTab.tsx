'use client';

import { MeetingSummaryData } from '@/lib/types';
import { FileText, Users, CheckCircle } from 'lucide-react';

interface SummaryTabProps {
  summary?: MeetingSummaryData;
}

export default function SummaryTab({ summary }: SummaryTabProps) {
  if (!summary) {
    return (
      <div className="py-12 text-center text-slate-500 text-xs">
        No summary generated for this meeting yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Executive Overview */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h4 className="text-sm font-bold font-heading text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Executive Overview
        </h4>
        <p className="text-sm text-slate-200 leading-relaxed">{summary.overview}</p>
      </div>

      {/* Key Discussion Points */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h4 className="text-sm font-bold font-heading text-indigo-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          Key Discussion Points & Outcomes
        </h4>
        <ul className="space-y-3">
          {summary.keyDiscussionPts.map((pt, i) => (
            <li key={i} className="flex items-start gap-3 text-xs text-slate-300">
              <span className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-semibold flex items-center justify-center shrink-0 mt-0.5 font-mono text-[11px]">
                {i + 1}
              </span>
              <span className="leading-relaxed">{pt}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Identified Participants */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h4 className="text-sm font-bold font-heading text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-400" />
          Identified Participants
        </h4>
        <div className="flex flex-wrap gap-2">
          {summary.participants.map((person, i) => (
            <span
              key={i}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-medium text-slate-300 flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {person}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
