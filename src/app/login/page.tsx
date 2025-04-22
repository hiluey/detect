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
 'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleLogin = async () => {
    setErro('');
    try {
      const result = await loginUser(email, senha);
      console.log('Usuário logado:', result.user);

      router.push('/detect'); 
    } catch (err: any) {
      setErro(err.message);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="Senha" />
      {erro && <p style={{ color: 'red' }}>{erro}</p>}
      <button onClick={handleLogin}>Entrar</button>
    </div>
  );
}
