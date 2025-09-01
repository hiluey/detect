'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useStore } from '@/lib/useStore'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const setUser = useStore((state) => state.setUser)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
  
    const res = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' },
    });
  
    if (!res.ok) {
      setError('Invalid credentials.');
      return;
    }
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
  
    if (userError || !userData) {
      setError('Failed to fetch user data.');
      return;
    }
  
    setUser({
      id: userData.id,
      email,
      username: userData.username,
      auth_user_id: userData.auth_user_id
    });
  
    router.push('/history');
  };
  
  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4 py-12">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm bg-white border border-gray-200 rounded-3xl shadow-xl p-8 sm:p-10"
      >
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Sign In</h1>

        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          />
        </div>

        {error && <p className="text-sm text-red-600 mt-3 text-center">{error}</p>}

        <button
          type="submit"
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl shadow-md transition disabled:opacity-50"
        >
          Login
        </button>

        <p className="text-sm text-center text-gray-600 mt-5">
          Don&apos;t have an account?{' '}
          <a href="/signup" className="text-blue-600 hover:underline font-medium">
            Sign up
          </a>
        </p>
      </form>
    </div>
  )
}
