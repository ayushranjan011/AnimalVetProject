'use client'

import { type Dispatch, type ReactNode, type SetStateAction, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Headset,
  Home,
  LogOut,
  MessageCircle,
  PawPrint,
  Save,
  ShieldCheck,
  Star,
  UserCircle2,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'

type Panel = 'overview' | 'profile' | 'bookings' | 'calendar' | 'reviews' | 'earnings' | 'messages' | 'security' | 'support'
type BookingStatus = 'pending' | 'confirmed' | 'cancelled'
type Booking = {
  id: string
  owner_id: string | null
  pet_id: string | null
  start_time: string | null
  end_time: string | null
  status: BookingStatus
  notes: string | null
  ownerName: string
  ownerEmail: string
  petName: string
}
type Profile = {
  id: string
  full_name: string
  email: string
  phone: string
  location: string
  bio: string
  description: string
  services: string
  pet_types: string
  availability: string
  available_times: string
  price_per_hour: string
  price_per_day: string
  rating: number
  reviews_count: number
  total_reviews: number
  reviews_list: Array<{ reviewer?: string; rating?: number; text?: string }>
  is_verified: boolean
}

const initProfile: Profile = {
  id: '',
  full_name: '',
  email: '',
  phone: '',
  location: '',
  bio: '',
  description: '',
  services: '',
  pet_types: '',
  availability: 'Available',
  available_times: '',
  price_per_hour: '',
  price_per_day: '',
  rating: 0,
  reviews_count: 0,
  total_reviews: 0,
  reviews_list: [],
  is_verified: false,
}

const asCsv = (v: unknown) =>
  Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean).join(', ') : String(v || '').trim()
const fmtDate = (v: string | null) => (v ? new Date(v).toLocaleString() : 'Not set')
const fmtMoney = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n)
const isMissingCol = (e: any) =>
  ['PGRST204', '42703'].includes(e?.code) || String(e?.message || '').toLowerCase().includes('column')

async function resolveUsersId(authUserId: string, email: string) {
  const byId = await supabase.from('users').select('id').eq('id', authUserId).maybeSingle()
  if (byId.data?.id) return String(byId.data.id)
  const byEmail = await supabase.from('users').select('id').eq('email', email).maybeSingle()
  if (byEmail.data?.id) return String(byEmail.data.id)
  return null
}

