'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Mic,
  Search,
  CheckSquare,
  Scale,
  FileText,
  ArrowRight,
  Sparkles,
  Plus,
  Loader2,
  Calendar,
  LayoutGrid,
  TrendingUp,
  Brain,
  Clock,
  Filter,
} from 'lucide-react';

export default function DashboardPage() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    transcripts: any[];
    actionItems: any[];
  } | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => { fetchMeetings(); }, []);

  const fetchMeetings = async () => {
    try {
      const res = await fetch('/api/meetings');
      if (res.ok) {
        const data = await res.json();
        setMeetings(data.meetings || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) { setSearchResults(null); return; }
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults({ transcripts: data.transcripts || [], actionItems: data.actionItems || [] });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  const totalMeetings = meetings.length;
  const totalActionItems = meetings.reduce((acc, m) => acc + (m.actionItems?.length || 0), 0);
  const totalDecisions = meetings.reduce((acc, m) => acc + (m.decisions?.length || 0), 0);
  const completedMeetings = meetings.filter(m => m.status === 'COMPLETED').length;

  const stats = [
    {
      icon: <Mic className="w-5 h-5 text-indigo-400" />,
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      title: 'Total Meetings',
      value: totalMeetings,
      sub: `${completedMeetings} processed`,
      trend: '+12%',
    },
    {
      icon: <CheckSquare className="w-5 h-5 text-emerald-400" />,
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      title: 'Action Items',
      value: totalActionItems,
      sub: 'tracked & assigned',
      trend: '+8%',
    },
    {
      icon: <Scale className="w-5 h-5 text-amber-400" />,
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      title: 'Key Decisions',
      value: totalDecisions,
      sub: 'identified by AI',
      trend: '+5%',
    },
    {
      icon: <Brain className="w-5 h-5 text-purple-400" />,
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      title: 'AI Summaries',
      value: completedMeetings,
      sub: 'generated',
      trend: '+15%',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeInUp">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutGrid className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
            Meeting Intelligence
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review transcripts, track action items, and query meeting knowledge with AI.
          </p>
        </div>
        <Link
          href="/upload"
          className="btn-primary text-xs shrink-0"
          id="dashboard-upload-btn"
        >
          <Plus className="w-4 h-4" />
          New Recording
        </Link>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeInUp delay-100">
        {stats.map(({ icon, bg, border, title, value, sub, trend }, i) => (
          <div key={title} className={`glass-card rounded-2xl p-5 border ${border}`}>
            <div className={`inline-flex p-2.5 rounded-xl ${bg} border ${border} mb-3`}>{icon}</div>
            <div className="text-2xl font-extrabold font-heading text-white">{value}</div>
            <div className="text-xs font-medium text-slate-400 mt-0.5">{title}</div>
            <div className="text-[10px] text-slate-600 font-mono mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      <div className="glass-card rounded-2xl border border-white/[0.06] p-5 space-y-4 animate-fadeInUp delay-200">
        <div className="relative">
          {searchLoading ? (
            <Loader2 className="w-4 h-4 text-indigo-400 absolute left-4 top-1/2 -translate-y-1/2 animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
          )}
          <input
            id="dashboard-search"
            type="text"
            placeholder="Search transcripts, topics, tasks, decisions..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="input-field pl-11 py-3.5"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Search Results */}
        {searchResults && (
          <div className="space-y-3 pt-2 border-t border-white/[0.04]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">
                {searchResults.transcripts.length + searchResults.actionItems.length} Results
              </h3>
            </div>
            {searchResults.actionItems.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400">Matching Action Items</p>
                {searchResults.actionItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                    <div>
                      <p className="text-sm text-slate-200">{item.description}</p>
                      <p className="text-[10px] text-indigo-400 font-mono mt-0.5">
                        {item.responsiblePerson || 'Unassigned'} · {item.meeting?.title}
                      </p>
                    </div>
                    <Link href={`/meetings/${item.meetingId}`} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                      View <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
            {searchResults.transcripts.length === 0 && searchResults.actionItems.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No results found for &quot;{searchQuery}&quot;</p>
            )}
          </div>
        )}
      </div>

      {/* ── Meetings Grid ── */}
      <div className="space-y-4 animate-fadeInUp delay-300">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-heading text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            Recent Meetings
          </h2>
          <span className="text-xs text-slate-500 font-mono">{meetings.length} total</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-2xl p-5 space-y-3">
                <div className="shimmer h-4 w-24 rounded-lg" />
                <div className="shimmer h-5 w-3/4 rounded-lg" />
                <div className="shimmer h-12 rounded-lg" />
                <div className="shimmer h-8 rounded-lg" />
              </div>
            ))}
          </div>
        ) : meetings.length === 0 ? (
          <div className="glass-card rounded-2xl border border-white/[0.06] py-20 text-center space-y-5">
            <div className="inline-flex p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
              <Mic className="w-10 h-10 text-indigo-400 animate-float" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-heading">No Meetings Yet</h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed">
                Upload your first audio or video recording to start extracting AI-powered meeting intelligence.
              </p>
            </div>
            <Link href="/upload" className="btn-primary inline-flex text-sm" id="empty-upload-btn">
              <Plus className="w-4 h-4" /> Upload First Meeting
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {meetings.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MeetingCard({ meeting }: { meeting: any }) {
  const isCompleted = meeting.status === 'COMPLETED';
  const isProcessing = meeting.status === 'PROCESSING';

  const statusBadge = isCompleted
    ? 'badge badge-emerald'
    : isProcessing
    ? 'badge badge-indigo'
    : 'badge badge-red';

  return (
    <div className="group glass-card rounded-2xl border border-white/[0.06] hover:border-indigo-500/25 p-5 flex flex-col justify-between gap-4 transition-all duration-300">
      <div>
        {/* Status row */}
        <div className="flex items-center justify-between mb-3">
          <span className={statusBadge}>
            {isProcessing && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />}
            {isCompleted && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            {meeting.status}
          </span>
          <span className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
            <Calendar className="w-3 h-3" />
            {new Date(meeting.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold font-heading text-white line-clamp-1 group-hover:text-indigo-200 transition-colors">
          {meeting.title}
        </h3>

        {/* Summary */}
        {meeting.summary?.overview ? (
          <p className="text-sm text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {meeting.summary.overview}
          </p>
        ) : (
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 italic">
            {isProcessing && <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />}
            {isProcessing ? 'Processing transcription & AI analysis...' : 'No summary available'}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-white/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
          <span className="flex items-center gap-1">
            <CheckSquare className="w-3 h-3 text-emerald-500" />
            {meeting.actionItems?.length || 0} Tasks
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Scale className="w-3 h-3 text-amber-500" />
            {meeting.decisions?.length || 0} Decisions
          </span>
        </div>
        <Link
          href={`/meetings/${meeting.id}`}
          className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 group-hover:gap-1.5 transition-all"
        >
          Open <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
