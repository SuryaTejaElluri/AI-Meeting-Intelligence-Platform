'use client';

import { useState } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';

interface ChatMessage {
  id?: string;
  userQuestion: string;
  aiResponse: string;
}

interface AiChatWidgetProps {
  meetingId: string;
  initialChats: ChatMessage[];
}

export default function AiChatWidget({ meetingId, initialChats }: AiChatWidgetProps) {
  const [chats, setChats] = useState<ChatMessage[]>(initialChats);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    const q = question.trim();
    setQuestion('');
    setLoading(true);

    try {
      const res = await fetch(`/api/meetings/${meetingId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });

      if (res.ok) {
        const data = await res.json();
        setChats((prev) => [...prev, data.chat]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col h-[520px]">
      <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
        <h4 className="text-sm font-bold font-heading text-white flex items-center gap-2">
          <Bot className="w-5 h-5 text-indigo-400" />
          Ask AI About This Meeting
        </h4>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
          Open-Source LLM
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
        {chats.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <Sparkles className="w-8 h-8 text-indigo-500/40 mb-2" />
            <p className="text-xs font-medium text-slate-400">Ask any question about this meeting!</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
              e.g. "What was decided about the project timeline?" or "What are David's action items?"
            </p>
          </div>
        ) : (
          chats.map((c, i) => (
            <div key={i} className="space-y-2">
              {/* User Question */}
              <div className="flex items-start gap-2.5 justify-end">
                <div className="bg-indigo-600/90 text-white text-xs px-3.5 py-2 rounded-2xl rounded-tr-none max-w-[80%] shadow-md">
                  {c.userQuestion}
                </div>
                <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
                  <User className="w-4 h-4" />
                </div>
              </div>

              {/* AI Response */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                  <Bot className="w-4 h-4 text-purple-400" />
                </div>
                <div className="bg-slate-900 border border-slate-800 text-slate-200 text-xs px-4 py-3 rounded-2xl rounded-tl-none max-w-[85%] leading-relaxed">
                  {c.aiResponse}
                </div>
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-indigo-400 italic font-mono pl-9">
            <Loader2 className="w-4 h-4 animate-spin" />
            Searching transcript & generating answer...
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="pt-3 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          placeholder="Ask a question about decisions, tasks, deadlines..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={!question.trim() || loading}
          className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 transition-colors shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
