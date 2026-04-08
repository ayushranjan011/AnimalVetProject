'use client'

import { useEffect, useState } from 'react'
import { MessageSquare } from 'lucide-react'

const botpressScriptSrc = 'https://cdn.botpress.cloud/webchat/v3.6/inject.js'
const botpressConfigScriptSrc = 'https://files.bpcontent.cloud/2026/04/08/10/20260408105025-9Z5T0TTI.js'
const botpressEmbeddedId = 'bp-embedded-chat'

export default function ChatbotPanel() {
  const [isWebchatOpen, setIsWebchatOpen] = useState(false)

  const toggleWebchat = () => {
    setIsWebchatOpen((prevState) => !prevState)
  }

  useEffect(() => {
    const loadScript = (id: string, src: string, defer?: boolean) =>
      new Promise<void>((resolve, reject) => {
        const existing = document.getElementById(id) as HTMLScriptElement | null
        if (existing) {
          if (existing.dataset.loaded === 'true') {
            resolve()
            return
          }

          existing.addEventListener('load', () => resolve(), { once: true })
          existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true })
          return
        }

        const script = document.createElement('script')
        script.id = id
        script.src = src
        script.async = true
        script.defer = !!defer
        script.addEventListener('load', () => {
          script.dataset.loaded = 'true'
          resolve()
        }, { once: true })
        script.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true })
        document.head.appendChild(script)
      })

    void (async () => {
      try {
        await loadScript('botpress-webchat-script', botpressScriptSrc)
        await loadScript('botpress-webchat-config-script', botpressConfigScriptSrc, true)
      } catch (error) {
        console.error('Botpress load failed:', error)
      }
    })()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">AI Chatbot</h2>
          <p className="text-sm text-slate-500">Chat with our Pet Care Assistant</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 overflow-hidden shadow-lg">
        <div className="p-6 bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-teal-100">
          <p className="text-sm text-slate-600 font-medium">
            💬 Get instant answers about your pet's health, care, and wellness
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="text-xs text-slate-600 bg-white p-2 rounded-lg border border-teal-100">
              ✓ Health Issues
            </div>
            <div className="text-xs text-slate-600 bg-white p-2 rounded-lg border border-teal-100">
              ✓ Care Tips
            </div>
            <div className="text-xs text-slate-600 bg-white p-2 rounded-lg border border-teal-100">
              ✓ Medications
            </div>
            <div className="text-xs text-slate-600 bg-white p-2 rounded-lg border border-teal-100">
              ✓ Emergencies
            </div>
          </div>
        </div>

        <div className="relative min-h-96 bg-white" suppressHydrationWarning>
          <div
            id={botpressEmbeddedId}
            style={{
              width: '100%',
              minHeight: '500px',
              height: '100%',
              opacity: isWebchatOpen ? 1 : 0,
              pointerEvents: isWebchatOpen ? 'auto' : 'none',
              transition: 'opacity 180ms ease',
            }}
            suppressHydrationWarning
          />
          {!isWebchatOpen && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/95 backdrop-blur-sm">
              <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-teal-600" />
              </div>
              <p className="text-slate-600 font-medium">Ready to chat?</p>
              <p className="text-sm text-slate-500 text-center px-4">
                Click the button below to start a conversation with our AI Pet Care Assistant
              </p>
              <button
                onClick={toggleWebchat}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all"
              >
                Open Chat
              </button>
            </div>
          )}
        </div>

        {isWebchatOpen && (
          <div className="p-4 border-t border-slate-200">
            <button
              onClick={toggleWebchat}
              className="w-full px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-all font-medium"
            >
              Close Chat
            </button>
          </div>
        )}
      </div>

      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>⚠️ Note:</strong> For urgent pet emergencies, use the SOS button or contact your vet immediately.
        </p>
      </div>
    </div>
  )
}

declare global {
  interface Window {
    botpress?: {
      on?: (event: string, callback: () => void) => void
      init?: (config: any) => void
      open?: () => void
      close?: () => void
      toggle?: () => void
    }
  }
}
