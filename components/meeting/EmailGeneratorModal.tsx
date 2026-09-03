'use client';

import { useState } from 'react';
import { Mail, Copy, Check, X, Loader2, Sparkles } from 'lucide-react';

interface EmailGeneratorModalProps {
  meetingId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function EmailGeneratorModal({
  meetingId,
  isOpen,
  onClose,
}: EmailGeneratorModalProps) {
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/meetings/${meetingId}/email`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setEmailSubject(data.email.subject);
        setEmailBody(data.email.body);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const fullText = `Subject: ${emailSubject}\n\n${emailBody}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-2xl p-6 rounded-2xl border border-slate-800 shadow-2xl relative space-y-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold font-heading text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-400" />
            Generate Follow-Up Email
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!emailBody && !loading ? (
          <div className="py-12 text-center space-y-4">
            <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 w-16 h-16 mx-auto flex items-center justify-center">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Automated Follow-Up Email Generator</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                AI will compose a clean, professional follow-up email summarizing key discussion points, decisions, and assigned tasks with deadlines.
              </p>
            </div>
            <button
              onClick={handleGenerate}
              className="px-6 py-2.5 rounded-xl font-semibold text-xs bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-95 shadow-lg shadow-indigo-500/20"
            >
              Generate Draft Now
            </button>
          </div>
        ) : loading ? (
          <div className="py-16 text-center text-xs text-indigo-400 font-mono flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            Composing professional email draft with Open-Source LLM...
          </div>
        ) : (
          <div className="space-y-4 flex-1 flex flex-col min-h-0">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Subject Line
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Email Body
              </label>
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={12}
                className="w-full flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleGenerate}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" /> Regenerate Draft
              </button>

              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800"
                >
                  Close
                </button>
                <button
                  onClick={handleCopy}
                  className="px-5 py-2 rounded-xl font-semibold text-xs bg-indigo-600 text-white hover:bg-indigo-500 flex items-center gap-2 shadow-md shadow-indigo-500/20"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied to Clipboard!' : 'Copy Email'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
