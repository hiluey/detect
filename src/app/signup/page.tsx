'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !email || !password || !birthdate) {
      setError('All fields are required.');
      return;
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      return;
    }

    const userId = authData.user?.id;
    if (!userId) {
      setError('Failed to retrieve user ID.');
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
      setError(insertError.message);
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
          Create Account
        </h1>

        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <label className="block mb-1">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1">
              Birthdate <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              required
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 mt-3 text-center">{error}</p>
        )}

        <button
          type="submit"
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
        >
          Sign Up
        </button>

        <p className="text-sm text-center text-gray-600 mt-4">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            Log in
          </a>
        </p>
      </form>
    </div>
  );
}
