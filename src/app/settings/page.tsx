'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/useStore';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, setUser } = useStore() as { user: User; setUser: (u: User) => void };
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
      setBirthdate(user.birthdate || '');
    }
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (!user) return;

    const isValidBirthdate = (dateStr: string) => {
      const date = new Date(dateStr);
      return !isNaN(date.getTime()) && date.getFullYear() > 1900 && date < new Date();
    };

    const updatePayload: any = { username };
    if (isValidBirthdate(birthdate)) updatePayload.birthdate = birthdate;

    const { error: updateError } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('auth_user_id', user.auth_user_id);

    if (updateError) {
      console.error('Erro ao atualizar a tabela users:', updateError.message);
      setMessage('Erro ao atualizar dados do perfil.');
      return;
    }

    if (email !== user.email) {
      const { error: emailError } = await supabase.auth.updateUser({ email });
      if (emailError) {
        console.error('Erro ao atualizar email:', emailError.message);
        setMessage('Erro ao atualizar email.');
        return;
      }
    }

    if (showPasswordFields) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        setMessage('Preencha todos os campos de senha.');
        return;
      }

      if (newPassword !== confirmPassword) {
        setMessage('As novas senhas não coincidem.');
        return;
      }

      // Reautenticar antes de atualizar a senha
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (loginError) {
        console.error('Senha atual incorreta:', loginError.message);
        setMessage('Senha atual incorreta.');
        return;
      }

      if (currentPassword === newPassword) {
        setMessage('A nova senha deve ser diferente da atual.');
        return;
      }

      const { error: passwordError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (passwordError) {
        console.error('Erro ao atualizar senha:', passwordError.message);
        setMessage('A senha deve conter pelo menos 6 caracteries.');
        return;
      }
    }

    setUser({ ...user, username, email, birthdate });
    setMessage('Dados atualizados com sucesso!');
    router.refresh();
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Configurações da Conta</h1>
        <p className="text-red-600">Você precisa estar logado para acessar as configurações.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Configurações da Conta</h1>
      <form onSubmit={handleUpdate} className="space-y-4">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Nome de usuário"
          className="w-full p-2 border rounded"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          className="w-full p-2 border rounded"
        />
        <input
          type="date"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
          className="w-full p-2 border rounded"
        />

        <button
          type="button"
          onClick={() => setShowPasswordFields(!showPasswordFields)}
          className="text-blue-600 underline"
        >
          {showPasswordFields ? 'Cancelar alteração de senha' : 'Alterar senha?'}
        </button>

        {showPasswordFields && (
          <>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Senha atual"
              className="w-full p-2 border rounded"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nova senha"
              className="w-full p-2 border rounded"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme a nova senha"
              className="w-full p-2 border rounded"
            />
          </>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Salvar Alterações
        </button>
      </form>

      {message && <p className="mt-4 text-center text-red-600">{message}</p>}
    </div>
  );
}
