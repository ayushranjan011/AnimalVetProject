import { createHmac, timingSafeEqual } from 'crypto'

export type PetPassportPayload = {
  petId: string
  petName: string
  petType: string
  breed: string
  age: string
  owner: string
  medicalHistory: string[]
  vaccinations: Array<{ name: string; date: string }>
  treatments: Array<{ date: string; description: string }>
  petImage?: string
  generatedAt: string
}

type TokenEnvelope = {
  payload: PetPassportPayload
  exp: number
}

const DEFAULT_TTL_HOURS = 72
const DEV_FALLBACK_SECRET = 'dev-only-passport-secret-change-me'

const toBase64Url = (value: string) =>
  Buffer.from(value, 'utf8').toString('base64url')

const fromBase64Url = (value: string) =>
  Buffer.from(value, 'base64url').toString('utf8')

const getSecret = () =>
  process.env.PET_PASSPORT_SHARE_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  DEV_FALLBACK_SECRET

const signValue = (value: string) =>
  createHmac('sha256', getSecret()).update(value).digest('base64url')

export const createPetPassportToken = (
  payload: PetPassportPayload,
  ttlHours = DEFAULT_TTL_HOURS
) => {
  const safeTtlHours = Number.isFinite(ttlHours) && ttlHours > 0 ? ttlHours : DEFAULT_TTL_HOURS
  const envelope: TokenEnvelope = {
    payload,
    exp: Date.now() + safeTtlHours * 60 * 60 * 1000,
  }

  const encodedEnvelope = toBase64Url(JSON.stringify(envelope))
  const signature = signValue(encodedEnvelope)

  return `${encodedEnvelope}.${signature}`
}

export const verifyPetPassportToken = (token: string) => {
  const [encodedEnvelope, incomingSignature] = token.split('.')

  if (!encodedEnvelope || !incomingSignature) {
    return { valid: false as const, reason: 'Malformed token' }
  }

  const expectedSignature = signValue(encodedEnvelope)
  const expectedBuffer = Buffer.from(expectedSignature)
  const incomingBuffer = Buffer.from(incomingSignature)

  if (expectedBuffer.length !== incomingBuffer.length) {
    return { valid: false as const, reason: 'Invalid signature' }
  }

  if (!timingSafeEqual(expectedBuffer, incomingBuffer)) {
    return { valid: false as const, reason: 'Invalid signature' }
  }

  try {
    const envelope = JSON.parse(fromBase64Url(encodedEnvelope)) as TokenEnvelope

    if (!envelope?.payload || typeof envelope.exp !== 'number') {
      return { valid: false as const, reason: 'Invalid payload' }
    }

    if (Date.now() > envelope.exp) {
      return { valid: false as const, reason: 'Token expired' }
    }

    return { valid: true as const, payload: envelope.payload, exp: envelope.exp }
  } catch {
    return { valid: false as const, reason: 'Invalid token payload' }
  }
}
