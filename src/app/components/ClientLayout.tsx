'use client';

import Link from 'next/link';
import { useStore } from '@/lib/useStore';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import md5 from 'md5';
import {
  UserCircle2,
  ShieldCheck,
  Wand2,
  Clock,
  Settings,
  Cpu,
  BarChart3,
  Rocket,
  Lightbulb,
  MessageSquare,
  X
} from 'lucide-react';
import { Outfit } from 'next/font/google';

const outfit = Outfit({ subsets: ['latin'] });

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [showMenu, setShowMenu] = useState(false);
  const pathname = usePathname();
  const hideAside = ['/login', '/signup', '/settings'].includes(pathname);

  return (
    <div className={`${outfit.className} min-h-screen grid grid-cols-1 md:grid-cols-[240px_1fr] grid-rows-[64px_auto_1fr] bg-neutral-50 dark:bg-neutral-900 text-gray-800 dark:text-gray-100 transition-colors`}>
      <Header onMenuToggle={() => setShowMenu(!showMenu)} />
      <SubHeader />
      <Sidebar isMobile={true} show={showMenu} onClose={() => setShowMenu(false)} />
      <Sidebar isMobile={false} />
      <main className="p-4 md:p-6 lg:p-8 overflow-y-auto z-0 flex">
        <div className="flex flex-col md:flex-row w-full gap-8">
          <div className="flex-1">{children}</div>
          {!hideAside && (
            <motion.aside
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="hidden md:flex w-[260px] flex-col gap-4 overflow-y-auto"
            >
              <StatsCard />
              <TipCard />
              <PerformanceCard />
              <FeedbackCard />
              <TipCardD />
            </motion.aside>
          )}
        </div>
      </main>
    </div>
  );
}
function SubHeader() {
  const pathname = usePathname();

  const pageInfo: { [key: string]: { title: string; description: string } } = {
    '/detect': { title: 'AI Detection', description: 'Detect AI-generated text easily.' },
    '/human': { title: 'Humanize Text', description: 'Transform AI text to human-like.' },
    '/history': { title: 'History', description: 'Review your previous analyses.' },
    '/settings': { title: 'Settings', description: 'Adjust your account settings.' },
  };

  const { title, description } = pageInfo[pathname] || { title: 'Dashboard', description: 'Welcome back!' };

  return (
    <div className="col-span-1 md:col-span-2 h-12 bg-blue-100 dark:bg-blue-900 flex items-center px-6 text-blue-900 dark:text-blue-100 border-b border-blue-200 dark:border-blue-700 transition-colors">
      <div>
        <h1 className="text-sm font-semibold">{title}</h1>
        <p className="text-xs opacity-70">{description}</p>
      </div>
    </div>
  );
}

