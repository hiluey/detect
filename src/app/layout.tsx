'use client'


import './globals.css'
import Link from 'next/link'
import { useStore } from '@/lib/useStore'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import md5 from 'md5'
import {
  UserCircle2,
  ShieldCheck,
  Wand2,
  Clock,
  Settings,
  Cpu,
} from 'lucide-react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900 font-sans antialiased">
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-[240px_1fr] grid-rows-[64px_1fr]">
          <Header onMenuToggle={() => setShowMenu(!showMenu)} />
          <Sidebar isMobile={true} show={showMenu} onClose={() => setShowMenu(false)} />
          <Sidebar isMobile={false} />
          <main className="p-6 md:p-8 bg-gray-50 overflow-y-auto z-0">{children}</main>
        </div>
      </body>
    </html>
  )
}

function Sidebar({
  isMobile,
  show = false,
  onClose,
}: {
  isMobile: boolean
  show?: boolean
  onClose?: () => void
}) {
  const navItems = [
    { label: 'AI Detector', href: '/detect', icon: ShieldCheck },
    { label: 'Humanize Text', href: '/human', icon: Wand2 },
    { label: 'History', href: '/history', icon: Clock },
    { label: 'Settings', href: '/settings', icon: Settings },
  ]

  if (isMobile && !show) return null

  return (
    <aside
      className={`${
        isMobile
          ? 'fixed inset-y-0 left-0 w-64 bg-white z-50 shadow-lg transform transition-transform animate-slideIn'
          : 'hidden md:flex bg-white border-r px-4 md:px-6 py-8 md:py-10 flex-col gap-10 shadow-md'
      }`}
    >
      <div className="flex items-center justify-between md:justify-start gap-2 text-2xl font-bold text-blue-600 tracking-tight px-4 pt-6 md:px-0 md:pt-0">
        <div className="flex items-center gap-2">
          <Cpu size={26} className="text-blue-500" />
          AI Detect
        </div>
        {isMobile && (
          <button onClick={onClose} className="text-gray-500">
            ✕
          </button>
        )}
      </div>

      <nav className="flex flex-col gap-4 text-gray-700 text-sm font-medium mt-8 px-4 md:px-0">
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2 rounded hover:bg-blue-100 hover:text-blue-700 transition-all"
          >
            <Icon size={18} className="text-gray-500" />
            <span className="flex items-center gap-1">
              {label}
              {label === 'AI Detector' && <span className="text-red-500">*</span>}
            </span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}

function getGravatarUrl(email: string) {
  const hash = md5(email.trim().toLowerCase())
  return `https://www.gravatar.com/avatar/${hash}?d=identicon`
}

function Header({ onMenuToggle }: { onMenuToggle: () => void }) {
  const { user, setUser } = useStore()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/login')
  }

  const userEmail = user?.email || ''
  const avatar = userEmail ? getGravatarUrl(userEmail) : null

  return (
    <header className="col-span-1 md:col-span-2 h-16 bg-white border-b flex items-center justify-between px-4 md:px-6 shadow-sm relative z-20">
      <div className="flex items-center gap-2 text-xl font-semibold text-gray-800">
        <button className="md:hidden mr-2" onClick={onMenuToggle}>
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Cpu size={22} className="text-blue-600" />
        AI vs Human
      </div>

      <div className="relative group">
        <div className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
          {avatar ? (
            <img
              src={avatar}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover border"
            />
          ) : (
            <UserCircle2 size={28} className="text-gray-600" />
          )}
        </div>

        <div className="absolute right-0 top-12 bg-white border shadow-lg rounded-lg w-64 p-4 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
          {user ? (
            <>
              <p className="text-sm text-gray-600">Logged in as:</p>
              <p className="font-semibold truncate">{user.username || user.email}</p>
              <button
                onClick={handleLogout}
                className="mt-4 w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition"
              >
                Log out
              </button>
            </>
          ) : (
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">You are not logged in.</p>
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
  )
}
