'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PawPrint, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'

const normalizeCsv = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .join(', ')

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

const resolveLinkedUsersId = async (params: {
  authUserId: string
  email: string
}) => {
  const { authUserId, email } = params

  const byIdQuery = await supabase.from('users').select('id').eq('id', authUserId).maybeSingle()
  if (byIdQuery.data?.id) {
    return String(byIdQuery.data.id)
  }

  const byEmailQuery = await supabase.from('users').select('id').eq('email', email).maybeSingle()
  if (byEmailQuery.data?.id) {
    return String(byEmailQuery.data.id)
  }

  return null
}

export default function PetNannyRegisterPage() {
  const router = useRouter()
  const { signup, logout } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [description, setDescription] = useState('')
  const [services, setServices] = useState('')
  const [petTypes, setPetTypes] = useState('')
  const [availability, setAvailability] = useState('Available')
  const [availableTimes, setAvailableTimes] = useState('')
  const [experience, setExperience] = useState('')
  const [experienceYears, setExperienceYears] = useState('')
  const [pricePerHour, setPricePerHour] = useState('')
  const [pricePerDay, setPricePerDay] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    const normalizedName = fullName.trim()
    const normalizedEmail = email.trim().toLowerCase()
    const normalizedPhone = phone.trim()

    if (!normalizedName || !normalizedEmail || !password) {
      setError('Full name, email, and password are required.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    const experienceYearsNumber = experienceYears.trim() ? Number(experienceYears) : null
    const pricePerHourNumber = pricePerHour.trim() ? Number(pricePerHour) : null
    const pricePerDayNumber = pricePerDay.trim() ? Number(pricePerDay) : null

    if (experienceYearsNumber !== null && (!Number.isFinite(experienceYearsNumber) || experienceYearsNumber < 0)) {
      setError('Experience years must be a valid non-negative number.')
      return
    }

    if (pricePerHourNumber !== null && (!Number.isFinite(pricePerHourNumber) || pricePerHourNumber < 0)) {
      setError('Price per hour must be a valid non-negative number.')
      return
    }

    if (pricePerDayNumber !== null && (!Number.isFinite(pricePerDayNumber) || pricePerDayNumber < 0)) {
      setError('Price per day must be a valid non-negative number.')
      return
    }

    setLoading(true)
    try {
      const signupResult = await signup(normalizedEmail, password, normalizedName, 'pet_nanny', {
        phone: normalizedPhone,
      })
      const userId = signupResult.userId

      if (!userId) {
        throw new Error('User ID missing after signup.')
      }

      const linkedUsersId = await resolveLinkedUsersId({
        authUserId: userId,
        email: normalizedEmail,
      })

      const existingNannyByUserId = linkedUsersId
        ? await supabase
            .from('pet_nannies')
            .select('id')
            .eq('user_id', linkedUsersId)
            .limit(1)
            .maybeSingle()
        : { data: null, error: null as any }

      if (existingNannyByUserId.error) {
        throw existingNannyByUserId.error
      }

      const existingNannyByEmail = !existingNannyByUserId.data
        ? await supabase
            .from('pet_nannies')
            .select('id')
            .eq('email', normalizedEmail)
            .limit(1)
            .maybeSingle()
        : { data: null, error: null as any }

      if (existingNannyByEmail.error) {
        throw existingNannyByEmail.error
      }

      const existingNanny = existingNannyByUserId.data || existingNannyByEmail.data

      const profilePayload = {
        user_id: linkedUsersId,
        full_name: normalizedName,
        image: imageUrl.trim() || null,
        phone: normalizedPhone || null,
        email: normalizedEmail,
        location: location.trim() || null,
        bio: bio.trim() || null,
        description: description.trim() || null,
        services: normalizeCsv(services) || null,
        price_per_hour: pricePerHourNumber,
        price_per_day: pricePerDayNumber,
        availability: availability.trim() || null,
        available_times: availableTimes.trim() || null,
        pet_types: normalizeCsv(petTypes) || null,
        experience: experience.trim() || null,
        experience_years: experienceYearsNumber,
      }

      const profilePayloadWithLegacyName = {
        ...profilePayload,
        name: normalizedName,
      }

      if (existingNanny?.id) {
        const primaryUpdate = await supabase
          .from('pet_nannies')
          .update({ ...profilePayloadWithLegacyName, updated_at: new Date().toISOString() })
          .eq('id', existingNanny.id)

        if (primaryUpdate.error) {
          if (!isMissingColumnError(primaryUpdate.error)) {
            throw primaryUpdate.error
          }

          const fallbackUpdate = await supabase
            .from('pet_nannies')
            .update({ ...profilePayload, updated_at: new Date().toISOString() })
            .eq('id', existingNanny.id)

          if (fallbackUpdate.error) {
            throw fallbackUpdate.error
          }
        }
      } else {
        const primaryInsert = await supabase.from('pet_nannies').insert(profilePayloadWithLegacyName)
        if (primaryInsert.error) {
          if (!isMissingColumnError(primaryInsert.error)) {
            throw primaryInsert.error
          }

          const fallbackInsert = await supabase.from('pet_nannies').insert(profilePayload)
          if (fallbackInsert.error) {
            throw fallbackInsert.error
          }
        }
      }

      await logout()
      router.push('/')
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please verify your schema and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/70 to-rose-50/40 p-4 md:p-6">
      <div className="mx-auto max-w-6xl grid lg:grid-cols-[1fr_1.25fr] rounded-3xl overflow-hidden border border-amber-100 shadow-xl bg-white">
        <section className="p-8 md:p-10 bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-6">
            <PawPrint className="h-7 w-7" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Pet Nanny Registration</h1>
          <p className="text-orange-50 leading-relaxed">
            Build your service profile to receive requests from pet owners near your location.
          </p>
        </section>

        <section className="p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} className="mt-2" />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-2" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2" />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={location} onChange={(event) => setLocation(event.target.value)} className="mt-2" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Password *</Label>
                <div className="relative mt-2">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="pr-10"
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
              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative mt-2">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="services">Services (comma separated)</Label>
                <Input id="services" value={services} onChange={(event) => setServices(event.target.value)} className="mt-2" placeholder="Day care, Walking" />
              </div>
              <div>
                <Label htmlFor="petTypes">Pet Types (comma separated)</Label>
                <Input id="petTypes" value={petTypes} onChange={(event) => setPetTypes(event.target.value)} className="mt-2" placeholder="Dog, Cat" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="availableTimes">Available Times</Label>
                <Input id="availableTimes" value={availableTimes} onChange={(event) => setAvailableTimes(event.target.value)} className="mt-2" placeholder="Mon-Sat, 9 AM - 7 PM" />
              </div>
              <div>
                <Label htmlFor="availability">Availability</Label>
                <Input id="availability" value={availability} onChange={(event) => setAvailability(event.target.value)} className="mt-2" placeholder="Available" />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="experience">Experience Summary</Label>
                <Input id="experience" value={experience} onChange={(event) => setExperience(event.target.value)} className="mt-2" placeholder="Pet sitter and trainer" />
              </div>
              <div>
                <Label htmlFor="experienceYears">Experience Years</Label>
                <Input id="experienceYears" type="number" min={0} value={experienceYears} onChange={(event) => setExperienceYears(event.target.value)} className="mt-2" />
              </div>
              <div>
                <Label htmlFor="imageUrl">Profile Image URL</Label>
                <Input id="imageUrl" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} className="mt-2" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pricePerHour">Price Per Hour</Label>
                <Input id="pricePerHour" type="number" min={0} step="0.01" value={pricePerHour} onChange={(event) => setPricePerHour(event.target.value)} className="mt-2" />
              </div>
              <div>
                <Label htmlFor="pricePerDay">Price Per Day</Label>
                <Input id="pricePerDay" type="number" min={0} step="0.01" value={pricePerDay} onChange={(event) => setPricePerDay(event.target.value)} className="mt-2" />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Short Bio</Label>
              <Textarea id="bio" value={bio} onChange={(event) => setBio(event.target.value)} className="mt-2 min-h-20" />
            </div>
            <div>
              <Label htmlFor="description">Detailed Description</Label>
              <Textarea id="description" value={description} onChange={(event) => setDescription(event.target.value)} className="mt-2 min-h-24" />
            </div>

            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600"
            >
              {loading ? 'Creating account...' : 'Create Pet Nanny Account'}
            </Button>
          </form>

          <div className="mt-6 text-sm text-slate-600">
            Already registered?{' '}
            <Link href="/" className="font-semibold text-orange-600 hover:text-orange-700">
              Sign in
            </Link>
          </div>

          <Link
            href="/register"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Back to main registration
          </Link>
        </section>
      </div>
    </div>
  )
}
