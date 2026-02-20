'use client'

import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { QrCode, Shield, Syringe, Stethoscope, Calendar, User, PawPrint } from 'lucide-react'

interface PetPassportProps {
  petId: string
  petName: string
  petType: string
  breed: string
  age: string
  owner: string
  medicalHistory: string[]
  vaccinations: { name: string; date: string }[]
  treatments: { date: string; description: string }[]
  open: boolean
  onOpenChange: (open: boolean) => void
  petImage?: string
}

export function PetPassport({
  petId,
  petName,
  petType,
  breed,
  age,
  owner,
  medicalHistory,
  vaccinations,
  treatments,
  open,
  onOpenChange,
  petImage,
}: PetPassportProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-teal-50/30 to-cyan-50/40 border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <QrCode className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Pet Passport
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Pet Photo & QR Code Section */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 p-6 rounded-2xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-200/50">
            {petImage && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full blur-xl opacity-30" />
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl">
                  <Image
                    src={petImage || "/placeholder.svg"}
                    alt={petName}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
            <div className="text-center">
              <div className="w-28 h-28 bg-white rounded-2xl flex items-center justify-center shadow-lg border-2 border-teal-100 mb-3">
                <QrCode className="h-20 w-20 text-teal-600" />
              </div>
              <p className="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {petId}
              </p>
            </div>
          </div>

          {/* Pet Details */}
          <div className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                <PawPrint className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800">Pet Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50">
                <p className="text-xs text-slate-500 mb-1">Name</p>
                <p className="font-semibold text-slate-800">{petName}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50">
                <p className="text-xs text-slate-500 mb-1">Type</p>
                <p className="font-semibold text-slate-800">{petType}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50">
                <p className="text-xs text-slate-500 mb-1">Breed</p>
                <p className="font-semibold text-slate-800">{breed}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50">
                <p className="text-xs text-slate-500 mb-1">Age</p>
                <p className="font-semibold text-slate-800">{age}</p>
              </div>
              <div className="col-span-2 p-3 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50 flex items-center gap-2">
                <User className="w-4 h-4 text-teal-600" />
                <div>
                  <p className="text-xs text-slate-500">Owner</p>
                  <p className="font-semibold text-slate-800">{owner}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Medical History */}
          <div className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800">Status</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {medicalHistory.map((item, index) => (
                <Badge 
                  key={index} 
                  className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-0 px-3 py-1"
                >
                  {item}
                </Badge>
              ))}
            </div>
          </div>

          {/* Vaccinations */}
          <div className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <Syringe className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800">Vaccinations</h3>
            </div>
            <div className="space-y-2">
              {vaccinations.map((vac, index) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50"
                >
                  <span className="font-medium text-slate-800">{vac.name}</span>
                  <span className="text-sm text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {vac.date}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Treatment History */}
          <div className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800">Treatment History</h3>
            </div>
            <div className="space-y-3">
              {treatments.map((treatment, index) => (
                <div key={index} className="p-3 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50">
                  <p className="text-xs text-violet-600 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {treatment.date}
                  </p>
                  <p className="text-sm text-slate-700">{treatment.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
