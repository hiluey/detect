/*import { Metadata } from "next"

export const metadata: Metadata = {
  title: 'AI-Detect Login',
  description: 'Detector de IA'
}

export default function Login() {
    return(
      <div>
        <h1>Login</h1>
      </div>
    )
  }*/
 'use client'
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

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      setError('Usuário não encontrado na tabela.');
      return;
    }

    // Busca o usuário completo na tabela "users"
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', data.user.id)
      .single();

    if (userError || !userData) {
      setError('Erro ao buscar dados do usuário.');
      return;
    }

    // Salva no Zustand com o auth_user_id incluso
    setUser({
      id: userData.id,
      email: data.user.email || '',
      username: userData.username,
      auth_user_id: data.user.id,
    });

    router.push('/history');
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Senha"
        required
      />
      <button type="submit">Entrar</button>
      {error && <p>{error}</p>}
    </form>
  );
}
