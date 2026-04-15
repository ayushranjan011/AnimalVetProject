'use client'

import { Suspense, useEffect, useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EmergencySOS } from '@/components/emergency-sos'
import { PetPassport } from '@/components/pet-passport'
import BookAppointmentModal from '@/components/BookAppointmentModal'
import ChatbotPanel from '@/components/ChatbotPanel'
import DietPlanChatbot from '@/components/DietPlanChatbot'
import MedicalRecords from '@/components/MedicalRecords'
import Notifications from '@/components/Notifications'
import PetNanny from '@/components/PetNanny'
import Appointments from '@/components/Appointments'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import {
  Menu,
  MessageSquare,
  FileText,
  QrCode,
  Bell,
  Plus,
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
  Building,
  Building2,
  Phone,
  Mail,
  Globe,
  X,
  Pencil,
  Trash2,
  ChevronDown,
  UserCircle2,
  IndianRupee,
  Eye,
} from 'lucide-react'

type ActiveSection =
  | 'home'
  | 'vet-directory'
  | 'pharmacy'
  | 'training'
  | 'ngo'
  | 'community'
  | 'ai-chatbot'
  | 'medical-records'
  | 'notifications'
  | 'pet-nanny'
  | 'diet-plans'
  | 'appointments'
  | 'my-pets'
  | 'my-profile'
  | 'settings'

type PetProfile = {
  id: string
  petId: string
  name: string
  type: string
  breed: string
  age: string
  ageYears: number | null
  ageMonths: number | null
  gender: string
  color: string
  weight: string
  image: string
  microchipId: string
  isNeutered: boolean
  isRescue: boolean
  notes: string
}

type PetDbRow = {
  id: string
  pet_id: string
  name: string
  species: string
  breed: string | null
  age_years: number | null
  age_months: number | null
  gender: string | null
  color: string | null
  weight: number | null
  profile_image: string | null
  microchip_id: string | null
  is_neutered: boolean | null
  is_rescue: boolean | null
  notes: string | null
}

type VetDirectoryItem = {
  id: string
  name: string
  specialty: string
  availability: string
  image: string
  rating: number | null
  distance: string
  city: string
  clinicName: string
  clinicAddress: string
  experienceYears: number | null
  consultationFee: number | null
  phone: string
  email: string
  descriptions: string
  prescriptions: string[]
}

type NgoDirectoryItem = {
  id: string
  name: string
  type: 'Government' | 'Private'
  volunteers: number
  rescueVans: number
  adoptions: number
  contact: string
  email: string
  website: string
  gallery: string[]
}

type VolunteerApplicationForm = {
  fullName: string
  email: string
  phone: string
  age: string
  city: string
  availability: string
  skills: string
  experience: string
  idProofNumber: string
  message: string
}

type PetHandoverForm = {
  ownerName: string
  ownerEmail: string
  ownerPhone: string
  handoverPetId: string
}

type NgoPetProfile = {
  id: string
  ngoId: string
  name: string
  type: string
  breed: string
  age: string
  healthStatus: string
  image: string
  description: string
}

type PetAdoptionForm = {
  applicantName: string
  applicantEmail: string
  applicantPhone: string
  city: string
  address: string
  preferredPetType: string
  experience: string
  verificationIdNumber: string
  requestPetPassport: boolean
}

type RecentActivityItem = {
  title: string
  time: string
  type: 'reminder' | 'message' | 'content'
  timestamp: number
}

type BlogComment = {
  author: string
  text: string
  time: string
}

type CommunityBlog = {
  id: string
  title: string
  author: string
  date: string
  image: string
  summary: string
  likes: number
  reads: number
  comments: BlogComment[]
}

type CommunityVlog = {
  id: string
  title: string
  owner: string
  description: string
  duration: string
  views: string
  likes: string
  thumbnail: string
  youtubeUrl: string
}

type UserProfileForm = {
  name: string
  email: string
  phone: string
  city: string
  state: string
  country: string
}

type OwnerProfileForm = UserProfileForm & {
  location: string
}

const initialOwnerProfileForm: OwnerProfileForm = {
  name: '',
  email: '',
  phone: '',
  location: '',
  city: '',
  state: '',
  country: '',
}

type IncomingVideoCall = {
  notificationId: string
  title: string
  description: string
  roomID: string
}

const mapToUsersRole = (
  role: 'user' | 'veterinarian' | 'ngo' | 'pet_nanny' | undefined
): 'pet_owner' | 'veterinarian' | 'ngo' | 'pet_nanny' => {
  if (role === 'veterinarian' || role === 'ngo' || role === 'pet_nanny') {
    return role
  }

  return 'pet_owner'
}

const isMissingColumnError = (error: any, columnName?: string) => {
  const message = String(error?.message || '').toLowerCase()
  const details = String(error?.details || '').toLowerCase()
  const normalizedColumnName = normalizeText(columnName).toLowerCase()
  return (
    error?.code === 'PGRST204' ||
    error?.code === '42703' ||
    message.includes('could not find') ||
    message.includes('column') ||
    details.includes('column') ||
    (!!normalizedColumnName &&
      (message.includes(normalizedColumnName) || details.includes(normalizedColumnName)))
  )
}

const formatSupabaseError = (error: any) => {
  if (!error) return 'Unknown error'
  const parts = [error?.message, error?.details, error?.hint, error?.code]
    .filter(Boolean)
    .map((item) => String(item))
  return parts.length > 0 ? parts.join(' | ') : JSON.stringify(error)
}

const isSetupPendingError = (error: any) => {
  const text = formatSupabaseError(error).toLowerCase()
  return (
    text.includes('permission denied') ||
    text.includes('does not exist') ||
    text.includes('relation') ||
    text.includes('schema cache') ||
    text.includes('rls')
  )
}

const normalizeText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

const getYouTubeEmbedUrl = (url: string, autoplay = false) => {
  try {
    const parsed = new URL(url)
    const params = new URLSearchParams()
    if (autoplay) {
      params.set('autoplay', '1')
      params.set('playsinline', '1')
    }
    if (parsed.hostname.includes('youtu.be')) {
      const videoId = parsed.pathname.replace('/', '')
      return videoId ? `https://www.youtube.com/embed/${videoId}${params.toString() ? `?${params.toString()}` : ''}` : url
    }

    if (parsed.hostname.includes('youtube.com')) {
      const videoId = parsed.searchParams.get('v')
      return videoId ? `https://www.youtube.com/embed/${videoId}${params.toString() ? `?${params.toString()}` : ''}` : url
    }
  } catch {
    return url
  }

  return url
}

const formatRelativeTime = (value?: string | null) => {
  if (!value) return 'Just now'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Just now'

  const diffMs = Date.now() - date.getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diffMs < minute) return 'Just now'
  if (diffMs < hour) return `${Math.floor(diffMs / minute)} min ago`
  if (diffMs < day) return `${Math.floor(diffMs / hour)} hr ago`
  return `${Math.floor(diffMs / day)} day ago`
}

const mapNotificationActivityType = (type: unknown): 'reminder' | 'message' | 'content' => {
  const normalizedType = normalizeText(type).toLowerCase()
  if (normalizedType === 'appointment' || normalizedType === 'vaccination' || normalizedType === 'sos') {
    return 'reminder'
  }
  if (normalizedType === 'medical' || normalizedType === 'prescription') {
    return 'message'
  }
  return 'content'
}

const getEmailPrefix = (value: unknown) => {
  const email = normalizeText(value)
  if (!email) return ''

  const [prefix] = email.split('@')
  return normalizeText(prefix)
}

const resolveRoomIDFromNotification = (row: any) => {
  const directRoomID =
    normalizeText(row?.room_id) ||
    normalizeText(row?.call_room_id) ||
    normalizeText(row?.video_room_id)

  if (directRoomID) return directRoomID

  const text = `${normalizeText(row?.description)} ${normalizeText(row?.title)}`
  const encodedMatch = /roomid=([a-zA-Z0-9_-]+)/i.exec(text)
  if (encodedMatch?.[1]) return encodedMatch[1]

  const labelMatch = /room\s*id\s*[:=]\s*([a-zA-Z0-9_-]+)/i.exec(text)
  if (labelMatch?.[1]) return labelMatch[1]

  return ''
}

const isVideoCallNotification = (row: any) => {
  if (row?.type !== 'appointment') return false
  const combined = `${normalizeText(row?.title)} ${normalizeText(row?.description)}`.toLowerCase()
  return (
    combined.includes('video call') ||
    combined.includes('join call') ||
    combined.includes('started your video consultation')
  )
}

