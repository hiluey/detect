import { supabase } from './supabaseClient';

export async function loginUser(email: string, password: string) {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    throw new Error(authError?.message || 'Erro ao fazer login.');
  }


  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', authData.user.id)
    .single();

  if (userError || !userData) {
    throw new Error(userError?.message || 'Usuário não encontrado na tabela.');
  }

  return {
    session: authData.session,
    user: {
      id: authData.user.id,
      email: authData.user.email,
      ...userData,
    },
  };
}
