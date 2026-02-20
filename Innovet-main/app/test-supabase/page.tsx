'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestSupabasePage() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing Supabase connection...')
        
        // Test 1: Check environment variables
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        if (!url || !key) {
          setStatus('error')
          setMessage('❌ Environment variables missing!')
          return
        }

        console.log('✅ Env vars loaded')
        setMessage('✅ Environment variables loaded')

        // Test 2: Check session
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          setStatus('error')
          setMessage(`❌ Connection error: ${error.message}`)
          console.error('Error:', error)
          return
        }

        setSession(data.session)
        setStatus('connected')
        
        if (data.session) {
          setMessage('✅ Connected! User is logged in')
        } else {
          setMessage('✅ Connected! (No active session)')
        }
        
        console.log('✅ Supabase connection successful!')
        
      } catch (err: any) {
        setStatus('error')
        setMessage(`❌ Error: ${err.message}`)
        console.error('Test error:', err)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-teal-50 p-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-6">Supabase Connection Test</h1>
          
          {/* Status Indicator */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              {status === 'loading' && (
                <>
                  <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse" />
                  <span className="text-yellow-600 font-semibold">Testing...</span>
                </>
              )}
              {status === 'connected' && (
                <>
                  <div className="w-4 h-4 bg-green-500 rounded-full" />
                  <span className="text-green-600 font-semibold">Connected</span>
                </>
              )}
              {status === 'error' && (
                <>
                  <div className="w-4 h-4 bg-red-500 rounded-full" />
                  <span className="text-red-600 font-semibold">Error</span>
                </>
              )}
            </div>

            <p className="text-gray-700 bg-gray-50 p-4 rounded text-sm">
              {message}
            </p>
          </div>

          {/* Session Info */}
          {session && (
            <div className="bg-green-50 p-4 rounded mb-6">
              <h3 className="font-semibold text-green-900 mb-2">User Info</h3>
              <p className="text-sm text-green-700">Email: {session.user?.email}</p>
              <p className="text-sm text-green-700">ID: {session.user?.id}</p>
            </div>
          )}

          {/* Environment Variables Debug */}
          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-semibold text-blue-900 mb-2">Debug Info</h3>
            <p className="text-xs text-blue-700">
              URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ SET' : '❌ MISSING'}
            </p>
            <p className="text-xs text-blue-700">
              KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ SET' : '❌ MISSING'}
            </p>
          </div>

          {/* Back Link */}
          <a 
            href="/"
            className="block mt-6 text-center text-cyan-600 hover:text-cyan-700 font-semibold"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
