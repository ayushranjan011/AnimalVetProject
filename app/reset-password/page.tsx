'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff } from 'lucide-react'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkingLink, setCheckingLink] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
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
    setSuccess('')

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

      setSuccess('Password updated successfully. Redirecting to login...')
      setTimeout(() => {
        router.push('/')
      }, 1200)
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
              <div className="relative mt-2">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  className="h-11 rounded-xl border-slate-200 pr-11 focus:border-teal-400 focus:ring-teal-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">Confirm password</Label>
              <div className="relative mt-2">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  className="h-11 rounded-xl border-slate-200 pr-11 focus:border-teal-400 focus:ring-teal-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
            {success && <p className="text-sm font-medium text-emerald-600">{success}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold"
            >
              {loading ? 'Updating...' : success ? 'Updated' : 'Update password'}
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/50 flex items-center justify-center p-4">
          <p className="text-sm text-slate-600">Loading reset form...</p>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
