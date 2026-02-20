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
import { User, Stethoscope, Heart, ArrowRight, Shield, Clock, Globe } from 'lucide-react'

type UserRole = 'user' | 'veterinarian' | 'ngo' | null

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [hoveredRole, setHoveredRole] = useState<UserRole>(null)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedRole && email && password) {
      login(email, password, selectedRole)
      if (selectedRole === 'user') {
        router.push('/user/dashboard')
      } else if (selectedRole === 'veterinarian') {
        router.push('/vet/dashboard')
      } else if (selectedRole === 'ngo') {
        router.push('/ngo/dashboard')
      }
    }
  }

  const roles = [
    {
      id: 'user' as const,
      title: 'Pet Owner',
      description: 'Access pet care, vet directory, and training resources',
      icon: User,
      gradient: 'from-teal-400 to-cyan-500',
      stats: '10K+ Users',
    },
    {
      id: 'veterinarian' as const,
      title: 'Veterinarian',
      description: 'Manage patients, appointments, and emergency cases',
      icon: Stethoscope,
      gradient: 'from-cyan-400 to-blue-500',
      stats: '500+ Vets',
    },
    {
      id: 'ngo' as const,
      title: 'NGO',
      description: 'Manage animal rescue, adoption, and volunteer programs',
      icon: Heart,
      gradient: 'from-emerald-400 to-teal-500',
      stats: '200+ NGOs',
    },
  ]

  const features = [
    { icon: Shield, label: 'Secure Platform' },
    { icon: Clock, label: '24/7 Support' },
    { icon: Globe, label: 'Nationwide Network' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/50">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-100/20 rounded-full blur-3xl" />
      </div>

      <div className="relative min-h-screen flex flex-col lg:flex-row">
        {/* Left Panel - Branding */}
        <div className="lg:w-2/5 bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-800 p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          
          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-4 mb-12">
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
                <p className="text-teal-200 text-sm">Healthcare Platform</p>
              </div>
            </div>

            {/* Main Heading */}
            <div className="mb-8">
              <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 text-balance">
                Complete care for every pet
              </h2>
              <p className="text-teal-100 text-lg leading-relaxed">
                Connect with veterinarians, access medical records, and get emergency support all in one place.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <div
                    key={feature.label}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
                  >
                    <Icon className="w-4 h-4 text-teal-200" />
                    <span className="text-sm text-white font-medium">{feature.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Stats */}
          {/* <div className="relative z-10 mt-12 lg:mt-0">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">10K+</p>
                <p className="text-teal-200 text-sm">Pet Owners</p>
              </div>
              <div className="text-center border-x border-white/20">
                <p className="text-3xl font-bold text-white">500+</p>
                <p className="text-teal-200 text-sm">Veterinarians</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">200+</p>
                <p className="text-teal-200 text-sm">NGO Partners</p>
              </div>
            </div>
          </div> */}

          {/* Floating Pet Image */}
          <div className="absolute -right-20 bottom-20 w-64 h-64 rounded-full overflow-hidden opacity-20 hidden lg:block">
            <Image
              src="/images/pet-dog-1.jpg"
              alt=""
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Right Panel - Content */}
        <div className="flex-1 p-8 lg:p-12 flex items-center justify-center">
          <div className="w-full max-w-lg">
            {!selectedRole ? (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome back</h2>
                  <p className="text-slate-500">Choose how you want to continue</p>
                </div>

                {/* Role Selection - Bento Style */}
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
                        className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 text-left group relative overflow-hidden ${
                          isHovered 
                            ? 'border-teal-400 bg-white shadow-xl shadow-teal-100/50 scale-[1.02]' 
                            : 'border-slate-200 bg-white/70 backdrop-blur-sm hover:bg-white'
                        }`}
                      >
                        {/* Gradient Background on Hover */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${role.gradient} opacity-0 transition-opacity duration-300 ${isHovered ? 'opacity-5' : ''}`} />
                        
                        <div className="relative flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center shadow-lg transition-transform duration-300 ${isHovered ? 'scale-110 rotate-3' : ''}`}>
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold text-slate-800">{role.title}</h3>
                              <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
                                {role.stats}
                              </span>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">{role.description}</p>
                          </div>
                          <ArrowRight className={`w-5 h-5 text-slate-400 transition-all duration-300 ${isHovered ? 'translate-x-1 text-teal-500' : ''}`} />
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Register Link */}
                <div className="text-center pt-4 border-t border-slate-200">
                  <p className="text-slate-500">
                    New to INNOVET?{' '}
                    <Link href="/register" className="text-teal-600 font-semibold hover:text-teal-700 transition-colors">
                      Create an account
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

                {/* Login Form Container */}
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
                            <h3 className="text-xl font-bold text-slate-800">Sign in as {role.title}</h3>
                            <p className="text-sm text-slate-500">Enter your credentials</p>
                          </div>
                        </>
                      )
                    })()}
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="you@example.com"
                        className="mt-2 h-12 rounded-xl border-slate-200 focus:border-teal-400 focus:ring-teal-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Enter your password"
                        className="mt-2 h-12 rounded-xl border-slate-200 focus:border-teal-400 focus:ring-teal-400"
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                        <span className="text-slate-600">Remember me</span>
                      </label>
                      <Link href="#" className="text-teal-600 font-medium hover:text-teal-700">
                        Forgot password?
                      </Link>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-teal-200/50 transition-all hover:shadow-xl hover:shadow-teal-200/50"
                    >
                      Sign In
                    </Button>
                  </form>
                </div>

                {/* Register Link */}
                <p className="text-center text-slate-500">
                  New to INNOVET?{' '}
                  <Link href="/register" className="text-teal-600 font-semibold hover:text-teal-700 transition-colors">
                    Create an account
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
