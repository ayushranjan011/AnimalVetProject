'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, User, Video, MapPin, Eye, VideoIcon, RotateCcw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Appointment {
  id: string
  petName: string
  petPhoto: string
  vetName: string
  type: 'Consultation' | 'Vaccination' | 'Training'
  date: string
  time: string
  mode: 'Online' | 'In-clinic'
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed' | 'Confirmed' | 'Cancelled'
  notes: string
  prescription?: string
}

const mockAppointments: Appointment[] = [
  {
    id: '1',
    petName: 'Max',
    petPhoto: '🐕',
    vetName: 'Dr. Sarah Johnson',
    type: 'Consultation',
    date: '2024-12-20',
    time: '2:00 PM',
    mode: 'In-clinic',
    status: 'Confirmed',
    notes: 'Regular health checkup and weight monitoring',
    prescription: 'Continue current diet, schedule next checkup in 3 months'
  },
  {
    id: '2',
    petName: 'Luna',
    petPhoto: '🐱',
    vetName: 'Dr. Michael Chen',
    type: 'Vaccination',
    date: '2024-12-22',
    time: '10:30 AM',
    mode: 'In-clinic',
    status: 'Confirmed',
    notes: 'Annual vaccination booster',
    prescription: 'Monitor for any allergic reactions'
  },
  {
    id: '3',
    petName: 'Buddy',
    petPhoto: '🐕',
    vetName: 'Dr. Emily Patterson',
    type: 'Training',
    date: '2024-12-25',
    time: '4:00 PM',
    mode: 'Online',
    status: 'Approved',
    notes: 'Obedience training session'
  },
  {
    id: '4',
    petName: 'Max',
    petPhoto: '🐕',
    vetName: 'Dr. Sarah Johnson',
    type: 'Consultation',
    date: '2024-12-10',
    time: '11:00 AM',
    mode: 'Online',
    status: 'Completed',
    notes: 'Follow-up consultation',
    prescription: 'Continue prescribed medication'
  },
  {
    id: '5',
    petName: 'Luna',
    petPhoto: '🐱',
    vetName: 'Dr. Michael Chen',
    type: 'Consultation',
    date: '2024-12-01',
    time: '3:00 PM',
    mode: 'In-clinic',
    status: 'Completed',
    notes: 'Routine checkup',
    prescription: 'All parameters normal'
  },
  {
    id: '6',
    petName: 'Buddy',
    petPhoto: '🐕',
    vetName: 'Dr. Emily Patterson',
    type: 'Vaccination',
    date: '2024-11-15',
    time: '9:00 AM',
    mode: 'In-clinic',
    status: 'Rejected',
    notes: 'Rescheduled due to weather'
  }
]

