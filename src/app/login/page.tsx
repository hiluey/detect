'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useStore } from '@/lib/useStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const setUser = useStore((state) => state.setUser);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      setError('Usuário não encontrado na tabela.');
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', data.user.id)
      .single();

    if (userError || !userData) {
      setError('Erro ao buscar dados do usuário.');
      return;
    }

    setUser({
      id: userData.id,
      email: data.user.email || '',
      username: userData.username,
      auth_user_id: data.user.id,
    });

    router.push('/history');
  };

  return (
    <div className="flex justify-center px-4 py-16">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm bg-white p-8 rounded-xl shadow border border-gray-200"
      >
        <h1 className="text-xl font-semibold text-center text-gray-800 mb-6">
          Entrar na Conta
        </h1>

        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && <p className="text-sm text-red-600 mt-2 text-center">{error}</p>}

        <button
          type="submit"
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
        >
          Entrar
        </button>

        <p className="text-sm text-center text-gray-600 mt-4">
          Não tem uma conta?{' '}
          <a href="/signup" className="text-blue-600 hover:underline">
            Cadastre-se
          </a>
        </p>
      </form>
    </div>
  );
}
