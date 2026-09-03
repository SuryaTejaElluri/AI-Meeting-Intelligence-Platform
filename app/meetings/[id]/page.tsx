'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AudioVideoPlayer from '@/components/meeting/AudioVideoPlayer';
import InteractiveTranscript from '@/components/meeting/InteractiveTranscript';
import SummaryTab from '@/components/meeting/SummaryTab';
import ActionItemsTab from '@/components/meeting/ActionItemsTab';
import DecisionsTab from '@/components/meeting/DecisionsTab';
import TopicsTab from '@/components/meeting/TopicsTab';
import AiChatWidget from '@/components/meeting/AiChatWidget';
import EmailGeneratorModal from '@/components/meeting/EmailGeneratorModal';
import { MeetingFullDetails } from '@/lib/types';
import {
  FileText,
  CheckSquare,
  Scale,
  Layers,
  Bot,
  Mail,
  ArrowLeft,
  Loader2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export default function MeetingWorkspacePage() {
  const params = useParams();
  const meetingId = params.id as string;
  const router = useRouter();

  const [meeting, setMeeting] = useState<MeetingFullDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeTab, setActiveTab] = useState<'summary' | 'actions' | 'decisions' | 'topics' | 'chat'>(
    'summary'
  );
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  useEffect(() => {
    fetchMeetingDetails();
  }, [meetingId]);

  const fetchMeetingDetails = async () => {
    try {
      const res = await fetch(`/api/meetings/${meetingId}`);
      if (res.ok) {
        const data = await res.json();
        setMeeting(data.meeting);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-xs font-mono text-indigo-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        Loading Meeting Intelligence Workspace...
      </div>
    );
  }

  if (!meeting) return null;

  const transcriptSegments = meeting.transcript?.segments || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <Link
            href="/dashboard"
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 mb-2 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
              {meeting.title}
            </h1>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {meeting.status}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-3">
            <span>📅 {new Date(meeting.createdAt).toLocaleString()}</span>
            <span>•</span>
            <span>🎙️ openai/whisper-small</span>
            <span>•</span>
            <span>🤖 Open-Source LLM</span>
          </p>
        </div>

        <button
          onClick={() => setIsEmailModalOpen(true)}
          className="px-5 py-2.5 rounded-xl font-semibold text-xs bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:opacity-95 shadow-lg shadow-pink-500/20 flex items-center justify-center gap-2 shrink-0"
        >
          <Mail className="w-4 h-4" />
          Generate Follow-Up Email
        </button>
      </div>

      {/* Main Workspace Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Media Player & Interactive Transcript (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <AudioVideoPlayer
            fileUrl={meeting.fileUrl}
            fileType={meeting.fileType}
            currentTime={currentTime}
            onTimeUpdate={setCurrentTime}
          />

          <InteractiveTranscript
            segments={transcriptSegments}
            currentTime={currentTime}
            onSeek={(t) => setCurrentTime(t)}
          />
        </div>

        {/* Right Column: AI Analytics & Intelligence Tabs (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {/* Tabs Header */}
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto text-xs font-semibold text-slate-400">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all shrink-0 ${
                activeTab === 'summary'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Summary
            </button>

            <button
              onClick={() => setActiveTab('actions')}
              className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all shrink-0 ${
                activeTab === 'actions'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'hover:text-white hover:bg-slate-800'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              Action Items ({meeting.actionItems.length})
            </button>

            <button
              onClick={() => setActiveTab('decisions')}
              className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all shrink-0 ${
                activeTab === 'decisions'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'hover:text-white hover:bg-slate-800'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              Decisions ({meeting.decisions.length})
            </button>

            <button
              onClick={() => setActiveTab('topics')}
              className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all shrink-0 ${
                activeTab === 'topics'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Topics
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all shrink-0 ${
                activeTab === 'chat'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'hover:text-white hover:bg-slate-800'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-purple-300" />
              AI Q&A
            </button>
          </div>

          {/* Tab Contents */}
          <div className="flex-1">
            {activeTab === 'summary' && <SummaryTab summary={meeting.summary} />}
            {activeTab === 'actions' && <ActionItemsTab actionItems={meeting.actionItems} />}
            {activeTab === 'decisions' && <DecisionsTab decisions={meeting.decisions} />}
            {activeTab === 'topics' && <TopicsTab topics={meeting.topics} />}
            {activeTab === 'chat' && (
              <AiChatWidget meetingId={meeting.id} initialChats={meeting.chats || []} />
            )}
          </div>
        </div>
      </div>

      {/* Follow Up Email Generator Modal */}
      <EmailGeneratorModal
        meetingId={meeting.id}
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
      />
    </div>
  );
}
