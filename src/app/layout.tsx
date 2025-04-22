// app/layout.tsx
import "./globals.css";
import Link from "next/link";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-100 text-gray-900">
        <div className="min-h-screen grid grid-cols-[250px_1fr] grid-rows-[60px_1fr]">
          {/* Header */}
          <header className="col-span-2 h-[60px] bg-white border-b flex items-center px-4 shadow-sm">
            <h1 className="text-xl font-semibold">IA Detector</h1>
          </header>

          {/* Sidebar */}
          <aside className="bg-white border-r p-4 flex flex-col gap-4">
            <nav className="flex flex-col gap-2">
              <Link href="/detect" className="hover:underline">Detector</Link>
              <Link href="/human" className="hover:underline">Humanizar</Link>
              <Link href="/history" className="hover:underline">Histórico</Link>
              <Link href="/settings" className="hover:underline">Configurações</Link>
            </nav>

            {/* Mensagem de login/cadastro */}
            <div className="mt-6 p-4 bg-gray-200 text-center rounded-md">
              <p>Você não está logado. <Link href="/login" className="font-semibold text-blue-600 hover:underline">Faça login</Link> ou <Link href="/signup" className="font-semibold text-blue-600 hover:underline">cadastre-se</Link>.</p>
            </div>
          </aside>

          {/* Main Content */}
          <main className="p-6 bg-gray-50">{children}</main>
        </div>
      </body>
    </html>
  );
}
