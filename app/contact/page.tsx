'use client';

import { useState } from 'react';
import { Mail, MessageSquare, Github, ArrowRight, CheckCircle2, AlertCircle, Cpu, Zap, Clock, HeadphonesIcon } from 'lucide-react';
import Link from 'next/link';

const faqs = [
  {
    q: 'Is IntellectMeeting really free?',
    a: 'Yes — 100%. We run on free-tier services: Groq Hosted Whisper API, Gemini AI, Neon Postgres, and Vercel. No credit card, no subscription.',
  },
  {
    q: 'What audio/video formats are supported?',
    a: 'MP3, WAV, M4A, MP4, and WebM are supported. File sizes up to 25MB are accepted for processing.',
  },
  {
    q: 'How accurate is the transcription?',
    a: 'We use Groq-hosted Whisper Large v3 Turbo — one of the most accurate speech-to-text models. Accuracy is typically 95-99%.',
  },
  {
    q: 'How long does processing take?',
    a: 'Typically under 60 seconds per meeting, depending on recording length. Groq\'s API is extremely fast.',
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    // Simulate send (no backend endpoint yet)
    await new Promise(r => setTimeout(r, 1500));
    setStatus('success');
  };

  return (
    <div className="overflow-hidden">
      {/* ── Hero ── */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="hero-glow" />
        <div className="absolute inset-0 grid-bg opacity-25" />
        <div className="glow-orb w-72 h-72 bg-indigo-600/10 -top-20 right-10" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <span className="section-label inline-flex mb-6">
            <MessageSquare className="w-3 h-3" /> Contact & Support
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-heading text-white leading-tight mt-4">
            We&apos;re here to <span className="text-gradient">help you</span>
          </h1>
          <p className="mt-4 text-slate-400 text-base leading-relaxed max-w-xl mx-auto">
            Have a question, feedback, or want to collaborate? Reach out to us via the form below or check our FAQs.
          </p>
        </div>
      </section>

      {/* ── Main Grid ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Contact Form */}
          <div className="lg:col-span-3 animate-fadeInUp">
            <div className="glass-card rounded-2xl p-8 border border-white/[0.06]">
              <h2 className="text-xl font-bold font-heading text-white mb-6 flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-400" />
                Send a Message
              </h2>

              {status === 'success' ? (
                <div className="py-12 text-center space-y-4">
                  <div className="inline-flex p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white font-heading">Message Sent!</h3>
                  <p className="text-sm text-slate-400">Thanks for reaching out. We&apos;ll get back to you within 24 hours.</p>
                  <button
                    onClick={() => { setStatus('idle'); setForm({ name: '', email: '', subject: '', message: '' }); }}
                    className="btn-secondary text-sm"
                  >
                    Send Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" id="contact-form">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Name</label>
                      <input
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        className="input-field"
                        required
                        id="contact-name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@company.com"
                        className="input-field"
                        required
                        id="contact-email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Subject</label>
                    <select
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      className="input-field"
                      required
                      id="contact-subject"
                    >
                      <option value="" disabled>Select a topic...</option>
                      <option value="general">General Inquiry</option>
                      <option value="bug">Bug Report</option>
                      <option value="feature">Feature Request</option>
                      <option value="enterprise">Enterprise / Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Message</label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Describe your question or feedback in detail..."
                      rows={5}
                      className="input-field resize-none"
                      required
                      id="contact-message"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="btn-primary w-full justify-center py-3 text-sm"
                    id="contact-submit"
                  >
                    {status === 'loading' ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                    ) : (
                      <><ArrowRight className="w-4 h-4" /> Send Message</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-2 space-y-5 animate-fadeInUp delay-200">
            {/* Quick Links */}
            <div className="glass-card rounded-2xl p-6 border border-white/[0.06] space-y-4">
              <h3 className="text-sm font-bold text-white font-heading">Quick Support</h3>
              {[
                {
                  icon: <Github className="w-4 h-4" />,
                  label: 'GitHub Repository',
                  sub: 'Browse source code & report issues',
                  href: 'https://github.com/SuryaTejaElluri/AI-Meeting-Intelligence-Platform',
                  external: true,
                },
                {
                  icon: <Cpu className="w-4 h-4" />,
                  label: 'Platform Dashboard',
                  sub: 'Access your meeting workspace',
                  href: '/dashboard',
                  external: false,
                },
              ].map(({ icon, label, sub, href, external }) => (
                external ? (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    className="group flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] hover:border-indigo-500/25 transition-all">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">{icon}</div>
                    <div>
                      <p className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">{label}</p>
                      <p className="text-[11px] text-slate-500">{sub}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 ml-auto transition-colors" />
                  </a>
                ) : (
                  <Link key={label} href={href}
                    className="group flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] hover:border-indigo-500/25 transition-all">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">{icon}</div>
                    <div>
                      <p className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">{label}</p>
                      <p className="text-[11px] text-slate-500">{sub}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 ml-auto transition-colors" />
                  </Link>
                )
              ))}
            </div>

            {/* Response time */}
            <div className="glass-card rounded-2xl p-5 border border-white/[0.06]">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Clock className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="text-sm font-bold text-white">Response Times</h4>
              </div>
              <div className="space-y-2.5">
                {[
                  { label: 'General inquiries', time: '< 24 hours' },
                  { label: 'Bug reports', time: '< 12 hours' },
                  { label: 'Feature requests', time: '2–3 days' },
                ].map(({ label, time }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">{label}</span>
                    <span className="text-xs font-mono text-emerald-400">{time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── FAQ ── */}
        <div className="mt-16 animate-fadeInUp delay-300">
          <div className="text-center mb-10">
            <span className="section-label inline-flex mb-4">
              <Zap className="w-3 h-3" /> FAQ
            </span>
            <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold font-heading text-white">
              Frequently Asked <span className="text-gradient">Questions</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {faqs.map(({ q, a }) => (
              <div key={q} className="glass-card rounded-2xl p-6 border border-white/[0.06]">
                <h4 className="text-sm font-bold text-white mb-2 font-heading">{q}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
