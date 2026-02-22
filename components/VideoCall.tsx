'use client'

import { useEffect, useRef } from 'react'

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
        onLeaveRoom: () => onLeave?.(),
      })
    } catch (error) {
      console.error('Failed to initialize video call:', error)
    }
  }

  return (
    <div className="w-full h-screen bg-black relative">
      {/* Video Container */}
      <div
        ref={containerRef}
        className="w-full h-full"
      />
    </div>
  )
}
