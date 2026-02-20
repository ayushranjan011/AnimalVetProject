'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { Input } from '@/components/ui/input'
import { EmergencySOS } from '@/components/emergency-sos'
import { PetPassport } from '@/components/pet-passport'
import { useAuth } from '@/contexts/auth-context'
import {
  LayoutDashboard,
  PawPrint,
  DollarSign,
  MapPin,
  Users,
  Truck,
  Settings,
  LogOut,
  Menu,
  AlertTriangle,
  Stethoscope,
  ImageIcon,
  Heart,
  Bell,
  ChevronRight,
  QrCode,
  Phone,
  Clock,
  Check,
  X,
  Navigation,
  Play,
  Calendar,
  FileText,
  Video,
  Upload,
  Search,
  Filter,
  MoreVertical,
  // Eye,
  Star,
  MessageSquare,
} from 'lucide-react'


type ActiveView = 'dashboard' | 'animals' | 'sos' | 'consultation' | 'gallery' | 'vans' | 'settings' | 'logout'


export default function NGODashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [activeView, setActiveView] = useState<ActiveView>('dashboard')
  const [showPassport, setShowPassport] = useState(false)
  const [selectedPet, setSelectedPet] = useState<{name: string; type: string; status: string; id: string; image: string; breed?: string; age?: string; rescueDate?: string; location?: string} | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', view: 'dashboard' as const },
    { icon: PawPrint, label: 'Our Animals', view: 'animals' as const },
    { icon: AlertTriangle, label: 'Emergency SOS', view: 'sos' as const, badge: 4 },
    { icon: Stethoscope, label: 'Consultation', view: 'consultation' as const },
    { icon: ImageIcon, label: 'My Gallery', view: 'gallery' as const },
    { icon: Truck, label: 'Rescue Vans', view: 'vans' as const },
    // { icon: MapPin, label: 'Life Tracking', view: 'tracking' as const },
    { icon: Settings, label: 'Settings', view: 'settings' as const },
    { icon: LogOut, label: 'Logout', view: 'logout' as const },
  ]

  const animals = [
    { name: 'Luna', type: 'Cat', breed: 'Persian Mix', age: '2 years', status: 'Healthy', id: 'NGO-CAT-001', image: '/images/rescue-cat-1.jpg', rescueDate: 'Dec 15, 2025', location: 'Shelter A' },
    { name: 'Bella', type: 'Cat', breed: 'Siamese', age: '1 year', status: 'Recovery', id: 'NGO-CAT-002', image: '/images/pet-cat-1.jpg', rescueDate: 'Jan 5, 2026', location: 'Medical Ward' },
    { name: 'Max', type: 'Dog', breed: 'Golden Retriever', age: '3 years', status: 'Healthy', id: 'NGO-DOG-001', image: '/images/pet-dog-1.jpg', rescueDate: 'Nov 20, 2025', location: 'Shelter B' },
    { name: 'Rocky', type: 'Dog', breed: 'Labrador', age: '4 years', status: 'Healthy', id: 'NGO-DOG-002', image: '/images/rescue-dog-1.jpg', rescueDate: 'Oct 10, 2025', location: 'Shelter A' },
    { name: 'Charlie', type: 'Dog', breed: 'Beagle', age: '2 years', status: 'Treatment', id: 'NGO-DOG-003', image: '/images/pet-dog-2.jpg', rescueDate: 'Jan 18, 2026', location: 'Medical Ward' },
    { name: 'Daisy', type: 'Cow', breed: 'Jersey', age: '5 years', status: 'Healthy', id: 'NGO-COW-001', image: '/images/animal-cow-1.jpg', rescueDate: 'Sep 1, 2025', location: 'Farm Shelter' },
  ]

  const sosAlerts = [
    { id: '1', petType: 'Dog', description: 'Injured stray dog found near highway', location: '123 Oak Street, Downtown', distance: '2.3 km', time: '5 mins ago', status: 'Pending', reporterPhone: '+1 555-0123' },
    { id: '2', petType: 'Cat', description: 'Cat stuck on rooftop, distressed', location: '456 Pine Avenue', distance: '1.8 km', time: '15 mins ago', status: 'In Process', reporterPhone: '+1 555-0456' },
    { id: '3', petType: 'Dog', description: 'Abandoned puppies found in park', location: 'Central Park, East Gate', distance: '3.5 km', time: '30 mins ago', status: 'Completed', reporterPhone: '+1 555-0789' },
    { id: '4', petType: 'Cow', description: 'Injured cow on roadside', location: 'Highway 45, Mile 12', distance: '8.2 km', time: '1 hour ago', status: 'Pending', reporterPhone: '+1 555-0321' },
  ]

    const vets = [
    {
      name: 'Dr. Sarah Johnson',
      specialty: 'General Practice',
      availability: 'Available Now',
      image: '/images/vet-1.jpg',
      rating: 4.9,
      distance: '1.2 km',
      //phone: '+1 (555) 123-4567',
      descriptions: 'Dr. Sarah Johnson is an experienced general practitioner providing routine checkups, preventive care, and treatment for common health conditions. She focuses on compassionate, patient-centered care to ensure overall well-being.',
      prescriptions: ['Heartgard Plus', 'Frontline'],
    },
    {
      name: 'Dr. Michael Chen',
      specialty: 'Surgery Specialist',
      availability: 'Available Today',
      image: '/images/vet-2.jpg',
      rating: 4.8,
      distance: '2.5 km',
      //phone: '+1 (555) 234-5678',
      descriptions: 'Dr. Michael Chen offers reliable and compassionate medical care, including regular health checkups, diagnosis, and treatment. He believes in clear communication and personalized care for every patient.',
      prescriptions: ['Metacam', 'Clavamox'],
    },
    {

      name: 'Dr. Emily Rodriguez',
      specialty: 'Emergency Care',
      availability: 'On Call 24/7',
      image: '/images/vet-3.jpg',
      rating: 4.9,
      distance: '0.8 km',
      //phone: '+1 (555) 345-6789',
      descriptions: 'Dr. Emily Rodriguez provides comprehensive veterinary care, including health checkups, preventive treatments, and guidance for maintaining your pet’s overall health and happiness.',
      prescriptions: [],
    },
    ]

  const galleryItems = [
    { id: '1', type: 'image', url: '/images/rescue-dog-1.jpg', title: 'Rocky\'s Rescue Day', date: 'Oct 10, 2025', likes: 245 },
    { id: '2', type: 'image', url: '/images/rescue-cat-1.jpg', title: 'Luna Finding Home', date: 'Dec 15, 2025', likes: 189 },
    { id: '3', type: 'video', url: '/images/pet-dog-1.jpg', title: 'Max\'s Recovery Journey', date: 'Nov 25, 2025', likes: 312, duration: '2:45' },
    { id: '4', type: 'image', url: '/images/pet-cat-1.jpg', title: 'Bella\'s First Day', date: 'Jan 5, 2026', likes: 156 },
    { id: '5', type: 'image', url: '/images/animal-cow-1.jpg', title: 'Daisy at Farm Shelter', date: 'Sep 1, 2025', likes: 98 },
    { id: '6', type: 'video', url: '/images/pet-dog-2.jpg', title: 'Charlie\'s Progress', date: 'Jan 20, 2026', likes: 203, duration: '1:30' },
  ]

  const rescueVans = [
    { id: 'VAN-001', name: 'Rescue Unit Alpha', driver: 'John Smith', status: 'Available', location: 'Base Station', fuel: 85, lastService: 'Jan 10, 2026' },
    { id: 'VAN-002', name: 'Rescue Unit Beta', driver: 'Mike Wilson', status: 'On Mission', location: 'Downtown Area', fuel: 60, lastService: 'Jan 5, 2026', currentMission: 'Responding to SOS #1' },
    { id: 'VAN-003', name: 'Rescue Unit Gamma', driver: 'Sarah Lee', status: 'Available', location: 'East District', fuel: 92, lastService: 'Jan 15, 2026' },
    { id: 'VAN-004', name: 'Medical Transport', driver: 'Tom Brown', status: 'Maintenance', location: 'Service Center', fuel: 45, lastService: 'Dec 20, 2025' },
  ]

  const trackedAnimals = [
    { id: '1', name: 'Rocky', image: '/images/rescue-dog-1.jpg', location: { lat: 40.7128, lng: -74.0060 }, status: 'Active', lastUpdate: '2 mins ago', battery: 85 },
    { id: '2', name: 'Luna', image: '/images/rescue-cat-1.jpg', location: { lat: 40.7580, lng: -73.9855 }, status: 'Active', lastUpdate: '5 mins ago', battery: 72 },
    { id: '3', name: 'Max', image: '/images/pet-dog-1.jpg', location: { lat: 40.7484, lng: -73.9857 }, status: 'Active', lastUpdate: '1 min ago', battery: 93 },
  ]

  const donors = [
    { name: 'John Smith', amount: 5000, date: 'Feb 1', type: 'Monthly' },
    { name: 'Sarah Johnson', amount: 10000, date: 'Feb 1', type: 'One-time' },
    { name: 'Mike Chen', amount: 2500, date: 'Jan 28', type: 'Monthly' },
  ]

  const volunteers = [
    { name: 'Alice Brown', role: 'Animal Care', hours: 120, status: 'Active' },
    { name: 'Bob Wilson', role: 'Rescue Ops', hours: 85, status: 'Active' },
  ]

  const animalCounts = {
    cats: animals.filter((a) => a.type === 'Cat').length,
    dogs: animals.filter((a) => a.type === 'Dog').length,
    cows: animals.filter((a) => a.type === 'Cow').length,
  }

  const totalFunds = donors.reduce((sum, donor) => sum + donor.amount, 0)

  const handleSidebarClick = (view: ActiveView) => {
    if (view === 'logout') {
      handleLogout()
    } else {
      setActiveView(view)
      setSidebarOpen(false)
    }
  }

  const viewPetPassport = (animal: typeof animals[0]) => {
    setSelectedPet(animal)
    setShowPassport(true)
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-800">INNOVET</h1>
            <p className="text-xs text-slate-500">NGO Portal</p>
          </div>
        </div>
      </div>
      <div className="flex-1 p-4 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.view
          return (
            <button
              key={item.label}
              onClick={() => handleSidebarClick(item.view)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-200' 
                  : 'text-slate-600 hover:bg-rose-50'
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
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50">
          <Avatar className="w-10 h-10 border-2 border-white">
            <AvatarFallback className="bg-gradient-to-br from-rose-500 to-pink-500 text-white">{user?.name?.[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500">NGO Admin</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeView) {
      case 'animals':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <PawPrint className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Our Animals</h2>
                  <p className="text-sm text-slate-500">{animals.length} animals in care</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input placeholder="Search animals..." className="pl-10 w-48" />
                </div>
                <Button variant="outline" className="bg-transparent"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {animals.map((animal) => (
                <div key={animal.id} className="group p-5 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 hover:shadow-xl transition-all">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-white shadow-lg group-hover:scale-105 transition-transform">
                      <Image src={animal.image || "/placeholder.svg"} alt={animal.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-800">{animal.name}</h3>
                        <Badge className={`${
                          animal.status === 'Healthy' ? 'bg-emerald-100 text-emerald-700' :
                          animal.status === 'Recovery' ? 'bg-amber-100 text-amber-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {animal.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500">{animal.type} - {animal.breed}</p>
                      <p className="text-xs text-slate-400 mt-1">Age: {animal.age}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">ID</span>
                      <span className="font-mono text-slate-700">{animal.id}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Rescue Date</span>
                      <span className="text-slate-700">{animal.rescueDate}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-500">Location</span>
                      <span className="text-slate-700">{animal.location}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => viewPetPassport(animal)} className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500" size="sm">
                      <QrCode className="mr-2 h-4 w-4" /> Passport
                    </Button>
                    {/* <Button variant="outline" size="sm" className="bg-transparent">
                      <Eye className="h-4 w-4" />
                    </Button> */}
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Emergency SOS</h2>
                <p className="text-sm text-slate-500">{sosAlerts.filter(a => a.status === 'Pending').length} cases pending response</p>
              </div>
            </div>
<Tabs defaultValue="all" className="w-full">
  <TabsList className="bg-white/60 backdrop-blur-sm border border-white/50 p-1 rounded-xl mb-6">
                <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">All</TabsTrigger>
                <TabsTrigger value="Pending" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">Pending</TabsTrigger>
                <TabsTrigger value="In Process" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">In Process</TabsTrigger>
                <TabsTrigger value="Completed" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">Completed</TabsTrigger>
  </TabsList>
  {/* <TabsContent value="all" className="mt-0">
                  <div className="grid md:grid-cols-3 gap-4">
                    {sosAlerts.map((statuss) => (
                      <div key={statuss.id} className="group p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 hover:shadow-xl transition-all">
                        <div className="aspect-square relative rounded-xl overflow-hidden mb-4">
                          <Image src={statuss.status || "/placeholder.svg"} alt={statuss.id} fill className="object-cover group-hover:scale-105 transition-transform" /> 
                          <Badge className="absolute top-2 right-2 bg-white/90 text-slate-700">{statuss.status}</Badge>
                        </div>
                        <h3 className="font-semibold text-slate-800">{statuss.id}</h3>
                        <p className="text-sm text-slate-500 mb-2">{statuss.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-teal-600">{product.price}</span>
                          <Button size="sm" className="bg-gradient-to-r from-teal-500 to-cyan-500">Add to Cart</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent> */}
</Tabs> 
            <div className="space-y-4">
              {sosAlerts.map((alert) => (
                <div key={alert.id} className={`p-5 rounded-2xl border transition-all ${
                  alert.status === 'Pending' 
                    ? 'bg-gradient-to-r from-rose-50 to-white border-rose-200' 
                    : alert.status === 'In Process'
                    ? 'bg-gradient-to-r from-amber-50 to-white border-amber-200'
                    : 'bg-white/70 border-white/50'
                }`}>
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${
                      alert.status === 'Pending' ? 'bg-rose-500' : alert.status === 'In Process' ? 'bg-amber-500' : 'bg-slate-400'
                    }`}>
                      <PawPrint className="w-7 h-7 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-lg font-bold text-slate-800">{alert.petType} Emergency</h3>
                        {/* <Badge className={`${
                          alert.priority === 'Critical' ? 'bg-rose-500' : alert.priority === 'High' ? 'bg-amber-500' : 'bg-slate-400'
                        } text-white border-0`}>
                          {alert.priority}
                        </Badge> */}
                        <Badge variant="outline" className={`${
                          alert.status === 'Pending' ? 'border-rose-300 text-rose-600' : 
                          alert.status === 'In Process' ? 'border-emerald-300 text-emerald-600' : 'border-blue-300 text-blue-600'
                        }`}>
                          {alert.status}
                        </Badge>
                      </div>
                      <p className="text-slate-600 mb-2">{alert.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{alert.location}</span>
                        <span className="flex items-center gap-1"><Navigation className="w-4 h-4" />{alert.distance}</span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{alert.time}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {alert.status === 'Pending' && (
                        <Button className="bg-gradient-to-r from-rose-500 to-pink-500">
                          <Truck className="mr-2 h-4 w-4" /> Dispatch Van
                        </Button>
                      )}
                      {alert.status !== 'Completed' && (
                        <Button variant="outline" className="border-rose-200 text-rose-600 bg-transparent">
                          <Phone className="mr-2 h-4 w-4" /> Call Reporter
                        </Button>
                      )}
                      {/* <Button variant="outline" className="border-rose-200 text-rose-600 bg-transparent">
                        <Phone className="mr-2 h-4 w-4" /> Call Reporter
                      </Button> */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'consultation':
                return (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                        <Stethoscope className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-800">Vet Directory</h2>
                        <p className="text-sm text-slate-500">Find veterinarians, view descriptions & prescriptions</p>
                      </div>
                    </div>
        
                    {vets.map((vet) => (
                      <div key={vet.name} className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 hover:shadow-xl transition-all">
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="flex items-start gap-4">
                            <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                              <AvatarImage src={vet.image || "/placeholder.svg"} alt={vet.name} />
                              <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white text-xl">{vet.name[4]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-xl font-bold text-slate-800">{vet.name}</h3>
                              <p className="text-slate-500">{vet.specialty}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 border-0">{vet.availability}</Badge>
                                <span className="flex items-center text-sm text-amber-600">
                                  <Star className="w-4 h-4 fill-amber-400 mr-1" />{vet.rating}
                                </span>
                                <span className="flex items-center text-sm text-slate-400">
                                  <MapPin className="w-4 h-4 mr-1" />{vet.distance}
                                </span>
                              </div>
                              {/* <p className="flex items-center text-sm text-slate-500 mt-2">
                                <Phone className="w-4 h-4 mr-2" />{vet.//phone}
                              </p> */}
                            </div>
                          </div>
                          <div className="flex-1 md:border-l md:pl-6 border-slate-200">
                            <div className="mb-4">
                              <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-teal-500" /> Descriptions
                              </h4>
                              <p className="text-sm text-slate-600 bg-teal-50/50 p-3 rounded-xl">{vet.descriptions}</p>
                            </div>
                            {/* {vet.prescriptions.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                  <Pill className="w-4 h-4 text-cyan-500" /> Active Prescriptions
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {vet.prescriptions.map((rx) => (
                                    <span key={rx} className="px-3 py-1.5 bg-cyan-50 text-cyan-700 rounded-full text-sm font-medium">{rx}</span>
                                  ))}
                                </div>
                              </div>
                            )} */}
                          </div>
                        </div>
                        <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                          <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
                            <Calendar className="mr-2 h-4 w-4" /> Book Appointment
                          </Button>
                          {/* <Button variant="outline" className="bg-transparent">
                            <Video className="mr-2 h-4 w-4" /> Video Consult
                          </Button> */}
                        </div>
                      </div>
                    ))}
                  </div>
                )
      case 'gallery':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">My Gallery</h2>
                  <p className="text-sm text-slate-500">Photos and videos of our rescued animals</p>
                </div>
              </div>
              <Button className="bg-gradient-to-r from-violet-500 to-purple-500">
                <Upload className="mr-2 h-4 w-4" /> Upload Media
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {galleryItems.map((item) => (
                <div key={item.id} className="group rounded-2xl overflow-hidden bg-white/70 backdrop-blur-sm border border-white/50 hover:shadow-xl transition-all">
                  <div className="aspect-video relative">
                    <Image src={item.url || "/placeholder.svg"} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                    {item.type === 'video' && (
                      <>
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                            <Play className="w-6 h-6 text-violet-600 ml-1" />
                          </div>
                        </div>
                        <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded">{item.duration}</span>
                      </>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-800 mb-1">{item.title}</h3>
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>{item.date}</span>
                      {/* <span className="flex items-center gap-1"><Heart className="w-4 h-4 text-rose-500" />{item.likes}</span> */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'vans':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Rescue Vans</h2>
                <p className="text-sm text-slate-500">{rescueVans.filter(v => v.status === 'Available').length} vans available</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              {rescueVans.map((van) => (
                <div key={van.id} className={`p-5 rounded-2xl backdrop-blur-sm border transition-all ${
                  van.status === 'Available' ? 'bg-white/70 border-emerald-100' :
                  van.status === 'On Mission' ? 'bg-gradient-to-r from-blue-50 to-white border-blue-200' :
                  'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{van.name}</h3>
                      <p className="text-sm text-slate-500 font-mono">{van.id}</p>
                    </div>
                    <Badge className={`${
                      van.status === 'Available' ? 'bg-emerald-100 text-emerald-700' :
                      van.status === 'On Mission' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {van.status}
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Driver</span>
                      <span className="font-medium text-slate-700">{van.driver}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Location</span>
                      <span className="text-slate-700">{van.location}</span>
                    </div>
                    {/* <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Fuel Level</span>
                      <div className="flex items-center gap-2">
                        <Progress value={van.fuel} className="w-20 h-2" />
                        <span className="text-slate-700">{van.fuel}%</span>
                      </div>
                    </div> */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Last Service</span>
                      <span className="text-slate-700">{van.lastService}</span>
                    </div>
                  </div>

                  {van.currentMission && (
                    <div className="p-3 rounded-lg bg-blue-50 mb-4">
                      <p className="text-sm text-blue-700 font-medium">{van.currentMission}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {van.status === 'Available' && (
                      <Button className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500" size="sm">
                        <Navigation className="mr-2 h-4 w-4" /> Dispatch
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="bg-transparent">
                      <MapPin className="mr-2 h-4 w-4" /> Track
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      // case 'tracking':
      //   return (
      //     <div className="space-y-6">
      //       <div className="flex items-center gap-3 mb-6">
      //         <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
      //           <MapPin className="w-5 h-5 text-white" />
      //         </div>
      //         <div>
      //           <h2 className="text-2xl font-bold text-slate-800">Life Tracking</h2>
      //           <p className="text-sm text-slate-500">Real-time location tracking for animals with GPS collars</p>
      //         </div>
      //       </div>

      //       <div className="grid lg:grid-cols-3 gap-6">
      //         {/* Map Placeholder */}
      //         <div className="lg:col-span-2 h-[500px] rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-200 overflow-hidden relative">
      //           <div className="absolute inset-0 flex items-center justify-center">
      //             <div className="text-center">
      //               <MapPin className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
      //               <p className="text-emerald-700 font-medium">Interactive Map</p>
      //               <p className="text-sm text-emerald-600">Showing {trackedAnimals.length} tracked animals</p>
      //             </div>
      //           </div>
      //           {/* Simulated map markers */}
      //           <div className="absolute top-1/4 left-1/3">
      //             <div className="relative">
      //               <div className="w-8 h-8 rounded-full bg-rose-500 border-2 border-white shadow-lg flex items-center justify-center animate-pulse">
      //                 <PawPrint className="w-4 h-4 text-white" />
      //               </div>
      //               <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium bg-white px-2 py-0.5 rounded shadow">Rocky</span>
      //             </div>
      //           </div>
      //           <div className="absolute top-1/2 right-1/3">
      //             <div className="relative">
      //               <div className="w-8 h-8 rounded-full bg-amber-500 border-2 border-white shadow-lg flex items-center justify-center animate-pulse">
      //                 <PawPrint className="w-4 h-4 text-white" />
      //               </div>
      //               <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium bg-white px-2 py-0.5 rounded shadow">Luna</span>
      //             </div>
      //           </div>
      //           <div className="absolute bottom-1/3 left-1/2">
      //             <div className="relative">
      //               <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center animate-pulse">
      //                 <PawPrint className="w-4 h-4 text-white" />
      //               </div>
      //               <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium bg-white px-2 py-0.5 rounded shadow">Max</span>
      //             </div>
      //           </div>
      //         </div>

      //         {/* Tracked Animals List */}
      //         <div className="space-y-3">
      //           <h3 className="font-semibold text-slate-800 mb-4">Tracked Animals</h3>
      //           {trackedAnimals.map((animal) => (
      //             <div key={animal.id} className="p-4 rounded-xl bg-white/70 backdrop-blur-sm border border-white/50 hover:shadow-lg transition-all">
      //               <div className="flex items-center gap-3 mb-3">
      //                 <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow">
      //                   <Image src={animal.image || "/placeholder.svg"} alt={animal.name} fill className="object-cover" />
      //                 </div>
      //                 <div className="flex-1">
      //                   <h4 className="font-semibold text-slate-800">{animal.name}</h4>
      //                   <div className="flex items-center gap-1">
      //                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      //                     <span className="text-xs text-emerald-600">{animal.status}</span>
      //                   </div>
      //                 </div>
      //               </div>
      //               <div className="space-y-2 text-sm">
      //                 <div className="flex items-center justify-between">
      //                   <span className="text-slate-500">Last Update</span>
      //                   <span className="text-slate-700">{animal.lastUpdate}</span>
      //                 </div>
      //                 <div className="flex items-center justify-between">
      //                   <span className="text-slate-500">Battery</span>
      //                   <div className="flex items-center gap-2">
      //                     <Progress value={animal.battery} className="w-16 h-2" />
      //                     <span className="text-slate-700">{animal.battery}%</span>
      //                   </div>
      //                 </div>
      //               </div>
      //               <Button size="sm" variant="outline" className="w-full mt-3 bg-transparent">
      //                 <Navigation className="mr-2 h-4 w-4" /> Navigate
      //               </Button>
      //             </div>
      //           ))}
      //         </div>
      //       </div>
      //     </div>
      //   )

      case 'settings':
        return (
          <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
                <p className="text-sm text-slate-500">Manage NGO account and preferences</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50">
                <h3 className="font-semibold text-slate-800 mb-4">Organization Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Organization Name</label>
                    <Input defaultValue="Pet Rescue Foundation" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Admin Name</label>
                    <Input defaultValue={user?.name} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Email</label>
                    <Input defaultValue={user?.email} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Phone</label>
                    <Input defaultValue="+1 (555) 000-0000" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Address</label>
                    <Input defaultValue="123 Animal Care Street" className="mt-1" />
                  </div>
                </div>
                <Button className="mt-6 bg-gradient-to-r from-rose-500 to-pink-500">Save Changes</Button>
              </div>

              <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50">
                <h3 className="font-semibold text-slate-800 mb-4">Notifications</h3>
                <div className="space-y-3">
                  {['SOS Alerts', 'New Donations', 'Volunteer Applications', 'Consultation Reminders'].map((item) => (
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
          <div className="space-y-6">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-1">NGO Dashboard</h2>
              <p className="text-slate-500">Welcome , {user?.name}</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50 hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-3 shadow-lg">
                  <PawPrint className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-slate-800">{animalCounts.cats}</p>
                <p className="text-sm text-slate-500">Cats</p>
              </div>
              <div className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50 hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mb-3 shadow-lg">
                  <PawPrint className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-slate-800">{animalCounts.dogs}</p>
                <p className="text-sm text-slate-500">Dogs</p>
              </div>
              <div className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50 hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-3 shadow-lg">
                  <PawPrint className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-slate-800">{animalCounts.cows}</p>
                <p className="text-sm text-slate-500">Cows</p>
              </div>
              <div className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50 hover:shadow-lg transition-all cursor-pointer" onClick={() => setActiveView('sos')}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mb-3 shadow-lg animate-pulse">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-slate-800">{sosAlerts.filter(a => a.status === 'Pending').length}</p>
                <p className="text-sm text-slate-500">Active SOS</p>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-emerald-50/80 to-white/60 backdrop-blur-sm border border-emerald-100/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Funds Received</h3>
                  <p className="text-xs text-emerald-600">This month</p>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-4xl font-bold text-slate-800">${totalFunds.toLocaleString()}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Progress value={65} className="h-2 flex-1" />
                  <span className="text-sm text-slate-500">65% of goal</span>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Frequent Donors</h3>
                  </div>
                </div>
                <div className="space-y-3">
                  {donors.map((donor, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-white/80 to-rose-50/30">
                      <Avatar className="w-10 h-10 border-2 border-white">
                        <AvatarFallback className="bg-gradient-to-br from-rose-400 to-pink-400 text-white">{donor.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">{donor.name}</p>
                        <p className="text-xs text-slate-500">{donor.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600">${donor.amount.toLocaleString()}</p>
                        <Badge variant="outline" className="text-xs">{donor.type}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Active Volunteers</h3>
                </div>
                <div className="space-y-3">
                  {volunteers.map((vol, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-white/80 to-violet-50/30">
                      <Avatar className="w-10 h-10 border-2 border-white">
                        <AvatarFallback className="bg-gradient-to-br from-violet-400 to-purple-400 text-white">{vol.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">{vol.name}</p>
                        <p className="text-xs text-slate-500">{vol.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-violet-600">{vol.hours} hrs</p>
                        <Badge className="bg-emerald-100 text-emerald-700 text-xs">{vol.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-pink-50/40">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-rose-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl" />
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
              <Button variant="ghost" size="icon" className="hover:bg-rose-100/50"><Menu className="h-6 w-6" /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 bg-gradient-to-b from-white to-rose-50/50">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <h1 className="font-bold text-lg bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">INNOVET</h1>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative hover:bg-rose-100/50">
              <Bell className="h-5 w-5 text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
            </Button>
            <Avatar className="w-8 h-8 border-2 border-white">
              <AvatarFallback className="bg-gradient-to-br from-rose-500 to-pink-500 text-white text-xs">{user?.name?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      <main className="flex-1 relative z-10 lg:ml-72 pt-16 lg:pt-0">
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>

      <EmergencySOS />

      {selectedPet && (
        <PetPassport
          open={showPassport}
          onOpenChange={setShowPassport}
          petId={selectedPet.id}
          petName={selectedPet.name}
          petType={selectedPet.type}
          breed={selectedPet.breed || "Mixed"}
          age={selectedPet.age || "Unknown"}
          owner="NGO Rescue"
          petImage={selectedPet.image}
          medicalHistory={[selectedPet.status]}
          vaccinations={[
            { name: 'Rabies', date: '2024-01-15' },
            { name: 'Distemper', date: '2024-01-15' },
          ]}
          treatments={[{ date: '2024-01-20', description: 'Initial health checkup' }]}
        />
      )}
    </div>
  )
}
