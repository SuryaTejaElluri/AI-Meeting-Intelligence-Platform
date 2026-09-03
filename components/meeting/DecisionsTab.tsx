import { DecisionData } from '@/lib/types';
import { Scale, Tag } from 'lucide-react';

interface DecisionsTabProps {
  decisions: DecisionData[];
}

export default function DecisionsTab({ decisions }: DecisionsTabProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold font-heading text-white flex items-center gap-2 px-2">
        <Scale className="w-5 h-5 text-amber-400" />
        Important Decisions Made ({decisions.length})
      </h4>

      <div className="grid gap-3">
        {decisions.map((d, idx) => (
          <div
            key={idx}
            className="glass-panel p-4 rounded-xl border border-slate-800 flex items-start gap-3"
          >
            <span className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
              {idx + 1}
            </span>

            <div className="flex-1">
              <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                {d.description}
              </p>

              {d.category && (
                <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-400">
                  <Tag className="w-3 h-3" />
                  {d.category}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
