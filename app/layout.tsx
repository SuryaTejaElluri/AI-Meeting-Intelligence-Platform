import './globals.css';
import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'IntellectMeeting — AI Meeting Intelligence Platform',
  description:
    'Transform recorded meetings into transcripts, executive summaries, action items, decisions & AI-powered follow-up emails using Groq Whisper & Gemini AI.',
  keywords: 'AI meeting intelligence, meeting transcription, whisper AI, meeting summarization, action items, follow-up email',
  authors: [{ name: 'IntellectMeeting' }],
  openGraph: {
    title: 'IntellectMeeting — AI Meeting Intelligence Platform',
    description: 'Transform recorded meetings into transcripts, summaries, action items & follow-up emails using AI.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col antialiased selection:bg-indigo-500/30 selection:text-white" style={{ backgroundColor: 'var(--color-bg)', color: '#e2e8f0' }}>
        <Navbar />
        <main className="flex-1 bg-gradient-glow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
