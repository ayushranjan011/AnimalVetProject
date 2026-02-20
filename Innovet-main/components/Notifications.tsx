'use client'

import { useState } from 'react'
import { Bell, AlertCircle, Stethoscope, Calendar, Syringe, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Notification {
  id: string
  type: 'sos' | 'medical' | 'appointment' | 'vaccination' | 'prescription' | 'training'
  title: string
  description: string
  timestamp: string
  isRead: boolean
  petName: string
  isUserTriggered?: boolean
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'sos',
    title: 'SOS Alert - Max',
    description: 'Emergency alert triggered by you. Max needs immediate attention.',
    timestamp: '5 mins ago',
    isRead: false,
    petName: 'Max',
    isUserTriggered: true
  },
  {
    id: '2',
    type: 'medical',
    title: 'New Medical Record',
    description: 'Lab results for Luna have been uploaded by Dr. Michael Chen',
    timestamp: '1 hour ago',
    isRead: false,
    petName: 'Luna'
  },
  {
    id: '3',
    type: 'appointment',
    title: 'Appointment Confirmed',
    description: 'Your appointment with Dr. Sarah Johnson for Max is confirmed for tomorrow at 2:00 PM',
    timestamp: '2 hours ago',
    isRead: true,
    petName: 'Max'
  },
  {
    id: '4',
    type: 'vaccination',
    title: 'Vaccination Due',
    description: 'Buddy is due for annual DHPP vaccination. Schedule an appointment with your vet.',
    timestamp: '1 day ago',
    isRead: false,
    petName: 'Buddy'
  },
  {
    id: '5',
    type: 'prescription',
    title: 'Prescription Ready',
    description: 'Luna\'s thyroid medication prescription is ready for pickup at the pharmacy',
    timestamp: '2 days ago',
    isRead: true,
    petName: 'Luna'
  },
  {
    id: '6',
    type: 'training',
    title: 'Training Session Scheduled',
    description: 'New training session scheduled for Max - "Obedience Training" next week',
    timestamp: '3 days ago',
    isRead: true,
    petName: 'Max'
  },
  {
    id: '7',
    type: 'sos',
    title: 'SOS Alert - Luna',
    description: 'Emergency alert triggered by you. Luna requires immediate care.',
    timestamp: '5 days ago',
    isRead: true,
    petName: 'Luna',
    isUserTriggered: true
  },
  {
    id: '8',
    type: 'appointment',
    title: 'Appointment Reminder',
    description: 'Reminder: Your appointment with Dr. Emily Patterson for Buddy is in 3 days',
    timestamp: '1 week ago',
    isRead: true,
    petName: 'Buddy'
  }
]

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'sos':
      return <AlertCircle className="w-5 h-5 text-red-500" />
    case 'medical':
      return <Stethoscope className="w-5 h-5 text-blue-500" />
    case 'appointment':
      return <Calendar className="w-5 h-5 text-purple-500" />
    case 'vaccination':
      return <Syringe className="w-5 h-5 text-green-500" />
    case 'prescription':
      return <Bell className="w-5 h-5 text-orange-500" />
    case 'training':
      return <BookOpen className="w-5 h-5 text-indigo-500" />
    default:
      return <Bell className="w-5 h-5 text-gray-500" />
  }
}

const getNotificationBgColor = (type: string, isRead: boolean) => {
  if (isRead) return 'bg-white'
  switch (type) {
    case 'sos':
      return 'bg-red-50'
    case 'medical':
      return 'bg-blue-50'
    case 'appointment':
      return 'bg-purple-50'
    case 'vaccination':
      return 'bg-green-50'
    case 'prescription':
      return 'bg-orange-50'
    case 'training':
      return 'bg-indigo-50'
    default:
      return 'bg-gray-50'
  }
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [filter, setFilter] = useState<'all' | 'unread' | 'emergency'>('all')

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.isRead
    if (filter === 'emergency') return notif.type === 'sos' && notif.isUserTriggered
    return true
  })

  const unreadCount = notifications.filter(n => !n.isRead).length
  const sosCount = notifications.filter(n => n.type === 'sos' && n.isUserTriggered && !n.isRead).length

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, isRead: true } : notif
    ))
  }

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, isRead: true })))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600">Stay updated with your pet's health and activity</p>
        <div className="h-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full w-20 mt-4"></div>
      </div>

      {/* Filters and Mark All as Read */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-teal-500 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-teal-500'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg font-medium transition relative ${
              filter === 'unread'
                ? 'bg-teal-500 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-teal-500'
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter('emergency')}
            className={`px-4 py-2 rounded-lg font-medium transition relative ${
              filter === 'emergency'
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-red-500'
            }`}
          >
            Emergency
            {sosCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {sosCount}
              </span>
            )}
          </button>
        </div>

        {/* Mark All as Read Button */}
        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAllAsRead}
            variant="outline"
            className="bg-white border-gray-300 text-teal-600 hover:bg-teal-50 font-medium"
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleMarkAsRead(notification.id)}
              className={`flex gap-4 p-4 rounded-lg border transition cursor-pointer hover:shadow-md ${
                getNotificationBgColor(notification.type, notification.isRead)
              } ${
                notification.isRead
                  ? 'border-gray-200'
                  : 'border-l-4 border-l-teal-500 border-t border-r border-b border-gray-200'
              }`}
            >
              {/* Icon */}
              <div className="flex-shrink-0 flex items-start pt-1">
                {getNotificationIcon(notification.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className={`font-semibold ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                      {notification.title}
                    </h3>
                    <p className={`text-sm mt-1 line-clamp-2 ${notification.isRead ? 'text-gray-500' : 'text-gray-700'}`}>
                      {notification.description}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="flex-shrink-0 w-2 h-2 bg-teal-500 rounded-full mt-2"></div>
                  )}
                </div>
                <p className={`text-xs mt-2 ${notification.isRead ? 'text-gray-500' : 'text-gray-600'}`}>
                  {notification.timestamp}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">You have no notifications</p>
            <p className="text-gray-500 text-sm mt-1">
              {filter === 'unread' && 'All notifications have been read'}
              {filter === 'emergency' && 'No emergency alerts at this time'}
              {filter === 'all' && 'Check back later for updates'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
