// app/layout.tsx
'use client' 
import "./globals.css";
import Link from "next/link";
import { UserCircle2 } from "lucide-react";
import { useStore } from "@/lib/useStore";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-100 text-gray-900">
        <div className="min-h-screen grid grid-cols-[250px_1fr] grid-rows-[60px_1fr]">
          <Header />
          <aside className="bg-white border-r p-4 flex flex-col gap-4">
            <nav className="flex flex-col gap-2">
              <Link href="/detect" className="hover:underline">Detector</Link>
              <Link href="/human" className="hover:underline">Humanizar</Link>
              <Link href="/history" className="hover:underline">Histórico</Link>
              <Link href="/settings" className="hover:underline">Configurações</Link>
            </nav>
          </aside>
          <main className="p-6 bg-gray-50">{children}</main>
        </div>
      </body>
    </html>
  );
}

function Header() {
  const { user, setUser } = useStore();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  };

  return (
    <header className="col-span-2 h-[60px] bg-white border-b flex items-center justify-between px-4 shadow-sm relative">
      <h1 className="text-xl font-semibold">IA Detector</h1>

      <div className="relative">
        <button onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-2 hover:opacity-80">
          <UserCircle2 size={28} />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-12 bg-white border shadow-md rounded-md w-64 p-4 z-50">
            {user ? (
              <>
                <p className="text-sm text-gray-700 mb-2">Logado como:</p>
                <p className="font-semibold">{user.username || user.email}</p>
                <button
                  onClick={handleLogout}
                  className="mt-4 w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                >
                  Sair
                </button>
              </>
            ) : (
              <div className="text-center space-y-2">
                <p className="text-sm">Você não está logado.</p>
                <Link href="/login" className="block font-semibold text-blue-600 hover:underline">Fazer login</Link>
                <Link href="/signup" className="block font-semibold text-blue-600 hover:underline">Cadastrar-se</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
