import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, PawPrint, Shield, Syringe, Stethoscope, User, AlertTriangle } from 'lucide-react'
import { verifyPetPassportToken } from '@/lib/pet-passport-share'

type SharedPetPassportPageProps = {
  searchParams: Promise<{ token?: string }>
}

export default async function SharedPetPassportPage({ searchParams }: SharedPetPassportPageProps) {
  const params = await searchParams
  const token = params?.token || ''
  const verificationResult = token ? verifyPetPassportToken(token) : { valid: false as const }

  if (!verificationResult.valid) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/40 to-cyan-50/50 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200 bg-white/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Invalid or Expired QR Link
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              The shared pet passport link is invalid, tampered, or expired. Ask the pet owner to generate and share a fresh QR link.
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  const payload = verificationResult.payload

  const medicalHistory = Array.isArray(payload.medicalHistory) ? payload.medicalHistory : []
  const vaccinations = Array.isArray(payload.vaccinations) ? payload.vaccinations : []
  const treatments = Array.isArray(payload.treatments) ? payload.treatments : []

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/40 to-cyan-50/50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="p-6 rounded-2xl bg-white/90 border border-teal-100 shadow-sm">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2">
            <PawPrint className="h-7 w-7 text-teal-600" />
            Shared Pet Passport
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            This passport was shared by the pet owner for consultation and care.
          </p>
          {payload.generatedAt && (
            <p className="text-xs text-slate-400 mt-2">
              Generated: {new Date(payload.generatedAt).toLocaleString()}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 border-teal-100 bg-white/90">
            <CardContent className="p-5">
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-100 mb-4">
                <Image
                  src={payload.petImage || '/images/pet-dog-1.jpg'}
                  alt={payload.petName || 'Pet image'}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><PawPrint className="h-4 w-4 text-teal-600" /><span className="font-medium">Name:</span> <span>{payload.petName || 'N/A'}</span></div>
                <div><span className="font-medium">Passport ID:</span> {payload.petId || 'N/A'}</div>
                <div><span className="font-medium">Type:</span> {payload.petType || 'N/A'}</div>
                <div><span className="font-medium">Breed:</span> {payload.breed || 'N/A'}</div>
                <div><span className="font-medium">Age:</span> {payload.age || 'N/A'}</div>
                <div className="flex items-center gap-2"><User className="h-4 w-4 text-teal-600" /><span className="font-medium">Owner:</span> <span>{payload.owner || 'N/A'}</span></div>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card className="border-emerald-100 bg-white/90">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800"><Shield className="h-5 w-5 text-emerald-600" /> Status</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {medicalHistory.length ? medicalHistory.map((item, idx) => (
                  <Badge key={`${item}-${idx}`} className="bg-emerald-100 text-emerald-700 border-0">{item}</Badge>
                )) : <p className="text-sm text-slate-500">No status records provided.</p>}
              </CardContent>
            </Card>

            <Card className="border-blue-100 bg-white/90">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800"><Syringe className="h-5 w-5 text-blue-600" /> Vaccinations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {vaccinations.length ? vaccinations.map((vac, idx) => (
                  <div key={`${vac.name || 'vac'}-${idx}`} className="p-3 rounded-xl bg-blue-50 flex justify-between items-center text-sm">
                    <span className="font-medium text-slate-800">{vac.name || 'Unnamed vaccine'}</span>
                    <span className="text-slate-500 flex items-center gap-1"><Calendar className="h-3 w-3" /> {vac.date || 'Date unavailable'}</span>
                  </div>
                )) : <p className="text-sm text-slate-500">No vaccination records provided.</p>}
              </CardContent>
            </Card>

            <Card className="border-violet-100 bg-white/90">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800"><Stethoscope className="h-5 w-5 text-violet-600" /> Treatment History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {treatments.length ? treatments.map((item, idx) => (
                  <div key={`${item.date || 'treat'}-${idx}`} className="p-3 rounded-xl bg-violet-50 text-sm">
                    <p className="text-violet-700 flex items-center gap-1 mb-1"><Calendar className="h-3 w-3" /> {item.date || 'Date unavailable'}</p>
                    <p className="text-slate-700">{item.description || 'No details available.'}</p>
                  </div>
                )) : <p className="text-sm text-slate-500">No treatment history provided.</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
