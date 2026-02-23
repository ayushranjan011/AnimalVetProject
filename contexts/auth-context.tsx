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

const isDuplicateKeyError = (error: any) => {
  const text = [error?.message, error?.details, error?.hint, error?.code]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase())
    .join(' ')

  return error?.code === '23505' || text.includes('duplicate key')
}

const isMissingRelationError = (error: any) => {
  const text = [error?.message, error?.details, error?.hint, error?.code]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase())
    .join(' ')

  return error?.code === '42P01' || (text.includes('relation') && text.includes('does not exist'))
}

const isPermissionError = (error: any) => {
  const text = [error?.message, error?.details, error?.hint, error?.code]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase())
    .join(' ')

  return (
    error?.code === '42501' ||
    text.includes('permission denied') ||
    text.includes('row-level security') ||
    text.includes('rls') ||
    text.includes('not authenticated') ||
    text.includes('jwt')
  )
}

const normalizeUserRole = (role: unknown): UserRole => {
  if (role === 'veterinarian' || role === 'ngo') {
    return role
  }

  return 'user'
}

const normalizeDisplayName = (name: unknown, email?: string) => {
  const normalizedName = typeof name === 'string' ? name.trim() : ''
  if (normalizedName) return normalizedName

  const normalizedEmail = typeof email === 'string' ? email.trim() : ''
  if (normalizedEmail) {
    const [prefix] = normalizedEmail.split('@')
    const normalizedPrefix = prefix?.trim()
    if (normalizedPrefix) return normalizedPrefix
  }

  return 'User'
}

