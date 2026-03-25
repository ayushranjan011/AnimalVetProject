'use client'

import { useEffect, useRef, useState } from 'react'

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

export default function VideoCall({ 
  roomID, 
  userID = `user_${Math.floor(Math.random() * 10000)}`,
  userName = `User_${Math.floor(Math.random() * 10000)}`,
  onLeave
}: VideoCallProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const zpRef = useRef<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Check for permissions first
    const checkPermissions = async () => {
      try {
        const hasAudio = await navigator.permissions.query({ name: 'microphone' as PermissionName })
        const hasVideo = await navigator.permissions.query({ name: 'camera' as PermissionName })
        
        if (hasAudio?.state === 'denied' || hasVideo?.state === 'denied') {
          setError('Please grant camera and microphone permissions in your browser settings')
          return
        }
      } catch (e) {
        // Permissions API not available, continue anyway
      }
    }

    checkPermissions()

    // Load Zegocloud SDK
    if (!window.ZegoUIKitPrebuilt) {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/@zegocloud/zego-uikit-prebuilt/zego-uikit-prebuilt.js'
      script.onload = () => {
        setIsInitialized(true)
        initializeCall()
      }
      script.onerror = () => {
        setError('Failed to load video call SDK. Please refresh the page.')
      }
      document.body.appendChild(script)
    } else {
      setIsInitialized(true)
      initializeCall()
    }

    return () => {
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
    if (!containerRef.current || !window.ZegoUIKitPrebuilt) return

    try {
      // Get credentials from environment variables
      const appID = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || '619251060')
      const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || 'c6485f29754e29441f94a972cd7a2663'
      
      if (!appID || !serverSecret) {
        setError('Video call configuration is missing. Please contact support.')
        return
      }

      // Validate room ID and user ID
      if (!roomID || !userID) {
        setError('Invalid room or user information')
        return
      }

      // Generate token with error handling
      let kitToken
      try {
        kitToken = window.ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID,
          serverSecret,
          roomID,
          userID,
          userName
        )
      } catch (tokenError) {
        console.error('Token generation error:', tokenError)
        setError('Failed to generate video call token. Please try again.')
        return
      }

      if (!kitToken) {
        setError('Failed to generate authentication token')
        return
      }

      // Create Zego instance with error handling
      let zp
      try {
        zp = window.ZegoUIKitPrebuilt.create(kitToken)
      } catch (createError) {
        console.error('Failed to create Zego instance:', createError)
        setError('Failed to initialize video call. Please refresh and try again.')
        return
      }

      zpRef.current = zp

      // Join room with comprehensive error handling
      try {
        zp.joinRoom({
          container: containerRef.current,
          sharedLinks: [
            {
              name: 'Share this link',
              url:
                `${window.location.protocol}//${window.location.host}/user/video-call?roomID=${roomID}`,
            },
          ],
          scenario: {
            mode: window.ZegoUIKitPrebuilt.VideoConference,
          },
          turnOnMicrophoneWhenJoining: true,
          turnOnCameraWhenJoining: true,
          showMyCameraToggleButton: true,
          showMyMicrophoneToggleButton: true,
          showAudioVideoSettingsButton: true,
          showScreenSharingButton: true,
          showTextChat: true,
          showUserList: true,
          maxUsers: 2,
          layout: 'Auto',
          showLayoutButton: false,
          onLeaveRoom: () => {
            setError(null)
            onLeave?.()
          },
          onError: (error: any) => {
            console.error('Video call error:', error)
            setError(`Video call error: ${error?.message || 'Unknown error'}`)
          },
        })
      } catch (joinError) {
        console.error('Failed to join room:', joinError)
        setError('Failed to join video call. Please check your connection and try again.')
      }
    } catch (error) {
      console.error('Failed to initialize video call:', error)
      setError('An unexpected error occurred. Please refresh the page.')
    }
  }

  return (
    <div className="w-full h-screen bg-black relative">
      {/* Error Display */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/70">
          <div className="bg-red-900/80 backdrop-blur-sm border border-red-600 rounded-lg p-6 max-w-md text-center">
            <p className="text-white font-semibold mb-4">Video Call Error</p>
            <p className="text-red-100 text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {!isInitialized && !error && (
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
    </div>
  )
}
