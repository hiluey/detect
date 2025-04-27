import { supabase } from './supabaseClient';
import { AnalysisType } from './types'; 
import { State } from './useStore';

export async function saveAnalysis({
  type,
  input_text,
  result,
  user,
}: {
  type: AnalysisType;
  input_text: string;
  result: string;
  user?: State['user']; 
}) {
  const { error } = await supabase.from('analyses').insert({
    user_id: user?.auth_user_id ?? null,
    type,
    input: input_text,
    output: result,
  });

  if (error) {
    console.error('Erro ao salvar análise:', error);
    return false;
  }

  return true;
}
