'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { hasSupabaseConfig, supabase } from '@/lib/supabase'

type UserRole = 'user' | 'veterinarian' | 'ngo' | 'pet_nanny'

const mapToUsersRole = (role: UserRole): 'pet_owner' | 'veterinarian' | 'ngo' | 'pet_nanny' => {
  if (role === 'veterinarian' || role === 'ngo' || role === 'pet_nanny') {
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

const formatSupabaseError = (error: any): string => {
  if (!error) return 'Unknown error'
  
  const parts: string[] = []
  
  if (error.message) parts.push(`Message: ${error.message}`)
  if (error.code) parts.push(`Code: ${error.code}`)
  if (error.details) parts.push(`Details: ${error.details}`)
  if (error.hint) parts.push(`Hint: ${error.hint}`)
  if (error.status) parts.push(`Status: ${error.status}`)
  
  if (parts.length === 0) {
    parts.push(`Error object: ${JSON.stringify(error)}`)
  }
  
  return parts.join(' | ')
}

const normalizeUserRole = (role: unknown): UserRole => {
  if (role === 'veterinarian' || role === 'ngo' || role === 'pet_nanny') {
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

const normalizeLocationText = (value: unknown) => {
  const normalizedValue = typeof value === 'string' ? value.trim() : ''
  return normalizedValue || undefined
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

export interface OwnerSignupProfile {
  location?: string
  city?: string
  state?: string
  country?: string
}

interface SignupOptions {
  phone?: string
  city?: string
  state?: string
  country?: string
  vetProfile?: VetSignupProfile
  ownerProfile?: OwnerSignupProfile
}

interface SignupResult {
  warning?: string
  userId?: string
}

type ProfileSeed = {
  id: string
  email: string
  name: string
  role: UserRole
  phone?: string
  city?: string
  state?: string
  country?: string
  vetProfile?: VetSignupProfile
  ownerProfile?: OwnerSignupProfile
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

  const parseOwnerProfileFromUnknown = (value: unknown): OwnerSignupProfile | undefined => {
    if (!value || typeof value !== 'object') {
      return undefined
    }

    const row = value as Record<string, unknown>
    return {
      location: typeof row.location === 'string' ? row.location : undefined,
      city: typeof row.city === 'string' ? row.city : undefined,
      state: typeof row.state === 'string' ? row.state : undefined,
      country: typeof row.country === 'string' ? row.country : undefined,
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

    if (seed.city) {
      payload.city = seed.city
    }

    if (seed.state) {
      payload.state = seed.state
    }

    if (seed.country) {
      payload.country = seed.country
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

    if (seed.role === 'user') {
      payload.location = seed.ownerProfile?.location?.trim() || null
      payload.city = seed.ownerProfile?.city?.trim() || null
      payload.state = seed.ownerProfile?.state?.trim() || null
      payload.country = seed.ownerProfile?.country?.trim() || null
    }

    return payload
  }

  const hasTextValue = (value: unknown) => typeof value === 'string' && value.trim().length > 0

  const buildProfileBackfillPayload = (params: {
    profile: any
    fallbackName: string
    fallbackPhone?: string
    fallbackRole: UserRole
    fallbackVetProfile?: VetSignupProfile
    fallbackOwnerProfile?: OwnerSignupProfile
  }): Record<string, unknown> => {
    const {
      profile,
      fallbackName,
      fallbackPhone,
      fallbackRole,
      fallbackVetProfile,
      fallbackOwnerProfile,
    } = params
    const payload: Record<string, unknown> = {}
    const profileRole = normalizeUserRole(profile?.role ?? fallbackRole)

    if (!hasTextValue(profile?.name) && hasTextValue(fallbackName)) {
      payload.name = fallbackName.trim()
    }

    if (!hasTextValue(profile?.phone) && hasTextValue(fallbackPhone)) {
      payload.phone = fallbackPhone?.trim()
    }

    if (profileRole === 'user' && fallbackOwnerProfile) {
      if (!hasTextValue(profile?.location) && hasTextValue(fallbackOwnerProfile.location)) {
        payload.location = fallbackOwnerProfile.location?.trim()
      }

      if (!hasTextValue(profile?.city) && hasTextValue(fallbackOwnerProfile.city)) {
        payload.city = fallbackOwnerProfile.city?.trim()
      }

      if (!hasTextValue(profile?.state) && hasTextValue(fallbackOwnerProfile.state)) {
        payload.state = fallbackOwnerProfile.state?.trim()
      }

      if (!hasTextValue(profile?.country) && hasTextValue(fallbackOwnerProfile.country)) {
        payload.country = fallbackOwnerProfile.country?.trim()
      }

      return payload
    }

    if (profileRole !== 'veterinarian' || !fallbackVetProfile) {
      return payload
    }

    if (!hasTextValue(profile?.vet_specialty) && hasTextValue(fallbackVetProfile.specialty)) {
      payload.vet_specialty = fallbackVetProfile.specialty.trim()
    }

    if (
      (profile?.vet_experience_years === null || profile?.vet_experience_years === undefined) &&
      typeof fallbackVetProfile.experienceYears === 'number'
    ) {
      payload.vet_experience_years = fallbackVetProfile.experienceYears
    }

    if (!hasTextValue(profile?.vet_clinic_name) && hasTextValue(fallbackVetProfile.clinicName)) {
      payload.vet_clinic_name = fallbackVetProfile.clinicName?.trim()
    }

    if (!hasTextValue(profile?.vet_clinic_address) && hasTextValue(fallbackVetProfile.clinicAddress)) {
      payload.vet_clinic_address = fallbackVetProfile.clinicAddress?.trim()
    }

    if (!hasTextValue(profile?.vet_city) && hasTextValue(fallbackVetProfile.city)) {
      payload.vet_city = fallbackVetProfile.city?.trim()
    }

    if (
      (profile?.vet_consultation_fee === null || profile?.vet_consultation_fee === undefined) &&
      typeof fallbackVetProfile.consultationFee === 'number'
    ) {
      payload.vet_consultation_fee = fallbackVetProfile.consultationFee
    }

    if (!hasTextValue(profile?.vet_availability) && hasTextValue(fallbackVetProfile.availability)) {
      payload.vet_availability = fallbackVetProfile.availability?.trim()
    }

    if (!hasTextValue(profile?.vet_description) && hasTextValue(fallbackVetProfile.description)) {
      payload.vet_description = fallbackVetProfile.description?.trim()
    }

    if (!hasTextValue(profile?.vet_image_url) && hasTextValue(fallbackVetProfile.imageUrl)) {
      payload.vet_image_url = fallbackVetProfile.imageUrl?.trim()
    }

    return payload
  }

  const backfillProfileFromMetadata = async (params: {
    userId: string
    profile: any
    fallbackName: string
    fallbackPhone?: string
    fallbackRole: UserRole
    fallbackVetProfile?: VetSignupProfile
    fallbackOwnerProfile?: OwnerSignupProfile
  }) => {
    const {
      userId,
      profile,
      fallbackName,
      fallbackPhone,
      fallbackRole,
      fallbackVetProfile,
      fallbackOwnerProfile,
    } = params
    const profileRole = normalizeUserRole(profile?.role ?? fallbackRole)
    const shouldBackfillProfile = profileRole === 'veterinarian' || profileRole === 'user'

    if (!shouldBackfillProfile) {
      return profile
    }

    const payload = buildProfileBackfillPayload({
      profile,
      fallbackName,
      fallbackPhone,
      fallbackRole,
      fallbackVetProfile,
      fallbackOwnerProfile,
    })

    if (Object.keys(payload).length === 0) {
      return profile
    }

    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId)
      .select('*')
      .maybeSingle()

    if (!error) {
      return updatedProfile || { ...profile, ...payload }
    }

    if (isMissingColumnError(error) || isPermissionError(error)) {
      return { ...profile, ...payload }
    }

    console.warn('Profile metadata backfill failed:', error)
    return profile
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

  const logAdminLogin = async (authUserId: string) => {
    const adminRowQuery = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', authUserId)
      .maybeSingle()

    if (adminRowQuery.error || !adminRowQuery.data?.id) {
      if (adminRowQuery.error && !isMissingRelationError(adminRowQuery.error)) {
        console.warn('Failed to resolve admin row for activity log:', adminRowQuery.error)
      }
      return
    }

    const { error: activityError } = await supabase
      .from('admin_activity_logs')
      .insert({
        admin_id: adminRowQuery.data.id,
        action: 'LOGIN',
        description: 'Admin user logged in',
        status: 'success',
      })

    if (activityError && !isMissingRelationError(activityError)) {
      console.warn('Failed to insert admin activity log:', activityError)
    }
  }

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkSession = async () => {
      if (!hasSupabaseConfig) {
        console.warn('Supabase is not configured. Skipping session check.')
        setLoading(false)
        return
      }

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
          const fallbackOwnerProfile =
            fallbackRole === 'user' ? parseOwnerProfileFromUnknown(metadata.ownerProfile) : undefined

          let { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sessionUser.id)
            .maybeSingle()

          if (profileError) {
            console.error('Session profile fetch error:', formatSupabaseError(profileError))
          } else if (!profile) {
            await syncAppRecords(
              {
                id: sessionUser.id,
                email: sessionUser.email || '',
                name: fallbackName,
                role: fallbackRole,
                phone: normalizePhone(metadata.phone),
                city: normalizeLocationText(metadata.city),
                state: normalizeLocationText(metadata.state),
                country: normalizeLocationText(metadata.country),
                vetProfile: fallbackVetProfile,
                ownerProfile: fallbackOwnerProfile,
              },
              false
            )

            const profileReload = await supabase
              .from('profiles')
              .select('*')
              .eq('id', sessionUser.id)
              .maybeSingle()

            if (profileReload.error) {
              console.error('Session profile reload error:', formatSupabaseError(profileReload.error))
            } else {
              profile = profileReload.data
            }
          }

          profile = await backfillProfileFromMetadata({
            userId: sessionUser.id,
            profile,
            fallbackName,
            fallbackPhone: normalizePhone(metadata.phone),
            fallbackRole,
            fallbackVetProfile,
            fallbackOwnerProfile,
          })

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
      if (!hasSupabaseConfig) {
        throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
      }

      const normalizedEmail = email.trim().toLowerCase()
      const normalizedName = normalizeDisplayName(name, normalizedEmail)
      const normalizedPhone = normalizePhone(options?.phone)
      const normalizedCity = normalizeLocationText(options?.city)
      const normalizedState = normalizeLocationText(options?.state)
      const normalizedCountry = normalizeLocationText(options?.country)
      const normalizedVetProfile =
        role === 'veterinarian' ? parseVetProfileFromUnknown(options?.vetProfile) : undefined
      const normalizedOwnerProfile =
        role === 'user' ? parseOwnerProfileFromUnknown(options?.ownerProfile) : undefined

      const signupMetadata: Record<string, unknown> = {
        name: normalizedName,
        role,
        phone: normalizedPhone || null,
        city: normalizedCity || null,
        state: normalizedState || null,
        country: normalizedCountry || null,
      }

      if (role === 'veterinarian') {
        signupMetadata.vetProfile = normalizedVetProfile || null
      }

      if (role === 'user') {
        signupMetadata.ownerProfile = normalizedOwnerProfile || null
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
          city: normalizedCity,
          state: normalizedState,
          country: normalizedCountry,
          vetProfile: normalizedVetProfile,
          ownerProfile: normalizedOwnerProfile,
        }

        const profileState = await syncAppRecords(profileSeed, !authData.session)
        if (profileState === 'deferred') {
          warningMessage =
            'Profile creation is deferred until first successful login because the sign-up session is not active yet.'
        } else if (profileState === 'created_basic') {
          if (role === 'veterinarian') {
            warningMessage =
              'Veterinarian profile fields (specialty/city/description) were not saved because vet columns are missing in the database. Run vet_profile_migration.sql in Supabase SQL Editor.'
          } else if (role === 'user') {
            warningMessage =
              'Pet owner location fields were not saved because location columns are missing in the database. Run owner_profile_location_migration.sql in Supabase SQL Editor.'
          }
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

        return warningMessage
          ? { warning: warningMessage, userId: authData.user.id }
          : { userId: authData.user.id }
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
      if (!hasSupabaseConfig) {
        throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
      }

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
          metadata.role === 'ngo' ||
          metadata.role === 'pet_nanny'
        const fallbackRole = hasValidMetadataRole
          ? normalizeUserRole(metadata.role)
          : expectedRole || 'user'
        const fallbackName = normalizeDisplayName(metadata.name, data.user.email || normalizedEmail)
        const fallbackVetProfile =
          fallbackRole === 'veterinarian' ? parseVetProfileFromUnknown(metadata.vetProfile) : undefined
        const fallbackOwnerProfile =
          fallbackRole === 'user' ? parseOwnerProfileFromUnknown(metadata.ownerProfile) : undefined

        let { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle()

        if (profileError) {
          console.error('Profile fetch error:', formatSupabaseError(profileError))
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
                city: normalizeLocationText(metadata.city),
                state: normalizeLocationText(metadata.state),
                country: normalizeLocationText(metadata.country),
              vetProfile: fallbackVetProfile,
              ownerProfile: fallbackOwnerProfile,
            },
            false
          )

          const profileReload = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle()

          if (profileReload.error) {
            console.error('Profile reload error:', formatSupabaseError(profileReload.error))
            throw new Error('Failed to fetch user profile')
          }

          profile = profileReload.data
        }

        profile = await backfillProfileFromMetadata({
          userId: data.user.id,
          profile,
          fallbackName,
          fallbackPhone: normalizePhone(metadata.phone),
          fallbackRole,
          fallbackVetProfile,
          fallbackOwnerProfile,
        })

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
          await logAdminLogin(data.user.id)
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
      if (!hasSupabaseConfig) {
        setUser(null)
        return
      }

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
