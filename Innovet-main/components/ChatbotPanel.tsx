'use client'

import { useState, lazy, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { MessageSquare } from 'lucide-react'

const Webchat = dynamic(() => import('@botpress/webchat').then(mod => ({ default: mod.Webchat })), {
  ssr: false,
})

const clientId = '33efe5e8-e337-409b-beea-8d1e317722e3'

export default function ChatbotPanel() {
  const [isWebchatOpen, setIsWebchatOpen] = useState(false)

  const toggleWebchat = () => {
    setIsWebchatOpen((prevState) => !prevState)
  }

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
          {isWebchatOpen ? (
            <Suspense fallback={<div className="w-full h-96 flex items-center justify-center">Loading chat...</div>}>
              <div style={{ width: '100%', height: '100%', minHeight: '500px' }} suppressHydrationWarning>
                <Webchat clientId={clientId} />
              </div>
            </Suspense>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
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
