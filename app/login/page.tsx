'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/auth-context'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!email || !password) {
        setError('Please fill in all fields')
        setLoading(false)
        return
      }

      console.log('Attempting login with:', email)
      await login(email, password)
      console.log('Login successful')
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push('/user/dashboard')
      }, 500)
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-teal-600 mb-2">INNOVET</h1>
            <p className="text-gray-600">Healthcare Platform</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="h-10"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="text-right -mt-2">
              <Link href="/forgot-password" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                Forgot password?
              </Link>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                ❌ {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 h-10"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <Link href="/register" className="text-teal-600 hover:text-teal-700 font-semibold">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
