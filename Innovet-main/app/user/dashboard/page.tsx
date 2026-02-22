'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { EmergencySOS } from '@/components/emergency-sos'
import { PetPassport } from '@/components/pet-passport'
import BookAppointmentModal from '@/components/BookAppointmentModal'
import ChatbotPanel from '@/components/ChatbotPanel'
import { useAuth } from '@/contexts/auth-context'
import {
  Menu,
  MessageSquare,
  FileText,
  QrCode,
  Bell,
  Baby,
  Utensils,
  Calendar,
  Settings,
  LogOut,
  Stethoscope,
  ShoppingBag,
  GraduationCap,
  Heart,
  Users,
  Play,
  DollarSign,
  HandHeart,
  PawPrint,
  Star,
  Clock,
  MapPin,
  ChevronRight,
  Pill,
  Video,
  Truck,
  ImageIcon,
  ThumbsUp,
  Send,
  Building,
  Building2,
  Phone,
  Mail,
  Globe,
} from 'lucide-react'

type ActiveSection = 'home' | 'vet-directory' | 'pharmacy' | 'training' | 'ngo' | 'community'

export default function UserDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [showPassport, setShowPassport] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<ActiveSection>('home')
  const [feedback, setFeedback] = useState('')
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [selectedVet, setSelectedVet] = useState<any>(null)

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const openBookingModal = (vet: any) => {
    setSelectedVet(vet)
    setBookingModalOpen(true)
  }

  const closeBookingModal = () => {
    setBookingModalOpen(false)
    setSelectedVet(null)
  }

  const topNavItems = [
    { id: 'home' as const, label: 'Home', icon: PawPrint },
    { id: 'vet-directory' as const, label: 'Vet Directory', icon: Stethoscope },
    { id: 'pharmacy' as const, label: 'Pharmacy', icon: Pill },
    { id: 'training' as const, label: 'Training', icon: GraduationCap },
    { id: 'ngo' as const, label: 'NGO', icon: Heart },
    { id: 'community' as const, label: 'Community', icon: Users },
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

const pharmacies = [
    {
      id: 1,
      name: "Smart Chemist",
      distance: "500m",
      address: "B-12, Sector 18, Noida",
      timing: "24 Hours Open",
      contact: "+91 120 4567890",
      status: "Open",
      rating: 4.8,
phImage: "/images/img/smartchemist.webp"
    },
    {
      id: 2,
      name: "Easylife chemist",
      distance: "1.5 km",
      address: "Shop 4, Market Complex, Phase 2",
      timing: "09:00 AM - 11:00 PM",
      contact: "+91 120 9876543",
      status: "Open",
      rating: 4.5,
      phImage: "/images/img/easylife.webp"
    },
    {
      id: 3,
      name: "Wellness Chemist ",
      distance: "2.1 km",
      address: "G-5, Galleria Mall Road",
      timing: "10:00 AM - 10:00 PM",
      contact: "+91 11 22334455",
      status: "Closed",
      phImage: "/images/img/wellness.webp",
      rating: 4.2
    }
  ];

  const pharmacyProducts = [
    { name: 'Heartgard Plus', category: 'Medicine', price: '$45.99', image: '/images/product-food.jpg', description: 'Monthly heartworm prevention' },
    { name: 'Premium Dog Food', category: 'Food', price: '$59.99', image: '/images/product-food.jpg', description: 'High-protein adult formula' },
    { name: 'Flea & Tick Shampoo', category: 'Grooming', price: '$18.99', image: '/images/product-food.jpg', description: 'Gentle cleansing formula' },
    { name: 'Joint Support Chews', category: 'Supplements', price: '$34.99', image: '/images/product-food.jpg', description: 'Glucosamine & chondroitin' },
    { name: 'Dental Treats', category: 'Food', price: '$24.99', image: '/images/product-food.jpg', description: 'Reduces plaque & tartar' },
    { name: 'Vitamin Supplements', category: 'Supplements', price: '$29.99', image: '/images/product-food.jpg', description: 'Daily multivitamin' },
  ]

  const trainingVideos = [
    { id:1 ,title: 'New Cat Owner Guide', duration: '15 min', thumbnail: '/images/img/catguide2.png', views: '12K', instructor: 'John Smith' ,youtubeurl:"https://youtu.be/PMjBFyFO4W8?si=jeuwlDexBujqfKlU"},
    { id:2 ,title: 'New Dog Owner Guide', duration: '20 min', thumbnail: '/images/img/dogguide.jpg', views: '8.5K', instructor: 'Sarah Lee' ,youtubeurl:"https://youtu.be/g_ow9J6wBv0?si=SsEBWEqsS8LIVHn0"},
    { id:3 ,title: 'New Cow Owner Guide', duration: '25 min', thumbnail: '/images/img/cowguide.webp', views: '6.2K', instructor: 'Mike Brown' ,youtubeurl:"https://youtu.be/l0H5sVWt_dA?si=6ofqRWb3Qmj5pRZX"},
    { id:4 ,title: 'New Goat Owner Guide', duration: '18 min', thumbnail: '/images/img/goatguide.jpg', views: '9.1K', instructor: 'Emily Davis' ,youtubeurl:"https://youtu.be/0OAu4e8bRgo?si=t5ulp3zotlZIml7z"},
  ]
  const trainingVideos2 = [
    { id:1 ,title: 'Cat First Aid', duration: '15 min', thumbnail: '/images/img/catFA.png', views: '12K', instructor: 'John Smith',youtubeurl:"https://youtu.be/2TbgB1br3D4?si=OmWzvdtHMhhcBzKf" },
    { id:2 ,title: 'Dog First Aid', duration: '20 min', thumbnail: '/images/img/dogFA.jpg', views: '8.5K', instructor: 'Sarah Lee',youtubeurl:"https://youtu.be/p_Xw_LaofEQ?si=GvAWESQNpMNP_Ih4" },
    { id:3 ,title: 'Cow First Aid', duration: '25 min', thumbnail: '/images/training-video-1.jpg', views: '6.2K', instructor: 'Mike Brown',youtubeurl:"https://www.youtube.com/watch?v=4WM4eVsXI-0&t=105s" },
    { id:4 ,title: 'Goat First Aid', duration: '18 min', thumbnail: '/images/training-video-1.jpg', views: '9.1K', instructor: 'Emily Davis',youtubeurl:"https://youtu.be/2TbgB1br3D4?si=OmWzvdtHMhhcBzKf" },
    // { id:5 ,title: 'Goat First Aid', duration: '18 min', thumbnail: '/images/training-video-1.jpg', views: '9.1K', instructor: 'Emily Davis' ,youtubeurl:"https://youtu.be/2TbgB1br3D4?si=OmWzvdtHMhhcBzKf"},
  ]


  const liveSessions = [
    { title: 'Live Q&A: Puppy Behavior', time: 'Today 3:00 PM', instructor: 'Dr. Sarah Johnson', attendees: 45 },
    { title: 'Group Training Session', time: 'Tomorrow 10:00 AM', instructor: 'John Smith', attendees: 28 },
    { title: 'Virtual Vet Consultation', time: 'Sat 2:00 PM', instructor: 'Dr. Michael Chen', attendees: 15 },
  ]

  const ngos = [
    { 
      name: 'Pet Rescue Foundation', 
      type: 'Government', 
      // donations: '$125,000',
      volunteers: 250,
      rescueVans: 8,
      adoptions: 320,
      contact: '+1 (555) 111-2222',
      email: 'contact@petrescue.gov',
      website: 'www.petrescue.gov',
      gallery: ['/images/rescue-dog-1.jpg', '/images/rescue-cat-1.jpg', '/images/pet-dog-1.jpg'],
    },
    { 
      name: 'Animal Welfare Society', 
      type: 'Private', 
      // donations: '$89,000',
      volunteers: 180,
      rescueVans: 5,
      adoptions: 215,
      contact: '+1 (555) 333-4444',
      email: 'help@animalwelfare.org',
      website: 'www.animalwelfare.org',
      gallery: ['/images/pet-cat-1.jpg', '/images/pet-dog-2.jpg', '/images/animal-cow-1.jpg'],
    },
  ]

  const blogs = [
    { title: '10 Tips for First-Time Pet Owners', author: 'Dr. Sarah Johnson', date: 'Jan 15, 2026', image: '/images/blog-1.jpg', likes: 234 },
    { title: 'Understanding Your Pet\'s Body Language', author: 'Emily Davis', date: 'Jan 12, 2026', image: '/images/training-video-1.jpg', likes: 189 },
    { title: 'Nutrition Guide for Senior Dogs', author: 'Dr. Michael Chen', date: 'Jan 10, 2026', image: '/images/product-food.jpg', likes: 156 },
  ]

  const vlogs = [
    { title: 'A Day at the Animal Shelter', duration: '12:45', views: '45K', thumbnail: '/images/rescue-dog-1.jpg' },
    { title: 'Pet Adoption Success Stories', duration: '18:30', views: '32K', thumbnail: '/images/pet-dog-1.jpg' },
    { title: 'Behind the Scenes: Vet Clinic', duration: '15:20', views: '28K', thumbnail: '/images/vet-clinic.jpg' },
  ]

  const sidebarItems = [
    { icon: MessageSquare, label: 'AI Chatbot', action: () => setActiveSection('ai-chatbot') },
    { icon: FileText, label: 'Medical Records', action: () => router.push('/user/medical-records') },
    { icon: QrCode, label: 'Pet Passport', action: () => setShowPassport(true) },
    { icon: Bell, label: 'Notifications', action: () => router.push('/user/notifications') },
    { icon: Baby, label: 'Pet Nanny', action: () => router.push('/user/pet-nanny') },
    { icon: Utensils, label: 'Diet Plans', action: () => {} },
    { icon: Calendar, label: 'Appointments', action: () => router.push('/user/appointments') },
    { icon: Settings, label: 'Settings', action: () => {} },
    { icon: LogOut, label: 'Logout', action: handleLogout },
  ]

  const renderContent = () => {
    switch (activeSection) {
      case 'ai-chatbot':
        return <ChatbotPanel />

      case 'vet-directory':
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
                  <Button 
                    onClick={() => openBookingModal(vet)}
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                  >
                    <Calendar className="mr-2 h-4 w-4" /> Book Appointment
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )

case 'pharmacy':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Pharmacy</h2>
                <p className="text-sm text-slate-500">Recommended products for your pets</p>
              </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Nearest Pharmacies (Near You)</h2>
          <button className="flex items-center gap-2 text-blue-600 font-semibold border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50">
            Use My Location
          </button>
        </div>

        {/* Div Blocks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pharmacies.map((shop) => (
            <div key={shop.id} className="group bg-white rounded-3xl p-2 shadow-sm border border-slate-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="bg-slate-100 rounded-2xl h-40 mb-4 overflow-hidden relative">
                {/* Image Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center text-slate-300 italic">
                  <Image src={shop.phImage || "/placeholder.svg"} alt={shop.name} fill className="object-cover" />
                </div>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-blue-600">
                  {shop.distance}
                </div>
              </div>

              <div className="px-4 pb-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-slate-800">{shop.name}</h3>
                  <div className="flex items-center text-yellow-500">
                    <span className="text-sm font-bold mr-1">{shop.rating}</span>
                    ★
                  </div>
                </div>

                <p className="text-slate-500 text-sm mb-4 flex items-start gap-2">
                  <MapPin size={16} className="mt-1 flex-shrink-0 text-red-500" />
                  {shop.address}
                </p>

                <div className="space-y-2 mb-6 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-blue-500" />
                    <span>{shop.timing}</span>
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${shop.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {shop.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <Phone size={16} className="text-green-500" />
                    {shop.contact}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition">
                    Get Directions
                  </button>
                  <button className="w-12 h-12 flex items-center justify-center border border-slate-200 rounded-xl hover:bg-slate-50">
                    <Phone size={20} className="text-green-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
            </Tabs>
          </div>
        )
      case 'training':
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Training Sessions</h2>
                <p className="text-sm text-slate-500">Videos and live training sessions</p>
              </div>
            </div>

            {/* Live Sessions */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Live & Upcoming Sessions
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {liveSessions.map((session) => (
                  <div key={session.title} className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 hover:shadow-xl transition-all">
                    <div className="flex items-center gap-2 mb-3">
                      <Video className="w-5 h-5 text-indigo-500" />
                      <Badge className="bg-red-500 text-white border-0">Live</Badge>
                    </div>
                    <h4 className="font-semibold text-slate-800 mb-1">{session.title}</h4>
                    <p className="text-sm text-slate-500 mb-2">{session.instructor}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-indigo-600 font-medium">{session.time}</span>
                      <span className="text-slate-400">{session.attendees} attending</span>
                    </div>
                    <Button className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-blue-500">Join Session</Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Video Library */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">New Pet Owner Guide</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {trainingVideos.map((video) => (
                  <div key={video.id} className="group relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 hover:shadow-xl transition-all">
                    <div className="aspect-video relative overflow-hidden">
                      <Image src={video.thumbnail || "/placeholder.svg"} alt={video.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        
                        <a
    href={video.youtubeurl}
    target="_blank"
    rel="noopener noreferrer"
    className="absolute inset-0 flex items-center justify-center"
  >
                        <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                          <Play className="w-6 h-6 text-indigo-600 ml-1" />
                        </div>
      </a>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                        <span className="text-xs text-white/90 flex items-center"><Clock className="w-3 h-3 mr-1" />{video.duration}</span>
                        <span className="text-xs text-white/90">{video.views} views</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-slate-800 mb-1">{video.title}</h4>
                      <p className="text-sm text-slate-500">{video.instructor}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Video Library 2*/}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">First Aid & Emergency Care</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {trainingVideos2.map((video) => (
                  <div key={video.id} className="group relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 hover:shadow-xl transition-all">
                    <div className="aspect-video relative overflow-hidden">
                      <Image src={video.thumbnail || "/placeholder.svg"} alt={video.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
<a
    href={video.youtubeurl}
    target="_blank"
    rel="noopener noreferrer"
    className="absolute inset-0 flex items-center justify-center"
  >
                        <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                          <Play className="w-6 h-6 text-indigo-600 ml-1" />
                        </div>
  </a>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                        <span className="text-xs text-white/90 flex items-center"><Clock className="w-3 h-3 mr-1" />{video.duration}</span>
                        <span className="text-xs text-white/90">{video.views} views</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-slate-800 mb-1">{video.title}</h4>
                      <p className="text-sm text-slate-500">{video.instructor}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'ngo':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">NGO Partners</h2>
                <p className="text-sm text-slate-500">Government & private animal welfare organizations</p>
              </div>
            </div>

            {ngos.map((ngo) => (
              <div key={ngo.name} className="p-6 rounded-2xl bg-gradient-to-br from-white/80 to-rose-50/30 backdrop-blur-sm border border-white/50 hover:shadow-xl transition-all">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="lg:w-1/3">
                    <div className="flex items-center gap-3 mb-4">
                      {ngo.type === 'Government' ? (
                        <Building className="w-8 h-8 text-blue-600" />
                      ) : (
                        <Building2 className="w-8 h-8 text-rose-600" />
                      )}
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">{ngo.name}</h3>
                        <Badge className={ngo.type === 'Government' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}>{ngo.type}</Badge>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-slate-600">
                      <p className="flex items-center gap-2"><Phone className="w-4 h-4" />{ngo.contact}</p>
                      <p className="flex items-center gap-2"><Mail className="w-4 h-4" />{ngo.email}</p>
                      <p className="flex items-center gap-2"><Globe className="w-4 h-4" />{ngo.website}</p>
                    </div>
                  </div>
                  
                  <div className="lg:w-1/3 grid grid-cols-2 gap-3">
                    {/* <div className="p-4 rounded-xl bg-white/60 text-center">
                      <DollarSign className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                      <p className="text-lg font-bold text-slate-800">{ngo.donations}</p>
                      <p className="text-xs text-slate-500">Donations</p>
                    </div> */}
                    <div className="p-4 rounded-xl bg-white/60 text-center">
                      <Users className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                      <p className="text-lg font-bold text-slate-800">{ngo.volunteers}</p>
                      <p className="text-xs text-slate-500">Volunteers</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/60 text-center">
                      <Truck className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                      <p className="text-lg font-bold text-slate-800">{ngo.rescueVans}</p>
                      <p className="text-xs text-slate-500">Rescue Vans</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/60 text-center">
                      <Heart className="w-6 h-6 text-rose-500 mx-auto mb-1" />
                      <p className="text-lg font-bold text-slate-800">{ngo.adoptions}</p>
                      <p className="text-xs text-slate-500">Adoptions</p>
                    </div>
                  </div>

                  <div className="lg:w-1/3">
                    <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2"><ImageIcon className="w-4 h-4" />Gallery</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {ngo.gallery.map((img, i) => (
                        <div key={i} className="aspect-square relative rounded-lg overflow-hidden">
                          <Image src={img || "/placeholder.svg"} alt="Gallery" fill className="object-cover hover:scale-110 transition-transform" />
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
                
                <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-rose-100">
                  <Button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600">
                    <DollarSign className="mr-2 h-4 w-4" /> Donate Now
                  </Button>
                  <Button variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-50 bg-transparent ">
                    <HandHeart className="mr-2 h-4 w-4" /> Volunteer
                  </Button>
                  <Button variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-50 bg-transparent">
                    <PawPrint className="mr-2 h-4 w-4" /> Adopt
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )

      case 'community':
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Community</h2>
                <p className="text-sm text-slate-500">Blogs, vlogs, and feedback</p>
              </div>
            </div>

            <Tabs defaultValue="blogs" className="w-full">
              <TabsList className="bg-white/60 backdrop-blur-sm border border-white/50 p-1 rounded-xl mb-6">
                <TabsTrigger value="blogs" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">Blogs</TabsTrigger>
                <TabsTrigger value="vlogs" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">Vlogs</TabsTrigger>
                <TabsTrigger value="feedback" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">Feedback</TabsTrigger>
              </TabsList>

              <TabsContent value="blogs" className="mt-0 space-y-4">
                {blogs.map((blog) => (
                  <div key={blog.title} className="flex flex-col md:flex-row gap-4 p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 hover:shadow-xl transition-all">
                    <div className="md:w-48 aspect-video relative rounded-xl overflow-hidden">
                      <Image src={blog.image || "/placeholder.svg"} alt={blog.title} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-800 mb-1">{blog.title}</h3>
                      <p className="text-sm text-slate-500 mb-2">By {blog.author} | {blog.date}</p>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center text-sm text-rose-500"><ThumbsUp className="w-4 h-4 mr-1" />{blog.likes} likes</span>
                        <Button variant="ghost" size="sm" className="text-violet-600">Read More <ChevronRight className="ml-1 h-4 w-4" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="vlogs" className="mt-0">
                <div className="grid md:grid-cols-3 gap-4">
                  {vlogs.map((vlog) => (
                    <div key={vlog.title} className="group relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 hover:shadow-xl transition-all">
                      <div className="aspect-video relative">
                        <Image src={vlog.thumbnail || "/placeholder.svg"} alt={vlog.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                            <Play className="w-6 h-6 text-violet-600 ml-1" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                          <span className="text-xs text-white/90">{vlog.duration}</span>
                          <span className="text-xs text-white/90">{vlog.views} views</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-slate-800">{vlog.title}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="feedback" className="mt-0">
                <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Share Your Feedback</h3>
                  <Textarea 
                    placeholder="Tell us about your experience with INNOVET..."
                    className="mb-4 min-h-32"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                  <Button className="bg-gradient-to-r from-violet-500 to-purple-500">
                    <Send className="mr-2 h-4 w-4" /> Submit Feedback
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )

      default:
        return (
          <div className="space-y-8">
            {/* Welcome Section */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-600 p-6 md:p-8 text-white">
              <div className="absolute inset-0 bg-[url('/images/hero-pets.jpg')] opacity-10 bg-cover bg-center" />
              <div className="relative z-10">
                <p className="text-teal-100 text-sm mb-1">Welcome </p>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">{user?.name || 'Pet Parent'}</h2>
                <p className="text-teal-100 text-sm mb-4">Your pets are in great health today!</p>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => setShowPassport(true)} className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30">
                    <QrCode className="mr-2 h-4 w-4" /> Pet Passport
                  </Button>
                  <Button className="bg-white text-teal-600 hover:bg-white/90">
                    <Calendar className="mr-2 h-4 w-4" /> Book Appointment
                  </Button>
                </div>
              </div>
            </section>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Upcoming Appointments', value: '2', icon: Calendar, color: 'from-teal-500 to-cyan-500' },
                { label: 'Active Prescriptions', value: '3', icon: Pill, color: 'from-emerald-500 to-teal-500' },
                // { label: 'Training Progress', value: '75%', icon: GraduationCap, color: 'from-blue-500 to-indigo-500' },
                { label: 'Pet Health Score', value: '92%', icon: Heart, color: 'from-rose-500 to-pink-500' },
              ].map((stat) => (
                <div key={stat.label} className="p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <section>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[
                  { title: 'Vaccination due for Max', time: '2 days left', type: 'reminder' },
                  { title: 'Dr. Sarah responded to your query', time: '1 hour ago', type: 'message' },
                  { title: 'New training video available', time: '3 hours ago', type: 'content' },
                  { title: 'New training video available', time: '3 hours ago', type: 'content' },
                ].map((activity, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center">
                      {activity.type === 'reminder' && <Bell className="w-5 h-5 text-teal-600" />}
                      {activity.type === 'message' && <MessageSquare className="w-5 h-5 text-teal-600" />}
                      {activity.type === 'content' && <Play className="w-5 h-5 text-teal-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">{activity.title}</p>
                      <p className="text-sm text-slate-500">{activity.time}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                ))}
              </div>
            </section>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/40 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-300/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-emerald-300/15 rounded-full blur-3xl" />
      </div>

      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-white/50">
        <div className="flex h-16 items-center gap-4 px-4 md:px-6">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-teal-100/50 lg:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-gradient-to-b from-white to-teal-50/50 backdrop-blur-xl">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex flex-col gap-2 py-4">
                <div className="px-3 py-4 mb-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                      <PawPrint className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg text-slate-800">INNOVET</h2>
                      <p className="text-xs text-slate-500">Pet Healthcare</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {sidebarItems.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => { item.action(); setSidebarOpen(false) }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-gradient-to-r hover:from-teal-100/80 hover:to-cyan-100/60 hover:text-teal-700 transition-all duration-200"
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
              <PawPrint className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">INNOVET</h1>
          </div>

          {/* Top Navigation Links */}
          <div className="hidden md:flex items-center gap-1 ml-8">
            {topNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-teal-100/50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
          
          <div className="ml-auto flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative hover:bg-teal-100/50">
              <Bell className="h-5 w-5 text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-teal-100/80 to-cyan-100/60">
              <Avatar className="w-7 h-7 border-2 border-white">
                <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white text-xs">{user?.name?.[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-slate-700 hidden lg:block">{user?.name}</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden overflow-x-auto border-t border-white/50">
          <div className="flex items-center gap-1 px-4 py-2">
            {topNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                    : 'text-slate-600 bg-white/50'
                }`}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Layout with Sidebar + Main Content */}
      <div className="flex relative z-10">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col fixed left-0 top-16 bottom-0 bg-white/70 backdrop-blur-xl border-r border-white/50 overflow-y-auto">
          <div className="p-4">
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-gradient-to-r hover:from-teal-100/80 hover:to-cyan-100/60 hover:text-teal-700 transition-all duration-200"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 px-4 md:px-6 py-6">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      <EmergencySOS />

      <PetPassport
        open={showPassport}
        onOpenChange={setShowPassport}
        petId="PET-2024-12345"
        petName="Max"
        petType="Dog"
        breed="Golden Retriever"
        age="3 years"
        owner={user?.name || 'Unknown'}
        petImage="/images/pet-dog-1.jpg"
        medicalHistory={['Healthy', 'No allergies', 'Neutered']}
        vaccinations={[
          { name: 'Rabies', date: '2024-01-15' },
          { name: 'Distemper', date: '2024-01-15' },
          { name: 'Parvovirus', date: '2024-01-15' },
        ]}
        treatments={[
          { date: '2024-01-20', description: 'Annual checkup - All clear' },
          { date: '2023-12-10', description: 'Dental cleaning' },
        ]}
      />

      <BookAppointmentModal
        isOpen={bookingModalOpen}
        onClose={closeBookingModal}
        vet={selectedVet}
      />
    </div>
  )
}
