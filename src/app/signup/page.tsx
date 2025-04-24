'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [username, setUsername] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [erro, setErro] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: senha,
    });

    if (authError) {
      setErro(authError.message);
      return;
    }

    const userId = authData.user?.id;
    if (!userId) {
      setErro('Erro ao obter ID do usuário.');
      return;
    }

    const { error: insertError } = await supabase.from('users').insert([
      {
        auth_user_id: userId,
        username,
        email,
        birthdate,
      },
    ]);

    if (insertError) {
      setErro(insertError.message);
      return;
    }

    router.push('/login');
  };

  return (
    <div className="flex justify-center px-4 py-16">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-sm bg-white p-8 rounded-xl shadow border border-gray-200"
      >
        <h1 className="text-xl font-semibold text-center text-gray-800 mb-6">
          Criar Conta
        </h1>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nome de usuário"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="E-mail"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            required
          />
          <input
            type="date"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={birthdate}
            onChange={e => setBirthdate(e.target.value)}
            required
          />
        </div>

        {erro && <p className="text-sm text-red-600 mt-2 text-center">{erro}</p>}

        <button
          type="submit"
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
        >
          Cadastrar
        </button>

        <p className="text-sm text-center text-gray-600 mt-4">
          Já tem uma conta?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            Entrar
          </a>
        </p>
      </form>
    </div>
  );
}
