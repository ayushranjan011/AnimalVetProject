'use client'

import React from "react"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/auth-context'
import { User, Stethoscope, Heart, ArrowRight, CheckCircle2 } from 'lucide-react'

type UserRole = 'user' | 'veterinarian' | 'ngo' | null

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [hoveredRole, setHoveredRole] = useState<UserRole>(null)
  const { signup, logout } = useAuth()
  const router = useRouter()
  const handlePhoneChange = (value: string) => {
    const normalizedPhone = value.replace(/\D/g, '').slice(0, 10)
    setPhone(normalizedPhone)
  }

  const handleRegister = async (e: React.FormEvent) => {
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

    try {
      await signup(email, password, name, selectedRole)
      await logout()
      alert('Registered successfully. Please login to continue.')
      router.push('/')
    } catch (error: any) {
      alert('Registration failed: ' + error.message)
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
      description: 'Manage patients, appointments, and emergency cases',
      icon: Stethoscope,
      gradient: 'from-cyan-400 to-blue-500',
      benefits: ['Manage patients', 'Handle emergencies', 'Collaborate'],
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
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-cyan-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-100/20 rounded-full blur-3xl" />
      </div>

      <div className="relative min-h-screen flex flex-col lg:flex-row">
        {/* Left Panel - Branding */}
        <div className="lg:w-2/5 bg-gradient-to-br from-cyan-600 via-teal-600 to-emerald-700 p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-10 bg-pattern" />
          
          <div className="relative z-10  ">
            {/* Logo */}
            <div className="flex items-center gap-4 mb-2 ">
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

            {/* Main Heading */}
            <div className="mb-2">
              <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 text-balance">
                Join our pet care community
              </h2>
              <p className="text-cyan-100 text-lg leading-relaxed">
                Create your account and connect with thousands of pet lovers, veterinarians, and animal welfare organizations.
              </p>
            </div>

            {/* Benefits List */}
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

          {/* Image */}
          <div className="relative z-10 mt-12 lg:mt-1 hidden lg:block">
            <div className="relative w-full h-85  ">
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

        {/* Right Panel - Content */}
        <div className="flex-1 p-8 lg:p-12 flex items-center justify-center">
          <div className="w-full max-w-lg">
            {!selectedRole ? (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-800 mb-2">Create your account</h2>
                  <p className="text-slate-500">Select your role to get started</p>
                </div>

                {/* Role Selection - Horizontal Tabs Style */}
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

                {/* Login Link */}
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
                {/* Back Button */}
                <button
                  onClick={() => setSelectedRole(null)}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  <span className="text-sm font-medium">Back to roles</span>
                </button>

                {/* Register Form Container */}
                <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                  {/* Role Badge */}
                  <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                    {(() => {
                      const role = roles.find(r => r.id === selectedRole)
                      if (!role) return null
                      const Icon = role.icon
                      return (
                        <>
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center shadow-lg`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-800">Register as {role.title}</h3>
                            <p className="text-sm text-slate-500">Fill in your details</p>
                          </div>
                        </>
                      )
                    })()}
                  </div>

                  {/* Form */}
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
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
                    <div className="grid grid-cols-2 gap-4">
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
                        <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">Confirm *</Label>
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
                    <div className="flex items-start gap-2 pt-2">
                      <input type="checkbox" id="terms" required className="mt-1 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                      <label htmlFor="terms" className="text-sm text-slate-500">
                        I agree to the <Link href="#" className="text-teal-600 hover:underline">Terms of Service</Link> and <Link href="#" className="text-teal-600 hover:underline">Privacy Policy</Link>
                      </label>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-11 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-teal-200/50 transition-all hover:shadow-xl"
                    >
                      Create Account
                    </Button>
                  </form>
                </div>

                {/* Login Link */}
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
