import { TopicData } from '@/lib/types';
import { Layers, Clock } from 'lucide-react';

interface TopicsTabProps {
  topics: TopicData[];
}

export default function TopicsTab({ topics }: TopicsTabProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold font-heading text-white flex items-center gap-2 px-2">
        <Layers className="w-5 h-5 text-purple-400" />
        Discussion Topics & Timeline Breakdown
      </h4>

      <div className="grid gap-3 sm:grid-cols-2">
        {topics.map((t, idx) => (
          <div
            key={idx}
            className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 font-heading">{t.name}</span>
              {t.timestamp && (
                <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                  <Clock className="w-3 h-3 text-purple-400" />
                  {t.timestamp}
                </span>
              )}
            </div>

            {t.summary && <p className="text-xs text-slate-400 leading-relaxed">{t.summary}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
