'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, Clock, MapPin, Video, AlertCircle, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'

interface Vet {
  name: string
  specialty: string
  image: string
  rating: number
  distance: string
  descriptions: string
}

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  vet: Vet | null
}

type PetPassportOption = {
  id: string
  petId: string
  name: string
}

const isMissingColumnError = (error: any) => {
  const message = String(error?.message || '').toLowerCase()
  const details = String(error?.details || '').toLowerCase()
  return (
    error?.code === 'PGRST204' ||
    error?.code === '42703' ||
    message.includes('could not find') ||
    message.includes('column') ||
    details.includes('column')
  )
}

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
]

const dates = Array.from({ length: 7 }, (_, i) => {
  const date = new Date()
  date.setDate(date.getDate() + i)
  return date
})

export default function BookAppointmentModal({ isOpen, onClose, vet }: BookingModalProps) {
  const { user } = useAuth()
  const [step, setStep] = useState<'type' | 'date-time' | 'details' | 'confirm'>('type')
  const [appointmentType, setAppointmentType] = useState<'Online' | 'In-clinic' | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedPetPassportId, setSelectedPetPassportId] = useState('')
  const [problemDescription, setProblemDescription] = useState('')
  const [petPassports, setPetPassports] = useState<PetPassportOption[]>([])
  const [petPassportsLoading, setPetPassportsLoading] = useState(false)

  useEffect(() => {
    const fetchPetPassports = async () => {
      if (!isOpen || !user?.id) {
        setPetPassports([])
        return
      }

      setPetPassportsLoading(true)
      let query = await supabase
        .from('pets')
        .select('id, pet_id, name')
        .eq('owner_id', user.id)
        .order('name', { ascending: true })

      if (query.error && isMissingColumnError(query.error)) {
        query = await supabase
          .from('pets')
          .select('id, pet_id, name')
          .eq('pet_owner_id', user.id)
          .order('name', { ascending: true })
      }

      setPetPassportsLoading(false)

      if (query.error) {
        setPetPassports([])
        return
      }

      setPetPassports(
        (query.data || []).map((row: any) => ({
          id: String(row.id || ''),
          petId: String(row.pet_id || '').trim(),
          name: String(row.name || '').trim() || 'Unnamed Pet',
        }))
      )
    }

    void fetchPetPassports()
  }, [isOpen, user?.id])

  const handleClose = () => {
    setStep('type')
    setAppointmentType(null)
    setSelectedDate(null)
    setSelectedTime(null)
    setSelectedPetPassportId('')
    setProblemDescription('')
    onClose()
  }

  const handleBooking = () => {
    const selectedPassport = petPassports.find((item) => item.id === selectedPetPassportId)

    // Store appointment data (will be sent to backend later)
    const appointmentData = {
      vetName: vet?.name,
      type: appointmentType,
      date: selectedDate?.toLocaleDateString(),
      time: selectedTime,
      petName: selectedPassport?.name,
      petPassportId: selectedPassport?.petId,
      problemDescription,
      status: 'Pending',
      mode: appointmentType === 'Online' ? 'Online' : 'In-clinic'
    }
    
    console.log('Appointment booked:', appointmentData)
    // TODO: Send to backend API
    handleClose()
  }

  if (!vet) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Appointment with {vet.name}</DialogTitle>
          <DialogDescription>
            {vet.specialty} • Rating: {vet.rating}/5.0
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Appointment Type */}
        {step === 'type' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800">Select Appointment Type</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Online Appointment */}
              <button
                onClick={() => {
                  setAppointmentType('Online')
                  setStep('date-time')
                }}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  appointmentType === 'Online'
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 bg-white hover:border-teal-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Video className="w-6 h-6 text-teal-600" />
                  <h4 className="font-semibold text-slate-800">Online Consultation</h4>
                </div>
                <p className="text-sm text-slate-600 mb-3">Video call with the veterinarian</p>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li>✓ Real-time video consultation</li>
                  <li>✓ Share pet photos/videos</li>
                  <li>✓ Prescription delivery</li>
                </ul>
              </button>

              {/* In-Clinic Appointment */}
              <button
                onClick={() => {
                  setAppointmentType('In-clinic')
                  setStep('date-time')
                }}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  appointmentType === 'In-clinic'
                    ? 'border-cyan-500 bg-cyan-50'
                    : 'border-gray-200 bg-white hover:border-cyan-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <MapPin className="w-6 h-6 text-cyan-600" />
                  <h4 className="font-semibold text-slate-800">In-Clinic Visit</h4>
                </div>
                <p className="text-sm text-slate-600 mb-3">Physical visit to the clinic</p>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li>✓ Physical examination</li>
                  <li>✓ Lab tests available</li>
                  <li>✓ Direct treatment</li>
                </ul>
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Step 2: Date & Time Selection */}
        {step === 'date-time' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800">Select Date & Time</h3>

            {/* Date Selection */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-3 block">Choose Date</label>
              <div className="grid grid-cols-4 gap-2">
                {dates.map((date, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(date)}
                    className={`p-3 rounded-lg border transition-all text-center ${
                      selectedDate?.toDateString() === date.toDateString()
                        ? 'border-teal-500 bg-teal-100 text-teal-900'
                        : 'border-gray-200 hover:border-teal-300'
                    }`}
                  >
                    <div className="text-xs font-semibold">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                    <div className="text-sm">{date.getDate()}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div>
                <label className="text-sm font-medium text-slate-700 mb-3 block">Choose Time</label>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-2 rounded-lg border transition-all text-sm ${
                        selectedTime === time
                          ? 'border-teal-500 bg-teal-100 text-teal-900 font-semibold'
                          : 'border-gray-200 hover:border-teal-300'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep('type')}>Back</Button>
              <Button
                onClick={() => setStep('details')}
                disabled={!selectedDate || !selectedTime}
                className="bg-teal-500 hover:bg-teal-600"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Appointment Details */}
        {step === 'details' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800">Appointment Details</h3>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Pet Passport *</label>
              <select
                value={selectedPetPassportId}
                onChange={(e) => setSelectedPetPassportId(e.target.value)}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
                disabled={petPassportsLoading}
              >
                <option value="">
                  {petPassportsLoading
                    ? 'Loading pet passports...'
                    : petPassports.length
                    ? 'Select pet passport'
                    : 'No pet passport found. Add pet profile first.'}
                </option>
                {petPassports.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}{item.petId ? ` (Passport: ${item.petId})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Problem Description *</label>
              <Textarea
                placeholder="Describe your pet's issue or symptoms..."
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                rows={4}
                className="border-gray-300"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Appointment Info</p>
                <p>After booking, the veterinarian will review your request and confirm the appointment time. You'll receive a confirmation notification.</p>
              </div>
            </div>

            <div className="flex justify-between gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep('date-time')}>Back</Button>
              <Button
                onClick={() => setStep('confirm')}
                disabled={!selectedPetPassportId || !problemDescription.trim()}
                className="bg-teal-500 hover:bg-teal-600"
              >
                Review Booking
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>

            <h3 className="font-semibold text-slate-800 text-center">Confirm Your Booking</h3>

            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <span className="text-slate-600">Doctor:</span>
                <span className="font-semibold text-slate-800">{vet.name}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-slate-600">Type:</span>
                <Badge variant={appointmentType === 'Online' ? 'default' : 'secondary'}>
                  {appointmentType}
                </Badge>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-slate-600">Date:</span>
                <span className="font-semibold text-slate-800">{selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-slate-600">Time:</span>
                <span className="font-semibold text-slate-800">{selectedTime}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-slate-600">Pet Passport:</span>
                <span className="font-semibold text-slate-800">
                  {petPassports.find((item) => item.id === selectedPetPassportId)?.name || 'N/A'}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-slate-600">Problem:</span>
                <span className="font-semibold text-slate-800 text-right">{problemDescription}</span>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-orange-800">
                <p><strong>Next Step:</strong> After you confirm, the veterinarian will review and approve your appointment. Once approved, you'll be able to join the video call.</p>
              </div>
            </div>

            <div className="flex justify-between gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep('details')}>Back</Button>
              <Button
                onClick={handleBooking}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Confirm & Book
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
