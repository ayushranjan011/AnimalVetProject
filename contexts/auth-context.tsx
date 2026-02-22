'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

type UserRole = 'user' | 'veterinarian' | 'ngo'

const mapToUsersRole = (role: UserRole): 'pet_owner' | 'veterinarian' | 'ngo' => {
  if (role === 'veterinarian' || role === 'ngo') {
    return role
  }

  return 'pet_owner'
}

const isMissingColumnError = (error: any) => {
  const message = String(error?.message || '').toLowerCase()
  const details = String(error?.details || '').toLowerCase()
  return (
    error?.code === 'PGRST204' ||
    error?.code === '42703' ||
    message.includes('could not find') ||
    message.includes('column') ||
    details.includes('column')
  )
}

interface User {
  id: string
  email: string
  role: UserRole
  name: string
}

export interface VetSignupProfile {
  specialty: string
  experienceYears?: number | null
  clinicName?: string
  clinicAddress?: string
  city?: string
  consultationFee?: number | null
  availability?: string
  description?: string
  imageUrl?: string
}

interface SignupOptions {
  phone?: string
  vetProfile?: VetSignupProfile
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signup: (email: string, password: string, name: string, role: UserRole, options?: SignupOptions) => Promise<void>
  login: (email: string, password: string) => Promise<User>
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

  const signup = async (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    options?: SignupOptions
  ) => {
    setError(null)
    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      if (authData.user) {
        const profilePayload: Record<string, unknown> = {
          id: authData.user.id,
          email,
          name,
          role,
        }

        const normalizedPhone = options?.phone?.trim()
        if (normalizedPhone) {
          profilePayload.phone = normalizedPhone
        }

        if (role === 'veterinarian') {
          const vetProfile = options?.vetProfile
          profilePayload.vet_specialty = vetProfile?.specialty?.trim() || null
          profilePayload.vet_experience_years = vetProfile?.experienceYears ?? null
          profilePayload.vet_clinic_name = vetProfile?.clinicName?.trim() || null
          profilePayload.vet_clinic_address = vetProfile?.clinicAddress?.trim() || null
          profilePayload.vet_city = vetProfile?.city?.trim() || null
          profilePayload.vet_consultation_fee = vetProfile?.consultationFee ?? null
          profilePayload.vet_availability = vetProfile?.availability?.trim() || 'Available'
          profilePayload.vet_description = vetProfile?.description?.trim() || null
          profilePayload.vet_image_url = vetProfile?.imageUrl?.trim() || null
        }

        // Create user profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert(profilePayload)

        if (profileError) {
          if (!isMissingColumnError(profileError)) {
            throw profileError
          }

          // Backward compatibility: older DB schema without vet profile columns.
          const { error: fallbackProfileError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email,
              name,
              role,
            })

          if (fallbackProfileError) {
            throw fallbackProfileError
          }

          console.warn(
            'Profiles table appears to be missing vet profile columns. Applied fallback insert.'
          )
        }

        const { error: usersError } = await supabase
          .from('users')
          .upsert(
            {
              id: authData.user.id,
              email,
              full_name: name,
              role: mapToUsersRole(role),
            },
            { onConflict: 'id' }
          )

        if (usersError) throw usersError

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

  const login = async (email: string, password: string): Promise<User> => {
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
          const loggedInUser: User = {
            id: data.user.id,
            email: data.user.email || '',
            name: profile.name,
            role: profile.role,
          }

          setUser(loggedInUser)

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

          return loggedInUser
        }
      }

      throw new Error('Invalid email or password')
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
