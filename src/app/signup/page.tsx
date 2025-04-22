/*import { Metadata } from "next"

export const metadata: Metadata = {
  title: 'AI-Detect Signup',
  description: 'Detector de IA'
} 
export default function Signup() {
    return(
      <div>
        <h1>Signup</h1>
      </div>
    )
  }*/

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

    // 1. Cadastrar no Auth
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

    // 2. Cadastrar dados extras na tabela "users"
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

    // Redirecionar após sucesso
    router.push('/login');
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Cadastro</h1>
      <form onSubmit={handleSignup} className="space-y-4">
        <input
          type="text"
          placeholder="Nome de usuário"
          className="w-full p-2 border rounded"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          className="w-full p-2 border rounded"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          required
        />
        <input
          type="date"
          className="w-full p-2 border rounded"
          value={birthdate}
          onChange={e => setBirthdate(e.target.value)}
          required
        />
        {erro && <p className="text-red-600">{erro}</p>}
        <button type="submit" className="w-full bg-green-500 text-white p-2 rounded">
          Cadastrar
        </button>
      </form>
    </div>
  );
}
