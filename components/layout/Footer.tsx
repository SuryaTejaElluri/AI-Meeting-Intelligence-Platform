export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p>© 2026 AI Meeting Intelligence Platform. Built with Next.js, OpenAI Whisper Small & Open-Source LLMs.</p>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Privacy Policy</span>
          <span>•</span>
          <span>Terms of Service</span>
          <span>•</span>
          <span>Documentation</span>
        </div>
      </div>
    </footer>
  );
}
