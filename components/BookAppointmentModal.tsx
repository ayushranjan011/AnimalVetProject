'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, Clock, MapPin, Video, AlertCircle, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'

interface Vet {
  id: string
  name: string
  specialty: string
  image: string
  rating: number | null
  distance: string
  descriptions: string
}

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  vet: Vet | null
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

const isRelationMissingError = (error: any) => {
  const message = String(error?.message || '').toLowerCase()
  const details = String(error?.details || '').toLowerCase()
  return (
    error?.code === '42P01' ||
    message.includes('relation') ||
    message.includes('does not exist') ||
    details.includes('does not exist')
  )
}

const isRecoverableAppointmentInsertError = (error: any) => {
  const message = String(error?.message || '').toLowerCase()
  const details = String(error?.details || '').toLowerCase()
  const text = `${message} ${details}`

  if (isMissingColumnError(error)) return true

  // Retry with alternate payload shapes if schema enforces legacy NOT NULL columns.
  if (
    error?.code === '23502' &&
    (text.includes('appointment_date') ||
      text.includes('appointment_time') ||
      text.includes('scheduled_date') ||
      text.includes('scheduled_time') ||
      text.includes('date') ||
      text.includes('time'))
  ) {
    return true
  }

  return false
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

const to24HourTime = (value: string) => {
  const trimmed = value.trim()
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(trimmed)
  if (!match) return null

  let hours = Number(match[1])
  const minutes = Number(match[2])
  const meridiem = match[3].toUpperCase()

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null
  if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return null

  if (meridiem === 'PM' && hours !== 12) hours += 12
  if (meridiem === 'AM' && hours === 12) hours = 0

  const hh = String(hours).padStart(2, '0')
  const mm = String(minutes).padStart(2, '0')
  return `${hh}:${mm}:00`
}

export default function BookAppointmentModal({ isOpen, onClose, vet }: BookingModalProps) {
  const { user } = useAuth()
  const [step, setStep] = useState<'type' | 'date-time' | 'details' | 'confirm'>('type')
  const [appointmentType, setAppointmentType] = useState<'Online' | 'In-clinic' | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [petName, setPetName] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleClose = () => {
    if (isSubmitting) return
    setStep('type')
    setAppointmentType(null)
    setSelectedDate(null)
    setSelectedTime(null)
    setPetName('')
    setNotes('')
    onClose()
  }

  const handleBooking = async () => {
    if (!user?.id) {
      alert('Please login to book an appointment.')
      return
    }

    if (!vet?.id || !appointmentType || !selectedDate || !selectedTime || !petName.trim()) {
      alert('Please complete all required fields.')
      return
    }

    const ownerName = user.name?.trim() || user.email?.split('@')[0] || 'Pet Owner'
    const appointmentDate = selectedDate.toISOString().split('T')[0]
    const appointmentTime24 = to24HourTime(selectedTime)

    const basePayload = {
      owner_id: user.id,
      pet_owner_id: user.id,
      owner_name: ownerName,
      owner_email: user.email || null,
      vet_id: vet.id,
      vet_name: vet.name,
      pet_name: petName.trim(),
      type: 'Consultation',
      appointment_type: 'consultation',
      mode: appointmentType,
      status: 'scheduled',
      notes: notes.trim() || null,
    }

    setIsSubmitting(true)

    const payloadVariants = [
      {
        ...basePayload,
        date: appointmentDate,
        time: selectedTime,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime24,
        scheduled_date: appointmentDate,
        scheduled_time: appointmentTime24,
      },
      {
        ...basePayload,
        date: appointmentDate,
        time: selectedTime,
      },
      {
        ...basePayload,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime24,
      },
      {
        ...basePayload,
        scheduled_date: appointmentDate,
        scheduled_time: appointmentTime24,
      },
      {
        ...basePayload,
        appointment_datetime: `${appointmentDate} ${selectedTime}`,
      },
      {
        owner_id: user.id,
        pet_owner_id: user.id,
        vet_id: vet.id,
        vet_name: vet.name,
        pet_name: petName.trim(),
        status: 'scheduled',
        notes: notes.trim() || null,
      },
    ]

    let error: any = null
    for (const variant of payloadVariants) {
      const result = await supabase.from('appointments').insert(variant)
      error = result.error
      if (!error) break
      if (isRelationMissingError(error)) break
      if (!isRecoverableAppointmentInsertError(error)) break
    }

    setIsSubmitting(false)

    if (error) {
      console.error('Failed to create appointment:', error)
      alert(`Could not book appointment: ${error.message}`)
      return
    }

    alert('Appointment request sent to veterinarian successfully.')
    handleClose()
  }

  if (!vet) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Appointment with {vet.name}</DialogTitle>
          <DialogDescription>
            {vet.specialty} • Rating: {vet.rating !== null ? `${vet.rating}/5.0` : 'N/A'}
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
              <label className="text-sm font-medium text-slate-700 mb-1 block">Pet Name *</label>
              <Input
                placeholder="Enter your pet's name"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                className="border-gray-300"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Additional Notes</label>
              <Textarea
                placeholder="Describe your pet's symptoms or concerns..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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
                disabled={!petName}
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
                <span className="text-slate-600">Pet Name:</span>
                <span className="font-semibold text-slate-800">{petName}</span>
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
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isSubmitting ? 'Booking...' : 'Confirm & Book'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