function UserDashboardContent() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassport, setShowPassport] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<ActiveSection>('home')
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [selectedVet, setSelectedVet] = useState<VetDirectoryItem | null>(null)
  const [selectedBlogPost, setSelectedBlogPost] = useState<CommunityBlog | null>(null)
  const [selectedBlogView, setSelectedBlogView] = useState<'post' | 'comments'>('post')
  const [blogLikeStates, setBlogLikeStates] = useState<Record<string, boolean>>({})
  const [blogReadMarks, setBlogReadMarks] = useState<Record<string, boolean>>({})
  const [blogCommentDrafts, setBlogCommentDrafts] = useState<Record<string, string>>({})
  const [blogCommentsById, setBlogCommentsById] = useState<Record<string, BlogComment[]>>({
    'first-time-pet-owners': [
      { author: 'Aarav', text: 'Great checklist for new pet parents.', time: '2h ago' },
      { author: 'Meera', text: 'The feeding tips were especially helpful.', time: '1d ago' },
    ],
    'pet-body-language': [
      { author: 'Kavya', text: 'This helped me understand my dog much better.', time: '3h ago' },
    ],
    'senior-dog-nutrition': [
      { author: 'Rohit', text: 'Useful guide for my older Labrador.', time: '6h ago' },
    ],
  })
  const [showAddPetPopup, setShowAddPetPopup] = useState(false)
  const [petModalMode, setPetModalMode] = useState<'add' | 'edit'>('add')
  const [editingPetId, setEditingPetId] = useState<string | null>(null)
  const [petImageFile, setPetImageFile] = useState<File | null>(null)
  const [petImagePreview, setPetImagePreview] = useState('')
  const [volunteerIdProofFile, setVolunteerIdProofFile] = useState<File | null>(null)
  const [volunteerIdProofPreview, setVolunteerIdProofPreview] = useState('')
  const [adoptionIdProofFile, setAdoptionIdProofFile] = useState<File | null>(null)
  const [adoptionIdProofPreview, setAdoptionIdProofPreview] = useState('')
  const [isUploadingPetImage, setIsUploadingPetImage] = useState(false)
  const [myPets, setMyPets] = useState<PetProfile[]>([])
  const [selectedPetId, setSelectedPetId] = useState('')
  const [petsLoading, setPetsLoading] = useState(false)
  const [petOwnerId, setPetOwnerId] = useState<string | null>(null)
  const [vets, setVets] = useState<VetDirectoryItem[]>([])
  const [vetsLoading, setVetsLoading] = useState(false)
  const [vetSearchTerm, setVetSearchTerm] = useState('')
  const [vetSchemaWarning, setVetSchemaWarning] = useState('')
  const [ngos, setNgos] = useState<NgoDirectoryItem[]>([])
  const [ngosLoading, setNgosLoading] = useState(false)
  const [ngoSchemaWarning, setNgoSchemaWarning] = useState('')
  const [selectedNgo, setSelectedNgo] = useState<NgoDirectoryItem | null>(null)
  const [showVolunteerForm, setShowVolunteerForm] = useState(false)
  const [submittingVolunteerForm, setSubmittingVolunteerForm] = useState(false)
  const [volunteerForm, setVolunteerForm] = useState<VolunteerApplicationForm>({
    fullName: '',
    email: '',
    phone: '',
    age: '',
    city: '',
    availability: '',
    skills: '',
    experience: '',
    idProofNumber: '',
    message: '',
  })
  const [selectedHandoverNgo, setSelectedHandoverNgo] = useState<NgoDirectoryItem | null>(null)
  const [showHandoverForm, setShowHandoverForm] = useState(false)
  const [submittingHandoverForm, setSubmittingHandoverForm] = useState(false)
  const [handoverForm, setHandoverForm] = useState<PetHandoverForm>({
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    handoverPetId: '',
  })
  const [selectedNgoForProfiles, setSelectedNgoForProfiles] = useState<NgoDirectoryItem | null>(null)
  const [showNgoPetProfiles, setShowNgoPetProfiles] = useState(false)
  const [selectedAdoptionNgo, setSelectedAdoptionNgo] = useState<NgoDirectoryItem | null>(null)
  const [selectedAdoptionPet, setSelectedAdoptionPet] = useState<NgoPetProfile | null>(null)
  const [showAdoptionForm, setShowAdoptionForm] = useState(false)
  const [submittingAdoptionForm, setSubmittingAdoptionForm] = useState(false)
  const [adoptionForm, setAdoptionForm] = useState<PetAdoptionForm>({
    applicantName: '',
    applicantEmail: '',
    applicantPhone: '',
    city: '',
    address: '',
    preferredPetType: 'Dog',
    experience: '',
    verificationIdNumber: '',
    requestPetPassport: true,
  })
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)
  const [incomingVideoCall, setIncomingVideoCall] = useState<IncomingVideoCall | null>(null)
  const [incomingVideoCallOpen, setIncomingVideoCallOpen] = useState(false)
  const [lastIncomingVideoNotificationId, setLastIncomingVideoNotificationId] = useState('')
  const [vetDietPlans, setVetDietPlans] = useState<any[]>([])
  const [dietPlansLoading, setDietPlansLoading] = useState(false)
  const [dietPlansError, setDietPlansError] = useState('')
  const [recentActivities, setRecentActivities] = useState<RecentActivityItem[]>([])
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileForm, setProfileForm] = useState<UserProfileForm>({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    country: '',
  })
  const [ownerProfileForm, setOwnerProfileForm] =
    useState<OwnerProfileForm>(initialOwnerProfileForm)
  const [ownerProfileLoading, setOwnerProfileLoading] = useState(false)
  const [ownerProfileSaving, setOwnerProfileSaving] = useState(false)
  const [ownerProfileSchemaWarning, setOwnerProfileSchemaWarning] = useState('')
  const [newPetForm, setNewPetForm] = useState({
    name: '',
    species: 'Dog',
    breed: '',
    ageYears: '',
    ageMonths: '',
    gender: 'unknown',
    color: '',
    weight: '',
    microchipId: '',
    isNeutered: false,
    isRescue: false,
    profileImage: '',
    notes: '',
  })
  const [activeVlogId, setActiveVlogId] = useState<string | null>(null)
  const resolvedVolunteerIdProofFile =
    typeof volunteerIdProofFile === 'undefined' ? null : volunteerIdProofFile

  useEffect(() => {
    if (activeSection !== 'community' && activeVlogId) {
      setActiveVlogId(null)
    }
  }, [activeSection, activeVlogId])

  const handleBlogLike = (blogId: string) => {
    setBlogLikeStates((previous) => ({
      ...previous,
      [blogId]: !previous[blogId],
    }))
  }

  const handleMarkBlogRead = (blogId: string) => {
    setBlogReadMarks((previous) => {
      if (previous[blogId]) return previous
      return {
        ...previous,
        [blogId]: true,
      }
    })
  }

  const handleOpenBlogPost = (blog: CommunityBlog) => {
    setSelectedBlogView('post')
    handleMarkBlogRead(blog.id)
    setSelectedBlogPost(blog)
  }

  const handleOpenBlogComments = (blog: CommunityBlog) => {
    setSelectedBlogView('comments')
    handleMarkBlogRead(blog.id)
    setSelectedBlogPost(blog)
  }

  const handleCloseBlogPost = () => {
    setSelectedBlogPost(null)
  }

  const handleBlogCommentChange = (blogId: string, value: string) => {
    setBlogCommentDrafts((previous) => ({
      ...previous,
      [blogId]: value,
    }))
  }

  const handleBlogCommentSubmit = (blogId: string) => {
    const commentText = (blogCommentDrafts[blogId] || '').trim()
    if (!commentText) return

    setBlogCommentsById((previous) => ({
      ...previous,
      [blogId]: [
        {
          author: user?.name || 'You',
          text: commentText,
          time: 'Just now',
        },
        ...(previous[blogId] || []),
      ],
    }))
    setBlogCommentDrafts((previous) => ({
      ...previous,
      [blogId]: '',
    }))
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) {
        setProfileForm({
          name: '',
          email: '',
          phone: '',
          city: '',
          state: '',
          country: '',
        })
        return
      }

      setProfileLoading(true)
      let query = await supabase
        .from('profiles')
        .select('name, email, phone, city, state, country')
        .eq('id', user.id)
        .maybeSingle()

      if (query.error && isMissingColumnError(query.error)) {
        query = await supabase
          .from('profiles')
          .select('name, email, phone')
          .eq('id', user.id)
          .maybeSingle()
      }

      setProfileLoading(false)

      if (query.error) {
        setProfileForm({
          name: user.name || '',
          email: user.email || '',
          phone: '',
          city: '',
          state: '',
          country: '',
        })
        return
      }

      const row = query.data || {}
      setProfileForm({
        name: normalizeText((row as any)?.name) || user.name || '',
        email: normalizeText((row as any)?.email) || user.email || '',
        phone: normalizeText((row as any)?.phone),
        city: normalizeText((row as any)?.city),
        state: normalizeText((row as any)?.state),
        country: normalizeText((row as any)?.country),
      })
    }

    void fetchUserProfile()
  }, [user?.id, user?.email, user?.name])

  const handleProfileSave = async () => {
    if (!user?.id) return

    setProfileSaving(true)
    const fullPayload = {
      name: profileForm.name.trim() || user.name,
      phone: profileForm.phone.trim() || null,
      city: profileForm.city.trim() || null,
      state: profileForm.state.trim() || null,
      country: profileForm.country.trim() || null,
    }

    let query = await supabase
      .from('profiles')
      .update(fullPayload)
      .eq('id', user.id)

    if (query.error && isMissingColumnError(query.error)) {
      query = await supabase
        .from('profiles')
        .update({
          name: profileForm.name.trim() || user.name,
          phone: profileForm.phone.trim() || null,
        })
        .eq('id', user.id)
    }

    setProfileSaving(false)

    if (query.error) {
      alert(`Could not update profile: ${query.error.message}`)
      return
    }

    alert('Profile updated successfully.')
  }

  const openIncomingVideoCallPopup = (row: any) => {
    if (!isVideoCallNotification(row)) return

    const roomID = resolveRoomIDFromNotification(row)
    if (!roomID) return

    const notificationId = String(row.id || '')
    if (!notificationId || notificationId === lastIncomingVideoNotificationId) return

    setIncomingVideoCall({
      notificationId,
      title: normalizeText(row.title) || 'Video Call Started',
      description:
        normalizeText(row.description) ||
        'Your veterinarian has started the online consultation.',
      roomID,
    })
    setIncomingVideoCallOpen(true)
    setLastIncomingVideoNotificationId(notificationId)
  }

  useEffect(() => {
    const section = searchParams.get('section')
    const allowedSections: ActiveSection[] = [
      'home',
      'vet-directory',
      'pharmacy',
      'training',
      'ngo',
      'community',
      'ai-chatbot',
      'medical-records',
      'notifications',
      'pet-nanny',
      'diet-plans',
      'appointments',
      'my-pets',
      'my-profile',
      'settings',
    ]

    if (section && allowedSections.includes(section as ActiveSection)) {
      setActiveSection(section as ActiveSection)
    }
  }, [searchParams])

  const openBookingModal = (vet: VetDirectoryItem) => {
    setSelectedVet(vet)
    setBookingModalOpen(true)
  }

  const closeBookingModal = () => {
    setBookingModalOpen(false)
    setSelectedVet(null)
  }

  const mapDbPetToProfile = (pet: PetDbRow): PetProfile => ({
    id: pet.id,
    petId: pet.pet_id,
    name: pet.name,
    type: pet.species || 'Not specified',
    breed: pet.breed || 'Not specified',
    age: pet.age_years !== null || pet.age_months !== null
      ? `${pet.age_years ?? 0}y ${pet.age_months ?? 0}m`
      : 'Not specified',
    ageYears: pet.age_years,
    ageMonths: pet.age_months,
    gender: pet.gender || 'unknown',
    color: pet.color || 'Not specified',
    weight: pet.weight !== null ? String(pet.weight) : 'Not specified',
    image: pet.profile_image || '/images/pet-dog-1.jpg',
    microchipId: pet.microchip_id || '',
    isNeutered: !!pet.is_neutered,
    isRescue: !!pet.is_rescue,
    notes: pet.notes || 'No additional notes.',
  })

  const selectedPet = myPets.find((pet) => pet.id === selectedPetId)
  const selectedPetPassport = selectedPet || myPets[0] || null
  const passportMedicalHistory = selectedPetPassport
    ? [
        selectedPetPassport.isNeutered ? 'Neutered' : 'Not neutered',
        selectedPetPassport.isRescue ? 'Rescue pet' : 'Domestic pet',
        selectedPetPassport.microchipId
          ? `Microchip: ${selectedPetPassport.microchipId}`
          : 'Microchip not available',
      ]
    : ['No pet selected']
  const passportVaccinations = selectedPetPassport
    ? [
        { name: 'Rabies', date: 'Record not added' },
        { name: 'DHPP / Core', date: 'Record not added' },
      ]
    : [{ name: 'No records', date: 'N/A' }]
  const passportTreatments = selectedPetPassport
    ? [
        {
          date: 'Latest note',
          description:
            selectedPetPassport.notes || 'No treatment note available for this pet.',
        },
      ]
    : [{ date: 'N/A', description: 'Select a pet profile to view passport.' }]
  const selectedPetWeightKgRaw =
    selectedPet && selectedPet.weight !== 'Not specified'
      ? Number(selectedPet.weight)
      : null
  const selectedPetWeightKg =
    selectedPetWeightKgRaw !== null &&
    Number.isFinite(selectedPetWeightKgRaw) &&
    selectedPetWeightKgRaw > 0
      ? selectedPetWeightKgRaw
      : null

  useEffect(() => {
    if (!petImageFile) {
      setPetImagePreview('')
      return
    }

    const previewUrl = URL.createObjectURL(petImageFile)
    setPetImagePreview(previewUrl)

    return () => {
      URL.revokeObjectURL(previewUrl)
    }
  }, [petImageFile])

  useEffect(() => {
    if (!resolvedVolunteerIdProofFile) {
      setVolunteerIdProofPreview('')
      return
    }

    const previewUrl = URL.createObjectURL(resolvedVolunteerIdProofFile)
    setVolunteerIdProofPreview(previewUrl)

    return () => {
      URL.revokeObjectURL(previewUrl)
    }
  }, [resolvedVolunteerIdProofFile])

  useEffect(() => {
    if (!adoptionIdProofFile) {
      setAdoptionIdProofPreview('')
      return
    }

    const previewUrl = URL.createObjectURL(adoptionIdProofFile)
    setAdoptionIdProofPreview(previewUrl)

    return () => {
      URL.revokeObjectURL(previewUrl)
    }
  }, [adoptionIdProofFile])

  useEffect(() => {
    const resolveOwnerId = async () => {
      if (!user?.id) {
        setPetOwnerId(null)
        return
      }

      const normalizedEmail = user.email?.trim()
      const normalizedName = user.name?.trim()

      const { data: byId, error: byIdError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      if (byIdError) {
        console.error('Owner id lookup by id failed:', byIdError)
      }

      if (byId?.id) {
        setPetOwnerId(byId.id)
        return
      }

      if (normalizedEmail) {
        const { data: byEmail, error: byEmailError } = await supabase
          .from('users')
          .select('id')
          .eq('email', normalizedEmail)
          .maybeSingle()

        if (byEmailError) {
          console.error('Owner id lookup by email failed:', byEmailError)
        }

        if (byEmail?.id) {
          setPetOwnerId(byEmail.id)
          return
        }
      }

      if (!normalizedEmail) {
        setPetOwnerId(null)
        return
      }

      const { error: upsertError } = await supabase
        .from('users')
        .upsert(
          {
            id: user.id,
            email: normalizedEmail,
            full_name: normalizedName || normalizedEmail.split('@')[0] || 'Pet Owner',
            role: mapToUsersRole(user.role),
          },
          { onConflict: 'id' }
        )

      if (upsertError) {
        console.error('Owner record creation failed:', upsertError)
        setPetOwnerId(null)
        return
      }

      setPetOwnerId(user.id)
    }

    resolveOwnerId()
  }, [user?.id, user?.email, user?.name, user?.role])

  useEffect(() => {
    const loadOwnerProfile = async () => {
      if (!user?.id) {
        setOwnerProfileForm(initialOwnerProfileForm)
        setOwnerProfileSchemaWarning('')
        return
      }

      setOwnerProfileLoading(true)
      setOwnerProfileSchemaWarning('')

      const primaryQuery = await supabase
        .from('profiles')
        .select('name, email, phone, location, city, state, country')
        .eq('id', user.id)
        .maybeSingle()

      let data: any = primaryQuery.data
      let error: any = primaryQuery.error

      if (error && isMissingColumnError(error)) {
        const fallbackQuery = await supabase
          .from('profiles')
          .select('name, email, phone')
          .eq('id', user.id)
          .maybeSingle()

        data = fallbackQuery.data
        error = fallbackQuery.error
        setOwnerProfileSchemaWarning(
          'Profile location columns are missing in database. Run owner_profile_location_migration.sql in Supabase SQL Editor.'
        )
      }

      setOwnerProfileLoading(false)

      if (error) {
        console.error('Failed to load pet owner profile:', error)
        setOwnerProfileForm({
          ...initialOwnerProfileForm,
          name: user.name || '',
          email: user.email || '',
        })
        return
      }

      setOwnerProfileForm({
        name: normalizeText(data?.name) || user.name || '',
        email: normalizeText(data?.email) || user.email || '',
        phone: normalizeText(data?.phone),
        location: normalizeText(data?.location),
        city: normalizeText(data?.city),
        state: normalizeText(data?.state),
        country: normalizeText(data?.country),
      })
    }

    void loadOwnerProfile()
  }, [user?.id, user?.name, user?.email])

  const handleOwnerProfileSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!user?.id) {
      return
    }

    const normalizedName = ownerProfileForm.name.trim()
    const normalizedPhone = ownerProfileForm.phone.trim()

    if (!normalizedName) {
      alert('Name is required.')
      return
    }

    if (normalizedPhone && normalizedPhone.length !== 10) {
      alert('Phone number must be exactly 10 digits')
      return
    }

    setOwnerProfileSaving(true)

    const profilePayload = {
      name: normalizedName,
      phone: normalizedPhone || null,
      location: ownerProfileForm.location.trim() || null,
      city: ownerProfileForm.city.trim() || null,
      state: ownerProfileForm.state.trim() || null,
      country: ownerProfileForm.country.trim() || null,
      updated_at: new Date().toISOString(),
    }

    let updateResult = await supabase.from('profiles').update(profilePayload).eq('id', user.id)

    if (updateResult.error && isMissingColumnError(updateResult.error)) {
      const fallbackResult = await supabase
        .from('profiles')
        .update({
          name: normalizedName,
          phone: normalizedPhone || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      updateResult = fallbackResult
      if (!fallbackResult.error) {
        setOwnerProfileSchemaWarning(
          'Profile updated without location fields because location columns are missing. Run owner_profile_location_migration.sql in Supabase SQL Editor.'
        )
      }
    }

    setOwnerProfileSaving(false)

    if (updateResult.error) {
      console.error('Failed to update owner profile:', updateResult.error)
      alert(`Could not update profile: ${updateResult.error.message || 'Unknown error'}`)
      return
    }

    alert('Profile updated successfully.')
  }

  useEffect(() => {
    const fetchVets = async () => {
      setVetsLoading(true)
      setVetSchemaWarning('')
      const primaryQuery = await supabase
        .from('profiles')
        .select(
          'id, email, name, role, phone, vet_specialty, vet_experience_years, vet_clinic_name, vet_clinic_address, vet_city, vet_consultation_fee, vet_availability, vet_description, vet_image_url, vet_rating'
        )
        .eq('role', 'veterinarian')
        .order('created_at', { ascending: false })

      let data: any[] | null = primaryQuery.data as any[] | null
      let error: any = primaryQuery.error

      if (error && isMissingColumnError(error)) {
        setVetSchemaWarning(
          'Vet profile schema is incomplete in database. Run vet_profile_migration.sql in Supabase SQL Editor to show specialty, city, clinic and about details.'
        )
        const fallback = await supabase
          .from('profiles')
          .select('id, email, name, role')
          .eq('role', 'veterinarian')
          .order('created_at', { ascending: false })

        data = fallback.data as any[] | null
        error = fallback.error
      }

      setVetsLoading(false)

      if (error) {
        console.error('Failed to fetch veterinarians:', error)
        setVets([])
        return
      }

      let vetRows = data || []
      if (vetRows.length === 0) {
        const { data: usersFallbackRows, error: usersFallbackError } = await supabase
          .from('users')
          .select('id, email, full_name, role')
          .eq('role', 'veterinarian')

        if (usersFallbackError) {
          console.warn('Could not fetch veterinarians from users fallback:', usersFallbackError)
        } else if ((usersFallbackRows || []).length > 0) {
          vetRows = (usersFallbackRows || []).map((row: any) => ({
            id: row.id,
            email: row.email,
            name: row.full_name,
            role: row.role,
          }))
        }
      }

      const vetIds = vetRows
        .map((row: any) => String(row.id || ''))
        .filter(Boolean)

      const fallbackNamesById: Record<string, string> = {}
      if (vetIds.length > 0) {
        const { data: usersRows, error: usersError } = await supabase
          .from('users')
          .select('id, full_name')
          .in('id', vetIds)

        if (usersError) {
          console.warn('Could not fetch fallback vet names from users table:', usersError)
        } else {
          for (const usersRow of usersRows || []) {
            const usersId = String((usersRow as any)?.id || '')
            const usersName = normalizeText((usersRow as any)?.full_name)
            if (usersId && usersName) {
              fallbackNamesById[usersId] = usersName
            }
          }
        }
      }

      const mappedVets: VetDirectoryItem[] = vetRows.map((row: any) => ({
        id: String(row.id),
        name:
          normalizeText(row.name) ||
          fallbackNamesById[String(row.id)] ||
          getEmailPrefix(row.email) ||
          'Veterinarian',
        specialty: row.vet_specialty || 'Specialty not provided',
        availability: row.vet_availability || 'Not specified',
        image: row.vet_image_url || '/placeholder.svg',
        rating: typeof row.vet_rating === 'number' ? row.vet_rating : null,
        distance: row.vet_city || row.vet_clinic_address || 'Location not provided',
        city: row.vet_city || '',
        clinicName: row.vet_clinic_name || '',
        clinicAddress: row.vet_clinic_address || '',
        experienceYears:
          typeof row.vet_experience_years === 'number' ? row.vet_experience_years : null,
        consultationFee:
          row.vet_consultation_fee !== null && row.vet_consultation_fee !== undefined
            ? Number(row.vet_consultation_fee)
            : null,
        phone: row.phone || '',
        email: row.email || '',
        descriptions: row.vet_description || 'No profile description available yet.',
        prescriptions: [],
      }))

      setVets(mappedVets)
    }

    fetchVets()
  }, [activeSection])

  useEffect(() => {
    const fetchNgos = async () => {
      setNgosLoading(true)
      setNgoSchemaWarning('')

      const primaryQuery = await supabase
        .from('profiles')
        .select('id, email, name, role, phone')
        .eq('role', 'ngo')
        .order('created_at', { ascending: false })

      let ngoRows: any[] = (primaryQuery.data as any[]) || []
      let error: any = primaryQuery.error

      if (error || ngoRows.length === 0) {
        const fallbackUsers = await supabase
          .from('users')
          .select('id, email, full_name, role')
          .eq('role', 'ngo')

        if (fallbackUsers.error) {
          if (error) {
            error = `${formatSupabaseError(error)} | ${formatSupabaseError(fallbackUsers.error)}`
          } else {
            error = fallbackUsers.error
          }
        } else {
          error = null
          ngoRows = (fallbackUsers.data || []).map((row: any) => ({
            id: row.id,
            email: row.email,
            name: row.full_name,
            role: row.role,
            phone: '',
          }))
        }
      }

      setNgosLoading(false)

      if (error) {
        console.error('Failed to fetch NGOs:', error)
        setNgoSchemaWarning(
          'NGO records not available yet. Please ensure NGO users are registered in profiles/users table.'
        )
        setNgos([])
        return
      }

      const mappedNgos: NgoDirectoryItem[] = ngoRows.map((row: any, index: number) => {
        const id = String(row.id || `ngo-${index}`)
        const displayName = normalizeText(row.name) || getEmailPrefix(row.email) || 'NGO Organization'

        return {
          id,
          name: displayName,
          type: index % 2 === 0 ? 'Government' : 'Private',
          volunteers: 50 + index * 15,
          rescueVans: 2 + (index % 5),
          adoptions: 20 + index * 12,
          contact: normalizeText(row.phone) || 'Contact not provided',
          email: normalizeText(row.email) || 'Email not provided',
          website: 'Not provided',
          gallery: ['/images/rescue-dog-1.jpg', '/images/rescue-cat-1.jpg', '/images/pet-dog-1.jpg'],
        }
      })

      setNgos(mappedNgos)
    }

    if (activeSection === 'ngo') {
      fetchNgos()
    }
  }, [activeSection])

  useEffect(() => {
    const fetchUnreadNotificationCount = async () => {
      if (!user?.id) {
        setUnreadNotificationCount(0)
        return
      }

      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) {
        console.error('Failed to fetch unread notification count:', error)
        setUnreadNotificationCount(0)
        return
      }

      setUnreadNotificationCount(count || 0)
    }

    fetchUnreadNotificationCount()
  }, [user?.id, activeSection])

  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel(`dashboard-notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const row = payload.new as any
          if (!row) return

          if (!row.is_read) {
            setUnreadNotificationCount((prev) => prev + 1)
          }

          openIncomingVideoCallPopup(row)
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [user?.id, lastIncomingVideoNotificationId])

  useEffect(() => {
    if (!user?.id) return

    const pollIncomingVideoCall = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'appointment')
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) {
        return
      }

      const latestVideoCallRow = (data || []).find((row) => {
        const id = String((row as any)?.id || '')
        if (!id || id === lastIncomingVideoNotificationId) return false
        return isVideoCallNotification(row) && !!resolveRoomIDFromNotification(row)
      })

      if (latestVideoCallRow) {
        openIncomingVideoCallPopup(latestVideoCallRow)
      }
    }

    void pollIncomingVideoCall()
    const intervalId = window.setInterval(() => {
      void pollIncomingVideoCall()
    }, 15000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [user?.id, lastIncomingVideoNotificationId])

  const markNotificationAsRead = async (notificationId?: string) => {
    const id = normalizeText(notificationId)
    if (!id) return

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)

    if (error) {
      console.warn('Failed to mark incoming call notification as read:', error)
      return
    }

    setUnreadNotificationCount((prev) => Math.max(0, prev - 1))
  }

  const handleJoinIncomingCall = async () => {
    if (!incomingVideoCall?.roomID) return
    await markNotificationAsRead(incomingVideoCall.notificationId)
    setIncomingVideoCallOpen(false)
    router.push(`/user/video-call?roomID=${encodeURIComponent(incomingVideoCall.roomID)}`)
  }

  useEffect(() => {
    const fetchRecentActivities = async () => {
      if (!user?.id) {
        setRecentActivities([])
        return
      }

      const activities: RecentActivityItem[] = []

      const notificationsQuery = await supabase
        .from('notifications')
        .select('id, title, description, type, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (!notificationsQuery.error) {
        for (const row of notificationsQuery.data || []) {
          const timestampString =
            normalizeText((row as any)?.created_at) || new Date().toISOString()

          activities.push({
            title:
              normalizeText((row as any)?.title) ||
              normalizeText((row as any)?.description) ||
              'New notification',
            time: formatRelativeTime(timestampString),
            type: mapNotificationActivityType((row as any)?.type),
            timestamp: new Date(timestampString).getTime(),
          })
        }
      }

      let appointmentsQuery = await supabase
        .from('appointments')
        .select('id, pet_name, status, created_at, date, appointment_date, scheduled_date, mode, type')
        .or(`owner_id.eq.${user.id},pet_owner_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(10)

      if (appointmentsQuery.error && isMissingColumnError(appointmentsQuery.error, 'created_at')) {
        appointmentsQuery = await supabase
          .from('appointments')
          .select('id, pet_name, status, created_at, date, appointment_date, scheduled_date, mode, type')
          .or(`owner_id.eq.${user.id},pet_owner_id.eq.${user.id}`)
          .order('date', { ascending: false })
          .limit(10)
      }

      if (!appointmentsQuery.error) {
        for (const row of appointmentsQuery.data || []) {
          const petName = normalizeText((row as any)?.pet_name) || 'your pet'
          const status = normalizeText((row as any)?.status) || 'updated'
          const mode = normalizeText((row as any)?.mode) || ''
          const type = normalizeText((row as any)?.type) || ''
          const timestampString =
            normalizeText((row as any)?.created_at) ||
            normalizeText((row as any)?.date) ||
            normalizeText((row as any)?.appointment_date) ||
            normalizeText((row as any)?.scheduled_date) ||
            new Date().toISOString()

          // Check if it's a video consultation
          if (mode.toLowerCase().includes('video') || mode.toLowerCase().includes('online') || type.toLowerCase().includes('consultation')) {
            activities.push({
              title: `Video consultation ${status.toLowerCase()} for ${petName}`,
              time: formatRelativeTime(timestampString),
              type: 'message', // Use message icon for consultations
              timestamp: new Date(timestampString).getTime(),
            })
          } else {
            activities.push({
              title: `Appointment ${status.toLowerCase()} for ${petName}`,
              time: formatRelativeTime(timestampString),
              type: 'reminder',
              timestamp: new Date(timestampString).getTime(),
            })
          }
        }
      }

      // Add mock training video views (since no tracking table exists yet)
      const mockTrainingViews = [
        { title: 'Watched "Dog First Aid Training"', time: '2 hours ago', type: 'content' as const },
        { title: 'Completed "Cat Care Basics"', time: '1 day ago', type: 'content' as const },
      ]
      for (const view of mockTrainingViews) {
        activities.push({
          title: view.title,
          time: view.time,
          type: view.type,
          timestamp: Date.now() - Math.random() * 86400000 * 2, // Random time in last 2 days
        })
      }

      const sorted = activities
        .filter((item) => Number.isFinite(item.timestamp))
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 6)

      setRecentActivities(sorted)
    }

    void fetchRecentActivities()
  }, [user?.id, unreadNotificationCount, incomingVideoCall?.notificationId])

  useEffect(() => {
    const fetchDietPlans = async () => {
      if (!petOwnerId) {
        setVetDietPlans([])
        setDietPlansError('')
        return
      }

      setDietPlansLoading(true)
      setDietPlansError('')

      let query = await supabase
        .from('diet_plans')
        .select('*')
        .eq('owner_id', petOwnerId)
        .order('created_at', { ascending: false })

      if (query.error && isMissingColumnError(query.error)) {
        query = await supabase
          .from('diet_plans')
          .select('*')
          .eq('owner_id', petOwnerId)
      }

      setDietPlansLoading(false)

      const { data, error } = query

      if (error) {
        const formattedError = formatSupabaseError(error)
        if (isSetupPendingError(error)) {
          console.warn('Diet plans setup pending:', formattedError)
          setDietPlansError('Diet plans database setup pending. Please configure table/policies.')
        } else {
          console.warn('Failed to fetch diet plans:', formattedError)
          setDietPlansError('Could not load diet plans.')
        }
        setVetDietPlans([])
        return
      }

      setDietPlansError('')
      setVetDietPlans(data || [])
    }

    fetchDietPlans()
  }, [petOwnerId])

  useEffect(() => {
    const fetchPets = async () => {
      if (!petOwnerId) {
        setMyPets([])
        setSelectedPetId('')
        return
      }

      setPetsLoading(true)
      const { data, error } = await supabase
        .from('pets')
        .select('id, pet_id, name, species, breed, age_years, age_months, gender, color, weight, profile_image, microchip_id, is_neutered, is_rescue, notes')
        .eq('owner_id', petOwnerId)
        .order('created_at', { ascending: false })

      setPetsLoading(false)

      if (error) {
        console.error('Failed to fetch pets:', error)
        setMyPets([])
        setSelectedPetId('')
        return
      }

      const fetchedPets = ((data || []) as PetDbRow[]).map(mapDbPetToProfile)
      setMyPets(fetchedPets)
      setSelectedPetId((prev) =>
        prev && fetchedPets.some((pet) => pet.id === prev) ? prev : (fetchedPets[0]?.id || '')
      )
    }

    fetchPets()
  }, [petOwnerId])

  const resetPetForm = () => {
    setNewPetForm({
      name: '',
      species: 'Dog',
      breed: '',
      ageYears: '',
      ageMonths: '',
      gender: 'unknown',
      color: '',
      weight: '',
      microchipId: '',
      isNeutered: false,
      isRescue: false,
      profileImage: '',
      notes: '',
    })
    setPetImageFile(null)
    setEditingPetId(null)
    setPetModalMode('add')
  }

  const openAddPetPopup = () => {
    resetPetForm()
    setShowAddPetPopup(true)
  }

  const openEditPetPopup = (pet: PetProfile) => {
    setPetModalMode('edit')
    setEditingPetId(pet.id)
    setPetImageFile(null)
    setNewPetForm({
      name: pet.name,
      species: pet.type,
      breed: pet.breed,
      ageYears: pet.ageYears !== null ? String(pet.ageYears) : '',
      ageMonths: pet.ageMonths !== null ? String(pet.ageMonths) : '',
      gender: pet.gender,
      color: pet.color,
      weight: pet.weight,
      microchipId: pet.microchipId,
      isNeutered: pet.isNeutered,
      isRescue: pet.isRescue,
      profileImage: pet.image,
      notes: pet.notes,
    })
    setShowAddPetPopup(true)
  }

  const closeAddPetPopup = () => {
    setShowAddPetPopup(false)
    resetPetForm()
  }

  const handleDeletePet = (petId: string) => {
    const deletePet = async () => {
      const shouldDelete = window.confirm('Delete this pet profile?')
      if (!shouldDelete || !petOwnerId) return

      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', petId)
        .eq('owner_id', petOwnerId)

      if (error) {
        console.error('Failed to delete pet:', error)
        alert('Could not delete pet profile. Please try again.')
        return
      }

      setMyPets((prev) => {
        const updated = prev.filter((pet) => pet.id !== petId)
        if (updated.length === 0) {
          setSelectedPetId('')
        } else if (selectedPetId === petId) {
          setSelectedPetId(updated[0].id)
        }
        return updated
      })
    }

    deletePet()
  }

  const uploadPetImage = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await fetch('/api/upload-pet-image', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Image upload failed')
    }

    const payload = (await response.json()) as { path?: string }
    if (!payload.path) {
      throw new Error('Invalid upload response')
    }

    return payload.path
  }

  const resetVolunteerForm = () => {
    setVolunteerForm({
      fullName: user?.name || '',
      email: user?.email || '',
      phone: '',
      age: '',
      city: '',
      availability: '',
      skills: '',
      experience: '',
      idProofNumber: '',
      message: '',
    })
    setVolunteerIdProofFile(null)
    setSelectedNgo(null)
  }

  const openVolunteerForm = (ngo: NgoDirectoryItem) => {
    setSelectedNgo(ngo)
    setVolunteerForm({
      fullName: user?.name || '',
      email: user?.email || '',
      phone: '',
      age: '',
      city: '',
      availability: '',
      skills: '',
      experience: '',
      idProofNumber: '',
      message: '',
    })
    setVolunteerIdProofFile(null)
    setShowVolunteerForm(true)
  }

  const closeVolunteerForm = () => {
    setShowVolunteerForm(false)
    resetVolunteerForm()
  }

  const uploadVolunteerIdProof = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload-volunteer-id-proof', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string }
      throw new Error(payload.error || 'ID proof upload failed')
    }

    const payload = (await response.json()) as { path?: string }
    if (!payload.path) {
      throw new Error('Invalid upload response')
    }

    return payload.path
  }

  const handleVolunteerFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedNgo) {
      alert('Please select an NGO first.')
      return
    }

    if (
      !volunteerForm.fullName.trim() ||
      !volunteerForm.email.trim() ||
      !volunteerForm.phone.trim() ||
      !volunteerForm.idProofNumber.trim()
    ) {
      alert('Please fill all required volunteer details.')
      return
    }

    if (!resolvedVolunteerIdProofFile) {
      alert('Please upload ID proof.')
      return
    }

    try {
      setSubmittingVolunteerForm(true)
      const idProofPath = await uploadVolunteerIdProof(resolvedVolunteerIdProofFile)
      const ownerId = petOwnerId || user?.id || null
      const ngoId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        selectedNgo.id
      )
        ? selectedNgo.id
        : null

      const payload = {
        user_id: ownerId,
        ngo_id: ngoId,
        ngo_name: selectedNgo.name,
        applicant_name: volunteerForm.fullName.trim(),
        applicant_email: volunteerForm.email.trim().toLowerCase(),
        applicant_phone: volunteerForm.phone.trim(),
        age: volunteerForm.age.trim() ? Number(volunteerForm.age.trim()) : null,
        city: volunteerForm.city.trim() || null,
        availability: volunteerForm.availability.trim() || null,
        skills: volunteerForm.skills.trim() || null,
        experience: volunteerForm.experience.trim() || null,
        id_proof_number: volunteerForm.idProofNumber.trim(),
        id_proof_url: idProofPath,
        message: volunteerForm.message.trim() || null,
        status: 'pending',
      }

      const { error } = await supabase.from('volunteer_applications').insert(payload)

      if (error) {
        const formatted = formatSupabaseError(error)
        console.error('Volunteer application failed:', formatted)

        if (isSetupPendingError(error)) {
          alert(
            'Volunteer form database setup pending. Please run volunteer_applications_schema.sql in Supabase SQL Editor.'
          )
        } else {
          alert('Could not submit volunteer application. Please try again.')
        }
        return
      }

      alert('Volunteer application submitted successfully.')
      closeVolunteerForm()
    } catch (error: any) {
      console.error(error)
      alert(error?.message || 'Could not submit volunteer application.')
    } finally {
      setSubmittingVolunteerForm(false)
    }
  }

  const resetHandoverForm = () => {
    setHandoverForm({
      ownerName: user?.name || '',
      ownerEmail: user?.email || '',
      ownerPhone: '',
      handoverPetId: '',
    })
    setSelectedHandoverNgo(null)
  }

  const openHandoverForm = (ngo: NgoDirectoryItem) => {
    setSelectedHandoverNgo(ngo)
    setHandoverForm({
      ownerName: user?.name || '',
      ownerEmail: user?.email || '',
      ownerPhone: '',
      handoverPetId: '',
    })
    setShowHandoverForm(true)
  }

  const closeHandoverForm = () => {
    setShowHandoverForm(false)
    resetHandoverForm()
  }

  const handleHandoverFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedHandoverNgo) {
      alert('Please select NGO first.')
      return
    }

    if (
      !handoverForm.ownerName.trim() ||
      !handoverForm.ownerEmail.trim() ||
      !handoverForm.ownerPhone.trim() ||
      !handoverForm.handoverPetId
    ) {
      alert('Please fill all required fields and select pet for handover.')
      return
    }

    const selectedHandoverPet = myPets.find((pet) => pet.id === handoverForm.handoverPetId)
    if (!selectedHandoverPet) {
      alert('Selected pet not found. Please choose a valid pet.')
      return
    }

    const ngoId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      selectedHandoverNgo.id
    )
      ? selectedHandoverNgo.id
      : null

    try {
      setSubmittingHandoverForm(true)

      const payload = {
        user_id: petOwnerId || user?.id || null,
        ngo_id: ngoId,
        ngo_name: selectedHandoverNgo.name,
        owner_name: handoverForm.ownerName.trim(),
        owner_email: handoverForm.ownerEmail.trim().toLowerCase(),
        owner_phone: handoverForm.ownerPhone.trim(),
        pet_name: selectedHandoverPet.name,
        pet_type: selectedHandoverPet.type,
        pet_breed: selectedHandoverPet.breed,
        pet_age: selectedHandoverPet.age,
        reason: 'Owner requested pet handover to NGO.',
        health_notes: selectedHandoverPet.notes || null,
        pet_passport_requested: true,
        passport_pet_id: selectedHandoverPet.id,
        passport_snapshot: {
          pet_id: selectedHandoverPet.petId || null,
          pet_name: selectedHandoverPet.name || null,
          pet_type: selectedHandoverPet.type || null,
          breed: selectedHandoverPet.breed || null,
          age: selectedHandoverPet.age || null,
          microchip_id: selectedHandoverPet.microchipId || null,
        },
        verification_status: 'pending',
        status: 'pending',
      }

      const { error } = await supabase.from('pet_handover_requests').insert(payload)
      if (error) {
        if (isSetupPendingError(error)) {
          alert('Pet handover table setup pending. Please run pet_handover_requests_schema.sql in Supabase SQL Editor.')
        } else {
          alert('Could not submit handover request. Please try again.')
        }
        return
      }

      alert('Pet handover request submitted successfully.')
      closeHandoverForm()
    } catch (error) {
      console.error('Pet handover request error:', error)
      alert('Could not submit handover request.')
    } finally {
      setSubmittingHandoverForm(false)
    }
  }

  const resetAdoptionForm = () => {
    setAdoptionForm({
      applicantName: user?.name || '',
      applicantEmail: user?.email || '',
      applicantPhone: '',
      city: '',
      address: '',
      preferredPetType: 'Dog',
      experience: '',
      verificationIdNumber: '',
      requestPetPassport: true,
    })
    setAdoptionIdProofFile(null)
    setSelectedAdoptionNgo(null)
    setSelectedAdoptionPet(null)
  }

  const openNgoPetProfiles = (ngo: NgoDirectoryItem) => {
    setSelectedNgoForProfiles(ngo)
    setShowNgoPetProfiles(true)
  }

  const closeNgoPetProfiles = () => {
    setShowNgoPetProfiles(false)
    setSelectedNgoForProfiles(null)
  }

  const openAdoptionForm = (ngo: NgoDirectoryItem, ngoPet: NgoPetProfile) => {
    setSelectedAdoptionNgo(ngo)
    setSelectedAdoptionPet(ngoPet)
    setAdoptionForm({
      applicantName: user?.name || '',
      applicantEmail: user?.email || '',
      applicantPhone: '',
      city: '',
      address: '',
      preferredPetType: ngoPet.type,
      experience: '',
      verificationIdNumber: '',
      requestPetPassport: true,
    })
    setAdoptionIdProofFile(null)
    setShowNgoPetProfiles(false)
    setShowAdoptionForm(true)
  }

  const closeAdoptionForm = () => {
    setShowAdoptionForm(false)
    resetAdoptionForm()
  }

  const handleAdoptionFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedAdoptionNgo) {
      alert('Please select NGO first.')
      return
    }
    if (!selectedAdoptionPet) {
      alert('Please choose a pet profile first.')
      return
    }

    if (
      !adoptionForm.applicantName.trim() ||
      !adoptionForm.applicantEmail.trim() ||
      !adoptionForm.applicantPhone.trim() ||
      !adoptionForm.city.trim() ||
      !adoptionForm.address.trim() ||
      !adoptionForm.verificationIdNumber.trim()
    ) {
      alert('Please fill all required fields including verification details.')
      return
    }

    if (!adoptionIdProofFile) {
      alert('Please upload verification ID proof image.')
      return
    }

    const ngoId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      selectedAdoptionNgo.id
    )
      ? selectedAdoptionNgo.id
      : null

    try {
      setSubmittingAdoptionForm(true)
      const idProofPath = await uploadVolunteerIdProof(adoptionIdProofFile)

      const payload = {
        user_id: petOwnerId || user?.id || null,
        ngo_id: ngoId,
        ngo_name: selectedAdoptionNgo.name,
        ngo_pet_id: selectedAdoptionPet.id,
        ngo_pet_name: selectedAdoptionPet.name,
        applicant_name: adoptionForm.applicantName.trim(),
        applicant_email: adoptionForm.applicantEmail.trim().toLowerCase(),
        applicant_phone: adoptionForm.applicantPhone.trim(),
        city: adoptionForm.city.trim(),
        address: adoptionForm.address.trim(),
        preferred_pet_type: selectedAdoptionPet.type,
        experience: adoptionForm.experience.trim() || null,
        reason: 'Not provided by applicant',
        verification_id_number: adoptionForm.verificationIdNumber.trim(),
        verification_id_proof_url: idProofPath,
        pet_passport_requested: adoptionForm.requestPetPassport,
        verification_status: 'pending',
        status: 'pending',
      }

      const { error } = await supabase.from('pet_adoption_requests').insert(payload)
      if (error) {
        if (isSetupPendingError(error)) {
          alert('Pet adoption table setup pending. Please run pet_adoption_requests_schema.sql in Supabase SQL Editor.')
        } else {
          alert('Could not submit adoption request. Please try again.')
        }
        return
      }

      alert('Adoption request submitted successfully.')
      closeAdoptionForm()
    } catch (error) {
      console.error('Adoption request error:', error)
      alert('Could not submit adoption request.')
    } finally {
      setSubmittingAdoptionForm(false)
    }
  }

  const handleAddPetSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!newPetForm.name.trim()) return
    if (!petOwnerId) {
      alert('Please log in to add a pet.')
      return
    }

    let uploadedImagePath = newPetForm.profileImage.trim() || '/images/pet-dog-1.jpg'
    if (petImageFile) {
      try {
        setIsUploadingPetImage(true)
        uploadedImagePath = await uploadPetImage(petImageFile)
      } catch (error) {
        console.error(error)
        alert('Photo upload failed. Please try again.')
        setIsUploadingPetImage(false)
        return
      } finally {
        setIsUploadingPetImage(false)
      }
    }

    const parsedAgeYears = newPetForm.ageYears.trim() ? Number(newPetForm.ageYears) : null
    const parsedAgeMonths = newPetForm.ageMonths.trim() ? Number(newPetForm.ageMonths) : null
    const parsedWeight = newPetForm.weight.trim() ? Number(newPetForm.weight) : null

    const generatedPetId = `PET-${Date.now().toString().slice(-8)}`
    const petPayload = {
      owner_id: petOwnerId,
      name: newPetForm.name.trim(),
      species: newPetForm.species,
      breed: newPetForm.breed.trim() || 'Not specified',
      age_years: Number.isFinite(parsedAgeYears) ? parsedAgeYears : null,
      age_months: Number.isFinite(parsedAgeMonths) ? parsedAgeMonths : null,
      gender: newPetForm.gender,
      color: newPetForm.color.trim() || 'Not specified',
      weight: Number.isFinite(parsedWeight) ? parsedWeight : null,
      profile_image: uploadedImagePath,
      microchip_id: newPetForm.microchipId.trim() || null,
      is_neutered: newPetForm.isNeutered,
      is_rescue: newPetForm.isRescue,
      notes: newPetForm.notes.trim() || 'No additional notes.',
    }

    if (petModalMode === 'edit' && editingPetId) {
      const { data, error } = await supabase
        .from('pets')
        .update(petPayload)
        .eq('id', editingPetId)
        .eq('owner_id', petOwnerId)
        .select('id, pet_id, name, species, breed, age_years, age_months, gender, color, weight, profile_image, microchip_id, is_neutered, is_rescue, notes')
        .single()

      if (error || !data) {
        console.error('Failed to update pet:', error)
        alert(`Could not update pet profile: ${error?.message || 'Unknown error'}`)
        return
      }

      const updatedPet = mapDbPetToProfile(data as PetDbRow)
      setMyPets((prev) => prev.map((pet) => (pet.id === updatedPet.id ? updatedPet : pet)))
      setSelectedPetId(updatedPet.id)
    } else {
      const insertPayload = {
        ...petPayload,
        pet_id: generatedPetId,
      }
      const { data, error } = await supabase
        .from('pets')
        .insert(insertPayload)
        .select('id, pet_id, name, species, breed, age_years, age_months, gender, color, weight, profile_image, microchip_id, is_neutered, is_rescue, notes')
        .single()

      if (error || !data) {
        console.error('Failed to add pet:', error)
        const errorDetails = [error?.message, error?.details, error?.hint]
          .filter(Boolean)
          .join(' ')
        alert(`Could not add pet profile: ${errorDetails || 'Unknown error'}`)
        return
      }

      const createdPet = mapDbPetToProfile(data as PetDbRow)
      setMyPets((prev) => [...prev, createdPet])
      setSelectedPetId(createdPet.id)
    }

    setActiveSection('my-pets')
    closeAddPetPopup()
  }

  const topNavItems = [
    { id: 'home' as const, label: 'Home', icon: PawPrint },
    { id: 'vet-directory' as const, label: 'Vet Directory', icon: Stethoscope },
    { id: 'pharmacy' as const, label: 'Pharmacy', icon: Pill },
    { id: 'training' as const, label: 'Training', icon: GraduationCap },
    { id: 'ngo' as const, label: 'NGO', icon: Heart },
    { id: 'community' as const, label: 'Community', icon: Users },
  ]

  const filteredVets = vets.filter((vet) => {
    const term = vetSearchTerm.trim().toLowerCase()
    if (!term) return true
    return (
      vet.name.toLowerCase().includes(term) ||
      vet.specialty.toLowerCase().includes(term) ||
      vet.descriptions.toLowerCase().includes(term) ||
      vet.city.toLowerCase().includes(term) ||
      vet.clinicName.toLowerCase().includes(term)
    )
  })

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
phImage: "/images/img/smartChemist.jpeg"
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
      phImage: "/images/img/easy.jpeg"
    },
    {
      id: 3,
      name: "Wellness Chemist ",
      distance: "2.1 km",
      address: "G-5, Galleria Mall Road",
      timing: "10:00 AM - 10:00 PM",
      contact: "+91 11 22334455",
      status: "Closed",
      phImage: "/images/img/welness.jpeg",
      rating: 4.2
    }
  ];

  const distanceToKm = (distance: string) => {
    const numericValue = Number.parseFloat(distance.replace(/[^\d.]/g, ''))
    if (!Number.isFinite(numericValue)) return Number.POSITIVE_INFINITY
    return distance.toLowerCase().includes('m') && !distance.toLowerCase().includes('km')
      ? numericValue / 1000
      : numericValue
  }

  const normalizedCity = normalizeText(profileForm.city).toLowerCase()
  const normalizedState = normalizeText(profileForm.state).toLowerCase()
  const normalizedCountry = normalizeText(profileForm.country).toLowerCase()
  const userLocationParts = [profileForm.city, profileForm.state, profileForm.country]
    .map((part) => normalizeText(part))
    .filter(Boolean)
  const userLocationQuery = userLocationParts.join(', ')

  const locationScoreForPharmacy = (address: string) => {
    if (!normalizedCity && !normalizedState && !normalizedCountry) return 0
    const normalizedAddress = address.toLowerCase()
    let score = 0
    if (normalizedCity && normalizedAddress.includes(normalizedCity)) score += 3
    if (normalizedState && normalizedAddress.includes(normalizedState)) score += 2
    if (normalizedCountry && normalizedAddress.includes(normalizedCountry)) score += 1
    return score
  }

  const pharmaciesSorted = [...pharmacies].sort((first, second) => {
    const scoreDiff =
      locationScoreForPharmacy(second.address) - locationScoreForPharmacy(first.address)
    if (scoreDiff !== 0) return scoreDiff
    return distanceToKm(first.distance) - distanceToKm(second.distance)
  })

  const nearestPharmacy = pharmaciesSorted[0] || null

  const buildMapsSearchUrl = (query: string) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`

  const openNearbyPharmacySearch = () => {
    const query = userLocationQuery
      ? `pet pharmacy near ${userLocationQuery}`
      : 'pet pharmacy near me'
    window.open(buildMapsSearchUrl(query), '_blank', 'noopener,noreferrer')
  }

  const openPharmacyDirections = (shop: (typeof pharmacies)[number]) => {
    const destination = `${shop.name}, ${shop.address}`
    const url = userLocationQuery
      ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(userLocationQuery)}&destination=${encodeURIComponent(destination)}`
      : buildMapsSearchUrl(destination)

    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const profileLocationSummary = [
    profileForm.city,
    profileForm.state,
    profileForm.country,
  ]
    .map((value) => normalizeText(value))
    .filter(Boolean)
    .join(', ')

  const pharmacySearchTerms = [
    profileForm.city,
    profileForm.state,
    profileForm.country,
  ]
    .map((value) => normalizeText(value).toLowerCase())
    .filter(Boolean)

  const filteredPharmacies =
    pharmacySearchTerms.length === 0
      ? pharmacies
      : pharmacies.filter((shop) => {
          const haystack = `${shop.name} ${shop.address}`.toLowerCase()
          return pharmacySearchTerms.some((term) => haystack.includes(term))
        })

  // const pharmacyProducts = [
  //   { name: 'Heartgard Plus', category: 'Medicine', price: '₹45.99', image: '/images/product-food.jpg', description: 'Monthly heartworm prevention' },
  //   { name: 'Premium Dog Food', category: 'Food', price: '₹59.99', image: '/images/product-food.jpg', description: 'High-protein adult formula' },
  //   { name: 'Flea & Tick Shampoo', category: 'Grooming', price: '₹18.99', image: '/images/product-food.jpg', description: 'Gentle cleansing formula' },
  //   { name: 'Joint Support Chews', category: 'Supplements', price: '₹34.99', image: '/images/product-food.jpg', description: 'Glucosamine & chondroitin' },
  //   { name: 'Dental Treats', category: 'Food', price: '₹24.99', image: '/images/product-food.jpg', description: 'Reduces plaque & tartar' },
  //   { name: 'Vitamin Supplements', category: 'Supplements', price: '₹29.99', image: '/images/product-food.jpg', description: 'Daily multivitamin' },
  // ]

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

  const ngoPetProfiles: NgoPetProfile[] = ngos.flatMap((ngo, ngoIndex) => ([
    {
      id: `${ngo.id}-pet-1`,
      ngoId: ngo.id,
      name: `Buddy ${ngoIndex + 1}`,
      type: 'Dog',
      breed: 'Labrador Mix',
      age: '2 years',
      healthStatus: 'Vaccinated',
      image: '/images/rescue-dog-1.jpg',
      description: 'Friendly and social. Good with families.',
    },
    {
      id: `${ngo.id}-pet-2`,
      ngoId: ngo.id,
      name: `Milo ${ngoIndex + 1}`,
      type: 'Cat',
      breed: 'Indian Shorthair',
      age: '1 year',
      healthStatus: 'Healthy',
      image: '/images/rescue-cat-1.jpg',
      description: 'Calm nature, litter trained, indoor-friendly.',
    },
  ]))

  const selectedNgoPetProfiles = selectedNgoForProfiles
    ? ngoPetProfiles.filter((pet) => pet.ngoId === selectedNgoForProfiles.id)
    : []

  const blogs: CommunityBlog[] = [
    {
      id: 'first-time-pet-owners',
      title: '10 Tips for First-Time Pet Owners',
      author: 'Dr. Sarah Johnson',
      date: 'Jan 15, 2026',
      image: '/images/blog-1.jpg',
      summary: 'A practical starter guide covering feeding, vaccination, daily care, and what to prepare in the first 30 days.',
      likes: 234,
      reads: 1840,
      comments: [
        { author: 'Aarav', text: 'Very helpful for someone adopting a puppy soon.', time: '2h ago' },
        { author: 'Meera', text: 'Loved the vaccination reminders section.', time: '1d ago' },
      ],
    },
    {
      id: 'pet-body-language',
      title: 'Understanding Your Pet\'s Body Language',
      author: 'Emily Davis',
      date: 'Jan 12, 2026',
      image: '/images/training-video-1.jpg',
      summary: 'Learn how to recognize stress, comfort, excitement, and warning signs from your pet’s posture and movements.',
      likes: 189,
      reads: 1260,
      comments: [
        { author: 'Riya', text: 'This explains tail movements so well.', time: '5h ago' },
      ],
    },
    {
      id: 'senior-dog-nutrition',
      title: 'Nutrition Guide for Senior Dogs',
      author: 'Dr. Michael Chen',
      date: 'Jan 10, 2026',
      image: '/images/product-food.jpg',
      summary: 'A vet-approved breakdown of meal timing, supplements, and diet changes for aging dogs.',
      likes: 156,
      reads: 980,
      comments: [
        { author: 'Nikhil', text: 'Useful for my 11-year-old beagle.', time: '8h ago' },
      ],
    },
  ]

  const vlogs: CommunityVlog[] = [
    {
      id: 'animal-shelter-day',
      title: 'A Day at the Animal Shelter',
      owner: 'Rescue Team Delhi',
      description: 'A short walkthrough of rescue intake, feeding routines, and how the team prepares animals for adoption.',
      duration: '12:45',
      views: '45K',
      likes: '3.8K',
      thumbnail: '/images/rescue-dog-1.jpg',
      youtubeUrl: 'https://youtu.be/PMjBFyFO4W8?si=jeuwlDexBujqfKlU',
    },
    {
      id: 'pet-adoption-success',
      title: 'Pet Adoption Success Stories',
      owner: 'INNOVET Community',
      description: 'Families share how adoption changed their lives and why rescue-first choices matter.',
      duration: '18:30',
      views: '32K',
      likes: '2.9K',
      thumbnail: '/images/pet-dog-1.jpg',
      youtubeUrl: 'https://youtu.be/g_ow9J6wBv0?si=SsEBWEqsS8LIVHn0',
    },
    {
      id: 'vet-clinic-behind-scenes',
      title: 'Behind the Scenes: Vet Clinic',
      owner: 'Dr. Sarah Johnson',
      description: 'See how the clinic prepares for routine checkups, emergency cases, and daily care workflows.',
      duration: '15:20',
      views: '28K',
      likes: '2.1K',
      thumbnail: '/images/vet-clinic.jpg',
      youtubeUrl: 'https://www.youtube.com/watch?v=4WM4eVsXI-0&t=105s',
    },
  ]

  const sidebarItems = [
    { icon: MessageSquare, label: 'AI Chatbot', action: () => setActiveSection('ai-chatbot') },
    { icon: FileText, label: 'Medical Records', action: () => setActiveSection('medical-records') },
    { icon: QrCode, label: 'Pet Passport', action: () => setShowPassport(true) },
    { icon: PawPrint, label: 'My Pets', action: () => setActiveSection('my-pets') },
    { icon: Bell, label: 'Notifications', action: () => setActiveSection('notifications') },
    { icon: Baby, label: 'Pet Nanny', action: () => setActiveSection('pet-nanny') },
    { icon: Utensils, label: 'Diet Plans', action: () => setActiveSection('diet-plans') },
    { icon: Calendar, label: 'Appointments', action: () => setActiveSection('appointments') },
  ]

  const renderContent = () => {
    switch (activeSection) {
      case 'ai-chatbot':
        return <ChatbotPanel />
      case 'medical-records':
        return <MedicalRecords />
      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Notifications</h2>
                <p className="text-sm text-slate-500">Updates and reminders</p>
              </div>
            </div>
            <Notifications />
          </div>
        )
      case 'pet-nanny':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                <Baby className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Pet Nanny & Care Center Finder</h2>
                <p className="text-sm text-slate-500">Find trusted pet nannies and pet care centers near you when you are away</p>
              </div>
            </div>
            <PetNanny />
          </div>
        )
      case 'diet-plans':
        return (
          <div className="space-y-8">
            <section className="rounded-2xl bg-white/75 backdrop-blur-sm border border-white/50 p-5 md:p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Doctor Recommended Diet Plans</h3>
                  <p className="text-sm text-slate-500">As per vet guidance</p>
                </div>
              </div>

              {dietPlansLoading ? (
                <div className="text-sm text-slate-500">Loading diet plans...</div>
              ) : dietPlansError ? (
                <div className="text-sm text-amber-700 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
                  {dietPlansError}
                </div>
              ) : vetDietPlans.length > 0 ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {vetDietPlans.map((item, index) => (
                    <div key={item.id || index} className="p-4 rounded-xl border border-teal-100 bg-teal-50/40">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-semibold text-slate-800">{item.pet_name || item.pet_type || 'Pet'}</p>
                        <Badge className="bg-teal-600 text-white border-0">Vet Guided</Badge>
                      </div>
                      <p className="text-sm text-slate-700 mb-2">
                        <span className="font-medium">Plan:</span> {item.plan || item.diet_plan || 'Plan not provided'}
                      </p>
                      <p className="text-sm text-slate-600 mb-2">
                        <span className="font-medium">Care Notes:</span> {item.notes || item.care_notes || 'No notes provided'}
                      </p>
                      <p className="text-xs text-teal-700 font-medium">
                        {item.next_review || item.review_date || 'Review schedule not available'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-500 rounded-xl border border-slate-200 bg-white/70 p-4">
                  No vet-guided diet plans found in database yet.
                </div>
              )}
            </section>

            <DietPlanChatbot
              petName={selectedPet?.name}
              species={selectedPet?.type}
              ageYears={selectedPet?.ageYears}
              weightKg={selectedPetWeightKg}
            />

          </div>
        )
      case 'appointments':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Appointments</h2>
                <p className="text-sm text-slate-500">Track and manage consultations</p>
              </div>
            </div>
            <Appointments />
          </div>
        )

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

            <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50">
              <Input
                value={vetSearchTerm}
                onChange={(event) => setVetSearchTerm(event.target.value)}
                placeholder="Search vets by name or specialty..."
              />
            </div>

            {vetSchemaWarning && (
              <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 text-sm">
                {vetSchemaWarning}
              </div>
            )}

            {vetsLoading ? (
              <div className="p-5 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 text-slate-600">
                Loading veterinarians...
              </div>
            ) : filteredVets.length === 0 ? (
              <div className="p-5 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 text-slate-600">
                No veterinarians found in database.
              </div>
            ) : filteredVets.map((vet) => (
              <div key={vet.id} className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 hover:shadow-xl transition-all">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                      <AvatarImage src={vet.image || "/placeholder.svg"} alt={vet.name} />
                      <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white text-xl">
                        {vet.name?.[0]?.toUpperCase() || 'V'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">{vet.name}</h3>
                      <p className="text-slate-500">{vet.specialty}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <Badge className={vet.availability === 'Available' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 border-0' : 'bg-slate-200 text-slate-700 border-0'}>
                          {vet.availability}
                        </Badge>
                        {vet.rating !== null && (
                          <span className="flex items-center text-sm text-amber-600">
                            <Star className="w-4 h-4 fill-amber-400 mr-1" /> {vet.rating.toFixed(1)}
                          </span>
                        )}
                        {vet.city ? (
                          <span className="flex items-center text-sm text-slate-500">
                            <MapPin className="w-4 h-4 mr-1" /> {vet.city}
                          </span>
                        ) : (
                          <span className="flex items-center text-sm text-slate-400">
                            <MapPin className="w-4 h-4 mr-1" /> {vet.distance}
                          </span>
                        )}
                      </div>
                      {vet.phone && (
                        <p className="flex items-center text-sm text-slate-600 mt-2">
                          <Phone className="w-4 h-4 mr-2" /> {vet.phone}
                        </p>
                      )}
                      {vet.email && (
                        <p className="flex items-center text-sm text-slate-500 mt-1">
                          <Mail className="w-4 h-4 mr-2" /> {vet.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 md:border-l md:pl-6 border-slate-200">
                    <div className="mb-4">
                      <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-teal-500" /> About
                      </h4>
                      <p className="text-sm text-slate-600 bg-teal-50/50 p-3 rounded-xl">{vet.descriptions}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {vet.experienceYears !== null && (
                        <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm">
                          {vet.experienceYears}+ years experience
                        </span>
                      )}
                      {vet.consultationFee !== null && (
                        <span className="px-3 py-1.5 rounded-full bg-cyan-50 text-cyan-700 text-sm">
                          Consultation fee: INR {vet.consultationFee}
                        </span>
                      )}
                      {vet.clinicName && (
                        <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm">
                          {vet.clinicName}
                        </span>
                      )}
                    </div>
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
                {nearestPharmacy && nearestPharmacy.id === shop.id && (
                  <div className="absolute top-3 left-3 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Nearest Match
                  </div>
                )}
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
                  <button
                    onClick={() => openPharmacyDirections(shop)}
                    className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition"
                  >
                    Get Directions
                  </button>
                  <a
                    href={`tel:${shop.contact.replace(/\s+/g, '')}`}
                    className="w-12 h-12 flex items-center justify-center border border-slate-200 rounded-xl hover:bg-slate-50"
                    aria-label={`Call ${shop.name}`}
                  >
                    <Phone size={20} className="text-green-600" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPharmacies.length === 0 && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            No pharmacy matched your profile location. Try updating city/state/country in My Profile.
          </div>
        )}
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

            {ngoSchemaWarning && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-800">
                {ngoSchemaWarning}
              </div>
            )}

            {ngosLoading && (
              <div className="rounded-xl border border-white/50 bg-white/70 p-4 text-sm text-slate-600">
                Loading NGO partners...
              </div>
            )}

            {!ngosLoading && ngos.length === 0 && (
              <div className="rounded-xl border border-white/50 bg-white/70 p-4 text-sm text-slate-600">
                No NGO registrations found yet.
              </div>
            )}

            {ngos.map((ngo) => (
              <div key={ngo.id} className="p-6 rounded-2xl bg-gradient-to-br from-white/80 to-rose-50/30 backdrop-blur-sm border border-white/50 hover:shadow-xl transition-all">
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
                    <IndianRupee className="mr-2 h-4 w-4" /> Donate (Rs)
                  </Button>
                  <Button
                    variant="outline"
                    className="border-rose-200 text-rose-600 hover:bg-rose-50 bg-transparent"
                    onClick={() => openVolunteerForm(ngo)}
                  >
                    <HandHeart className="mr-2 h-4 w-4" /> Volunteer
                  </Button>
                  <Button
                    variant="outline"
                    className="border-rose-200 text-rose-600 hover:bg-rose-50 bg-transparent"
                    onClick={() => openNgoPetProfiles(ngo)}
                  >
                    <PawPrint className="mr-2 h-4 w-4" /> Adopt
                  </Button>
                  <Button
                    variant="outline"
                    className="border-rose-200 text-rose-600 hover:bg-rose-50 bg-transparent"
                    onClick={() => openHandoverForm(ngo)}
                  >
                    <PawPrint className="mr-2 h-4 w-4" /> Pet Handover
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
                <p className="text-sm text-slate-500">Blogs and vlogs with comments, likes, and reads</p>
              </div>
            </div>

            <Tabs defaultValue="blogs" className="w-full">
              <TabsList className="bg-white/60 backdrop-blur-sm border border-white/50 p-1 rounded-xl mb-6">
                <TabsTrigger value="blogs" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">Blogs</TabsTrigger>
                <TabsTrigger value="vlogs" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">Vlogs</TabsTrigger>
              </TabsList>

              <TabsContent value="blogs" className="mt-0 space-y-4">
                {blogs.map((blog) => (
                  <div key={blog.id} className="flex flex-col md:flex-row gap-4 p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 hover:shadow-xl transition-all">
                    <div className="md:w-44 aspect-video md:aspect-auto md:h-28 relative rounded-xl overflow-hidden shrink-0">
                      <Image src={blog.image || "/placeholder.svg"} alt={blog.title} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-800 mb-1">{blog.title}</h3>
                      <p className="text-sm text-slate-500 mb-2">Author: {blog.author} | {blog.date}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-4">
                        <span className="flex items-center text-rose-500"><ThumbsUp className="w-4 h-4 mr-1" />{blog.likes + (blogLikeStates[blog.id] ? 1 : 0)} likes</span>
                        <span className="flex items-center text-sky-600"><Eye className="w-4 h-4 mr-1" />{(blog.reads + (blogReadMarks[blog.id] ? 1 : 0)).toLocaleString()} reads</span>
                        <span className="flex items-center text-violet-600"><MessageSquare className="w-4 h-4 mr-1" />{(blogCommentsById[blog.id] || blog.comments).length} comments</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => handleOpenBlogPost(blog)}
                          className="bg-gradient-to-r from-violet-500 to-purple-500"
                        >
                          Open Post
                        </Button>
                        <Button
                          variant="outline"
                          className="border-violet-200 text-violet-600 hover:bg-violet-50 bg-transparent"
                          onClick={() => handleOpenBlogComments(blog)}
                        >
                          Comments
                        </Button>
                        <Button
                          variant="outline"
                          className="border-rose-200 text-rose-600 hover:bg-rose-50 bg-transparent"
                          onClick={() => handleBlogLike(blog.id)}
                        >
                          <ThumbsUp className="mr-2 h-4 w-4" /> {blogLikeStates[blog.id] ? 'Unlike' : 'Like'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="vlogs" className="mt-0">
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {vlogs.map((vlog) => (
                    <div key={vlog.id} className={`group overflow-hidden rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 hover:shadow-xl transition-all ${activeVlogId === vlog.id ? 'ring-2 ring-violet-400' : ''}`}>
                      <div className="aspect-[4/3] relative bg-slate-100">
                        {activeVlogId === vlog.id ? (
                          <iframe
                            src={getYouTubeEmbedUrl(vlog.youtubeUrl, true)}
                            title={vlog.title}
                            className="absolute inset-0 h-full w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => setActiveVlogId(vlog.id)}
                            className="absolute inset-0 w-full h-full text-left"
                            aria-label={`Play ${vlog.title}`}
                            title={`Play ${vlog.title}`}
                          >
                            <Image
                              src={vlog.thumbnail || '/placeholder.svg'}
                              alt={vlog.title}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                                <Play className="w-5 h-5 text-violet-600 ml-1" />
                              </div>
                            </div>
                          </button>
                        )}
                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                          <span className="rounded-full bg-black/70 px-2 py-1 text-xs text-white/90">{vlog.duration}</span>
                          <span className="rounded-full bg-black/70 px-2 py-1 text-xs text-white/90">{vlog.views} views</span>
                        </div>
                      </div>
                      <div className="p-3 space-y-2">
                        <div>
                          <h4 className="font-semibold text-slate-800 text-sm leading-snug">{vlog.title}</h4>
                          <p className="text-sm text-slate-500">Owner: {vlog.owner}</p>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{vlog.description}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                          <span className="flex items-center text-rose-500"><ThumbsUp className="w-4 h-4 mr-1" />{vlog.likes} likes</span>
                          <span className="flex items-center text-sky-600"><Eye className="w-4 h-4 mr-1" />{vlog.views} views</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            onClick={() => setActiveVlogId(vlog.id)}
                            className="bg-gradient-to-r from-violet-500 to-purple-500 text-xs h-8 px-3"
                          >
                            Play
                          </Button>
                          <Button
                            variant="outline"
                            className="border-violet-200 text-violet-600 hover:bg-violet-50 bg-transparent text-xs h-8 px-3"
                            onClick={() => window.open(vlog.youtubeUrl, '_blank', 'noopener,noreferrer')}
                          >
                            YouTube
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <Dialog open={Boolean(selectedBlogPost)} onOpenChange={(open) => !open && handleCloseBlogPost()}>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                {selectedBlogPost && (
                  <>
                    <DialogHeader>
                      <DialogTitle>{selectedBlogPost.title}</DialogTitle>
                      <DialogDescription>
                        By {selectedBlogPost.author} | {selectedBlogPost.date}
                      </DialogDescription>
                    </DialogHeader>

                      <div
                        className="space-y-5 max-h-[60vh] overflow-y-auto pr-1"
                        onScroll={(event) => {
                          const target = event.currentTarget
                          const isAtBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 24
                          if (isAtBottom && selectedBlogPost) {
                            handleMarkBlogRead(selectedBlogPost.id)
                          }
                        }}
                      >
                      <div className="aspect-video relative rounded-2xl overflow-hidden">
                        <Image
                          src={selectedBlogPost.image || '/placeholder.svg'}
                          alt={selectedBlogPost.title}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                        <span className="flex items-center text-rose-500">
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          {selectedBlogPost.likes + (blogLikeStates[selectedBlogPost.id] ? 1 : 0)} likes
                        </span>
                        <span className="flex items-center text-sky-600">
                          <Eye className="w-4 h-4 mr-1" />
                          Read by {(selectedBlogPost.reads + (blogReadMarks[selectedBlogPost.id] ? 1 : 0)).toLocaleString()} people
                        </span>
                        <span className="flex items-center text-violet-600">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          {(blogCommentsById[selectedBlogPost.id] || selectedBlogPost.comments).length} comments
                        </span>
                      </div>

                      {selectedBlogView === 'post' ? (
                        <>
                          <p className="text-sm text-slate-700 leading-relaxed">{selectedBlogPost.summary}</p>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              onClick={() => handleBlogLike(selectedBlogPost.id)}
                              className="bg-gradient-to-r from-rose-500 to-pink-500"
                            >
                              <ThumbsUp className="mr-2 h-4 w-4" /> {blogLikeStates[selectedBlogPost.id] ? 'Unlike Post' : 'Like Post'}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setSelectedBlogView('comments')}
                              className="border-violet-200 text-violet-600 hover:bg-violet-50 bg-transparent"
                            >
                              View Comments
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="space-y-3">
                            <h4 className="font-semibold text-slate-800">Comments</h4>
                            {(blogCommentsById[selectedBlogPost.id] || selectedBlogPost.comments).map((comment, index) => (
                              <div key={`${selectedBlogPost.id}-dialog-comment-${index}`} className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <p className="text-sm font-semibold text-slate-800">{comment.author}</p>
                                  <p className="text-xs text-slate-400">{comment.time}</p>
                                </div>
                                <p className="text-sm text-slate-600">{comment.text}</p>
                              </div>
                            ))}
                          </div>

                          <Textarea
                            value={blogCommentDrafts[selectedBlogPost.id] || ''}
                            onChange={(event) => handleBlogCommentChange(selectedBlogPost.id, event.target.value)}
                            placeholder="Write a comment for this post..."
                            className="min-h-28"
                          />

                          <div className="flex flex-wrap gap-2">
                            <Button
                              onClick={() => handleBlogCommentSubmit(selectedBlogPost.id)}
                              className="bg-gradient-to-r from-violet-500 to-purple-500"
                            >
                              Post Comment
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setSelectedBlogView('post')}
                              className="border-slate-200 text-slate-700 hover:bg-slate-50 bg-transparent"
                            >
                              Back to Post
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </div>
        )

      case 'my-profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center">
                <UserCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">My Profile</h2>
                <p className="text-sm text-slate-500">Manage your account and location for nearest pharmacy</p>
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-xl bg-sky-50/60"><span className="text-slate-500">Name:</span> <span className="font-semibold text-slate-700">{user?.name || 'N/A'}</span></div>
                <div className="p-3 rounded-xl bg-sky-50/60"><span className="text-slate-500">Email:</span> <span className="font-semibold text-slate-700">{user?.email || 'N/A'}</span></div>
                <div className="p-3 rounded-xl bg-sky-50/60"><span className="text-slate-500">Role:</span> <span className="font-semibold text-slate-700 capitalize">{user?.role || 'N/A'}</span></div>
                <div className="p-3 rounded-xl bg-sky-50/60"><span className="text-slate-500">Total Pets:</span> <span className="font-semibold text-slate-700">{myPets.length}</span></div>
              </div>
              <div className="mt-5 flex gap-3">
                <Button onClick={() => setActiveSection('my-pets')} className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
                  <PawPrint className="mr-2 h-4 w-4" /> View My Pets
                </Button>
                <Button variant="outline" className="bg-transparent" onClick={() => setActiveSection('notifications')}>
                  <Bell className="mr-2 h-4 w-4" /> Notifications
                </Button>
              </div>
            </div>
          </div>
        )

      case 'settings':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
                <p className="text-sm text-slate-500">Account quick actions</p>
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 space-y-3">
              <Button variant="outline" className="w-full justify-start bg-transparent" onClick={() => setActiveSection('my-profile')}>
                <UserCircle2 className="mr-2 h-4 w-4" /> Open My Profile
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent" onClick={() => setActiveSection('my-pets')}>
                <PawPrint className="mr-2 h-4 w-4" /> Open My Pets
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent" onClick={() => setActiveSection('notifications')}>
                <Bell className="mr-2 h-4 w-4" /> Open Notifications
              </Button>
              <Button variant="outline" className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50 bg-transparent" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>
          </div>
        )

      case 'my-pets':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                  <PawPrint className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">My Pets</h2>
                  <p className="text-sm text-slate-500">Pet profiles and complete pet information</p>
                </div>
              </div>
              <Button
                onClick={openAddPetPopup}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Pet
              </Button>
            </div>

            {petsLoading ? (
              <div className="p-8 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 text-center text-slate-600">
                Loading pets...
              </div>
            ) : myPets.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 text-center">
                <p className="text-slate-600 mb-4">No pet profiles yet.</p>
                <Button
                  onClick={openAddPetPopup}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Your First Pet
                </Button>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-3">
                  {myPets.map((pet) => (
                    <button
                      key={pet.id}
                      onClick={() => setSelectedPetId(pet.id)}
                      className={`w-full text-left p-3 rounded-2xl border transition-all ${
                        selectedPetId === pet.id
                          ? 'bg-teal-50 border-teal-300 shadow-md'
                          : 'bg-white/70 border-white/50 hover:shadow-lg'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100">
                          <Image src={pet.image || '/placeholder.svg'} alt={pet.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{pet.name}</p>
                          <p className="text-xs text-slate-500">{pet.type} | {pet.breed}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="lg:col-span-2 p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50">
                  {selectedPet ? (
                    <>
                      <div className="flex flex-col md:flex-row gap-5">
                        <div className="relative w-full md:w-56 h-56 rounded-2xl overflow-hidden bg-slate-100">
                          <Image src={selectedPet.image || '/placeholder.svg'} alt={selectedPet.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-bold text-slate-800">{selectedPet.name}</h3>
                            <Badge className="bg-teal-100 text-teal-700">{selectedPet.petId}</Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="p-3 rounded-xl bg-teal-50/60"><span className="text-slate-500">Type:</span> <span className="font-semibold text-slate-700">{selectedPet.type}</span></div>
                            <div className="p-3 rounded-xl bg-teal-50/60"><span className="text-slate-500">Breed:</span> <span className="font-semibold text-slate-700">{selectedPet.breed}</span></div>
                            <div className="p-3 rounded-xl bg-teal-50/60"><span className="text-slate-500">Age:</span> <span className="font-semibold text-slate-700">{selectedPet.age}</span></div>
                            <div className="p-3 rounded-xl bg-teal-50/60"><span className="text-slate-500">Gender:</span> <span className="font-semibold text-slate-700">{selectedPet.gender}</span></div>
                            <div className="p-3 rounded-xl bg-teal-50/60"><span className="text-slate-500">Color:</span> <span className="font-semibold text-slate-700">{selectedPet.color}</span></div>
                            <div className="p-3 rounded-xl bg-teal-50/60"><span className="text-slate-500">Weight:</span> <span className="font-semibold text-slate-700">{selectedPet.weight}</span></div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 p-4 rounded-xl bg-cyan-50/70 border border-cyan-100">
                        <p className="text-sm text-slate-500 mb-1">Notes</p>
                        <p className="text-sm text-slate-700">{selectedPet.notes}</p>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Button
                          variant="outline"
                          className="border-teal-200 text-teal-700 hover:bg-teal-50 bg-transparent"
                          onClick={() => openEditPetPopup(selectedPet)}
                        >
                          <Pencil className="mr-2 h-4 w-4" /> Edit Profile
                        </Button>
                        <Button
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                          onClick={() => handleDeletePet(selectedPet.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Profile
                        </Button>
                      </div>
                    </>
                  ) : (
                    <p className="text-slate-600">Select a pet to view details.</p>
                  )}
                </div>
              </div>
            )}
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
                  <Button
                    onClick={() => setActiveSection('vet-directory')}
                    className="bg-white text-teal-600 hover:bg-white/90"
                  >
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
                {(recentActivities.length
                  ? recentActivities
                  : [{ title: 'No recent activity yet', time: 'Just now', type: 'content', timestamp: Date.now() }]
                ).map((activity, i) => (
                  <div
                    key={`${activity.title}-${activity.timestamp}-${i}`}
                    onClick={() => {
                      if (activity.type === 'reminder') {
                        router.push('/user/appointments')
                      } else if (activity.type === 'message') {
                        router.push('/user/appointments') // Could redirect to video-call if we have roomID
                      } else if (activity.type === 'content') {
                        setActiveSection('training')
                      }
                    }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50 cursor-pointer hover:bg-white/80 transition-colors"
                  >
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/40 relative">
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
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-teal-100/50"
              onClick={openAddPetPopup}
              aria-label="Add Pet"
              title="Add Pet"
            >
              <Plus className="h-5 w-5 text-slate-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-teal-100/50"
              onClick={() => setActiveSection('notifications')}
              title="Notifications"
            >
              <Bell className="h-5 w-5 text-slate-600" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 rounded-full text-[10px] font-semibold text-white flex items-center justify-center leading-none">
                  {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                </span>
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-teal-100/80 to-cyan-100/60 hover:from-teal-200/80 hover:to-cyan-200/60 transition-colors">
                  <Avatar className="w-7 h-7 border-2 border-white">
                    <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white text-xs">{user?.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-slate-700 hidden lg:block">{user?.name || 'User'}</span>
                  <ChevronDown className="w-4 h-4 text-slate-600" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>{user?.name || 'My Account'}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActiveSection('my-profile')}>
                  <UserCircle2 className="w-4 h-4 mr-2" /> My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveSection('my-pets')}>
                  <PawPrint className="w-4 h-4 mr-2" /> My Pets
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveSection('settings')}>
                  <Settings className="w-4 h-4 mr-2" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
        petId={selectedPetPassport?.petId || 'N/A'}
        petName={selectedPetPassport?.name || 'Select a pet'}
        petType={selectedPetPassport?.type || 'N/A'}
        breed={selectedPetPassport?.breed || 'N/A'}
        age={selectedPetPassport?.age || 'N/A'}
        owner={user?.name || 'Unknown'}
        petImage={selectedPetPassport?.image || '/images/pet-dog-1.jpg'}
        medicalHistory={passportMedicalHistory}
        vaccinations={passportVaccinations}
        treatments={passportTreatments}
      />

      <BookAppointmentModal
        isOpen={bookingModalOpen}
        onClose={closeBookingModal}
        vet={selectedVet}
      />

      {incomingVideoCall && (
        <Dialog
          open={incomingVideoCallOpen}
          onOpenChange={(open) => {
            setIncomingVideoCallOpen(open)
            if (!open) {
              setIncomingVideoCall(null)
            }
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{incomingVideoCall.title}</DialogTitle>
              <DialogDescription>{incomingVideoCall.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 text-sm text-slate-600">
              <p>Your veterinarian is waiting in the consultation room.</p>
              <p className="font-medium text-slate-800">Room ID: {incomingVideoCall.roomID}</p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={async () => {
                  await markNotificationAsRead(incomingVideoCall.notificationId)
                  setIncomingVideoCallOpen(false)
                  setIncomingVideoCall(null)
                }}
              >
                Dismiss
              </Button>
              <Button
                className="bg-teal-600 hover:bg-teal-700 text-white"
                onClick={() => void handleJoinIncomingCall()}
              >
                Join Call
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showVolunteerForm && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeVolunteerForm}
        >
          <div
            className="w-full max-w-2xl rounded-3xl bg-white border border-white/50 shadow-2xl p-6 md:p-7 max-h-[90vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Volunteer Registration</h3>
                <p className="text-sm text-slate-500">
                  {selectedNgo ? `Apply for ${selectedNgo.name}` : 'Submit your volunteer details'}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={closeVolunteerForm}>
                <X className="w-5 h-5 text-slate-600" />
              </Button>
            </div>

            <form onSubmit={handleVolunteerFormSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Full Name *</Label>
                  <Input
                    value={volunteerForm.fullName}
                    onChange={(event) =>
                      setVolunteerForm((prev) => ({ ...prev, fullName: event.target.value }))
                    }
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Email *</Label>
                  <Input
                    type="email"
                    value={volunteerForm.email}
                    onChange={(event) =>
                      setVolunteerForm((prev) => ({ ...prev, email: event.target.value }))
                    }
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Phone *</Label>
                  <Input
                    value={volunteerForm.phone}
                    onChange={(event) =>
                      setVolunteerForm((prev) => ({ ...prev, phone: event.target.value }))
                    }
                    placeholder="10-digit number"
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Age</Label>
                  <Input
                    type="number"
                    min={18}
                    value={volunteerForm.age}
                    onChange={(event) =>
                      setVolunteerForm((prev) => ({ ...prev, age: event.target.value }))
                    }
                    placeholder="e.g. 24"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">City</Label>
                  <Input
                    value={volunteerForm.city}
                    onChange={(event) =>
                      setVolunteerForm((prev) => ({ ...prev, city: event.target.value }))
                    }
                    placeholder="Your city"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Availability</Label>
                  <Input
                    value={volunteerForm.availability}
                    onChange={(event) =>
                      setVolunteerForm((prev) => ({ ...prev, availability: event.target.value }))
                    }
                    placeholder="Weekends / Evenings"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">ID Proof Number *</Label>
                  <Input
                    value={volunteerForm.idProofNumber}
                    onChange={(event) =>
                      setVolunteerForm((prev) => ({ ...prev, idProofNumber: event.target.value }))
                    }
                    placeholder="Aadhaar / Passport / DL number"
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">ID Proof Image *</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setVolunteerIdProofFile(event.target.files?.[0] || null)}
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Upload government ID proof image (max 5MB).
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold">Skills / Interests</Label>
                <Input
                  value={volunteerForm.skills}
                  onChange={(event) =>
                    setVolunteerForm((prev) => ({ ...prev, skills: event.target.value }))
                  }
                  placeholder="Animal care, rescue support, transport, social media"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold">Previous Experience</Label>
                <Textarea
                  value={volunteerForm.experience}
                  onChange={(event) =>
                    setVolunteerForm((prev) => ({ ...prev, experience: event.target.value }))
                  }
                  placeholder="Tell us about your volunteer background"
                  className="min-h-20"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold">Message</Label>
                <Textarea
                  value={volunteerForm.message}
                  onChange={(event) =>
                    setVolunteerForm((prev) => ({ ...prev, message: event.target.value }))
                  }
                  placeholder="Why do you want to volunteer?"
                  className="min-h-20"
                />
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/80">
                <p className="text-xs text-slate-500 mb-2">ID Proof Preview</p>
                <div className="relative w-28 h-20 rounded-lg overflow-hidden bg-slate-200">
                  {volunteerIdProofPreview ? (
                    <Image src={volunteerIdProofPreview} alt="ID proof preview" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                      No file selected
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" className="bg-transparent" onClick={closeVolunteerForm}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingVolunteerForm}
                  className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
                >
                  {submittingVolunteerForm ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showNgoPetProfiles && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeNgoPetProfiles}
        >
          <div
            className="w-full max-w-4xl rounded-3xl bg-white border border-white/50 shadow-2xl p-6 md:p-7 max-h-[90vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">NGO Pet Profiles</h3>
                <p className="text-sm text-slate-500">
                  {selectedNgoForProfiles
                    ? `Available pets in ${selectedNgoForProfiles.name}`
                    : 'Choose a pet to adopt'}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={closeNgoPetProfiles}>
                <X className="w-5 h-5 text-slate-600" />
              </Button>
            </div>

            {selectedNgoPetProfiles.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-600">
                No pets listed for this NGO yet.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {selectedNgoPetProfiles.map((pet) => (
                  <div key={pet.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex gap-4">
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-100">
                        <Image src={pet.image || '/placeholder.svg'} alt={pet.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-slate-800">{pet.name}</h4>
                        <p className="text-sm text-slate-500">{pet.type} | {pet.breed}</p>
                        <p className="text-sm text-slate-500">Age: {pet.age}</p>
                        <p className="text-xs text-emerald-700 mt-1">Health: {pet.healthStatus}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mt-3">{pet.description}</p>
                    <Button
                      className="mt-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
                      onClick={() => {
                        if (!selectedNgoForProfiles) return
                        openAdoptionForm(selectedNgoForProfiles, pet)
                      }}
                    >
                      <PawPrint className="mr-2 h-4 w-4" /> Adopt This Pet
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showAdoptionForm && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeAdoptionForm}
        >
          <div
            className="w-full max-w-2xl rounded-3xl bg-white border border-white/50 shadow-2xl p-6 md:p-7 max-h-[90vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Pet Adoption Request</h3>
                <p className="text-sm text-slate-500">
                  {selectedAdoptionNgo ? `Apply with ${selectedAdoptionNgo.name}` : 'Submit adoption request'}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={closeAdoptionForm}>
                <X className="w-5 h-5 text-slate-600" />
              </Button>
            </div>

            <form onSubmit={handleAdoptionFormSubmit} className="space-y-4">
              {selectedAdoptionPet && (
                <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4">
                  <p className="text-xs text-rose-700 font-medium mb-2">Selected Pet Profile</p>
                  <div className="flex gap-3 items-center">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-100">
                      <Image src={selectedAdoptionPet.image || '/placeholder.svg'} alt={selectedAdoptionPet.name} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{selectedAdoptionPet.name}</p>
                      <p className="text-sm text-slate-600">
                        {selectedAdoptionPet.type} | {selectedAdoptionPet.breed} | {selectedAdoptionPet.age}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Applicant Name *</Label>
                  <Input
                    value={adoptionForm.applicantName}
                    onChange={(event) =>
                      setAdoptionForm((prev) => ({ ...prev, applicantName: event.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Applicant Email *</Label>
                  <Input
                    type="email"
                    value={adoptionForm.applicantEmail}
                    onChange={(event) =>
                      setAdoptionForm((prev) => ({ ...prev, applicantEmail: event.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Phone *</Label>
                  <Input
                    value={adoptionForm.applicantPhone}
                    onChange={(event) =>
                      setAdoptionForm((prev) => ({ ...prev, applicantPhone: event.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">City *</Label>
                  <Input
                    value={adoptionForm.city}
                    onChange={(event) =>
                      setAdoptionForm((prev) => ({ ...prev, city: event.target.value }))
                    }
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-semibold">Address *</Label>
                  <Textarea
                    value={adoptionForm.address}
                    onChange={(event) =>
                      setAdoptionForm((prev) => ({ ...prev, address: event.target.value }))
                    }
                    className="min-h-16"
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Selected Pet Type</Label>
                  <Input value={selectedAdoptionPet?.type || adoptionForm.preferredPetType} readOnly />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Verification ID Number *</Label>
                  <Input
                    value={adoptionForm.verificationIdNumber}
                    onChange={(event) =>
                      setAdoptionForm((prev) => ({ ...prev, verificationIdNumber: event.target.value }))
                    }
                    placeholder="Aadhaar / Passport / DL number"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-semibold">Verification ID Proof *</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setAdoptionIdProofFile(event.target.files?.[0] || null)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold">Adoption Experience</Label>
                <Textarea
                  value={adoptionForm.experience}
                  onChange={(event) =>
                    setAdoptionForm((prev) => ({ ...prev, experience: event.target.value }))
                  }
                  placeholder="Previous pet adoption/care experience"
                  className="min-h-20"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={adoptionForm.requestPetPassport}
                  onChange={(event) =>
                    setAdoptionForm((prev) => ({ ...prev, requestPetPassport: event.target.checked }))
                  }
                />
                Request Pet Passport from NGO at adoption time
              </label>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/80">
                <p className="text-xs text-slate-500 mb-2">Verification ID Preview</p>
                <div className="relative w-28 h-20 rounded-lg overflow-hidden bg-slate-200">
                  {adoptionIdProofPreview ? (
                    <Image src={adoptionIdProofPreview} alt="Adoption verification proof preview" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                      No file selected
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" className="bg-transparent" onClick={closeAdoptionForm}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingAdoptionForm}
                  className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
                >
                  {submittingAdoptionForm ? 'Submitting...' : 'Submit Adoption Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showHandoverForm && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeHandoverForm}
        >
          <div
            className="w-full max-w-2xl rounded-3xl bg-white border border-white/50 shadow-2xl p-6 md:p-7 max-h-[90vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Pet Handover Request</h3>
                <p className="text-sm text-slate-500">
                  {selectedHandoverNgo ? `Send request to ${selectedHandoverNgo.name}` : 'Submit your request'}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={closeHandoverForm}>
                <X className="w-5 h-5 text-slate-600" />
              </Button>
            </div>

            <form onSubmit={handleHandoverFormSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Owner Name *</Label>
                  <Input
                    value={handoverForm.ownerName}
                    onChange={(event) =>
                      setHandoverForm((prev) => ({ ...prev, ownerName: event.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Owner Email *</Label>
                  <Input
                    type="email"
                    value={handoverForm.ownerEmail}
                    onChange={(event) =>
                      setHandoverForm((prev) => ({ ...prev, ownerEmail: event.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Owner Phone *</Label>
                  <Input
                    value={handoverForm.ownerPhone}
                    onChange={(event) =>
                      setHandoverForm((prev) => ({ ...prev, ownerPhone: event.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Which Pet Do You Want To Handover? *</Label>
                  <select
                    value={handoverForm.handoverPetId}
                    onChange={(event) =>
                      setHandoverForm((prev) => ({ ...prev, handoverPetId: event.target.value }))
                    }
                    className="mt-2 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select pet</option>
                    {myPets.map((pet) => (
                      <option key={pet.id} value={pet.id}>
                        {pet.name} ({pet.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {handoverForm.handoverPetId && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                  <p className="text-xs text-slate-500 mb-2">Selected Pet Passport</p>
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-transparent"
                    onClick={() => {
                      setSelectedPetId(handoverForm.handoverPetId)
                      setShowPassport(true)
                    }}
                  >
                    View Pet Passport
                  </Button>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" className="bg-transparent" onClick={closeHandoverForm}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingHandoverForm}
                  className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
                >
                  {submittingHandoverForm ? 'Submitting...' : 'Submit Handover Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddPetPopup && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeAddPetPopup}
        >
          <div
            className="w-full max-w-2xl rounded-3xl bg-white border border-white/50 shadow-2xl p-6 md:p-7 max-h-[90vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">{petModalMode === 'edit' ? 'Edit Pet' : 'Add Pet'}</h3>
                <p className="text-sm text-slate-500">{petModalMode === 'edit' ? 'Update pet profile details' : 'Fill pet profile details'}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={closeAddPetPopup}>
                <X className="w-5 h-5 text-slate-600" />
              </Button>
            </div>

            <form onSubmit={handleAddPetSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Pet Name *</Label>
                  <Input
                    value={newPetForm.name}
                    onChange={(event) => setNewPetForm((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="e.g. Bruno"
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Species</Label>
                  <select
                    value={newPetForm.species}
                    onChange={(event) => setNewPetForm((prev) => ({ ...prev, species: event.target.value }))}
                    className="mt-2 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option>Dog</option>
                    <option>Cat</option>
                    <option>Cow</option>
                    <option>Goat</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Breed</Label>
                  <Input
                    value={newPetForm.breed}
                    onChange={(event) => setNewPetForm((prev) => ({ ...prev, breed: event.target.value }))}
                    placeholder="e.g. Labrador"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Age (Years)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={newPetForm.ageYears}
                    onChange={(event) => setNewPetForm((prev) => ({ ...prev, ageYears: event.target.value }))}
                    placeholder="e.g. 2"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Age (Months)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={11}
                    value={newPetForm.ageMonths}
                    onChange={(event) => setNewPetForm((prev) => ({ ...prev, ageMonths: event.target.value }))}
                    placeholder="e.g. 6"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Gender</Label>
                  <select
                    value={newPetForm.gender}
                    onChange={(event) => setNewPetForm((prev) => ({ ...prev, gender: event.target.value }))}
                    className="mt-2 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="male">male</option>
                    <option value="female">female</option>
                    <option value="unknown">unknown</option>
                  </select>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Weight</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min={0}
                    value={newPetForm.weight}
                    onChange={(event) => setNewPetForm((prev) => ({ ...prev, weight: event.target.value }))}
                    placeholder="e.g. 18.5"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Color</Label>
                  <Input
                    value={newPetForm.color}
                    onChange={(event) => setNewPetForm((prev) => ({ ...prev, color: event.target.value }))}
                    placeholder="e.g. Brown"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Microchip ID</Label>
                  <Input
                    value={newPetForm.microchipId}
                    onChange={(event) => setNewPetForm((prev) => ({ ...prev, microchipId: event.target.value }))}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Pet Photo</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setPetImageFile(event.target.files?.[0] || null)}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Image will be uploaded to `public/images/pets`.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={newPetForm.isNeutered}
                    onChange={(event) => setNewPetForm((prev) => ({ ...prev, isNeutered: event.target.checked }))}
                  />
                  Is Neutered
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={newPetForm.isRescue}
                    onChange={(event) => setNewPetForm((prev) => ({ ...prev, isRescue: event.target.checked }))}
                  />
                  Is Rescue
                </label>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/80">
                <p className="text-xs text-slate-500 mb-2">Photo Preview</p>
                <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-slate-200">
                  <Image
                    src={petImagePreview || newPetForm.profileImage || '/images/pet-dog-1.jpg'}
                    alt="Pet preview"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold">Notes</Label>
                <Textarea
                  value={newPetForm.notes}
                  onChange={(event) => setNewPetForm((prev) => ({ ...prev, notes: event.target.value }))}
                  placeholder="Any health history, allergies, behavior notes..."
                  className="min-h-24"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" className="bg-transparent" onClick={closeAddPetPopup}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isUploadingPetImage} className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
                  <Plus className="mr-2 h-4 w-4" /> {isUploadingPetImage ? 'Uploading...' : (petModalMode === 'edit' ? 'Update Pet' : 'Save Pet')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function UserDashboard() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/50 flex items-center justify-center p-4">
          <p className="text-sm text-slate-600">Loading dashboard...</p>
        </div>
      }
    >
      <UserDashboardContent />
    </Suspense>
  )
}

