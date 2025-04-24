export type AnalysisType = 'detector' | 'humanizer';

export type User = {
  id: string;
  auth_user_id: string;
  username: string;
  email: string;
  birthdate?: string; // <- aqui você define o campo opcional
};
