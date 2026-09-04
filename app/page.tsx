import Link from 'next/link';
import {
  Mic,
  Sparkles,
  FileText,
  CheckSquare,
  Scale,
  Search,
  Bot,
  Mail,
  ArrowRight,
  ShieldCheck,
  Zap,
  Brain,
  Users,
  Clock,
  ChevronRight,
  Play,
} from 'lucide-react';

const features = [
  {
    icon: Mic,
    color: 'indigo',
    title: 'Upload Audio & Video',
    description: 'Drag-and-drop MP3, WAV, M4A, MP4, WebM files with real-time processing progress tracking.',
  },
  {
    icon: FileText,
    color: 'cyan',
    title: 'Timestamped Transcription',
    description: 'Groq Whisper Large extracts speech segments synced directly to media playback.',
  },
  {
    icon: Brain,
    color: 'purple',
    title: 'AI Executive Summaries',
    description: 'Gemini AI generates concise executive summaries, key discussion points, and topics.',
  },
  {
    icon: CheckSquare,
    color: 'emerald',
    title: 'Action Items & Owners',
    description: 'Automatically extracts tasks, assigns responsible persons, deadlines, and status tracking.',
  },
  {
    icon: Scale,
    color: 'amber',
    title: 'Key Decisions',
    description: 'Detect and surface major organizational and project decisions from your meetings.',
  },
  {
    icon: Search,
    color: 'cyan',
    title: 'Smart Meeting Search',
    description: 'Instantly query transcripts, topics, and action items across all your meetings.',
  },
  {
    icon: Bot,
    color: 'indigo',
    title: 'AI Q&A Chat',
    description: 'Ask natural-language questions about any specific meeting and get instant answers.',
  },
  {
    icon: Mail,
    color: 'pink',
    title: 'Follow-Up Email Generator',
    description: 'One-click professional follow-up emails with summaries, decisions, and next steps.',
  },
  {
    icon: ShieldCheck,
    color: 'emerald',
    title: 'Free & Open Architecture',
    description: 'Built on free-tier cloud services — Groq, Neon Postgres, Vercel. Zero subscription lock-in.',
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', glow: 'group-hover:shadow-indigo-500/20' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', glow: 'group-hover:shadow-purple-500/20' },
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', glow: 'group-hover:shadow-cyan-500/20' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', glow: 'group-hover:shadow-emerald-500/20' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', glow: 'group-hover:shadow-amber-500/20' },
  pink: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20', glow: 'group-hover:shadow-pink-500/20' },
};

const steps = [
  { n: '01', title: 'Upload Recording', desc: 'Drop any audio or video meeting recording into the platform.' },
  { n: '02', title: 'AI Transcription', desc: 'Groq Whisper processes speech with speaker identification in seconds.' },
  { n: '03', title: 'Gemini Analysis', desc: 'AI extracts summaries, decisions, action items, and key topics.' },
  { n: '04', title: 'Act on Insights', desc: 'Search meetings, chat with AI, and send automated follow-up emails.' },
];

