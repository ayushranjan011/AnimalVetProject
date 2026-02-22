'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'

export default function AppointmentsPage() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      router.replace('/user/dashboard?section=appointments')
    }
  }, [user, router])

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/40 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Please log in to view appointments</p>
          <Button onClick={() => router.push('/login')} className="bg-gradient-to-r from-teal-500 to-cyan-500">
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/40 flex items-center justify-center">
      <p className="text-slate-600">Opening appointments...</p>
    </div>
  )
}
