import Link from 'next/link';
import { Cpu, Github, Twitter, Linkedin, ArrowUpRight } from 'lucide-react';

const footerLinks = {
  Product: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Upload Recording', href: '/upload' },
    { label: 'Features', href: '/#features' },
    { label: 'Contact', href: '/contact' },
  ],
  Company: [
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
  Technology: [
    { label: 'Groq Whisper', href: 'https://groq.com', external: true },
    { label: 'Gemini AI', href: 'https://deepmind.google', external: true },
    { label: 'Neon Postgres', href: 'https://neon.tech', external: true },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.05] bg-[#020710] relative overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-40 bg-indigo-600/5 rounded-full filter blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4 group w-fit">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-bold text-white text-lg">
                Intellect<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Meeting</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              Turn meeting recordings into actionable AI-powered insights. Transcription, summaries, action items & more.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[
                { icon: <Github className="w-4 h-4" />, href: 'https://github.com/SuryaTejaElluri/AI-Meeting-Intelligence-Platform', label: 'GitHub' },
              ].map(({ icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-all"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h5 className="text-xs font-semibold text-white uppercase tracking-widest mb-4 font-mono">{section}</h5>
              <ul className="space-y-2.5">
                {links.map(({ label, href, external }: any) => (
                  <li key={label}>
                    {external ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {label}
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ) : (
                      <Link href={href} className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                        {label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            © 2026 IntellectMeeting. Built with Next.js, Groq Whisper & Gemini AI.
          </p>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
