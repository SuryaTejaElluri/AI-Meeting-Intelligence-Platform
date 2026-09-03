'use client';

import { useState } from 'react';
import { ActionItemData } from '@/lib/types';
import { CheckSquare, Square, User, Calendar, CheckCircle2 } from 'lucide-react';

interface ActionItemsTabProps {
  actionItems: ActionItemData[];
}

export default function ActionItemsTab({ actionItems: initialItems }: ActionItemsTabProps) {
  const [items, setItems] = useState<ActionItemData[]>(initialItems);

  const toggleStatus = async (index: number) => {
    const item = items[index];
    const newStatus = item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

    const updated = [...items];
    updated[index].status = newStatus;
    setItems(updated);

    if (item.id) {
      try {
        await fetch(`/api/action-items/${item.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
      } catch (e) {
        console.error('Failed to update status:', e);
      }
    }
  };

  const completedCount = items.filter((i) => i.status === 'COMPLETED').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h4 className="text-sm font-bold font-heading text-white flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-indigo-400" />
          Extracted Action Items ({items.length})
        </h4>
        <span className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg">
          Completed: {completedCount} / {items.length}
        </span>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => {
          const isDone = item.status === 'COMPLETED';
          return (
            <div
              key={idx}
              onClick={() => toggleStatus(idx)}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-4 ${
                isDone
                  ? 'bg-slate-900/30 border-slate-800/60 opacity-60'
                  : 'bg-slate-900/60 border-slate-800 hover:border-indigo-500/40'
              }`}
            >
              <button className="mt-0.5 shrink-0 text-indigo-400 hover:scale-110 transition-transform">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                ) : (
                  <Square className="w-5 h-5 text-slate-500" />
                )}
              </button>

              <div className="flex-1">
                <p
                  className={`text-xs sm:text-sm font-medium ${
                    isDone ? 'line-through text-slate-400' : 'text-slate-200'
                  }`}
                >
                  {item.description}
                </p>

                <div className="flex flex-wrap gap-4 mt-2.5 text-xs text-slate-400 font-mono">
                  {item.responsiblePerson && (
                    <span className="flex items-center gap-1 text-indigo-300">
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      Owner: {item.responsiblePerson}
                    </span>
                  )}

                  {item.deadline && (
                    <span className="flex items-center gap-1 text-amber-300">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      Due: {item.deadline}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
