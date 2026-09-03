import './globals.css';
import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'AI Meeting Intelligence Platform - Whisper Small & Open-Source LLM',
  description:
    'Transform recorded meeting audio and video into transcripts, summaries, action items with assignees, decisions, and follow-up emails using AI.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
        <Navbar />
        <main className="flex-1 bg-gradient-glow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
