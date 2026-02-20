'use client'

import { useEffect, useRef } from 'react'

export default function BotpressChatbot() {
  const scriptLoaded = useRef(false)

  useEffect(() => {
    // Only load script once
    if (scriptLoaded.current) {
      if (window.botpress) {
        window.botpress.open?.()
      }
      return
    }

    // Add the Botpress webchat container
    const container = document.getElementById('webchat-botpress')
    if (!container) {
      console.error('Webchat container not found')
      return
    }

    // Load Botpress script
    const script = document.createElement('script')
    script.src = 'https://cdn.botpress.cloud/webchat/v3.5/inject.js'
    script.async = true
    script.onload = () => {
      // Initialize Botpress after script loads
      if (window.botpress) {
        window.botpress.on('webchat:ready', () => {
          window.botpress.open?.()
        })

        window.botpress.init({
          botId: '30b345cf-8ac5-4a2e-a681-75e03491c5f8',
          configuration: {
            version: 'v2',
            botName: 'Pet Care Assistant',
            botDescription: 'Your AI assistant for pet care guidance',
            botAvatar: undefined,
            botAvatarUrl: undefined,
            color: '#67ad79',
            toggleButtonStyle: 'light',
            fontFamily: 'inter',
            borderRadius: 6,
            closeButtonStyle: 'light',
            enableTranscriptDownload: false,
            theme: 'light',
            themeMode: 'light',
            primaryColor: '#67ad79',
            backgroundColor: '#FFFFFF',
            textColor: '#000000',
            chat: {
              enabled: true,
              inputs: {
                enabled: true,
              },
            },
            soundEnabled: false,
            proactiveMessageEnabled: false,
          },
          clientId: '33efe5e8-e337-409b-beea-8d1e317722e3',
          selector: '#webchat-botpress',
        })

        scriptLoaded.current = true
      }
    }

    script.onerror = () => {
      console.error('Failed to load Botpress script')
    }

    document.head.appendChild(script)

    return () => {
      // Cleanup: Remove script if component unmounts
      if (script.parentNode) {
        script.parentNode.removeChild(script)
        scriptLoaded.current = false
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Pet Care Assistant</h2>
          <p className="text-sm text-slate-500">Ask our AI chatbot anything about your pet's health and care</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 overflow-hidden shadow-lg">
        <div className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
          <p className="text-sm text-slate-600">
            💬 Chat with our AI-powered Pet Care Assistant. Get instant answers about:
          </p>
          <ul className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
            <li className="text-sm text-slate-600">✓ Pet health and wellness</li>
            <li className="text-sm text-slate-600">✓ Emergency guidance</li>
            <li className="text-sm text-slate-600">✓ Medication information</li>
            <li className="text-sm text-slate-600">✓ General pet care tips</li>
          </ul>
        </div>

        {/* Botpress Webchat Container */}
        <div
          id="webchat-botpress"
          style={{
            width: '100%',
            height: '600px',
            minHeight: '600px',
            display: 'flex',
            flexDirection: 'column',
          }}
        />
      </div>

      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>⚠️ Note:</strong> For emergency situations, please contact your veterinarian immediately or call emergency services.
        </p>
      </div>
    </div>
  )
}

// Extend window type to include botpress
declare global {
  interface Window {
    botpress?: {
      on: (event: string, callback: () => void) => void
      init: (config: any) => void
      open?: () => void
      close?: () => void
    }
  }
}