export default function Appointments() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('all')
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [vetFilter, setVetFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState<'All' | 'Consultation' | 'Vaccination' | 'Training'>('All')

  const today = new Date('2024-12-15')

  const filteredAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date)
    let statusMatch = true

    if (filter === 'upcoming') statusMatch = aptDate >= today && apt.status !== 'Cancelled'
    else if (filter === 'past') statusMatch = aptDate < today || apt.status === 'Completed'
    else if (filter === 'cancelled') statusMatch = apt.status === 'Cancelled'

    const vetMatch = vetFilter === '' || apt.vetName.toLowerCase().includes(vetFilter.toLowerCase())
    const typeMatch = typeFilter === 'All' || apt.type === typeFilter

    return statusMatch && vetMatch && typeMatch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Cancelled':
        return 'bg-red-100 text-red-800'
      case 'Completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Consultation':
        return 'bg-purple-100 text-purple-800'
      case 'Vaccination':
        return 'bg-teal-100 text-teal-800'
      case 'Training':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-600">Manage your pet's vet consultations and sessions</p>
        <div className="h-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full w-24 mt-4"></div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 space-y-4">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'upcoming', 'past', 'cancelled'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                filter === tab
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Additional Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Vet Name Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vet Name</label>
            <input
              type="text"
              placeholder="Filter by vet name..."
              value={vetFilter}
              onChange={(e) => setVetFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option>All</option>
              <option>Consultation</option>
              <option>Vaccination</option>
              <option>Training</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                {/* Left Section - Pet and Details */}
                <div className="flex gap-4 flex-1">
                  {/* Pet Photo */}
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-3xl flex-shrink-0">
                    {apt.petPhoto}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900">{apt.petName}</h3>
                    <p className="text-gray-600 text-sm mb-3">with {apt.vetName}</p>

                    <div className="flex flex-wrap gap-2 items-center mb-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(apt.type)}`}>
                        {apt.type}
                      </span>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(apt.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {apt.time}
                      </div>
                      <div className="flex items-center gap-1">
                        {apt.mode === 'Online' ? (
                          <>
                            <Video className="w-4 h-4" />
                            Online
                          </>
                        ) : (
                          <>
                            <MapPin className="w-4 h-4" />
                            In-clinic
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Section - Actions */}
                <div className="flex flex-col gap-2 w-full md:w-auto">
                  <button
                    onClick={() => setSelectedAppointment(apt)}
                    className="px-4 py-2 rounded-lg border border-teal-500 text-teal-600 hover:bg-teal-50 font-medium transition text-sm"
                  >
                    <Eye className="w-4 h-4 inline mr-2" />
                    View Details
                  </button>

                  {apt.mode === 'Online' && apt.status === 'Approved' && (
                    <button 
                      onClick={() => router.push(`/user/video-call?roomID=apt_${apt.id}_${apt.vetName.replace(/\s+/g, '_')}`)}
                      className="px-4 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 font-medium transition text-sm"
                    >
                      <VideoIcon className="w-4 h-4 inline mr-2" />
                      Join Session
                    </button>
                  )}

                  {apt.status === 'Pending' && (
                    <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition text-sm">
                      <RotateCcw className="w-4 h-4 inline mr-2" />
                      Awaiting Approval
                    </button>
                  )}

                  {(apt.status === 'Confirmed' || apt.status === 'Approved') && (
                    <button className="px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 font-medium transition text-sm">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium text-lg">You have no appointments scheduled</p>
            <p className="text-gray-500 text-sm mt-2">
              {filter !== 'all' ? 'No appointments in this category' : 'Schedule your first appointment with a veterinarian'}
            </p>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredAppointments.length} of {appointments.length} appointments
      </div>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">{selectedAppointment.petName}'s Appointment</h2>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Pet and Vet Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Pet Name</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{selectedAppointment.petPhoto}</span>
                    <p className="text-lg font-semibold text-gray-900">{selectedAppointment.petName}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Veterinarian</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedAppointment.vetName}</p>
                </div>
              </div>

              {/* Appointment Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-teal-600" />
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-semibold text-gray-900">{formatDate(selectedAppointment.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-600" />
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-semibold text-gray-900">{selectedAppointment.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedAppointment.mode === 'Online' ? (
                    <Video className="w-5 h-5 text-teal-600" />
                  ) : (
                    <MapPin className="w-5 h-5 text-teal-600" />
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Mode</p>
                    <p className="font-semibold text-gray-900">{selectedAppointment.mode}</p>
                  </div>
                </div>
              </div>

              {/* Type and Status Badges */}
              <div className="flex gap-3">
                <span className={`px-4 py-2 rounded-full font-semibold text-sm ${getTypeColor(selectedAppointment.type)}`}>
                  {selectedAppointment.type}
                </span>
                <span className={`px-4 py-2 rounded-full font-semibold text-sm ${getStatusColor(selectedAppointment.status)}`}>
                  {selectedAppointment.status}
                </span>
              </div>

              {/* Notes */}
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Appointment Notes</p>
                <p className="text-gray-900">{selectedAppointment.notes}</p>
              </div>

              {/* Prescription/Follow-up */}
              {selectedAppointment.prescription && (
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-2">Prescription / Follow-up</p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-gray-900">{selectedAppointment.prescription}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setSelectedAppointment(null)}
              >
                Close
              </Button>
              {selectedAppointment.mode === 'Online' && selectedAppointment.status === 'Approved' && (
                <Button 
                  onClick={() => {
                    setSelectedAppointment(null)
                    router.push(`/user/video-call?roomID=apt_${selectedAppointment.id}_${selectedAppointment.vetName.replace(/\s+/g, '_')}`)
                  }}
                  className="bg-teal-500 hover:bg-teal-600 text-white"
                >
                  <VideoIcon className="w-4 h-4 mr-2" />
                  Join Session
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
