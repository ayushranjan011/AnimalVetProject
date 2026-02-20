'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertTriangle, Phone, MapPin, CheckCircle, Siren } from 'lucide-react'

export function EmergencySOS() {
  const [showDialog, setShowDialog] = useState(false)

  const triggerSOS = () => {
    setShowDialog(true)
  }

  return (
    <>
      {/* SOS Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="absolute inset-0 bg-rose-500 rounded-full animate-ping opacity-50" />
        <div className="absolute inset-[-8px] bg-rose-400/30 rounded-full animate-pulse" />
        <Button
          onClick={triggerSOS}
          className="relative h-16 w-16 rounded-full bg-gradient-to-br from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-2xl shadow-rose-500/50 transition-all hover:scale-110 border-4 border-white"
          size="icon"
        >
          <Siren className="h-7 w-7 text-white" />
          <span className="sr-only">Emergency SOS</span>
        </Button>
      </div>

      {/* SOS Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md bg-gradient-to-br from-white via-rose-50/50 to-pink-50/50 border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg animate-pulse">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-rose-600">Emergency SOS</span>
                <p className="text-sm font-normal text-slate-500">Alert has been activated</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* Status Banner */}
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Alert Sent Successfully</p>
                <p className="text-sm text-emerald-100">3 responders have been notified</p>
              </div>
            </div>

            {/* Location Card */}
            <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-rose-100 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-md">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Location Shared</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Your GPS coordinates have been shared with emergency responders
                  </p>
                </div>
              </div>
            </div>

            {/* Emergency Contact Card */}
            <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-rose-100 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Emergency Helpline</p>
                  <p className="text-lg font-bold text-emerald-600 mt-1">+1 (555) 0123-4567</p>
                </div>
              </div>
            </div>

            {/* Responders */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-2 w-2 bg-amber-500 rounded-full animate-pulse" />
                <p className="text-sm font-medium text-amber-700">Nearest responders are on their way</p>
              </div>
              <div className="flex -space-x-2">
                {['V', 'N', 'E'].map((letter, i) => (
                  <div 
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold border-2 border-white shadow"
                  >
                    {letter}
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold border-2 border-white">
                  +2
                </div>
              </div>
            </div>

            <Button
              onClick={() => setShowDialog(false)}
              className="w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white shadow-lg"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
