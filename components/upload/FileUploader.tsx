'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, FileAudio, FileVideo, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';

export default function FileUploader() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const supportedFormats = ['.mp3', '.wav', '.m4a', '.mp4', '.webm'];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMessage('');
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!supportedFormats.includes(ext)) {
      setErrorMessage(`Unsupported file format. Please upload ${supportedFormats.join(', ')}`);
      return;
    }
    setSelectedFile(file);
    if (!meetingTitle) {
      setMeetingTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(10);
    setStatusMessage('Uploading recording file...');
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', meetingTitle || selectedFile.name);

      setUploadProgress(30);
      const res = await fetch('/api/meetings', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await res.json();
      const meetingId = data.meeting.id;

      setUploadProgress(45);
      setStatusMessage('Transcribing speech with local openai/whisper-small model...');

      // Dynamic visual progress ticker
      const timer1 = setTimeout(() => {
        setUploadProgress(70);
        setStatusMessage('Identifying real speaker names & diarization...');
      }, 10000);

      const timer2 = setTimeout(() => {
        setUploadProgress(85);
        setStatusMessage('Extracting summaries, action items & decisions...');
      }, 18000);

      // Trigger AI Pipeline
      const processRes = await fetch(`/api/meetings/${meetingId}/process`, {
        method: 'POST',
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      if (!processRes.ok) {
        const errJson = await processRes.json().catch(() => ({}));
        throw new Error(errJson.error || 'AI processing failed');
      }

      setUploadProgress(100);
      setStatusMessage('Processing completed! Redirecting to meeting workspace...');

      setTimeout(() => {
        router.push(`/meetings/${meetingId}`);
      }, 800);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'An error occurred during upload and processing.');
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <h2 className="text-2xl font-bold font-heading text-white mb-2 flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-indigo-400" />
        Upload Meeting Recording
      </h2>
      <p className="text-slate-400 text-sm mb-6">
        Upload your recorded meeting audio or video file. AI will generate transcripts, summaries, action items, decisions, and follow-up emails.
      </p>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Meeting Title
          </label>
          <input
            type="text"
            value={meetingTitle}
            onChange={(e) => setMeetingTitle(e.target.value)}
            placeholder="e.g. Q4 Sprint Planning Sync"
            className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            disabled={uploading}
            required
          />
        </div>

        {/* Drag and Drop Box */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
              : selectedFile
              ? 'border-emerald-500/60 bg-emerald-500/5'
              : 'border-slate-700 bg-slate-900/50 hover:border-slate-500 hover:bg-slate-900/80'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,.wav,.m4a,.mp4,.webm"
            onChange={handleChange}
            className="hidden"
            disabled={uploading}
          />

          {selectedFile ? (
            <div className="flex flex-col items-center">
              <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-400 mb-3 border border-emerald-500/20">
                {selectedFile.type.startsWith('video') ? (
                  <FileVideo className="w-8 h-8" />
                ) : (
                  <FileAudio className="w-8 h-8" />
                )}
              </div>
              <p className="text-white font-medium text-sm mb-1">{selectedFile.name}</p>
              <p className="text-xs text-slate-400 font-mono">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Click to change file
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="p-4 rounded-full bg-indigo-500/10 text-indigo-400 mb-3 border border-indigo-500/20">
                <UploadCloud className="w-8 h-8" />
              </div>
              <p className="text-white font-semibold text-base mb-1">
                Click or drag & drop meeting recording file
              </p>
              <p className="text-xs text-slate-400 mb-3">
                Supports MP3, WAV, M4A, MP4, WebM (up to 500MB)
              </p>
              <div className="flex gap-2">
                {supportedFormats.map((ext) => (
                  <span
                    key={ext}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono"
                  >
                    {ext}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar & Status */}
        {uploading && (
          <div className="mt-6 p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                {statusMessage}
              </span>
              <span className="text-indigo-400 font-mono font-bold">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!selectedFile || uploading}
          className={`w-full mt-6 py-3.5 px-6 rounded-xl font-semibold text-sm shadow-lg flex items-center justify-center gap-2 transition-all ${
            !selectedFile || uploading
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-95 shadow-indigo-500/25 active:scale-[0.99]'
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing Recording...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Start AI Processing
            </>
          )}
        </button>
      </form>
    </div>
  );
}
