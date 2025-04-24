'use client'
import './globals.css'
import Link from 'next/link'
import { useStore } from '@/lib/useStore'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  UserCircle2,
  ShieldCheck,
  Wand2,
  Clock,
  Settings,
  Cpu,
} from 'lucide-react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900 font-sans antialiased">
        <div className="min-h-screen grid grid-cols-[240px_1fr] grid-rows-[64px_1fr]">
          <Header />
          <Sidebar />
          <main className="p-8 bg-gray-50 overflow-y-auto rounded-tl-3xl shadow-inner">{children}</main>
        </div>
      </body>
    </html>
  )
}

function Sidebar() {
  const navItems = [
    { label: 'Detector', href: '/detect', icon: ShieldCheck },
    { label: 'Humanizar', href: '/human', icon: Wand2 },
    { label: 'Histórico', href: '/history', icon: Clock },
    { label: 'Configurações', href: '/settings', icon: Settings },
  ]

  return (
    <aside className="bg-white border-r px-6 py-10 flex flex-col gap-10 shadow-md">
      <div className="flex items-center gap-2 text-2xl font-bold text-blue-600 tracking-tight">
        <Cpu size={26} className="text-blue-500" />
        IA Detector
      </div>

      <nav className="flex flex-col gap-4 text-gray-700 text-sm font-medium">
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-2 rounded hover:bg-blue-100 hover:text-blue-700 transition-all"
          >
            <Icon size={18} className="text-gray-500" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}

function Header() {
  const { user, setUser } = useStore()
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/login')
  }

  return (
    <header className="col-span-2 h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm relative z-20">
      <div className="flex items-center gap-2 text-xl font-semibold text-gray-800">
        <Cpu size={22} className="text-blue-600" />
        IA Detector
      </div>

      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <UserCircle2 size={28} className="text-gray-600" />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-14 bg-white border shadow-lg rounded-lg w-64 p-4 z-50 animate-fadeIn">
            {user ? (
              <>
                <p className="text-sm text-gray-600">Logado como:</p>
                <p className="font-semibold truncate">{user.username || user.email}</p>
                <button
                  onClick={handleLogout}
                  className="mt-4 w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition"
                >
                  Sair
                </button>
              </>
            ) : (
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">Você não está logado.</p>
                <Link href="/login" className="block text-blue-600 font-medium hover:underline">
                  Fazer login
                </Link>
                <Link href="/signup" className="block text-blue-600 font-medium hover:underline">
                  Cadastrar-se
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
