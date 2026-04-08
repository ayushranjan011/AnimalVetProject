import { NextResponse } from 'next/server'
import { createPetPassportToken, type PetPassportPayload } from '@/lib/pet-passport-share'

export const runtime = 'nodejs'

const isPayloadValid = (payload: any): payload is PetPassportPayload => {
  if (!payload || typeof payload !== 'object') return false
  if (!payload.petId || !payload.petName || !payload.petType) return false
  if (!Array.isArray(payload.medicalHistory)) return false
  if (!Array.isArray(payload.vaccinations)) return false
  if (!Array.isArray(payload.treatments)) return false
  return true
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const payload = body?.payload

    if (!isPayloadValid(payload)) {
      return NextResponse.json({ error: 'Invalid passport payload' }, { status: 400 })
    }

    const token = createPetPassportToken(payload)
    const origin =
      request.headers.get('origin') ||
      process.env.NEXT_PUBLIC_APP_URL ||
      `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host') || 'localhost:3000'}`

    return NextResponse.json({
      url: `${origin}/pet-passport/share?token=${encodeURIComponent(token)}`,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 })
  }
}
