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

let sdkLoadTimeout: NodeJS.Timeout | null = null

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
  const [retryCount, setRetryCount] = useState(0)
  const initializeAttemptRef = useRef(0)

  useEffect(() => {
    // Reset on mount
    initializeAttemptRef.current = 0

    const loadSDK = () => {
      // Load Zegocloud SDK if not already loaded
      if (window.ZegoUIKitPrebuilt) {
        // SDK already loaded
        setIsInitialized(true)
        initializeCall()
        return
      }

      // Create and load script
      if (document.getElementById('zego-sdk-script')) {
        // Script already loading
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
            setIsInitialized(true)
            initializeCall()
          } else {
            setError('SDK loaded but initialization failed. Please refresh.')
          }
        }, 500) // Wait for SDK to be fully processed
      }

      script.onerror = () => {
        setError('Failed to load video call SDK. Please check your connection.')
      }

      document.body.appendChild(script)

      // Set timeout for SDK load
      if (sdkLoadTimeout) clearTimeout(sdkLoadTimeout)
      sdkLoadTimeout = setTimeout(() => {
        if (!window.ZegoUIKitPrebuilt) {
          setError('SDK load timeout. Please refresh the page.')
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
      // Get credentials
      const appID = 619251060 // Use hardcoded for reliability, can fallback to env
      const serverSecret = 'c6485f29754e29441f94a972cd7a2663' // Use hardcoded for reliability
      
      console.log('[VideoCall] Initializing with AppID:', appID)
      console.log('[VideoCall] RoomID:', roomID)
      console.log('[VideoCall] UserID:', userID)
      console.log('[VideoCall] UserName:', userName)

      // Validate parameters
      if (!roomID || !userID) {
        throw new Error('Invalid room or user information')
      }

      if (!appID || !serverSecret) {
        throw new Error('Video call configuration is missing')
      }

      // Generate token
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

      console.log('[VideoCall] Token generated successfully, length:', kitToken.length)

      // Create Zego instance
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

      // Join room
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
        turnOnMicrophoneWhenJoining: false, // Changed to false for initial stability
        turnOnCameraWhenJoining: false, // Changed to false for initial stability
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
        },
        onLeaveRoom: () => {
          console.log('[VideoCall] Left room')
          setError(null)
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
      
      // Retry logic
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

  return (
    <div className="w-full h-screen bg-black relative">
      {/* Error Display */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/70">
          <div className="bg-red-900/80 backdrop-blur-sm border border-red-600 rounded-lg p-6 max-w-md text-center">
            <p className="text-white font-semibold mb-4">Video Call Error</p>
            <p className="text-red-100 text-sm mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
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
      {!isInitialized && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-white">Initializing video call...</p>
            {retryCount > 0 && <p className="text-yellow-400 text-sm mt-2">Attempt {retryCount + 1} of 3</p>}
          </div>
        </div>
      )}

      {/* Video Container */}
      <div
        ref={containerRef}
        className="w-full h-full"
      />
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
