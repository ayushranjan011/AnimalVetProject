'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingLink, setCheckingLink] = useState(true)
  const [error, setError] = useState('')
  const [validLink, setValidLink] = useState(false)

  useEffect(() => {
    const verifyRecoveryLink = async () => {
      setError('')

      try {
        const tokenHash = searchParams.get('token_hash')
        const type = searchParams.get('type')

        if (tokenHash && type === 'recovery') {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            type: 'recovery',
            token_hash: tokenHash,
          })

          if (verifyError) throw verifyError
          setValidLink(true)
          return
        }

        const { data, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError
        setValidLink(Boolean(data.session))
      } catch (err: any) {
        setError(err?.message || 'Invalid or expired reset link')
        setValidLink(false)
      } finally {
        setCheckingLink(false)
      }
    }

    verifyRecoveryLink()
  }, [searchParams])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError

      alert('Password updated successfully. Please login.')
      router.push('/')
    } catch (err: any) {
      setError(err?.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Reset password</h1>
        <p className="text-slate-500 mb-6">Set a new password for your account.</p>

        {checkingLink ? (
          <p className="text-sm text-slate-600">Verifying reset link...</p>
        ) : !validLink ? (
          <div className="space-y-4">
            <p className="text-sm font-medium text-rose-600">
              {error || 'Invalid or expired reset link'}
            </p>
            <Link href="/forgot-password" className="text-teal-600 font-semibold hover:text-teal-700">
              Request a new reset link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">New password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                className="mt-2 h-11 rounded-xl border-slate-200 focus:border-teal-400 focus:ring-teal-400"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                required
                className="mt-2 h-11 rounded-xl border-slate-200 focus:border-teal-400 focus:ring-teal-400"
              />
            </div>

            {error && <p className="text-sm font-medium text-rose-600">{error}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold"
            >
              {loading ? 'Updating...' : 'Update password'}
            </Button>
          </form>
        )}

        <p className="text-center text-slate-500 mt-6">
          Back to{' '}
          <Link href="/" className="text-teal-600 font-semibold hover:text-teal-700 transition-colors">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
