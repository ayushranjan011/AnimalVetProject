'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Image from 'next/image'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Upload, X, Loader2 } from 'lucide-react'

type VetProfileFormState = {
  name: string
  phone: string
  specialty: string
  experienceYears: string
  clinicName: string
  clinicAddress: string
  city: string
  consultationFee: string
  availability: 'Available' | 'Busy' | 'On Leave'
  description: string
  imageUrl: string
}

const initialState: VetProfileFormState = {
  name: '',
  phone: '',
  specialty: '',
  experienceYears: '',
  clinicName: '',
  clinicAddress: '',
  city: '',
  consultationFee: '',
  availability: 'Available',
  description: '',
  imageUrl: '',
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

export default function VetProfileSettings() {
  const { user } = useAuth()
  const [form, setForm] = useState<VetProfileFormState>(initialState)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [supportsExtendedProfile, setSupportsExtendedProfile] = useState(true)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')

  useEffect(() => {
    if (!imageFile) {
      setImagePreview('')
      return
    }

    const previewUrl = URL.createObjectURL(imageFile)
    setImagePreview(previewUrl)

    return () => {
      URL.revokeObjectURL(previewUrl)
    }
  }, [imageFile])

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) {
        setForm(initialState)
        return
      }

      setLoading(true)
      setFeedback('')
      const { data, error } = await supabase
        .from('profiles')
        .select(
          'name, phone, vet_specialty, vet_experience_years, vet_clinic_name, vet_clinic_address, vet_city, vet_consultation_fee, vet_availability, vet_description, vet_image_url'
        )
        .eq('id', user.id)
        .maybeSingle()
      if (error && isMissingColumnError(error)) {
        const fallback = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .maybeSingle()

        setLoading(false)

        if (fallback.error) {
          console.error('Failed to load fallback vet profile:', fallback.error)
          setFeedback('Could not load profile details.')
          return
        }

        setSupportsExtendedProfile(false)
        setForm((prev) => ({
          ...prev,
          name: fallback.data?.name || user.name || '',
        }))
        setFeedback('Database migration pending: advanced vet fields will work after SQL update.')
        return
      }

      setLoading(false)

      if (error) {
        console.error('Failed to load vet profile:', error)
        setFeedback('Could not load profile details.')
        return
      }

      setSupportsExtendedProfile(true)
      setForm({
        name: data?.name || user.name || '',
        phone: data?.phone || '',
        specialty: data?.vet_specialty || '',
        experienceYears:
          typeof data?.vet_experience_years === 'number' ? String(data.vet_experience_years) : '',
        clinicName: data?.vet_clinic_name || '',
        clinicAddress: data?.vet_clinic_address || '',
        city: data?.vet_city || '',
        consultationFee:
          data?.vet_consultation_fee !== null && data?.vet_consultation_fee !== undefined
            ? String(data.vet_consultation_fee)
            : '',
        availability:
          data?.vet_availability === 'Busy' || data?.vet_availability === 'On Leave'
            ? data.vet_availability
            : 'Available',
        description: data?.vet_description || '',
        imageUrl: data?.vet_image_url || '',
      })
    }

    loadProfile()
  }, [user?.id, user?.name])

  const handlePhoneChange = (value: string) => {
    const normalizedPhone = value.replace(/\D/g, '').slice(0, 10)
    setForm((prev) => ({ ...prev, phone: normalizedPhone }))
  }

  const uploadVetImage = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload-vet-image', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string }
      throw new Error(payload.error || 'Image upload failed')
    }

    const payload = (await response.json()) as { path?: string }
    if (!payload.path) {
      throw new Error('Invalid image upload response')
    }

    return payload.path
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user?.id) return

    if (!form.name.trim()) {
      alert('Please add your name.')
      return
    }

    if (supportsExtendedProfile && !form.specialty.trim()) {
      alert('Please add your specialty.')
      return
    }

    const parsedExperienceYears = form.experienceYears.trim() ? Number(form.experienceYears) : null
    if (parsedExperienceYears !== null && (!Number.isFinite(parsedExperienceYears) || parsedExperienceYears < 0)) {
      alert('Experience years must be a valid positive number.')
      return
    }

    const parsedConsultationFee = form.consultationFee.trim() ? Number(form.consultationFee) : null
    if (parsedConsultationFee !== null && (!Number.isFinite(parsedConsultationFee) || parsedConsultationFee < 0)) {
      alert('Consultation fee must be a valid positive number.')
      return
    }

    setSaving(true)
    setFeedback('')

    try {
      let imageUrl = form.imageUrl
      if (imageFile) {
        imageUrl = await uploadVetImage(imageFile)
      }

      const payload = supportsExtendedProfile
        ? {
            name: form.name.trim(),
            phone: form.phone.trim() || null,
            vet_specialty: form.specialty.trim(),
            vet_experience_years: parsedExperienceYears,
            vet_clinic_name: form.clinicName.trim() || null,
            vet_clinic_address: form.clinicAddress.trim() || null,
            vet_city: form.city.trim() || null,
            vet_consultation_fee: parsedConsultationFee,
            vet_availability: form.availability,
            vet_description: form.description.trim() || null,
            vet_image_url: imageUrl || null,
          }
        : {
            name: form.name.trim(),
          }

      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', user.id)

      if (error) {
        throw error
      }

      setForm((prev) => ({ ...prev, imageUrl }))
      setImageFile(null)
      setFeedback(
        supportsExtendedProfile
          ? 'Profile updated successfully.'
          : 'Basic profile updated. Run migration SQL to enable all vet fields.'
      )
    } catch (error: any) {
      console.error('Failed to update vet profile:', error)
      setFeedback(`Profile update failed: ${error?.message || 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50">
      <h3 className="font-semibold text-slate-800 mb-4">Profile Information</h3>

      {loading ? (
        <div className="text-sm text-slate-500">Loading profile...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-slate-600">Full Name *</Label>
              <Input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-600">Email</Label>
              <Input value={user?.email || ''} className="mt-1" disabled />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-600">Phone</Label>
              <Input
                value={form.phone}
                onChange={(event) => handlePhoneChange(event.target.value)}
                className="mt-1"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit number"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-600">Specialty *</Label>
              <Input
                value={form.specialty}
                onChange={(event) => setForm((prev) => ({ ...prev, specialty: event.target.value }))}
                className="mt-1"
                placeholder="Small Animal Medicine"
                required
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-600">Experience (Years)</Label>
              <Input
                type="number"
                min={0}
                value={form.experienceYears}
                onChange={(event) => setForm((prev) => ({ ...prev, experienceYears: event.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-600">Consultation Fee (INR)</Label>
              <Input
                type="number"
                min={0}
                step="1"
                value={form.consultationFee}
                onChange={(event) => setForm((prev) => ({ ...prev, consultationFee: event.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-600">Clinic Name</Label>
              <Input
                value={form.clinicName}
                onChange={(event) => setForm((prev) => ({ ...prev, clinicName: event.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-600">City</Label>
              <Input
                value={form.city}
                onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-slate-600">Clinic Address</Label>
            <Input
              value={form.clinicAddress}
              onChange={(event) => setForm((prev) => ({ ...prev, clinicAddress: event.target.value }))}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-slate-600">Availability</Label>
            <select
              value={form.availability}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  availability: event.target.value as VetProfileFormState['availability'],
                }))
              }
              className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="Available">Available</option>
              <option value="Busy">Busy</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>

          <div>
            <Label className="text-sm font-medium text-slate-600">Profile Description</Label>
            <Textarea
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              className="mt-1 min-h-24"
              placeholder="Add consultation style, services, and expertise"
            />
          </div>

          <div className="grid md:grid-cols-[1fr_180px] gap-4 items-start">
            <div>
              <Label htmlFor="vet-profile-photo" className="text-sm font-medium text-slate-600">Profile Photo</Label>
              <Input
                id="vet-profile-photo"
                type="file"
                accept="image/*"
                onChange={(event) => setImageFile(event.target.files?.[0] || null)}
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">Upload a clear profile image (max 5MB).</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
              <p className="text-xs text-slate-500 mb-2">Image Preview</p>
              <div className="relative h-32 rounded-lg overflow-hidden bg-slate-200">
                {imagePreview || form.imageUrl ? (
                  <Image
                    src={imagePreview || form.imageUrl}
                    alt="Vet profile preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <Upload className="w-5 h-5 mb-2" />
                    <span className="text-xs">No photo</span>
                  </div>
                )}
              </div>
              {(imageFile || form.imageUrl) && (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2 w-full bg-transparent"
                  onClick={() => {
                    setImageFile(null)
                    setImagePreview('')
                    setForm((prev) => ({ ...prev, imageUrl: '' }))
                  }}
                >
                  <X className="mr-2 h-4 w-4" /> Remove
                </Button>
              )}
            </div>
          </div>

          {feedback && (
            <p className={`text-sm ${feedback.includes('failed') || feedback.includes('Could not') ? 'text-rose-600' : 'text-emerald-600'}`}>
              {feedback}
            </p>
          )}

          <Button type="submit" disabled={saving} className="bg-gradient-to-r from-teal-500 to-cyan-500">
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </span>
            ) : (
              'Save Changes'
            )}
          </Button>
        </form>
      )}
    </div>
  )
}
