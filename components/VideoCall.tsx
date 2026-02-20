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
  const zpRef = useRef<any>(null)

  useEffect(() => {
    // Load Zegocloud SDK
    if (!window.ZegoUIKitPrebuilt) {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/@zegocloud/zego-uikit-prebuilt/zego-uikit-prebuilt.js'
      script.onload = initializeCall
      document.body.appendChild(script)
    } else {
      initializeCall()
    }

    return () => {
      if (zpRef.current) {
        zpRef.current.destroy?.()
      }
    }
  }, [roomID, userID, userName])

  const initializeCall = async () => {
    if (!containerRef.current || !window.ZegoUIKitPrebuilt) return

    try {
      const appID = 619251060
      const serverSecret = 'c6485f29754e29441f94a972cd7a2663'
      
      // Generate token
      const kitToken = window.ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomID,
        userID,
        userName
      )

      // Create Zego instance
      const zp = window.ZegoUIKitPrebuilt.create(kitToken)
      zpRef.current = zp

      // Join room
      zp.joinRoom({
        container: containerRef.current,
        sharedLinks: [
          {
            name: 'Share this link',
            url:
              `${window.location.protocol}//${window.location.host}/video-call?roomID=${roomID}`,
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
      })

      setIsCallActive(true)
    } catch (error) {
      console.error('Failed to initialize video call:', error)
    }
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