const stats = [
  { value: '< 60s', label: 'Processing time', sub: 'avg per meeting' },
  { value: '99%', label: 'Transcription accuracy', sub: 'Whisper Large v3' },
  { value: '100%', label: 'Free to use', sub: 'open-source stack' },
  { value: '∞', label: 'Meetings supported', sub: 'no limits' },
];

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background layers */}
        <div className="hero-glow" />
        <div className="absolute inset-0 grid-bg opacity-40" />

        {/* Floating orbs */}
        <div className="glow-orb w-96 h-96 bg-indigo-600/20 top-10 -left-20 animate-orb" />
        <div className="glow-orb w-80 h-80 bg-purple-600/15 -bottom-20 -right-10 animate-orb delay-500" style={{ animationDuration: '15s' }} />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 animate-fadeInUp">
            <span className="section-label animate-border-pulse">
              <Sparkles className="w-3 h-3" />
              Powered by Groq Whisper & Gemini AI
            </span>
          </div>

          {/* Headline */}
          <h1 className="mt-8 text-5xl sm:text-6xl lg:text-7xl font-extrabold font-heading text-white tracking-tight leading-[1.05] animate-fadeInUp delay-100">
            Turn Meetings Into{' '}
            <span className="text-gradient">Actionable Intelligence</span>
          </h1>

          {/* Sub */}
          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed animate-fadeInUp delay-200">
            Upload a meeting recording and get timestamped transcripts, AI summaries, action items with owners, key decisions, smart search, and one-click follow-up emails — in under a minute.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-fadeInUp delay-300">
            <Link href="/upload" className="btn-primary text-sm px-7 py-3.5" id="hero-upload-btn">
              <Mic className="w-4 h-4" />
              Upload Your First Recording
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/dashboard" className="btn-secondary text-sm px-7 py-3.5" id="hero-dashboard-btn">
              <Play className="w-4 h-4" />
              View Dashboard
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-12 animate-fadeInUp delay-400">
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl glass border border-white/[0.07]">
              <div className="flex -space-x-2">
                {['#6366f1', '#a855f7', '#10b981', '#f59e0b'].map((color, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-[#030712] flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ backgroundColor: color }}
                  >
                    {['A', 'B', 'C', 'D'][i]}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-white">Teams love IntellectMeeting</div>
                <div className="text-[10px] text-slate-500">100% free, no credit card needed</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ value, label, sub }, i) => (
            <div key={label} className={`glass-card rounded-2xl p-6 text-center animate-fadeInUp`} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="text-3xl font-extrabold font-heading text-gradient mb-1">{value}</div>
              <div className="text-sm font-semibold text-white mb-0.5">{label}</div>
              <div className="text-[11px] text-slate-500 font-mono">{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="how-it-works">
        <div className="text-center mb-14">
          <span className="section-label mb-4 inline-flex">
            <Zap className="w-3 h-3" /> How It Works
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold font-heading text-white">
            From Recording to Insights{' '}
            <span className="text-gradient">in 4 Simple Steps</span>
          </h2>
        </div>

        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map(({ n, title, desc }, i) => (
              <div key={n} className={`glass-card rounded-2xl p-6 flex flex-col gap-3 animate-fadeInUp`} style={{ animationDelay: `${i * 0.12}s` }}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/25 flex items-center justify-center font-mono font-bold text-indigo-300 text-sm">
                  {n}
                </div>
                <h3 className="font-bold text-white font-heading">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="features">
        <div className="text-center mb-14">
          <span className="section-label mb-4 inline-flex">
            <Sparkles className="w-3 h-3" /> Platform Features
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold font-heading text-white">
            Everything You Need to{' '}
            <span className="text-gradient">Master Your Meetings</span>
          </h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
            A comprehensive AI-powered meeting intelligence stack built on open-source, free-tier infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, color, title, description }, i) => {
            const c = colorMap[color];
            return (
              <div
                key={title}
                className={`group glass-card rounded-2xl p-6 flex flex-col gap-4 animate-fadeInUp`}
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className={`icon-ring w-12 h-12 ${c.bg} border ${c.border} ${c.glow} transition-shadow duration-300`}>
                  <Icon className={`w-5 h-5 ${c.text}`} />
                </div>
                <div>
                  <h3 className="font-bold text-white font-heading text-base mb-1.5">{title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden glass-card border border-indigo-500/20 p-10 sm:p-16 text-center">
          {/* BG */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-purple-600/8 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

          <div className="relative z-10">
            <span className="section-label mb-6 inline-flex">
              <Zap className="w-3 h-3" /> Get Started Today
            </span>
            <h2 className="mt-4 text-3xl sm:text-5xl font-extrabold font-heading text-white leading-tight">
              Never Lose a Meeting Insight{' '}
              <span className="text-gradient">Again</span>
            </h2>
            <p className="mt-4 text-slate-400 max-w-lg mx-auto text-base">
              Upload your first meeting recording in seconds. No credit card. No setup. Just AI-powered clarity.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/register" className="btn-primary px-8 py-4 text-sm" id="cta-register-btn">
                <Sparkles className="w-4 h-4" />
                Create Free Account
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/upload" className="btn-secondary px-8 py-4 text-sm" id="cta-upload-btn">
                <Mic className="w-4 h-4" />
                Try Without Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