const normalizePhone = (phone: unknown) => {
  const normalizedPhone = typeof phone === 'string' ? phone.trim() : ''
  return normalizedPhone || undefined
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

interface SignupResult {
  warning?: string
}

type ProfileSeed = {
  id: string
  email: string
  name: string
  role: UserRole
  phone?: string
  vetProfile?: VetSignupProfile
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signup: (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    options?: SignupOptions
  ) => Promise<SignupResult>
  login: (email: string, password: string, expectedRole?: UserRole) => Promise<User>
  logout: () => Promise<void>
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const parseVetProfileFromUnknown = (value: unknown): VetSignupProfile | undefined => {
    if (!value || typeof value !== 'object') {
      return undefined
    }

    const row = value as Record<string, unknown>
    return {
      specialty: typeof row.specialty === 'string' ? row.specialty : '',
      experienceYears: typeof row.experienceYears === 'number' ? row.experienceYears : null,
      clinicName: typeof row.clinicName === 'string' ? row.clinicName : undefined,
      clinicAddress: typeof row.clinicAddress === 'string' ? row.clinicAddress : undefined,
      city: typeof row.city === 'string' ? row.city : undefined,
      consultationFee: typeof row.consultationFee === 'number' ? row.consultationFee : null,
      availability: typeof row.availability === 'string' ? row.availability : undefined,
      description: typeof row.description === 'string' ? row.description : undefined,
      imageUrl: typeof row.imageUrl === 'string' ? row.imageUrl : undefined,
    }
  }

  const buildProfilePayload = (seed: ProfileSeed): Record<string, unknown> => {
    const payload: Record<string, unknown> = {
      id: seed.id,
      email: seed.email,
      name: seed.name,
      role: seed.role,
    }

    if (seed.phone) {
      payload.phone = seed.phone
    }

    if (seed.role === 'veterinarian') {
      payload.vet_specialty = seed.vetProfile?.specialty?.trim() || null
      payload.vet_experience_years = seed.vetProfile?.experienceYears ?? null
      payload.vet_clinic_name = seed.vetProfile?.clinicName?.trim() || null
      payload.vet_clinic_address = seed.vetProfile?.clinicAddress?.trim() || null
      payload.vet_city = seed.vetProfile?.city?.trim() || null
      payload.vet_consultation_fee = seed.vetProfile?.consultationFee ?? null
      payload.vet_availability = seed.vetProfile?.availability?.trim() || 'Available'
      payload.vet_description = seed.vetProfile?.description?.trim() || null
      payload.vet_image_url = seed.vetProfile?.imageUrl?.trim() || null
    }

    return payload
  }

  const createProfileRecord = async (
    seed: ProfileSeed,
    allowDeferredOnPermission: boolean
  ): Promise<'created' | 'exists' | 'deferred' | 'created_basic'> => {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert(buildProfilePayload(seed))

    if (!profileError) {
      return 'created'
    }

    if (isDuplicateKeyError(profileError)) {
      return 'exists'
    }

    if (isMissingColumnError(profileError)) {
      const { error: fallbackProfileError } = await supabase
        .from('profiles')
        .insert({
          id: seed.id,
          email: seed.email,
          name: seed.name,
          role: seed.role,
        })

      if (!fallbackProfileError) {
        return 'created_basic'
      }

      if (isDuplicateKeyError(fallbackProfileError)) {
        return 'exists'
      }

      if (allowDeferredOnPermission && isPermissionError(fallbackProfileError)) {
        return 'deferred'
      }

      throw fallbackProfileError
    }

    if (allowDeferredOnPermission && isPermissionError(profileError)) {
      return 'deferred'
    }

    throw profileError
  }

  const syncUsersRecord = async (seed: ProfileSeed, allowDeferredOnPermission: boolean) => {
    const { error: usersError } = await supabase
      .from('users')
      .upsert(
        {
          id: seed.id,
          email: seed.email,
          full_name: seed.name,
          role: mapToUsersRole(seed.role),
        },
        { onConflict: 'id' }
      )

    if (!usersError) {
      return
    }

    if (isMissingRelationError(usersError) || isMissingColumnError(usersError)) {
      console.warn('Users table is missing or outdated. Skipping users row sync.')
      return
    }

    if (allowDeferredOnPermission && isPermissionError(usersError)) {
      console.warn('Users row sync deferred due to auth/RLS policy.')
      return
    }

    console.warn('Failed to sync users row:', usersError)
  }

  const syncAppRecords = async (seed: ProfileSeed, allowDeferredOnPermission: boolean) => {
    const profileState = await createProfileRecord(seed, allowDeferredOnPermission)
    await syncUsersRecord(seed, allowDeferredOnPermission)
    return profileState
  }

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          throw error
        }

        if (data?.session?.user) {
          const sessionUser = data.session.user
          const metadata = (sessionUser.user_metadata || {}) as Record<string, unknown>
          const fallbackRole = normalizeUserRole(metadata.role)
          const fallbackName = normalizeDisplayName(metadata.name, sessionUser.email || '')
          const fallbackVetProfile =
            fallbackRole === 'veterinarian' ? parseVetProfileFromUnknown(metadata.vetProfile) : undefined

          let { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sessionUser.id)
            .maybeSingle()

          if (profileError) {
            console.error('Session profile fetch error:', profileError)
          } else if (!profile) {
            await syncAppRecords(
              {
                id: sessionUser.id,
                email: sessionUser.email || '',
                name: fallbackName,
                role: fallbackRole,
                phone: normalizePhone(metadata.phone),
                vetProfile: fallbackVetProfile,
              },
              false
            )

            const profileReload = await supabase
              .from('profiles')
              .select('*')
              .eq('id', sessionUser.id)
              .maybeSingle()

            if (profileReload.error) {
              console.error('Session profile reload error:', profileReload.error)
            } else {
              profile = profileReload.data
            }
          }

          setUser({
            id: sessionUser.id,
            email: sessionUser.email || '',
            name: normalizeDisplayName(profile?.name ?? fallbackName, sessionUser.email || ''),
            role: normalizeUserRole(profile?.role ?? fallbackRole),
          })
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
  ): Promise<SignupResult> => {
    setError(null)
    try {
      const normalizedEmail = email.trim().toLowerCase()
      const normalizedName = normalizeDisplayName(name, normalizedEmail)
      const normalizedPhone = normalizePhone(options?.phone)
      const normalizedVetProfile =
        role === 'veterinarian' ? parseVetProfileFromUnknown(options?.vetProfile) : undefined

      const signupMetadata: Record<string, unknown> = {
        name: normalizedName,
        role,
        phone: normalizedPhone || null,
      }

      if (role === 'veterinarian') {
        signupMetadata.vetProfile = normalizedVetProfile || null
      }

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: signupMetadata,
        },
      })

      if (authError) throw authError

      if (authData.user) {
        let warningMessage = ''

        const profileSeed: ProfileSeed = {
          id: authData.user.id,
          email: normalizedEmail,
          name: normalizedName,
          role,
          phone: normalizedPhone,
          vetProfile: normalizedVetProfile,
        }

        const profileState = await syncAppRecords(profileSeed, !authData.session)
        if (profileState === 'deferred') {
          warningMessage =
            'Profile creation is deferred until first successful login because the sign-up session is not active yet.'
        } else if (role === 'veterinarian' && profileState === 'created_basic') {
          warningMessage =
            'Veterinarian profile fields (specialty/city/description) were not saved because vet columns are missing in the database. Run vet_profile_migration.sql in Supabase SQL Editor.'
        }

        setUser({
          id: authData.user.id,
          email: normalizedEmail,
          name: normalizedName,
          role,
        })

        if (warningMessage) {
          console.warn(warningMessage)
        }

        return warningMessage ? { warning: warningMessage } : {}
      }

      throw new Error('Signup failed: user was not returned by Supabase Auth.')
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const login = async (email: string, password: string, expectedRole?: UserRole): Promise<User> => {
    setError(null)
    try {
      const normalizedEmail = email.trim().toLowerCase()
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      })

      if (authError) throw authError

      if (data.user) {
        const metadata = (data.user.user_metadata || {}) as Record<string, unknown>
        const hasValidMetadataRole =
          metadata.role === 'user' ||
          metadata.role === 'veterinarian' ||
          metadata.role === 'ngo'
        const fallbackRole = hasValidMetadataRole
          ? normalizeUserRole(metadata.role)
          : expectedRole || 'user'
        const fallbackName = normalizeDisplayName(metadata.name, data.user.email || normalizedEmail)
        const fallbackVetProfile =
          fallbackRole === 'veterinarian' ? parseVetProfileFromUnknown(metadata.vetProfile) : undefined

        let { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle()

        if (profileError) {
          console.error('Profile fetch error:', profileError)
          throw new Error('Failed to fetch user profile')
        }

        if (!profile) {
          await syncAppRecords(
            {
              id: data.user.id,
              email: data.user.email || normalizedEmail,
              name: fallbackName,
              role: fallbackRole,
              phone: normalizePhone(metadata.phone),
              vetProfile: fallbackVetProfile,
            },
            false
          )

          const profileReload = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle()

          if (profileReload.error) {
            console.error('Profile reload error:', profileReload.error)
            throw new Error('Failed to fetch user profile')
          }

          profile = profileReload.data
        }

        const resolvedRole = normalizeUserRole(profile?.role ?? fallbackRole)
        const resolvedName = normalizeDisplayName(
          profile?.name ?? fallbackName,
          data.user.email || normalizedEmail
        )

        await syncUsersRecord(
          {
            id: data.user.id,
            email: data.user.email || normalizedEmail,
            name: resolvedName,
            role: resolvedRole,
          },
          false
        )

        const loggedInUser: User = {
          id: data.user.id,
          email: data.user.email || normalizedEmail,
          name: resolvedName,
          role: resolvedRole,
        }

        setUser(loggedInUser)

        // Log admin login if admin
        if ((profile as any)?.role === 'admin' || normalizedEmail === 'admin@innovet.com') {
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
