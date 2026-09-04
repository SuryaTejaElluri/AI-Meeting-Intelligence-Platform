'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Cpu,
  Mic,
  LayoutDashboard,
  PlusCircle,
  LogOut,
  Menu,
  X,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/meetings');
        if (res.ok) {
          setUser({ name: 'User', email: 'user@intellect.ai' });
        }
      } catch {}
    };
    checkAuth();
  }, [pathname]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: '/upload', label: 'Upload', icon: <PlusCircle className="w-4 h-4" /> },
    { href: '/contact', label: 'Contact', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#030712]/90 border-b border-white/[0.06] shadow-xl shadow-black/40 backdrop-blur-xl'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0" aria-label="IntellectMeeting Home">
            <div className="relative p-2 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 shadow-lg shadow-indigo-500/30 group-hover:scale-105 group-hover:shadow-indigo-500/50 transition-all duration-300">
              <Cpu className="w-5 h-5 text-white" />
              <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <span className="text-[17px] font-bold font-heading text-white tracking-tight">
                Intellect<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Meeting</span>
              </span>
              <div className="text-[9px] font-mono text-slate-500 tracking-widest -mt-0.5 uppercase">AI Intelligence Platform</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === href
                    ? 'text-white bg-indigo-500/15 border border-indigo-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {icon}
                {label}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/upload"
                  className="btn-primary text-xs py-2 px-4"
                >
                  <Mic className="w-3.5 h-3.5" />
                  New Recording
                </Link>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-white/[0.07]">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
                    {user.name[0].toUpperCase()}
                  </div>
                  <span className="text-xs text-slate-300 font-medium">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  id="logout-btn"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="btn-primary text-xs py-2 px-4"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile Burger */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileOpen(false)}
        />
        {/* Panel */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-72 glass border-l border-white/[0.06] shadow-2xl flex flex-col p-6 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex items-center justify-between mb-8">
            <span className="font-heading font-bold text-white">Menu</span>
            <button onClick={() => setMobileOpen(false)} className="p-1 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-2 flex-1">
            {navLinks.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  pathname === href
                    ? 'text-white bg-indigo-500/15 border border-indigo-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {icon}
                {label}
              </Link>
            ))}
          </nav>

          <div className="pt-6 border-t border-white/[0.06] space-y-3">
            {user ? (
              <>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.name[0]}
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">{user.name}</p>
                    <p className="text-[10px] text-slate-500">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block w-full btn-secondary text-center text-sm py-3">Sign In</Link>
                <Link href="/register" className="block w-full btn-primary text-center text-sm py-3 justify-center">Get Started Free</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
