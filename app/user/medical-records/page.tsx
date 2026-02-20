'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import MedicalRecords from '@/components/MedicalRecords'
import { ArrowLeft } from 'lucide-react'

export default function MedicalRecordsPage() {
  const router = useRouter()
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/40 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Please log in to view medical records</p>
          <Button onClick={() => router.push('/login')} className="bg-gradient-to-r from-teal-500 to-cyan-500">
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/40">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-300/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-emerald-300/15 rounded-full blur-3xl" />
      </div>

      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-white/50">
        <div className="flex h-16 items-center gap-4 px-4 md:px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="hover:bg-teal-100/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Medical Records
          </h1>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <MedicalRecords />
        </div>
      </main>
    </div>
  )
}
