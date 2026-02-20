'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

type UserRole = 'user' | 'veterinarian' | 'ngo'

interface User {
  id: string
  email: string
  role: UserRole
  name: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (data?.session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single()

          if (profile) {
            setUser({
              id: data.session.user.id,
              email: data.session.user.email || '',
              name: profile.name,
              role: profile.role,
            })
          }
        }
      } catch (err) {
        console.error('Session check error:', err)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  const signup = async (email: string, password: string, name: string, role: UserRole) => {
    setError(null)
    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email,
            name,
            role,
          })

        if (profileError) throw profileError

        setUser({
          id: authData.user.id,
          email,
          name,
          role,
        })
      }
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const login = async (email: string, password: string) => {
    setError(null)
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (profileError) {
          console.error('Profile fetch error:', profileError)
          throw new Error('Failed to fetch user profile')
        }

        if (profile) {
          setUser({
            id: data.user.id,
            email: data.user.email || '',
            name: profile.name,
            role: profile.role,
          })

          // Log admin login if admin
          if (profile.role === 'admin' || email === 'admin@innovet.com') {
            await supabase
              .from('admin_activity_logs')
              .insert({
                admin_id: data.user.id,
                action: 'LOGIN',
                description: 'Admin user logged in',
                status: 'success',
              })
          }
        }
      }
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const logout = async () => {
    setError(null)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