function Sidebar({ isMobile, show = false, onClose }: { isMobile: boolean; show?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const navItems = [
    { label: 'AI Detector', href: '/detect', icon: ShieldCheck },
    { label: 'Humanize Text', href: '/human', icon: Wand2 },
    { label: 'History', href: '/history', icon: Clock },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  if (isMobile && !show) return null;

  return (
    <aside className={`
      ${isMobile
        ? 'fixed inset-y-0 left-0 w-64 bg-white dark:bg-neutral-800 z-50 shadow-lg overflow-y-auto px-6 py-6 transition-transform animate-slideIn flex flex-col'
        : 'hidden md:flex w-64 bg-white dark:bg-neutral-800 border-r border-gray-200 dark:border-neutral-700 px-6 py-8 flex-col gap-10 overflow-y-auto shadow-md'
      }
    `}>
      <div className="flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between md:justify-start gap-2 text-2xl font-bold text-blue-600 tracking-tight">
            <div className="flex items-center gap-2">
              <Cpu size={26} className="text-blue-500" />
              AI Platform
            </div>
            {isMobile && onClose && (
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            )}
          </div>

          <nav className="flex flex-col gap-2 text-sm font-medium mt-8">
            {navItems.map(({ label, href, icon: Icon }) => {
              const isActive = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-semibold'
                      : 'hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {isMobile && (
          <div className="flex flex-col gap-4 mt-8">
            <StatsCard />
            <TipCard />
            <PerformanceCard />
            <FeedbackCard />
            <TipCardD />
          </div>
        )}
      </div>
    </aside>
  );
}

function Header({ onMenuToggle }: { onMenuToggle: () => void }) {
  const { user, setUser } = useStore();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
  };

  const userEmail = user?.email || '';
  const avatar = userEmail ? getGravatarUrl(userEmail) : null;

  return (
    <header className="col-span-1 md:col-span-2 h-16 bg-white dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700 flex items-center justify-between px-6 shadow-sm relative z-20">
      <div className="flex items-center gap-3 text-xl font-semibold text-gray-800 dark:text-white">
        <button className="md:hidden" onClick={onMenuToggle}>
          <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Cpu size={22} className="text-blue-600" />
        AI Detection
      </div>

      <div className="relative group">
        <div className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
          {avatar ? (
            <img src={avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover border" />
          ) : (
            <UserCircle2 size={28} className="text-gray-500 dark:text-gray-300" />
          )}
        </div>

        <div className="absolute right-0 top-12 bg-white dark:bg-neutral-800 border dark:border-neutral-700 shadow-lg rounded-xl w-64 p-4 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
          {user ? (
            <>
              <p className="text-xs text-gray-500 dark:text-gray-300 mb-1">Logged in as</p>
              <p className="font-semibold truncate">{user.username || user.email}</p>
              <button
                onClick={handleLogout}
                className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition"
              >
                Log out
              </button>
            </>
          ) : (
            <div className="text-center space-y-2">
              <Link href="/login" className="block text-blue-600 font-medium hover:underline">
                Log in
              </Link>
              <Link href="/signup" className="block text-blue-600 font-medium hover:underline">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function CardWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      className="rounded-2xl shadow-md p-5 bg-white dark:bg-neutral-800 flex flex-col gap-4 border border-gray-100 dark:border-neutral-700 transition-all duration-200 ease-in-out"
    >
      {children}
    </motion.div>
  );
}

function StatsCard() {
  return (
    <CardWrapper>
      <div className="flex items-center gap-2">
        <BarChart3 size={22} className="text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          AI Stats
        </h2>
      </div>
      <div className="grid gap-2 text-sm text-gray-600 dark:text-gray-300">
        <div className="flex justify-between">
          <span>Detection Increase</span>
          <span className="font-bold text-blue-700 dark:text-blue-300">+120%</span>
        </div>
        <div className="flex justify-between">
          <span>Humanization Boost</span>
          <span className="font-bold text-blue-700 dark:text-blue-300">35%</span>
        </div>
        <div className="flex justify-between">
          <span>Common Triggers</span>
          <span className="font-bold text-blue-700 dark:text-blue-300">Repetition</span>
        </div>
      </div>
    </CardWrapper>
  );
}

function TipCard() {
  return (
    <CardWrapper>
      <div className="flex items-center gap-2">
        <Lightbulb size={22} className="text-yellow-500" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Quick Tip
        </h2>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Break up long paragraphs to avoid AI detection!
      </p>
    </CardWrapper>
  );
}

function PerformanceCard() {
  return (
    <CardWrapper>
      <div className="flex items-center gap-2">
        <Rocket size={22} className="text-purple-500" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Content Tips
        </h2>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Vary sentence lengths and add natural transitions.
      </p>
    </CardWrapper>
  );
}

function FeedbackCard() {
  return (
    <CardWrapper>
      <div className="flex items-center gap-2">
        <MessageSquare size={22} className="text-green-500" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Pro Tip
        </h2>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Editing the intro and conclusion can drastically improve detection scores!
      </p>
    </CardWrapper>
  );
}

function TipCardD() {
  return (
    <CardWrapper>
      <div className="flex items-center gap-2">
        <span className="text-2xl">🎉</span>
        <h2 className="text-lg font-semibold text-blue-600 dark:text-blue-300">
          Fun Fact
        </h2>
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300">
        Articles with a casual tone are 45% less likely to be flagged.
      </p>
    </CardWrapper>
  );
}

function getGravatarUrl(email: string) {
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
}
