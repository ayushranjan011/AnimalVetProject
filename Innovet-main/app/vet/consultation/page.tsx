'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import VideoCall from '@/components/VideoCall'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function VetConsultationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading } = useAuth()
  const [roomID, setRoomID] = useState<string>('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Get room ID from URL or generate new one
    const queryRoomID = searchParams.get('roomID')
    if (queryRoomID) {
      setRoomID(queryRoomID)
    } else {
      // Generate random room ID
      setRoomID(`vet_consultation_${Date.now()}_${Math.floor(Math.random() * 10000)}`)
    }
  }, [searchParams])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (!mounted || isLoading || !user) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p className="mb-4">Loading video consultation...</p>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.back()}
        className="absolute top-4 left-4 z-50 bg-black/50 hover:bg-black/70 text-white"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>

      <VideoCall
        roomID={roomID}
        userID={user?.id || `vet_${Date.now()}`}
        userName={user?.user_metadata?.name || 'Veterinarian'}
        onLeave={() => router.push('/vet/dashboard')}
      />
    </div>
  )
}
