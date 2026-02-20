'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Video,
  MessageSquare,
  Eye,
  Phone,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface VetAppointment {
  id: string
  petName: string
  ownerName: string
  type: 'Online' | 'In-clinic'
  date: string
  time: string
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed'
  mode: string
  notes: string
  ownerPhone?: string
  ownerEmail?: string
}

// Mock data
const mockAppointments: VetAppointment[] = [
  {
    id: '1',
    petName: 'Max',
    ownerName: 'John Doe',
    type: 'Online',
    date: '2024-12-20',
    time: '2:00 PM',
    status: 'Pending',
    mode: 'Online',
    notes: 'Regular health checkup and weight monitoring',
    ownerPhone: '+1 (555) 123-4567',
    ownerEmail: 'john@example.com',
  },
  {
    id: '2',
    petName: 'Luna',
    ownerName: 'Jane Smith',
    type: 'In-clinic',
    date: '2024-12-22',
    time: '10:30 AM',
    status: 'Pending',
    mode: 'In-clinic',
    notes: 'Annual vaccination booster',
    ownerPhone: '+1 (555) 987-6543',
    ownerEmail: 'jane@example.com',
  },
  {
    id: '3',
    petName: 'Buddy',
    ownerName: 'Bob Johnson',
    type: 'Online',
    date: '2024-12-25',
    time: '4:00 PM',
    status: 'Approved',
    mode: 'Online',
    notes: 'Follow-up consultation',
    ownerPhone: '+1 (555) 456-7890',
    ownerEmail: 'bob@example.com',
  },
]

interface VetAppointmentPanelProps {
  onVideoCallInitiate?: (appointmentId: string) => void
}

export default function VetAppointmentPanel({ onVideoCallInitiate }: VetAppointmentPanelProps) {
  const [appointments, setAppointments] = useState<VetAppointment[]>(mockAppointments)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'completed'>('all')
  const [selectedAppointment, setSelectedAppointment] = useState<VetAppointment | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [rejectReasonOpen, setRejectReasonOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'all') return true
    return apt.status.toLowerCase() === filter
  })

  const handleApproveAppointment = (id: string) => {
    setAppointments(
      appointments.map((apt) =>
        apt.id === id ? { ...apt, status: 'Approved' as const } : apt
      )
    )
    setDetailsModalOpen(false)
  }

  const handleRejectAppointment = (id: string) => {
    setAppointments(
      appointments.map((apt) =>
        apt.id === id ? { ...apt, status: 'Rejected' as const } : apt
      )
    )
    setRejectReasonOpen(false)
    setRejectReason('')
    setDetailsModalOpen(false)
  }

  const handleInitiateVideoCall = (appointmentId: string) => {
    onVideoCallInitiate?.(appointmentId)
    // This will navigate to video call page
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Approved':
        return 'bg-green-100 text-green-800'
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      case 'Completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    return type === 'Online' ? 'bg-teal-100 text-teal-800' : 'bg-purple-100 text-purple-800'
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">Appointments</h1>
        <p className="text-gray-600">Review and manage appointment requests from pet owners</p>
        <div className="h-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full w-24 mt-4"></div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex flex-wrap gap-2">
        {(['all', 'pending', 'approved', 'completed'] as const).map((tab) => (
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

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                {/* Left Section */}
                <div className="flex gap-4 flex-1 min-w-0">
                  <Avatar className="w-16 h-16 border-2 border-teal-200">
                    <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white text-lg">
                      {apt.petName[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900">{apt.petName}</h3>
                    <p className="text-gray-600 text-sm mb-3">Owner: {apt.ownerName}</p>

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
                        {apt.type === 'Online' ? (
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
                  <Button
                    onClick={() => {
                      setSelectedAppointment(apt)
                      setDetailsModalOpen(true)
                    }}
                    variant="outline"
                    className="border-teal-500 text-teal-600 hover:bg-teal-50"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>

                  {apt.status === 'Pending' && (
                    <>
                      <Button
                        onClick={() => handleApproveAppointment(apt.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedAppointment(apt)
                          setRejectReasonOpen(true)
                        }}
                        variant="destructive"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}

                  {apt.status === 'Approved' && apt.type === 'Online' && (
                    <Button
                      onClick={() => handleInitiateVideoCall(apt.id)}
                      className="bg-teal-500 hover:bg-teal-600 text-white"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Start Call
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium text-lg">No appointments found</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedAppointment && (
        <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedAppointment.petName}'s Appointment</DialogTitle>
              <DialogDescription>
                Owner: {selectedAppointment.ownerName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Appointment Details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Pet Name:</span>
                  <span className="font-semibold">{selectedAppointment.petName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Owner Name:</span>
                  <span className="font-semibold">{selectedAppointment.ownerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Type:</span>
                  <Badge variant={selectedAppointment.type === 'Online' ? 'default' : 'secondary'}>
                    {selectedAppointment.type}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-semibold">{formatDate(selectedAppointment.date)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-semibold">{selectedAppointment.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge className={getStatusColor(selectedAppointment.status)}>
                    {selectedAppointment.status}
                  </Badge>
                </div>
              </div>

              {/* Owner Contact */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Owner Contact</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    {selectedAppointment.ownerPhone}
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-gray-500" />
                    {selectedAppointment.ownerEmail}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Appointment Notes</h4>
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-gray-700">
                  {selectedAppointment.notes}
                </div>
              </div>

              {/* Actions */}
              {selectedAppointment.status === 'Pending' && (
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => handleApproveAppointment(selectedAppointment.id)}
                    className="bg-green-600 hover:bg-green-700 text-white flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Appointment
                  </Button>
                  <Button
                    onClick={() => {
                      setDetailsModalOpen(false)
                      setRejectReasonOpen(true)
                    }}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Reject Reason Modal */}
      {selectedAppointment && (
        <Dialog open={rejectReasonOpen} onOpenChange={setRejectReasonOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Reject Appointment</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this appointment.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Textarea
                placeholder="Reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setRejectReasonOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleRejectAppointment(selectedAppointment.id)}
                  variant="destructive"
                  className="flex-1"
                >
                  Reject
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
