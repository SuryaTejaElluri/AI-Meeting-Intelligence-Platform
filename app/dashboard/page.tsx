'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Mic,
  Search,
  CheckSquare,
  Scale,
  FileText,
  Clock,
  ArrowRight,
  Sparkles,
  Plus,
  Loader2,
  Calendar,
} from 'lucide-react';

export default function DashboardPage() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    transcripts: any[];
    actionItems: any[];
  } | null>(null);

  useEffect(() => {
    fetchMeetings();
  }, []);

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
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults({
          transcripts: data.transcripts || [],
          actionItems: data.actionItems || [],
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Metrics computation
  const totalMeetings = meetings.length;
  const totalActionItems = meetings.reduce((acc, m) => acc + (m.actionItems?.length || 0), 0);
  const totalDecisions = meetings.reduce((acc, m) => acc + (m.decisions?.length || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
            Meeting Intelligence Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review transcripts, track assigned action items, and query meeting knowledge with AI.
          </p>
        </div>

        <Link
          href="/upload"
          className="px-5 py-3 rounded-xl font-semibold text-xs bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-95 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Upload New Recording
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          icon={<Mic className="w-5 h-5 text-indigo-400" />}
          title="Total Meetings"
          value={totalMeetings.toString()}
          subtitle="Processed via Whisper Small"
        />
        <StatCard
          icon={<CheckSquare className="w-5 h-5 text-emerald-400" />}
          title="Action Items Tracked"
          value={totalActionItems.toString()}
          subtitle="Assigned to responsible persons"
        />
        <StatCard
          icon={<Scale className="w-5 h-5 text-amber-400" />}
          title="Key Decisions"
          value={totalDecisions.toString()}
          subtitle="Identified across meetings"
        />
      </div>

      {/* Global Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search transcripts, topics, tasks, decisions..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Search Results Drawer */}
        {searchResults && (
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Search Results ({searchResults.transcripts.length + searchResults.actionItems.length})
            </h3>

            {searchResults.actionItems.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-300">Matching Action Items:</p>
                {searchResults.actionItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs flex justify-between items-center"
                  >
                    <div>
                      <p className="text-slate-200">{item.description}</p>
                      <p className="text-[10px] text-indigo-400 font-mono mt-0.5">
                        Owner: {item.responsiblePerson || 'Unassigned'} • Meeting: {item.meeting?.title}
                      </p>
                    </div>
                    <Link
                      href={`/meetings/${item.meetingId}`}
                      className="text-xs text-indigo-400 hover:underline"
                    >
                      View →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Meetings Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold font-heading text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          Recent Meetings
        </h2>

        {loading ? (
          <div className="py-16 text-center text-xs text-indigo-400 font-mono flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading meeting records...
          </div>
        ) : meetings.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-4">
            <div className="p-4 rounded-full bg-indigo-500/10 text-indigo-400 w-16 h-16 mx-auto flex items-center justify-center">
              <Mic className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No Meeting Recordings Uploaded Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Upload your first audio or video recording to test speech-to-text transcription and open-source AI analysis.
              </p>
            </div>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/20"
            >
              Upload First Meeting
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

function StatCard({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">{icon}</div>
      <div>
        <p className="text-xs font-medium text-slate-400">{title}</p>
        <p className="text-2xl font-extrabold font-heading text-white">{value}</p>
        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function MeetingCard({ meeting }: { meeting: any }) {
  const isCompleted = meeting.status === 'COMPLETED';

  return (
    <div className="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span
            className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${
              isCompleted
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : meeting.status === 'PROCESSING'
                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                : 'bg-red-500/10 text-red-400 border-red-500/30'
            }`}
          >
            {meeting.status}
          </span>
          <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(meeting.createdAt).toLocaleDateString()}
          </span>
        </div>

        <h3 className="text-base font-bold font-heading text-white line-clamp-1">{meeting.title}</h3>

        {meeting.summary?.overview ? (
          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {meeting.summary.overview}
          </p>
        ) : (
          <p className="text-xs text-slate-500 italic mt-2">Processing transcription & summary...</p>
        )}
      </div>

      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
          <span>{meeting.actionItems?.length || 0} Tasks</span>
          <span>•</span>
          <span>{meeting.decisions?.length || 0} Decisions</span>
        </div>

        <Link
          href={`/meetings/${meeting.id}`}
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
        >
          View Workspace <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
