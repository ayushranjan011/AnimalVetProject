'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/auth-context'
import { User, Stethoscope, Heart, ArrowRight, CheckCircle2, Upload, X, Loader2 } from 'lucide-react'

type UserRole = 'user' | 'veterinarian' | 'ngo' | null

type VetRegistrationForm = {
  specialty: string
  experienceYears: string
  clinicName: string
  clinicAddress: string
  city: string
  consultationFee: string
  availability: 'Available' | 'Busy' | 'On Leave'
  description: string
}

const initialVetForm: VetRegistrationForm = {
  specialty: '',
  experienceYears: '',
  clinicName: '',
  clinicAddress: '',
  city: '',
  consultationFee: '',
  availability: 'Available',
  description: '',
}

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [hoveredRole, setHoveredRole] = useState<UserRole>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [vetForm, setVetForm] = useState<VetRegistrationForm>(initialVetForm)
  const [vetImageFile, setVetImageFile] = useState<File | null>(null)
  const [vetImagePreview, setVetImagePreview] = useState('')
  const { signup, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!vetImageFile) {
      setVetImagePreview('')
      return
    }

    const previewUrl = URL.createObjectURL(vetImageFile)
    setVetImagePreview(previewUrl)

    return () => {
      URL.revokeObjectURL(previewUrl)
    }
  }, [vetImageFile])

  const resetVetForm = () => {
    setVetForm(initialVetForm)
    setVetImageFile(null)
    setVetImagePreview('')
  }

  const handlePhoneChange = (value: string) => {
    const normalizedPhone = value.replace(/\D/g, '').slice(0, 10)
    setPhone(normalizedPhone)
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

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()

    if (!selectedRole || !email || !password || !name) {
      alert('Please fill in all required fields')
      return
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match')
      return
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters')
      return
    }

    if (phone && phone.length !== 10) {
      alert('Phone number must be exactly 10 digits')
      return
    }

    if (selectedRole === 'veterinarian' && !vetForm.specialty.trim()) {
      alert('Please add veterinarian specialty')
      return
    }

    const parsedExperienceYears = vetForm.experienceYears.trim() ? Number(vetForm.experienceYears) : null
    if (parsedExperienceYears !== null && (!Number.isFinite(parsedExperienceYears) || parsedExperienceYears < 0)) {
      alert('Experience years must be a valid positive number')
      return
    }

    const parsedConsultationFee = vetForm.consultationFee.trim() ? Number(vetForm.consultationFee) : null
    if (parsedConsultationFee !== null && (!Number.isFinite(parsedConsultationFee) || parsedConsultationFee < 0)) {
      alert('Consultation fee must be a valid positive number')
      return
    }

    setIsSubmitting(true)

    try {
      let vetImageUrl: string | undefined

      if (selectedRole === 'veterinarian' && vetImageFile) {
        vetImageUrl = await uploadVetImage(vetImageFile)
      }

      await signup(email, password, name, selectedRole, {
        phone,
        vetProfile: selectedRole === 'veterinarian'
          ? {
              specialty: vetForm.specialty,
              experienceYears: parsedExperienceYears,
              clinicName: vetForm.clinicName,
              clinicAddress: vetForm.clinicAddress,
              city: vetForm.city,
              consultationFee: parsedConsultationFee,
              availability: vetForm.availability,
              description: vetForm.description,
              imageUrl: vetImageUrl,
            }
          : undefined,
      })

      await logout()
      alert('Registered successfully. Please login to continue.')
      router.push('/')
    } catch (error: any) {
      alert('Registration failed: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const roles = [
    {
      id: 'user' as const,
      title: 'Pet Owner',
      description: 'Access pet care, vet directory, and training resources',
      icon: User,
      gradient: 'from-teal-400 to-cyan-500',
      benefits: ['Track pet health', 'Find nearby vets', 'Access resources'],
    },
    {
      id: 'veterinarian' as const,
      title: 'Veterinarian',
      description: 'Create professional profile, manage patients, and handle emergency cases',
      icon: Stethoscope,
      gradient: 'from-cyan-400 to-blue-500',
      benefits: ['Professional listing', 'Manage patients', 'Handle emergencies'],
    },
    {
      id: 'ngo' as const,
      title: 'NGO',
      description: 'Manage animal rescue, adoption, and volunteer programs',
      icon: Heart,
      gradient: 'from-emerald-400 to-teal-500',
      benefits: ['Track rescues', 'Manage volunteers', 'Process adoptions'],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/50">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-cyan-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-100/20 rounded-full blur-3xl" />
      </div>

      <div className="relative min-h-screen flex flex-col lg:flex-row">
        <div className="lg:w-2/5 bg-gradient-to-br from-cyan-600 via-teal-600 to-emerald-700 p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-pattern" />

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-2">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl">
                <Image
                  src="/images/innovet-logo.jpg"
                  alt="INNOVET Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">INNOVET</h1>
                <p className="text-cyan-200 text-sm">Healthcare Platform</p>
              </div>
            </div>

            <div className="mb-2">
              <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 text-balance">
                Join our pet care community
              </h2>
              <p className="text-cyan-100 text-lg leading-relaxed">
                Create your account and connect with thousands of pet lovers, veterinarians, and animal welfare organizations.
              </p>
            </div>

            <div className="space-y-2">
              {['Free to get started', 'Connect with experts', 'Access 24/7 support'].map((benefit) => (
                <div key={benefit} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 mt-12 lg:mt-1 hidden lg:block">
            <div className="relative w-full h-85">
              <Image
                src="/images/img/1a.png"
                alt="Veterinary Clinic"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-teal-900/50 to-transparent" />
            </div>
          </div>
        </div>

        <div className="flex-1 p-8 lg:p-12 flex items-center justify-center">
          <div className="w-full max-w-3xl">
            {!selectedRole ? (
              <div className="space-y-8 max-w-lg mx-auto">
                <div>
                  <h2 className="text-3xl font-bold text-slate-800 mb-2">Create your account</h2>
                  <p className="text-slate-500">Select your role to get started</p>
                </div>

                <div className="space-y-4">
                  {roles.map((role) => {
                    const Icon = role.icon
                    const isHovered = hoveredRole === role.id
                    return (
                      <button
                        key={role.id}
                        onClick={() => setSelectedRole(role.id)}
                        onMouseEnter={() => setHoveredRole(role.id)}
                        onMouseLeave={() => setHoveredRole(null)}
                        className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 text-left group relative overflow-hidden ${
                          isHovered
                            ? 'border-teal-400 bg-white shadow-xl shadow-teal-100/50 scale-[1.02]'
                            : 'border-slate-200 bg-white/70 backdrop-blur-sm hover:bg-white'
                        }`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-r ${role.gradient} opacity-0 transition-opacity duration-300 ${isHovered ? 'opacity-5' : ''}`} />

                        <div className="relative flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center shadow-lg flex-shrink-0 transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-slate-800">{role.title}</h3>
                            <p className="text-sm text-slate-500 mt-0.5">{role.description}</p>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {role.benefits.map((b) => (
                                <span key={b} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                                  {b}
                                </span>
                              ))}
                            </div>
                          </div>
                          <ArrowRight className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-all duration-300 ${isHovered ? 'translate-x-1 text-teal-500' : ''}`} />
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div className="text-center pt-4 border-t border-slate-200">
                  <p className="text-slate-500">
                    Already have an account?{' '}
                    <Link href="/" className="text-teal-600 font-semibold hover:text-teal-700 transition-colors">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <button
                  onClick={() => {
                    setSelectedRole(null)
                    resetVetForm()
                  }}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  <span className="text-sm font-medium">Back to roles</span>
                </button>

                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 max-h-[85vh] overflow-y-auto">
                  <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                    {(() => {
                      const role = roles.find((r) => r.id === selectedRole)
                      if (!role) return null
                      const Icon = role.icon
                      return (
                        <>
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center shadow-lg`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-800">Register as {role.title}</h3>
                            <p className="text-sm text-slate-500">
                              {selectedRole === 'veterinarian' ? 'Set up your professional profile' : 'Fill in your account details'}
                            </p>
                          </div>
                        </>
                      )
                    })()}
                  </div>

                  <form onSubmit={handleRegister} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-sm font-medium text-slate-700">Full Name *</Label>
                        <Input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          placeholder="John Doe"
                          className="mt-1.5 h-11 rounded-xl border-slate-200 focus:border-teal-400 focus:ring-teal-400"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-sm font-medium text-slate-700">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          placeholder="10-digit number"
                          inputMode="numeric"
                          maxLength={10}
                          pattern="[0-9]{10}"
                          className="mt-1.5 h-11 rounded-xl border-slate-200 focus:border-teal-400 focus:ring-teal-400"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="you@example.com"
                        className="mt-1.5 h-11 rounded-xl border-slate-200 focus:border-teal-400 focus:ring-teal-400"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          placeholder="Min 6 characters"
                          className="mt-1.5 h-11 rounded-xl border-slate-200 focus:border-teal-400 focus:ring-teal-400"
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">Confirm Password *</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          placeholder="Repeat password"
                          className="mt-1.5 h-11 rounded-xl border-slate-200 focus:border-teal-400 focus:ring-teal-400"
                        />
                      </div>
                    </div>

                    {selectedRole === 'veterinarian' && (
                      <section className="rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4 md:p-5 space-y-4">
                        <div>
                          <h4 className="text-base font-semibold text-slate-800">Veterinary Profile</h4>
                          <p className="text-xs text-slate-500">These details will be shown in pet owner vet directory.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-slate-700">Specialty *</Label>
                            <Input
                              value={vetForm.specialty}
                              onChange={(e) => setVetForm((prev) => ({ ...prev, specialty: e.target.value }))}
                              placeholder="Small Animal Medicine"
                              className="mt-1.5 h-11 rounded-xl border-slate-200"
                              required
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-700">Experience (Years)</Label>
                            <Input
                              type="number"
                              min={0}
                              value={vetForm.experienceYears}
                              onChange={(e) => setVetForm((prev) => ({ ...prev, experienceYears: e.target.value }))}
                              placeholder="5"
                              className="mt-1.5 h-11 rounded-xl border-slate-200"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-700">Clinic Name</Label>
                            <Input
                              value={vetForm.clinicName}
                              onChange={(e) => setVetForm((prev) => ({ ...prev, clinicName: e.target.value }))}
                              placeholder="Healthy Paws Clinic"
                              className="mt-1.5 h-11 rounded-xl border-slate-200"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-700">City</Label>
                            <Input
                              value={vetForm.city}
                              onChange={(e) => setVetForm((prev) => ({ ...prev, city: e.target.value }))}
                              placeholder="Noida"
                              className="mt-1.5 h-11 rounded-xl border-slate-200"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-700">Consultation Fee (INR)</Label>
                            <Input
                              type="number"
                              min={0}
                              step="1"
                              value={vetForm.consultationFee}
                              onChange={(e) => setVetForm((prev) => ({ ...prev, consultationFee: e.target.value }))}
                              placeholder="500"
                              className="mt-1.5 h-11 rounded-xl border-slate-200"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-700">Availability</Label>
                            <select
                              value={vetForm.availability}
                              onChange={(e) =>
                                setVetForm((prev) => ({
                                  ...prev,
                                  availability: e.target.value as VetRegistrationForm['availability'],
                                }))
                              }
                              className="mt-1.5 w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm"
                            >
                              <option value="Available">Available</option>
                              <option value="Busy">Busy</option>
                              <option value="On Leave">On Leave</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-slate-700">Clinic Address</Label>
                          <Input
                            value={vetForm.clinicAddress}
                            onChange={(e) => setVetForm((prev) => ({ ...prev, clinicAddress: e.target.value }))}
                            placeholder="Sector 18, Noida"
                            className="mt-1.5 h-11 rounded-xl border-slate-200"
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-slate-700">Profile Description</Label>
                          <Textarea
                            value={vetForm.description}
                            onChange={(e) => setVetForm((prev) => ({ ...prev, description: e.target.value }))}
                            placeholder="Add consultation style, services, and expertise"
                            className="mt-1.5 min-h-24 rounded-xl border-slate-200"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-4 items-start">
                          <div>
                            <Label htmlFor="vet-image" className="text-sm font-medium text-slate-700">Profile Photo</Label>
                            <Input
                              id="vet-image"
                              type="file"
                              accept="image/*"
                              onChange={(e) => setVetImageFile(e.target.files?.[0] || null)}
                              className="mt-1.5"
                            />
                            <p className="text-xs text-slate-500 mt-1">JPG/PNG up to 5MB. You can change or remove anytime before submit.</p>
                          </div>

                          <div className="rounded-xl border border-slate-200 bg-white p-3">
                            <p className="text-xs text-slate-500 mb-2">Image Preview</p>
                            <div className="relative w-full h-36 rounded-lg overflow-hidden bg-slate-100">
                              {vetImagePreview ? (
                                <Image src={vetImagePreview} alt="Vet preview" fill className="object-cover" />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                  <Upload className="w-5 h-5 mb-2" />
                                  <span className="text-xs">No photo selected</span>
                                </div>
                              )}
                            </div>
                            {vetImageFile && (
                              <Button
                                type="button"
                                variant="outline"
                                className="mt-2 w-full bg-transparent"
                                onClick={() => setVetImageFile(null)}
                              >
                                <X className="mr-2 h-4 w-4" /> Remove
                              </Button>
                            )}
                          </div>
                        </div>
                      </section>
                    )}

                    <div className="flex items-start gap-2 pt-1">
                      <input type="checkbox" id="terms" required className="mt-1 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                      <label htmlFor="terms" className="text-sm text-slate-500">
                        I agree to the <Link href="#" className="text-teal-600 hover:underline">Terms of Service</Link> and <Link href="#" className="text-teal-600 hover:underline">Privacy Policy</Link>
                      </label>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-11 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-teal-200/50 transition-all hover:shadow-xl"
                    >
                      {isSubmitting ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" /> Creating account...
                        </span>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </form>
                </div>

                <p className="text-center text-slate-500">
                  Already have an account?{' '}
                  <Link href="/" className="text-teal-600 font-semibold hover:text-teal-700 transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
