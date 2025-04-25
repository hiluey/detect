'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/useStore'
import { supabase } from '@/lib/supabaseClient'
import type { User } from '@/lib/types'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const { user, setUser } = useStore() as { user: User; setUser: (u: User) => void }
  const router = useRouter()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [showPasswordFields, setShowPasswordFields] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (user?.auth_user_id) {
        const { data: userDetails, error } = await supabase
          .from('users')
          .select('*')
          .eq('auth_user_id', user.auth_user_id)
          .single()

        if (userDetails) {
          setUsername(userDetails.username || '')
          setEmail(userDetails.email || '')
          setBirthdate(userDetails.birthdate ? userDetails.birthdate.slice(0, 10) : '')
        }

        if (error) {
          console.error('Error fetching user details:', error)
        }
      }
    }

    fetchUserDetails()
  }, [user])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    if (!user) return

    const isValidBirthdate = (dateStr: string) => {
      const date = new Date(dateStr)
      return !isNaN(date.getTime()) && date.getFullYear() > 1900 && date < new Date()
    }

    const updatePayload: any = { username }
    if (isValidBirthdate(birthdate)) updatePayload.birthdate = birthdate

    const { error: updateError } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('auth_user_id', user.auth_user_id)

    if (updateError) {
      console.error('Update error:', updateError)
      setMessage('Failed to update user data.')
      return
    }

    if (email !== user.email) {
      const { error: emailError } = await supabase.auth.updateUser({ email })
      if (emailError) {
        setMessage('Failed to update email.')
        return
      }
    }

    if (showPasswordFields) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        setMessage('Please fill in all password fields.')
        return
      }

      if (newPassword !== confirmPassword) {
        setMessage('New passwords do not match.')
        return
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      })

      if (loginError) {
        setMessage('Incorrect current password.')
        return
      }

      if (currentPassword === newPassword) {
        setMessage('New password must be different from the current one.')
        return
      }

      const { error: passwordError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (passwordError) {
        setMessage('Password must be at least 6 characters.')
        return
      }
    }

    setUser({ ...user, username, email, birthdate })
    setMessage('Profile updated successfully!')
    router.refresh()
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto p-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">🔒 Restricted Access</h1>
        <p className="text-gray-600 mb-6">
        You must be logged in to access settings.
        </p>
        <a
          href="/login"
          className="inline-block bg-blue-600 text-white font-semibold px-6 py-3 rounded-full shadow hover:bg-blue-700 transition"
        >
          Go to Login
        </a>
      </div>
    )
  }
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Account Settings</h1>
      <form onSubmit={handleUpdate} autoComplete="off" className="space-y-6 bg-white shadow rounded-xl p-6">
        <input type="text" name="fakeusernameremembered" className="hidden" />
        <input type="password" name="fakepasswordremembered" className="hidden" />

        <div className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          <input
            type="date"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowPasswordFields(!showPasswordFields)}
          className="text-sm text-blue-600 hover:underline"
        >
          {showPasswordFields ? 'Cancel password change' : 'Change password?'}
        </button>

        {showPasswordFields && (
          <div className="space-y-4">
            <input
              type="password"
              name="current-password-dummy"
              autoComplete="new-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            <input
              type="password"
              name="new-password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            <input
              type="password"
              name="confirm-password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Save Changes
        </button>

        {message && (
          <div
            className={`mt-4 text-center text-sm font-medium ${
              message.includes('success') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  )
}
