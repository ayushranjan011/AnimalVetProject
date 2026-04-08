'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

declare global {
  interface Window {
    ZegoUIKitPrebuilt: any
  }
}

interface VideoCallProps {
  roomID: string
  userID?: string
  userName?: string
  onLeave?: () => void
}

let sdkLoadTimeout: NodeJS.Timeout | null = null

export default function VideoCall({ 
  roomID, 
  userID = `user_${Math.floor(Math.random() * 10000)}`,
  userName = `User_${Math.floor(Math.random() * 10000)}`,
  onLeave
}: VideoCallProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMicOn, setIsMicOn] = useState(true)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const zpRef = useRef<any>(null)
  const initializeAttemptRef = useRef(0)

  useEffect(() => {
    initializeAttemptRef.current = 0

    const loadSDK = () => {
      // Load Zegocloud SDK if not already loaded
      if (window.ZegoUIKitPrebuilt) {
        setIsLoading(false)
        initializeCall()
        return
      }

      // Create and load script
      if (document.getElementById('zego-sdk-script')) {
        return
      }

      const script = document.createElement('script')
      script.id = 'zego-sdk-script'
      script.src = 'https://unpkg.com/@zegocloud/zego-uikit-prebuilt/zego-uikit-prebuilt.js'
      script.async = true
      script.defer = true

      script.onload = () => {
        setTimeout(() => {
          if (window.ZegoUIKitPrebuilt) {
            setIsLoading(false)
            initializeCall()
          } else {
            setError('SDK loaded but initialization failed. Please refresh.')
            setIsLoading(false)
          }
        }, 500)
      }

      script.onerror = () => {
        setError('Failed to load video call SDK. Please check your connection.')
        setIsLoading(false)
      }

      document.body.appendChild(script)

      if (sdkLoadTimeout) clearTimeout(sdkLoadTimeout)
      sdkLoadTimeout = setTimeout(() => {
        if (!window.ZegoUIKitPrebuilt) {
          setError('SDK load timeout. Please refresh the page.')
          setIsLoading(false)
        }
      }, 15000)
    }

    loadSDK()

    return () => {
      if (sdkLoadTimeout) clearTimeout(sdkLoadTimeout)
      if (zpRef.current) {
        try {
          zpRef.current.destroy?.()
        } catch (e) {
          console.error('Error destroying video call:', e)
        }
      }
    }
  }, [roomID, userID, userName])

  const initializeCall = async () => {
    if (!containerRef.current || !window.ZegoUIKitPrebuilt) {
      if (initializeAttemptRef.current < 3) {
        initializeAttemptRef.current++
        setTimeout(initializeCall, 500)
      }
      return
    }

    try {
      const appID = 619251060
      const serverSecret = 'c6485f29754e29441f94a972cd7a2663'
      
      console.log('[VideoCall] Initializing with AppID:', appID)
      console.log('[VideoCall] RoomID:', roomID)
      console.log('[VideoCall] UserID:', userID)

      if (!roomID || !userID) {
        throw new Error('Invalid room or user information')
      }

      if (!appID || !serverSecret) {
        throw new Error('Video call configuration is missing')
      }

      console.log('[VideoCall] Generating token...')
      let kitToken
      
      try {
        kitToken = window.ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID,
          serverSecret,
          String(roomID),
          String(userID),
          String(userName)
        )
      } catch (tokenError) {
        console.error('[VideoCall] Token generation error:', tokenError)
        throw new Error('Failed to generate authentication token')
      }

      if (!kitToken) {
        throw new Error('Token generation returned empty result')
      }

      console.log('[VideoCall] Token generated successfully')

      console.log('[VideoCall] Creating Zego instance...')
      let zp
      
      try {
        zp = window.ZegoUIKitPrebuilt.create(kitToken)
      } catch (createError) {
        console.error('[VideoCall] Create instance error:', createError)
        throw new Error('Failed to create video call instance')
      }

      console.log('[VideoCall] Zego instance created, joining room...')
      zpRef.current = zp

      zp.joinRoom({
        container: containerRef.current,
        sharedLinks: [
          {
            name: 'Share this link',
            url: `${window.location.protocol}//${window.location.host}/user/video-call?roomID=${roomID}`,
          },
        ],
        scenario: {
          mode: window.ZegoUIKitPrebuilt.VideoConference,
        },
        turnOnMicrophoneWhenJoining: false,
        turnOnCameraWhenJoining: false,
        showMyCameraToggleButton: true,
        showMyMicrophoneToggleButton: true,
        showAudioVideoSettingsButton: true,
        showScreenSharingButton: true,
        showTextChat: true,
        showUserList: true,
        maxUsers: 2,
        layout: 'Auto',
        showLayoutButton: false,
        onJoinRoom: () => {
          console.log('[VideoCall] Successfully joined room')
          setError(null)
          setIsCallActive(true)
        },
        onLeaveRoom: () => {
          console.log('[VideoCall] Left room')
          setError(null)
          setIsCallActive(false)
          onLeave?.()
        },
        onError: (error: any) => {
          const errorMsg = error?.message || error?.toString?.() || 'Unknown error'
          console.error('[VideoCall] Room error:', errorMsg, error)
          setError(`Video call error: ${errorMsg}`)
        },
      })

      console.log('[VideoCall] Room join request sent')
    } catch (error: any) {
      const errorMsg = error?.message || String(error)
      console.error('[VideoCall] Initialization error:', errorMsg, error)
      
      if (retryCount < 2) {
        console.log(`[VideoCall] Retrying... (attempt ${retryCount + 1}/2)`)
        setRetryCount(retryCount + 1)
        setTimeout(() => initializeCall(), 2000)
      } else {
        setError(`Video call initialization failed: ${errorMsg}. Please refresh and try again.`)
      }
    }
  }

  const handleRetry = () => {
    setError(null)
    setRetryCount(0)
    initializeAttemptRef.current = 0
    initializeCall()
  }

  const handleLeaveCall = () => {
    if (zpRef.current) {
      zpRef.current.destroy()
    }
    setIsCallActive(false)
    onLeave?.()
  }

  return (
    <div className="w-full h-screen bg-black relative">
      {/* Error Display */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/70">
          <div className="bg-red-900/80 backdrop-blur-sm border border-red-600 rounded-lg p-6 max-w-md text-center">
            <p className="text-white font-semibold mb-4">Video Call Error</p>
            <p className="text-red-100 text-sm mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition"
              >
                Retry
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-white">Initializing video call...</p>
          </div>
        </div>
      )}

      {/* Video Container */}
      <div
        ref={containerRef}
        className="w-full h-full"
      />

      {/* Control Bar - Floating at bottom */}
      {isCallActive && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4 z-50">
          <Button
            size="icon"
            variant={isMicOn ? 'default' : 'destructive'}
            onClick={() => setIsMicOn(!isMicOn)}
            className="rounded-full w-12 h-12"
          >
            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>

          <Button
            size="icon"
            variant={isCameraOn ? 'default' : 'destructive'}
            onClick={() => setIsCameraOn(!isCameraOn)}
            className="rounded-full w-12 h-12"
          >
            {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>

          <Button
            size="icon"
            variant="destructive"
            onClick={handleLeaveCall}
            className="rounded-full w-12 h-12"
          >
            <PhoneOff className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  )
}