export default function PetNannyDashboardPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [panel, setPanel] = useState<Panel>('overview')
  const [profile, setProfile] = useState<Profile>(initProfile)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user && user.role !== 'pet_nanny') router.push('/')
  }, [router, user])

  useEffect(() => {
    const load = async () => {
      if (!user || user.role !== 'pet_nanny') return
      setLoading(true)
      setError('')
      try {
        const linkedId = await resolveUsersId(user.id, user.email)
        let profileQuery = await supabase.from('pet_nannies').select('*').eq('user_id', linkedId || user.id).limit(1).maybeSingle()
        if (profileQuery.error) throw profileQuery.error

        let p = profileQuery.data as any
        if (!p) {
          const byEmail = await supabase.from('pet_nannies').select('*').eq('email', user.email).limit(1).maybeSingle()
          if (byEmail.error) throw byEmail.error
          p = byEmail.data
        }
        if (!p) {
          const created = await supabase
            .from('pet_nannies')
            .insert({ user_id: linkedId, full_name: user.name, name: user.name, email: user.email, availability: 'Available', reviews_list: [] })
            .select('*')
            .single()
          if (created.error) {
            if (!isMissingCol(created.error)) throw created.error
            const fallback = await supabase
              .from('pet_nannies')
              .insert({ user_id: linkedId, full_name: user.name, email: user.email, availability: 'Available', reviews_list: [] })
              .select('*')
              .single()
            if (fallback.error) throw fallback.error
            p = fallback.data
          } else {
            p = created.data
          }
        }

        setProfile({
          id: String(p.id || ''),
          full_name: String(p.full_name || p.name || user.name || ''),
          email: String(p.email || user.email || ''),
          phone: String(p.phone || ''),
          location: String(p.location || ''),
          bio: String(p.bio || ''),
          description: String(p.description || ''),
          services: asCsv(p.services),
          pet_types: asCsv(p.pet_types),
          availability: String(p.availability || 'Available'),
          available_times: String(p.available_times || ''),
          price_per_hour: p.price_per_hour != null ? String(p.price_per_hour) : '',
          price_per_day: p.price_per_day != null ? String(p.price_per_day) : '',
          rating: Number(p.rating || 0),
          reviews_count: Number(p.reviews_count || 0),
          total_reviews: Number(p.total_reviews || 0),
          reviews_list: Array.isArray(p.reviews_list) ? p.reviews_list : [],
          is_verified: Boolean(p.is_verified),
        })

        const b = await supabase.from('pet_nanny_bookings').select('*').eq('nanny_id', p.id).order('created_at', { ascending: false })
        if (b.error) throw b.error
        const rows = (b.data || []) as any[]
        if (!rows.length) {
          setBookings([])
        } else {
          const ownerIds = Array.from(new Set(rows.map((r) => r.owner_id).filter(Boolean)))
          const petIds = Array.from(new Set(rows.map((r) => r.pet_id).filter(Boolean)))
          const [owners, pets] = await Promise.all([
            ownerIds.length ? supabase.from('users').select('id,full_name,email').in('id', ownerIds as string[]) : Promise.resolve({ data: [] as any[] }),
            petIds.length ? supabase.from('pets').select('id,name').in('id', petIds as string[]) : Promise.resolve({ data: [] as any[] }),
          ])
          const ownerMap = new Map((owners.data || []).map((o: any) => [String(o.id), { n: String(o.full_name || o.email || 'Pet Owner'), e: String(o.email || '') }]))
          const petMap = new Map((pets.data || []).map((p0: any) => [String(p0.id), String(p0.name || 'Pet')]))
          setBookings(
            rows.map((r) => ({
              ...r,
              ownerName: r.owner_id ? ownerMap.get(r.owner_id)?.n || 'Pet Owner' : 'Pet Owner',
              ownerEmail: r.owner_id ? ownerMap.get(r.owner_id)?.e || '' : '',
              petName: r.pet_id ? petMap.get(r.pet_id) || 'Pet' : 'Pet',
            }))
          )
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load pet nanny panel.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id, user?.role])

  const stats = useMemo(() => {
    const pending = bookings.filter((b) => b.status === 'pending').length
    const confirmed = bookings.filter((b) => b.status === 'confirmed').length
    const cancelled = bookings.filter((b) => b.status === 'cancelled').length
    const rateH = Number(profile.price_per_hour || 0)
    const est = bookings.filter((b) => b.status === 'confirmed').reduce((sum, b) => {
      if (!b.start_time || !b.end_time) return sum
      const hours = (new Date(b.end_time).getTime() - new Date(b.start_time).getTime()) / 3600000
      return hours > 0 ? sum + hours * rateH : sum
    }, 0)
    return { pending, confirmed, cancelled, est }
  }, [bookings, profile.price_per_hour])

  const menu = [
    ['overview', 'Overview', Home],
    ['profile', 'Nanny Profile', UserCircle2],
    ['bookings', 'Booking Dashboard', CalendarDays],
    ['calendar', 'Calendar & Availability', CalendarDays],
    ['reviews', 'Review & Ratings', Star],
    ['earnings', 'Earnings & Payments', CreditCard],
    ['messages', 'Messaging & Communication', MessageCircle],
    ['security', 'Security & Verification', ShieldCheck],
    ['support', 'Support & Help', Headset],
  ] as const

  const saveProfile = async () => {
    if (!user || !profile.id) return
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const linkedId = await resolveUsersId(user.id, profile.email.trim().toLowerCase() || user.email)
      const payload: any = {
        user_id: linkedId,
        name: profile.full_name.trim() || null,
        full_name: profile.full_name.trim() || null,
        email: profile.email.trim().toLowerCase() || null,
        phone: profile.phone.trim() || null,
        location: profile.location.trim() || null,
        bio: profile.bio.trim() || null,
        description: profile.description.trim() || null,
        services: profile.services.trim() || null,
        pet_types: profile.pet_types.trim() || null,
        availability: profile.availability.trim() || null,
        available_times: profile.available_times.trim() || null,
        price_per_hour: profile.price_per_hour ? Number(profile.price_per_hour) : null,
        price_per_day: profile.price_per_day ? Number(profile.price_per_day) : null,
        updated_at: new Date().toISOString(),
      }

      let result = await supabase.from('pet_nannies').update(payload).eq('id', profile.id)
      if (result.error) {
        if (!isMissingCol(result.error)) throw result.error
        delete payload.name
        result = await supabase.from('pet_nannies').update(payload).eq('id', profile.id)
        if (result.error) throw result.error
      }
      setSuccess('Profile updated.')
    } catch (e: any) {
      setError(e?.message || 'Failed to save profile.')
    } finally {
      setSaving(false)
    }
  }

  const setStatus = async (id: string, status: BookingStatus) => {
    const res = await supabase.from('pet_nanny_bookings').update({ status }).eq('id', id)
    if (res.error) return setError(res.error.message || 'Failed to update booking.')
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)))
  }

  if (!user || user.role !== 'pet_nanny') {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">Loading pet nanny panel...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/40">
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:w-72 md:block bg-white border-r border-slate-200">
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white flex items-center justify-center">
            <PawPrint className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-slate-900">INNOVET</p>
            <p className="text-xs text-slate-500">Pet Nanny Portal</p>
          </div>
        </div>
        <div className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-85px)]">
          {menu.map(([k, label, Icon]) => (
            <button
              key={k}
              onClick={() => setPanel(k as Panel)}
              className={`w-full px-3 py-2.5 rounded-lg text-left flex items-center gap-2 text-sm ${
                panel === k ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </aside>

      <div className="md:ml-72">
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200 px-4 md:px-8 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-slate-900">Pet Nanny Dashboard</h1>
            <p className="text-xs md:text-sm text-slate-500">{profile.full_name || user.name}</p>
          </div>
          <Button variant="outline" onClick={async () => { await logout(); router.push('/') }}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </header>

        <main className="p-4 md:p-8 space-y-4">
          {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div> : null}
          {success ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{success}</div> : null}

          <div className="md:hidden bg-white rounded-xl border border-slate-200 p-2 flex gap-2 overflow-x-auto">
            {menu.map(([k, label]) => (
              <button key={k} onClick={() => setPanel(k as Panel)} className={`whitespace-nowrap px-3 py-1.5 rounded-md text-xs ${panel === k ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700'}`}>{label}</button>
            ))}
          </div>

          {loading ? <p className="text-sm text-slate-500">Loading...</p> : null}

          {!loading && panel === 'overview' ? <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">{[['Pending', stats.pending, Clock3], ['Confirmed', stats.confirmed, CheckCircle2], ['Cancelled', stats.cancelled, XCircle], ['Projected', fmtMoney(stats.est), CreditCard]].map(([t, v, I], i) => <Card key={i} title={String(t)} value={String(v)} icon={I as any} />)}</div> : null}
          {!loading && panel === 'profile' ? <ProfilePanel profile={profile} setProfile={setProfile} saveProfile={saveProfile} saving={saving} /> : null}
          {!loading && panel === 'bookings' ? <BookingsPanel bookings={bookings} setStatus={setStatus} /> : null}
          {!loading && panel === 'calendar' ? <SimplePanel title="Calendar & Availability"><p className="text-sm text-slate-600">Status: <b>{profile.availability || 'Not set'}</b> | Time: <b>{profile.available_times || 'Not set'}</b></p>{bookings.filter((b) => b.status === 'confirmed').slice(0, 8).map((b) => <Row key={b.id} text={`${b.petName} with ${b.ownerName} - ${fmtDate(b.start_time)}`} />)}</SimplePanel> : null}
          {!loading && panel === 'reviews' ? <SimplePanel title="Reviews & Ratings"><div className="grid sm:grid-cols-3 gap-3"><CardLite t="Rating" v={profile.rating.toFixed(1)} /><CardLite t="Reviews" v={String(profile.reviews_count)} /><CardLite t="Total" v={String(profile.total_reviews)} /></div></SimplePanel> : null}
          {!loading && panel === 'earnings' ? <SimplePanel title="Earnings & Payments"><div className="grid sm:grid-cols-3 gap-3"><CardLite t="Confirmed Jobs" v={String(stats.confirmed)} /><CardLite t="Rate/Hour" v={fmtMoney(Number(profile.price_per_hour || 0))} /><CardLite t="Projected" v={fmtMoney(stats.est)} /></div></SimplePanel> : null}
          {!loading && panel === 'messages' ? <SimplePanel title="Messaging & Communication">{Array.from(new Map(bookings.map((b) => [b.ownerEmail || b.ownerName, { name: b.ownerName, email: b.ownerEmail, note: b.notes || 'No message yet.' }])).values()).map((m, i) => <Row key={i} text={`${m.name} (${m.email || 'no email'}) - ${m.note}`} />)}</SimplePanel> : null}
          {!loading && panel === 'security' ? <SimplePanel title="Security & Verification"><Badge className={profile.is_verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>{profile.is_verified ? 'Verified' : 'Pending Verification'}</Badge><p className="text-sm text-slate-600 mt-2">Profile aur contact details updated rakhein.</p></SimplePanel> : null}
          {!loading && panel === 'support' ? <SimplePanel title="Support & Help"><Row text="Email: support@innovet.com" /><Row text="Helpline: +1 (000) 000-0000" /></SimplePanel> : null}
        </main>
      </div>
    </div>
  )
}

function Card({ title, value, icon: Icon }: { title: string; value: string; icon: any }) {
  return <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center justify-between"><p className="text-sm text-slate-500">{title}</p><Icon className="h-4 w-4 text-slate-500" /></div><p className="text-2xl font-bold mt-2 text-slate-900">{value}</p></div>
}
function CardLite({ t, v }: { t: string; v: string }) {
  return <div className="border border-slate-200 rounded-xl p-4"><p className="text-sm text-slate-500">{t}</p><p className="text-2xl font-bold mt-1">{v}</p></div>
}
function Row({ text }: { text: string }) {
  return <div className="border border-slate-200 rounded-lg p-3 text-sm text-slate-700 mt-2">{text}</div>
}
function SimplePanel({ title, children }: { title: string; children: ReactNode }) {
  return <section className="bg-white rounded-xl border border-slate-200 p-4"><h3 className="font-semibold text-slate-900 mb-2">{title}</h3>{children}</section>
}
function ProfilePanel({
  profile,
  setProfile,
  saveProfile,
  saving,
}: {
  profile: Profile
  setProfile: Dispatch<SetStateAction<Profile>>
  saveProfile: () => void
  saving: boolean
}) {
  const fields = [['Full Name', 'full_name'], ['Email', 'email'], ['Phone', 'phone'], ['Location', 'location'], ['Services', 'services'], ['Pet Types', 'pet_types'], ['Availability', 'availability'], ['Available Times', 'available_times'], ['Price/Hour', 'price_per_hour'], ['Price/Day', 'price_per_day']]
  return (
    <section className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
      <div className="grid md:grid-cols-2 gap-3">
        {fields.map(([label, key]) => (
          <div key={key}>
            <Label>{label}</Label>
            <Input className="mt-2" value={(profile as any)[key]} onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))} />
          </div>
        ))}
      </div>
      <div><Label>Bio</Label><Textarea className="mt-2" value={profile.bio} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))} /></div>
      <div><Label>Description</Label><Textarea className="mt-2" value={profile.description} onChange={(e) => setProfile((p) => ({ ...p, description: e.target.value }))} /></div>
      <Button onClick={saveProfile} disabled={saving}><Save className="h-4 w-4 mr-2" />{saving ? 'Saving...' : 'Save Profile'}</Button>
    </section>
  )
}
function BookingsPanel({
  bookings,
  setStatus,
}: {
  bookings: Booking[]
  setStatus: (id: string, status: BookingStatus) => void
}) {
  if (!bookings.length) return <section className="bg-white rounded-xl border border-slate-200 p-4 text-sm text-slate-500">No booking requests yet.</section>
  return (
    <div className="space-y-3">
      {bookings.map((b) => (
        <div key={b.id} className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-900">{b.petName}</p>
              <p className="text-sm text-slate-500">Owner: {b.ownerName}</p>
              <p className="text-sm text-slate-500">{fmtDate(b.start_time)} - {fmtDate(b.end_time)}</p>
              {b.notes ? <p className="text-sm text-slate-600 mt-1">{b.notes}</p> : null}
            </div>
            <Badge className={b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : b.status === 'cancelled' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}>{b.status}</Badge>
          </div>
          {b.status === 'pending' ? <div className="mt-3 flex gap-2"><Button size="sm" onClick={() => setStatus(b.id, 'confirmed')} className="bg-emerald-600 hover:bg-emerald-700">Confirm</Button><Button size="sm" variant="outline" onClick={() => setStatus(b.id, 'cancelled')}>Cancel</Button></div> : null}
        </div>
      ))}
    </div>
  )
}
