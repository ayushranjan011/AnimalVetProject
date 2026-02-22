'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import VetAppointmentPanel from '@/components/VetAppointmentPanel'
import VetProfileSettings from '@/components/VetProfileSettings'
import { useAuth } from '@/contexts/auth-context'
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  MessageCircle,
  Settings,
  LogOut,
  FileText,
  Calendar,
  Bell,
  Menu,
  Clock,
  ChevronRight,
  Stethoscope,
  PawPrint,
  TrendingUp,
  Phone,
  MapPin,
  Send,
  Search,
  Pill,
  Syringe,
  Activity,
  Heart,
  Weight,
  Thermometer,
  Eye,
  Check,
  X,
  User,
} from 'lucide-react'

type ActiveView = 'dashboard' |'appointments'| 'records' | 'sos' | 'discussions' | 'settings' | 'logout'

export default function VetDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [activeView, setActiveView] = useState<ActiveView>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)


const [openPatientId, setOpenPatientId] = useState<string | null>(null);





  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', view: 'dashboard' as const },
    { icon: Phone, label: 'Appointments', view: 'appointments' as const },
    { icon: FileText, label: 'Patient Records', view: 'records' as const },
    { icon: AlertTriangle, label: 'SOS Alerts', view: 'sos' as const, badge: 3 },
    { icon: MessageCircle, label: 'Case Discussions', view: 'discussions' as const },
    { icon: Settings, label: 'Settings', view: 'settings' as const },
    { icon: LogOut, label: 'Logout', view: 'logout' as const },
  ]

  const patients = [
    { id: '1', name: 'Max', type: 'Dog', breed: 'Golden Retriever', owner: 'John Doe', status: 'Scheduled', time: '10:00 AM', image: '/images/pet-dog-1.jpg', age: '3 years', weight: '32 kg', lastVisit: 'Jan 15, 2026' },
    { id: '2', name: 'Bella', type: 'Cat', breed: 'Persian', owner: 'Sarah Smith', status: 'In Progress', time: '11:30 AM', image: '/images/pet-cat-1.jpg', age: '2 years', weight: '4.5 kg', lastVisit: 'Jan 10, 2026' },
    { id: '3', name: 'Charlie', type: 'Dog', breed: 'Beagle', owner: 'Mike Johnson', status: 'Scheduled', time: '2:00 PM', image: '/images/pet-dog-2.jpg', age: '5 years', weight: '12 kg', lastVisit: 'Dec 20, 2025' },
    { id: '4', name: 'Luna', type: 'Cat', breed: 'Siamese', owner: 'Emily Davis', status: 'Completed', time: '9:00 AM', image: '/images/rescue-cat-1.jpg', age: '1 year', weight: '3.8 kg', lastVisit: 'Jan 18, 2026' },
    { id: '5', name: 'Snow', type: 'Cat', breed: 'Persian', owner: 'Emily Davis', status: 'Completed', time: '9:00 AM', image: '/images/rescue-cat-1.jpg', age: '1 year', weight: '3.8 kg', lastVisit: 'Jan 18, 2026' },
  ]

  const patientRecords = [
    { 
      id: '1', 
      petName: 'Max', 
      petImage: '/images/pet-dog-1.jpg',
      owner: 'John Doe',
      caseType: 'Annual Checkup',
      diagnosis: 'Healthy - Minor dental tartar buildup',
      prescriptions: ['Dental cleaning recommended', 'Heartgard Plus (Monthly)'],
      notes: 'Overall excellent health. Recommend dental cleaning in next visit. Continue current diet.',
      date: 'Jan 20, 2026',
      vitals: { heartRate: '80 bpm', temp: '38.5°C', weight: '32 kg', respRate: '18/min' }
    },
    { 
      id: '2', 
      petName: 'Bella', 
      petImage: '/images/pet-cat-1.jpg',
      owner: 'Sarah Smith',
      caseType: 'Vaccination',
      diagnosis: 'Routine vaccination - FVRCP booster',
      prescriptions: ['FVRCP Vaccine administered', 'Post-vaccine monitoring 24hrs'],
      notes: 'Vaccination complete. Monitor for any adverse reactions. Schedule next booster in 1 year.',
      date: 'Jan 18, 2026',
      vitals: { heartRate: '160 bpm', temp: '39.0°C', weight: '4.5 kg', respRate: '24/min' }
    },
    { 
      id: '3', 
      petName: 'Rocky', 
      petImage: '/images/rescue-dog-1.jpg',
      owner: 'Tom Wilson',
      caseType: 'Emergency - Injury',
      diagnosis: 'Laceration on right forelimb - sutured',
      prescriptions: ['Clavamox 250mg (twice daily, 10 days)', 'Metacam 1.5mg (once daily, 5 days)', 'Wound cleaning solution'],
      notes: 'Deep laceration caused by sharp object. 8 sutures applied. Elizabethan collar required. Recheck in 7 days for suture removal.',
      date: 'Jan 19, 2026',
      vitals: { heartRate: '95 bpm', temp: '39.2°C', weight: '28 kg', respRate: '22/min' }
    },
  ]


  const todayAppointments = [
    { 
      id: '1', 
      petName: 'Max', 
      petImage: '/images/pet-dog-1.jpg',
      owner: 'John Doe',
      caseType: 'Annual Checkup',
      diagnosis: 'Healthy - Minor dental tartar buildup',
      prescriptions: ['Dental cleaning recommended', 'Heartgard Plus (Monthly)'],
      notes: 'Overall excellent health. Recommend dental cleaning in next visit. Continue current diet.',
      date: 'Jan 20, 2026',
      vitals: { heartRate: '80 bpm', temp: '38.5°C', weight: '32 kg', respRate: '18/min' }
    },
    { 
      id: '2', 
      petName: 'Bella', 
      petImage: '/images/pet-cat-1.jpg',
      owner: 'Sarah Smith',
      caseType: 'Vaccination',
      diagnosis: 'Routine vaccination - FVRCP booster',
      prescriptions: ['FVRCP Vaccine administered', 'Post-vaccine monitoring 24hrs'],
      notes: 'Vaccination complete. Monitor for any adverse reactions. Schedule next booster in 1 year.',
      date: 'Jan 18, 2026',
      vitals: { heartRate: '160 bpm', temp: '39.0°C', weight: '4.5 kg', respRate: '24/min' }
    },
    { 
      id: '3', 
      petName: 'Rocky', 
      petImage: '/images/rescue-dog-1.jpg',
      owner: 'Tom Wilson',
      caseType: 'Emergency - Injury',
      diagnosis: 'Laceration on right forelimb - sutured',
      prescriptions: ['Clavamox 250mg (twice daily, 10 days)', 'Metacam 1.5mg (once daily, 5 days)', 'Wound cleaning solution'],
      notes: 'Deep laceration caused by sharp object. 8 sutures applied. Elizabethan collar required. Recheck in 7 days for suture removal.',
      date: 'Jan 19, 2026',
      vitals: { heartRate: '95 bpm', temp: '39.2°C', weight: '28 kg', respRate: '22/min' }
    },
  ]

  const sosAlerts = [
    { id: '1', petName: 'Rocky', type: 'Dog', breed: 'Labrador', emergency: 'Severe injury - bleeding', location: '2.3 km away', address: '123 Oak Street', time: '5 mins ago', priority: 'Critical', ownerPhone: '+1 555-0123', status: 'Pending' },
    { id: '2', petName: 'Luna', type: 'Cat', breed: 'Persian', emergency: 'Breathing difficulty', location: '4.1 km away', address: '456 Pine Avenue', time: '12 mins ago', priority: 'High', ownerPhone: '+1 555-0456', status: 'Responding' },
    { id: '3', petName: 'Buddy', type: 'Dog', breed: 'Beagle', emergency: 'Poisoning suspected - vomiting', location: '1.8 km away', address: '789 Maple Drive', time: '20 mins ago', priority: 'Critical', ownerPhone: '+1 555-0789', status: 'Pending' },
    { id: '4', petName: 'Whiskers', type: 'Cat', breed: 'Tabby', emergency: 'Not eating for 2 days', location: '3.5 km away', address: '321 Elm Street', time: '45 mins ago', priority: 'Medium', ownerPhone: '+1 555-0321', status: 'Acknowledged' },
  ]

  const caseDiscussions = [
    {
      id: '1',
      title: 'Complex cardiac case - German Shepherd',
      initiator: { name: 'Dr. Sarah Johnson', avatar: '/images/vet-1.jpg' },
      participants: [
        { name: 'Dr. Michael Chen', avatar: '/images/vet-2.jpg' },
        { name: 'Dr. Emily Rodriguez', avatar: '/images/vet-3.jpg' },
      ],
      lastMessage: 'I recommend an echocardiogram before proceeding with treatment.',
      time: '10 mins ago',
      unread: 3,
      messages: [
        { sender: 'Dr. Sarah Johnson', message: 'I have a 7-year-old German Shepherd presenting with exercise intolerance and intermittent coughing.', time: '2 hours ago' },
        { sender: 'Dr. Michael Chen', message: 'What did the initial cardiac auscultation reveal?', time: '1 hour ago' },
        { sender: 'Dr. Sarah Johnson', message: 'Grade 3/6 systolic murmur, loudest over the left apex.', time: '45 mins ago' },
        { sender: 'Dr. Emily Rodriguez', message: 'I recommend an echocardiogram before proceeding with treatment.', time: '10 mins ago' },
      ]
    },
    {
      id: '2',
      title: 'Unusual skin condition - Persian Cat',
      initiator: { name: 'Dr. Michael Chen', avatar: '/images/vet-2.jpg' },
      participants: [
        { name: 'Dr. Sarah Johnson', avatar: '/images/vet-1.jpg' },
      ],
      lastMessage: 'Have you ruled out ringworm with a Wood\'s lamp examination?',
      time: '1 hour ago',
      unread: 0,
      messages: [
        { sender: 'Dr. Michael Chen', message: 'Seeing a Persian cat with circular patches of hair loss and mild scaling.', time: '3 hours ago' },
        { sender: 'Dr. Sarah Johnson', message: 'Have you ruled out ringworm with a Wood\'s lamp examination?', time: '1 hour ago' },
      ]
    },
    {
      id: '3',
      title: 'Post-surgical complications discussion',
      initiator: { name: 'Dr. Emily Rodriguez', avatar: '/images/vet-3.jpg' },
      participants: [
        { name: 'Dr. Sarah Johnson', avatar: '/images/vet-1.jpg' },
        { name: 'Dr. Michael Chen', avatar: '/images/vet-2.jpg' },
      ],
      lastMessage: 'Let\'s schedule a follow-up for wound assessment tomorrow.',
      time: '3 hours ago',
      unread: 1,
      messages: [
        { sender: 'Dr. Emily Rodriguez', message: 'The Labrador from yesterday\'s splenectomy is showing signs of seroma formation.', time: '5 hours ago' },
        { sender: 'Dr. Michael Chen', message: 'Is there any discharge or signs of infection?', time: '4 hours ago' },
        { sender: 'Dr. Emily Rodriguez', message: 'No infection signs, just fluid accumulation at the incision site.', time: '3.5 hours ago' },
        { sender: 'Dr. Sarah Johnson', message: 'Let\'s schedule a follow-up for wound assessment tomorrow.', time: '3 hours ago' },
      ]
    },
  ]

  const [selectedDiscussion, setSelectedDiscussion] = useState<string | null>(null)

  const stats = [
    { label: 'Assigned Patients', value: 12, icon: Users, color: 'from-teal-500 to-cyan-500' },
    { label: "Today's Appointments", value: 8, icon: Calendar, color: 'from-blue-500 to-indigo-500' },
    { label: 'Active SOS', value: 3, icon: AlertTriangle, color: 'from-rose-500 to-pink-500' },
    { label: 'Pending Cases', value: 156, icon: TrendingUp, color: 'from-emerald-500 to-teal-500' },
  ]

  const handleSidebarClick = (view: ActiveView) => {
    if (view === 'logout') {
      handleLogout()
    } else {
      setActiveView(view)
      setSidebarOpen(false)
    }
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-800">INNOVET</h1>
            <p className="text-xs text-slate-500">Veterinarian Portal</p>
          </div>
        </div>
      </div>
      <div className="flex-1 p-4 space-y-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.view
          return (
            <button
              key={item.label}
              onClick={() => handleSidebarClick(item.view)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-200' 
                  : 'text-slate-600 hover:bg-teal-50'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
              {item.badge && (
                <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-rose-500 text-white'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
      <div className="p-4 border-t border-white/20">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50">
          <Avatar className="w-10 h-10 border-2 border-white">
            <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white">{user?.name?.[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">Dr. {user?.name}</p>
            <p className="text-xs text-slate-500">Veterinarian</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeView) {
      case 'appointments':
        return (
          <VetAppointmentPanel
            onVideoCallInitiate={(appointmentId) => {
              router.push(`/vet/consultation?appointmentId=${appointmentId}`)
            }}
          />
        )

        
      case 'records':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Patient Records</h2>
                  <p className="text-sm text-slate-500">View and manage case details</p>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="Search patients..." className="pl-10 w-64" />
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              {patientRecords.map((record) => (
                <div key={record.id} className="p-5 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 hover:shadow-xl transition-all">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden">
                      <Image src={record.petImage || "/placeholder.svg"} alt={record.petName} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-slate-800">{record.petName}</h3>
                        <Badge className="bg-indigo-100 text-indigo-700">{record.caseType}</Badge>
                      </div>
                      <p className="text-sm text-slate-500">Owner: {record.owner}</p>
                      <p className="text-xs text-slate-400">Date: {record.date}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-slate-50 text-center">
                      <Heart className="w-4 h-4 text-rose-500 mx-auto mb-1" />
                      <p className="text-xs font-medium text-slate-600">{record.vitals.heartRate}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 text-center">
                      <Thermometer className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                      <p className="text-xs font-medium text-slate-600">{record.vitals.temp}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 text-center">
                      <Weight className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                      <p className="text-xs font-medium text-slate-600">{record.vitals.weight}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 text-center">
                      <Activity className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                      <p className="text-xs font-medium text-slate-600">{record.vitals.respRate}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Diagnosis</p>
                      <p className="text-sm text-slate-700">{record.diagnosis}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Prescriptions</p>
                      <div className="flex flex-wrap gap-1">
                        {record.prescriptions.map((rx, i) => (
                          <span key={i} className="px-2 py-1 bg-cyan-50 text-cyan-700 rounded-full text-xs">{rx}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Notes</p>
                      <p className="text-sm text-slate-600">{record.notes}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                    <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-500">Edit Record</Button>
                    <Button size="sm" variant="outline" className="bg-transparent">Print</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'sos':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">SOS Alerts</h2>
                <p className="text-sm text-slate-500">Emergency cases requiring attention</p>
              </div>
            </div>

            <div className="space-y-4">
              {sosAlerts.map((alert) => (
                <div key={alert.id} className={`p-5 rounded-2xl border transition-all ${
                  alert.priority === 'Critical' 
                    ? 'bg-gradient-to-r from-rose-50 to-white border-rose-200' 
                    : alert.priority === 'High'
                    ? 'bg-gradient-to-r from-amber-50 to-white border-amber-200'
                    : 'bg-white/70 border-white/50'
                }`}>
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                      alert.priority === 'Critical' ? 'bg-rose-500' : alert.priority === 'High' ? 'bg-amber-500' : 'bg-slate-400'
                    }`}>
                      <PawPrint className="w-7 h-7 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-slate-800">{alert.petName}</h3>
                        <span className="text-sm text-slate-500">({alert.type} - {alert.breed})</span>
                        <Badge className={`ml-2 ${
                          alert.priority === 'Critical' ? 'bg-rose-500' : alert.priority === 'High' ? 'bg-amber-500' : 'bg-slate-400'
                        } text-white border-0`}>
                          {alert.priority}
                        </Badge>
                        <Badge variant="outline" className={`${
                          alert.status === 'Pending' ? 'border-rose-300 text-rose-600' : 
                          alert.status === 'Responding' ? 'border-emerald-300 text-emerald-600' : 'border-blue-300 text-blue-600'
                        }`}>
                          {alert.status}
                        </Badge>
                      </div>
                      <p className="text-rose-600 font-medium mb-2">{alert.emergency}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{alert.address}</span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{alert.time}</span>
                        <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{alert.ownerPhone}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600">
                        <Check className="mr-2 h-4 w-4" /> Accept
                      </Button>
                      <Button variant="outline" className="border-rose-200 text-rose-600 bg-transparent">
                        <Phone className="mr-2 h-4 w-4" /> Call Owner
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'discussions':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Case Discussions</h2>
                <p className="text-sm text-slate-500">Collaborate with other veterinarians</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Discussion List */}
              <div className="lg:col-span-1 space-y-3">
                {caseDiscussions.map((discussion) => (
                  <button
                    key={discussion.id}
                    onClick={() => setSelectedDiscussion(discussion.id)}
                    className={`w-full text-left p-4 rounded-xl transition-all ${
                      selectedDiscussion === discussion.id 
                        ? 'bg-gradient-to-r from-violet-100 to-purple-100 border-violet-300' 
                        : 'bg-white/70 hover:bg-white/90 border-white/50'
                    } border`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10 border-2 border-white">
                        <AvatarImage src={discussion.initiator.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-violet-500 text-white">{discussion.initiator.name[4]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-slate-800 text-sm truncate">{discussion.title}</h4>
                          {discussion.unread > 0 && (
                            <span className="px-2 py-0.5 bg-violet-500 text-white text-xs rounded-full">{discussion.unread}</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">{discussion.lastMessage}</p>
                        <p className="text-xs text-slate-400 mt-1">{discussion.time}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Chat Area */}
              <div className="lg:col-span-2 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 flex flex-col h-[600px]">
                {selectedDiscussion ? (
                  <>
                    {/* Chat Header */}
                    {(() => {
                      const discussion = caseDiscussions.find(d => d.id === selectedDiscussion)
                      return discussion ? (
                        <>
                          <div className="p-4 border-b border-slate-100">
                            <h3 className="font-semibold text-slate-800">{discussion.title}</h3>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-slate-500">Participants:</span>
                              <div className="flex -space-x-2">
                                <Avatar className="w-6 h-6 border-2 border-white">
                                  <AvatarImage src={discussion.initiator.avatar || "/placeholder.svg"} />
                                </Avatar>
                                {discussion.participants.map((p, i) => (
                                  <Avatar key={i} className="w-6 h-6 border-2 border-white">
                                    <AvatarImage src={p.avatar || "/placeholder.svg"} />
                                  </Avatar>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Messages */}
                          <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {discussion.messages.map((msg, i) => {
                              const isCurrentUser = msg.sender === `Dr. ${user?.name}`
                              return (
                                <div key={i} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-[80%] ${isCurrentUser ? 'order-2' : ''}`}>
                                    <p className={`text-xs mb-1 ${isCurrentUser ? 'text-right' : ''} text-slate-500`}>{msg.sender}</p>
                                    <div className={`p-3 rounded-2xl ${
                                      isCurrentUser 
                                        ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white' 
                                        : 'bg-slate-100 text-slate-800'
                                    }`}>
                                      <p className="text-sm">{msg.message}</p>
                                    </div>
                                    <p className={`text-xs mt-1 ${isCurrentUser ? 'text-right' : ''} text-slate-400`}>{msg.time}</p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          {/* Input */}
                          <div className="p-4 border-t border-slate-100">
                            <div className="flex gap-2">
                              <Input 
                                placeholder="Type your message..." 
                                value={chatMessage}
                                onChange={(e) => setChatMessage(e.target.value)}
                                className="flex-1"
                              />
                              <Button className="bg-gradient-to-r from-violet-500 to-purple-500">
                                <Send className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </>
                      ) : null
                    })()}
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-400">
                    <div className="text-center">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Select a discussion to view messages</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case 'settings':
        return (
          <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
                <p className="text-sm text-slate-500">Manage your account preferences</p>
              </div>
            </div>

            <div className="space-y-4">
              <VetProfileSettings />

              <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50">
                <h3 className="font-semibold text-slate-800 mb-4">Notifications</h3>
                <div className="space-y-3">
                  {['SOS Alerts', 'New Appointments', 'Case Discussion Replies', 'System Updates'].map((item) => (
                    <div key={item} className="flex items-center justify-between py-2">
                      <span className="text-slate-600">{item}</span>
                      <Button variant="outline" size="sm" className="bg-transparent">Enabled</Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return (
        // <div className=''>
          <div className=" space-y-6">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-1">Welcome Dr. {user?.name}</h2>
              <p className="text-slate-500">Here is your overview for today</p>
            </div>

{/* <div className="ml-auto flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative hover:bg-teal-100/50">
              <Bell className="h-5 w-5 text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
            </Button>
            <Avatar className="w-8 h-8 border-2 border-white">
              <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white text-xs">{user?.name?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
</div> */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50 hover:bg-white/80 hover:shadow-lg transition-all">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                  </div>
                )
              })}
            </div>

            

            <div className="rounded-2xl bg-gradient-to-br from-rose-50/80 to-white/60 backdrop-blur-sm border border-rose-100/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center animate-pulse">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">Active SOS Alerts</h3>
                    <p className="text-xs text-rose-500">Requires immediate attention</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-rose-600" onClick={() => setActiveView('sos')}>
                  View All <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3">
                {sosAlerts.slice(0, 2).map((alert) => (
                  <div key={alert.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${alert.priority === 'Critical' ? 'bg-gradient-to-r from-rose-100/80 to-rose-50/50 border-rose-200' : 'bg-white/80 border-rose-100/50'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${alert.priority === 'Critical' ? 'bg-rose-500' : 'bg-amber-500'}`}>
                      <PawPrint className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-800">{alert.petName}</h4>
                        <Badge variant="outline" className={`text-xs ${alert.priority === 'Critical' ? 'border-rose-500 text-rose-600' : 'border-amber-500 text-amber-600'}`}>{alert.priority}</Badge>
                      </div>
                      <p className="text-sm text-slate-600">{alert.emergency}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" />{alert.location}</span>
                        <span className="flex items-center"><Clock className="w-3 h-3 mr-1" />{alert.time}</span>
                      </div>
                    </div>
                    <Button size="sm" className="bg-gradient-to-r from-rose-500 to-pink-500">Respond</Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Today's Appointments</h3>
                </div>
                <Button variant="ghost" size="sm" className="text-teal-600" onClick={() => setActiveView('appointments')}>
                  View All <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3">
                {patients.slice(0, 3).map((patient) => (
                  <div key={patient.id} className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-white/80 to-slate-50/50 border border-white/50 hover:shadow-md transition-all">
                    <Avatar className="w-12 h-12 border-2 border-white shadow-md">
                      <AvatarImage src={patient.image || "/placeholder.svg"} alt={patient.name} />
                      <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white">{patient.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-800">{patient.name}</h4>
                        <span className="text-xs text-slate-400">({patient.type})</span>
                      </div>
                      <p className="text-sm text-slate-500">Owner: {patient.owner}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={`mb-1 ${patient.status === 'In Progress' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0' : 'bg-slate-100 text-slate-600'}`}>
                        {patient.status}
                      </Badge>
                      <p className="text-xs text-slate-400 flex items-center justify-end"><Clock className="w-3 h-3 mr-1" />{patient.time}</p>
                    </div>
                    <Button size="sm" className="bg-gradient-to-r from-teal-500 to-cyan-500">View</Button>
                  
                  
                  
                  
                  
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/40">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-teal-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl" />
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col backdrop-blur-xl bg-white/70 border-r border-white/50 fixed left-0 top-0 bottom-0 z-20 overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Mobile Header with Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-white/70 border-b border-white/50">
        <div className="flex h-16 items-center gap-4 px-4">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-teal-100/50"><Menu className="h-6 w-6" /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 bg-gradient-to-b from-white to-teal-50/50">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <h1 className="font-bold text-lg bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">INNOVET</h1>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative hover:bg-teal-100/50">
              <Bell className="h-5 w-5 text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
            </Button>
            <Avatar className="w-8 h-8 border-2 border-white">
              <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white text-xs">{user?.name?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      <main className="flex-1 relative z-10 lg:ml-72 pt-16 lg:pt-0">
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}
